#!/bin/bash

echo "======================================================================"
echo "  INICIANDO JUPYTER COM SUPORTE GPU - Crop Track"
echo "======================================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se nvidia-smi funciona
if ! command -v nvidia-smi &> /dev/null; then
    echo -e "${RED}✗${NC} nvidia-smi não encontrado. Drivers NVIDIA não instalados?"
    echo "  Continuando com CPU..."
else
    echo -e "${GREEN}✓${NC} Drivers NVIDIA detectados:"
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader | head -1
    echo ""
fi

# Configurar LD_LIBRARY_PATH com as bibliotecas NVIDIA
echo "Configurando bibliotecas CUDA..."

# Encontrar diretórios de bibliotecas NVIDIA
NVIDIA_LIBS=$(find ~/.local/lib/python*/site-packages/nvidia -name 'lib' -type d 2>/dev/null | tr '\n' ':')

if [ -z "$NVIDIA_LIBS" ]; then
    echo -e "${YELLOW}⚠${NC} Bibliotecas NVIDIA não encontradas em ~/.local/"
    echo "  Tentando instalar nvidia-cudnn-cu12..."
    pip3 install nvidia-cudnn-cu12 nvidia-cublas-cu12 --break-system-packages -q

    # Tentar novamente
    NVIDIA_LIBS=$(find ~/.local/lib/python*/site-packages/nvidia -name 'lib' -type d 2>/dev/null | tr '\n' ':')
fi

if [ -n "$NVIDIA_LIBS" ]; then
    export LD_LIBRARY_PATH="${NVIDIA_LIBS}${LD_LIBRARY_PATH}"
    echo -e "${GREEN}✓${NC} LD_LIBRARY_PATH configurado com bibliotecas NVIDIA"
    echo "  Total de diretórios: $(echo $NVIDIA_LIBS | tr ':' '\n' | grep -v '^$' | wc -l)"
else
    echo -e "${YELLOW}⚠${NC} Não foi possível configurar bibliotecas NVIDIA"
fi

# Desabilitar warnings verbosos do TensorFlow
export TF_CPP_MIN_LOG_LEVEL=2

# Configurar para usar toda memória GPU disponível
export TF_FORCE_GPU_ALLOW_GROWTH=true

echo ""
echo "======================================================================"
echo -e "${GREEN}Variáveis de ambiente configuradas:${NC}"
echo "  LD_LIBRARY_PATH: Configurado ✓"
echo "  TF_CPP_MIN_LOG_LEVEL: 2 (menos warnings)"
echo "  TF_FORCE_GPU_ALLOW_GROWTH: true"
echo "======================================================================"
echo ""

# Navegar para o diretório correto
cd "$(dirname "$0")"

# Verificar se Jupyter está instalado
if ! command -v jupyter &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Jupyter não encontrado. Instalando..."
    pip3 install jupyterlab notebook --break-system-packages
fi

echo ""
echo -e "${GREEN}Iniciando JupyterLab...${NC}"
echo "O navegador abrirá automaticamente em alguns segundos."
echo ""
echo "Para verificar se a GPU foi detectada:"
echo "  Execute a segunda célula do notebook e procure por '✅ GPU(s) detectada(s)!'"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC} Se a GPU não for detectada:"
echo "  1. Feche o Jupyter (Ctrl+C)"
echo "  2. Execute: pip3 uninstall tensorflow -y"
echo "  3. Execute: pip3 install tensorflow[and-cuda] --break-system-packages"
echo "  4. Execute este script novamente"
echo ""
echo "Pressione Ctrl+C para parar o Jupyter"
echo "======================================================================"
echo ""

# Iniciar Jupyter Lab
jupyter lab model_training.ipynb
