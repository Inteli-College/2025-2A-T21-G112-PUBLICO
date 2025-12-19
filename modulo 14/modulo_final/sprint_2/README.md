# Sprint 2 - Classificação Binária de Doenças em Folhas de Café

## Visão Geral

Este módulo implementa um sistema de **classificação binária** para detectar doenças em folhas de café, simplificando o problema original de 5 classes para 2 classes:

- **Classe 0 (Saudável)**: Folhas saudáveis
- **Classe 1 (Não Saudável)**: Folhas com qualquer tipo de doença (Cercospora, Leaf rust, Miner, Phoma)

## Objetivo

O objetivo desta abordagem é **aumentar a acurácia** do modelo ao simplificar o problema de classificação. Em vez de identificar o tipo específico de doença, o modelo foca em determinar se a folha está saudável ou não, o que é mais adequado para:

- Triagem inicial de plantas
- Sistemas de alerta precoce
- Aplicações em campo com recursos limitados
- Maior confiabilidade nas predições

## Estrutura do Projeto

```
modulo_final/sprint_2/
├── notebook/
│   └── Binary_Classification_Coffee_Disease.ipynb  # Notebook principal
├── modelos/                                          # Modelos treinados (gerado após execução)
│   ├── BinaryCNN_Light_best.pth
│   ├── BinaryCNN_Deep_best.pth
│   ├── BinaryCNN_Efficient_best.pth
│   ├── *_training_curves.png
│   ├── *_confusion_matrix.png
│   └── model_comparison.png
└── README.md                                         # Este arquivo
```

## Características do Notebook

### 1. Classificação Binária
- Conversão automática de dataset multi-classe para binário
- Classe "Healthy" → 0 (Saudável)
- Todas as outras classes → 1 (Não Saudável)

### 2. Três Arquiteturas de CNN

#### BinaryCNN_Light
- **Características**: Leve e rápido
- **Parâmetros**: ~1.2M
- **Uso**: Ideal para inferência em tempo real e dispositivos com recursos limitados

#### BinaryCNN_Deep
- **Características**: Profundo com conexões residuais
- **Parâmetros**: ~11.3M
- **Uso**: Máxima acurácia, requer mais recursos computacionais

#### BinaryCNN_Efficient
- **Características**: Balanço entre velocidade e acurácia
- **Parâmetros**: ~1.4M
- **Uso**: Melhor relação custo-benefício para produção

### 3. Data Augmentation Avançada
- **Mixup**: Mistura linear de imagens e labels
- **CutMix**: Recorte e colagem de regiões de imagens
- **Transformações geométricas**: Rotação, flip, crop
- **Transformações de cor**: Brightness, contrast, saturation
- **Random Erasing**: Melhora robustez

### 4. Técnicas de Treinamento
- **Early Stopping**: Previne overfitting
- **Learning Rate Scheduling**: Cosine Annealing
- **Mixed Precision Training**: Acelera treinamento em GPUs modernas
- **Gradient Clipping**: Estabiliza treinamento
- **Label Smoothing**: Melhora generalização

### 5. Visualizações Detalhadas
- **Training Progress**: Barra de progresso com loss em tempo real
- **Curvas de Treinamento**: Loss, Accuracy, Precision, Recall, F1-Score
- **Confusion Matrix**: Matriz de confusão detalhada
- **ROC Curve**: Curva ROC com AUC score
- **Model Comparison**: Comparação entre modelos

### 6. Métricas Abrangentes
- **Accuracy**: Acurácia geral
- **Precision**: Taxa de verdadeiros positivos
- **Recall**: Taxa de detecção de positivos
- **F1-Score**: Média harmônica de Precision e Recall
- **ROC-AUC**: Área sob a curva ROC

## Como Usar

### 1. Requisitos

```bash
pip install torch torchvision kagglehub numpy matplotlib seaborn pandas scikit-learn tqdm pillow
```

### 2. Configuração Kaggle

Certifique-se de ter suas credenciais do Kaggle configuradas:
```bash
# Linux/Mac
mkdir -p ~/.kaggle
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Windows
# Copie kaggle.json para C:\Users\<username>\.kaggle\
```

### 3. Executar o Notebook

```bash
jupyter notebook modulo_final/sprint_2/notebook/Binary_Classification_Coffee_Disease.ipynb
```

Ou use o JupyterLab:
```bash
jupyter lab
```

### 4. Treinamento

Execute todas as células do notebook em ordem. O processo inclui:

1. **Download dos datasets** (automático via Kaggle)
2. **Carregamento e preparação dos dados**
3. **Conversão para classificação binária**
4. **Treinamento de 3 modelos diferentes**
5. **Geração de visualizações e métricas**
6. **Salvamento dos modelos treinados**

### 5. Tempo de Treinamento Estimado

- **GPU (RTX 4000)**: ~30-40 minutos por modelo
- **GPU (GTX 1080)**: ~60-80 minutos por modelo
- **CPU**: ~4-6 horas por modelo (não recomendado)

## Configurações

As configurações principais estão no dicionário `CONFIG` (Célula 3):

```python
CONFIG = {
    'img_size': 224,              # Tamanho da imagem
    'batch_size': 32,             # Tamanho do batch
    'num_epochs': 50,             # Número de épocas
    'learning_rate': 0.001,       # Taxa de aprendizado
    'patience': 10,               # Paciência para early stopping
    'subset_fraction': 0.8,       # Fração do dataset a usar
    # ... mais configurações
}
```

### Ajustes Recomendados

**Para treinamento mais rápido:**
```python
CONFIG['num_epochs'] = 20
CONFIG['subset_fraction'] = 0.5
CONFIG['batch_size'] = 64
```

**Para máxima acurácia:**
```python
CONFIG['num_epochs'] = 100
CONFIG['subset_fraction'] = 1.0
CONFIG['patience'] = 15
```

## Resultados Esperados

### Acurácia Esperada
- **BinaryCNN_Light**: 85-90%
- **BinaryCNN_Deep**: 90-95%
- **BinaryCNN_Efficient**: 88-93%

### Interpretação das Métricas

**Precision Alta + Recall Baixo:**
- Modelo conservador, poucas detecções falsas
- Bom para evitar alarmes falsos

**Precision Baixo + Recall Alto:**
- Modelo sensível, detecta mais casos
- Bom para não perder casos de doença

**F1-Score Alto:**
- Balanço ideal entre Precision e Recall
- Melhor métrica geral para classificação binária

## Vantagens da Classificação Binária

1. **Maior Acurácia**: Problema simplificado resulta em melhores resultados
2. **Mais Prático**: Ideal para triagem inicial e alertas
3. **Menos Dados**: Requer menos exemplos por classe
4. **Deploy Eficiente**: Modelos menores e mais rápidos
5. **Interpretação Clara**: Fácil de entender e explicar

## Comparação com Classificação Multi-classe

| Aspecto | Multi-classe (5 classes) | Binária (2 classes) |
|---------|-------------------------|---------------------|
| **Acurácia** | 70-85% | 85-95% |
| **Complexidade** | Alta | Baixa |
| **Dados Necessários** | Mais | Menos |
| **Interpretação** | Complexa | Simples |
| **Velocidade** | Mais lenta | Mais rápida |
| **Uso Prático** | Diagnóstico específico | Triagem inicial |

## Troubleshooting

### Erro: CUDA out of memory
```python
CONFIG['batch_size'] = 16  # Reduzir batch size
CONFIG['use_mixed_precision'] = False  # Desabilitar mixed precision
```

### Erro: Datasets não encontrados
- Verifique conexão com internet
- Verifique credenciais do Kaggle
- Execute novamente a célula de download

### Overfitting (Loss de treino muito menor que validação)
```python
CONFIG['patience'] = 5  # Early stopping mais agressivo
CONFIG['label_smoothing'] = 0.2  # Aumentar label smoothing
# Adicionar mais dropout nas arquiteturas
```

### Underfitting (Loss alto em treino e validação)
```python
CONFIG['num_epochs'] = 100  # Mais épocas
CONFIG['learning_rate'] = 0.0001  # Menor learning rate
# Usar modelo mais complexo (BinaryCNN_Deep)
```

## Próximos Passos

1. **Análise Detalhada**: Revisar métricas e identificar melhor modelo
2. **Hyperparameter Tuning**: Otimizar hiperparâmetros usando grid search
3. **Ensemble**: Combinar predições de múltiplos modelos
4. **Testes em Produção**: Testar com imagens reais de campo
5. **Deploy**: Preparar para deploy em aplicação web/mobile
6. **Monitoramento**: Implementar sistema de monitoramento contínuo

## Contato e Suporte

Para dúvidas ou sugestões sobre este módulo, abra uma issue no repositório.

## Licença

Este projeto segue a licença do repositório principal.
