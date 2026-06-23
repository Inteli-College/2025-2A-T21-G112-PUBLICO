---
title: "Integracao do Modelo no Backend e Analise Visual"
sidebar_position: 1
---

# Sprint 4 - Integracao do Modelo no Backend e Analise Visual

:::success Status
Sprint concluida. O modelo CustomCNN_SE (99.86% de acuracia) foi integrado ao backend e esta acessivel pela aplicacao. Novo sistema de **Grid Scan** permite analise visual com marcacoes em imagens e videos.
:::

## Objetivo

Tornar o melhor modelo treinado na Sprint 3 (CustomCNN_SE) disponivel para uso real na aplicacao, e criar uma funcionalidade que analisa regioes especificas de imagens e videos, marcando visualmente as areas saudaveis e doentes.

---

## O que existia antes

O backend da aplicacao ja conseguia servir 6 modelos treinados em PyTorch. Porem, o melhor modelo — **CustomCNN_SE** — foi treinado usando Keras/TensorFlow, um framework diferente. Isso significava que o backend nao sabia como carrega-lo ou usa-lo.

Alem disso, o sistema so conseguia analisar **imagens inteiras**, dando um unico resultado por foto. Nao havia forma de identificar **onde** na imagem estava a doenca.

---

## O que foi feito

### 1. Integracao do CustomCNN_SE no backend

O backend foi adaptado para aceitar modelos de ambos os frameworks (PyTorch e Keras). Quando a aplicacao inicia, ela detecta automaticamente o tipo de cada modelo e sabe como usa-lo corretamente.

Se o TensorFlow nao estiver instalado no ambiente, o sistema continua funcionando normalmente com os modelos PyTorch — sem quebrar nada.

**Resultado:** a aplicacao agora serve **7 modelos**, incluindo o CustomCNN_SE como opcao principal para o usuario.

| Modelo | Tipo | Classes |
|--------|------|---------|
| CustomCNN1 | PyTorch | 5 classes |
| CustomCNN2 | PyTorch | 5 classes |
| CustomCNN3 | PyTorch | 5 classes |
| BinaryCNN_Light | PyTorch | 2 classes (saudavel/doente) |
| BinaryCNN_Deep | PyTorch | 2 classes (saudavel/doente) |
| BinaryCNN_Efficient | PyTorch | 2 classes (saudavel/doente) |
| **CustomCNN_SE** | **Keras** | **5 classes** |

---

### 2. Grid Scan — Analise por regioes com marcacoes visuais

O CustomCNN_SE classifica imagens inteiras, mas nao localiza onde esta o problema. Para resolver isso, implementamos a tecnica de **Grid Scan**:

#### Como funciona

1. A imagem e dividida em uma grade (por exemplo, 3x3 = 9 pedacos)
2. Cada pedaco e analisado individualmente pelo modelo
3. Caixas coloridas sao desenhadas sobre a imagem original, indicando o resultado de cada regiao

O usuario pode configurar:
- **Tamanho da grade:** 2x2, 3x3, 4x4 ou 5x5
- **Confianca minima:** so mostra marcacoes quando o modelo tem pelo menos X% de certeza

#### Cores por classe

| Classe | Cor | Significado |
|--------|-----|-------------|
| Healthy | Verde | Area saudavel |
| Cercospora | Vermelho | Cercosporiose |
| Leaf_rust | Laranja | Ferrugem da folha |
| Miner | Roxo | Bicho mineiro |
| Phoma | Vermelho escuro | Phoma |

#### Analise de imagem

O usuario faz upload de uma foto e recebe:
- A imagem com as caixas coloridas desenhadas
- Um resumo com quantidade de areas saudaveis, doentes e a proporcao de saude
- Detalhes de cada regiao analisada (classe e nivel de confianca)

#### Analise de video

O usuario faz upload de um video e recebe o video de volta com as marcacoes frame a frame. Para manter uma velocidade aceitavel, o sistema processa 1 a cada 5 frames e reutiliza o resultado nos frames intermediarios.

---

### 3. Nova tela no frontend — Grid Scan

Foi criado um novo componente na aplicacao web, acessivel pelo menu lateral como **"Grid Scan"**.

**Funcionalidades da tela:**

- Alternar entre modo imagem e modo video
- Selecionar qual modelo usar (todos os 7 disponiveis)
- Escolher o tamanho da grade e a confianca minima
- Visualizar a imagem analisada com as marcacoes coloridas
- Ver cards de resumo: areas saudaveis, areas doentes e proporcao de saude
- Legenda de cores para cada classe de doenca
- No modo video: assistir o video analisado e fazer download

---

### 4. Ambiente e dependencias

O TensorFlow foi adicionado as dependencias do backend. Para economizar espaco em disco, o PyTorch foi instalado na versao somente CPU (~190 MB em vez de ~2 GB com suporte a GPU).

O ambiente virtual do backend inclui: Flask, PyTorch (CPU), TensorFlow, OpenCV, Pillow e NumPy.

---

## Arquitetura da Aplicacao

A aplicacao funciona com dois servidores:

**Frontend (React)** — interface do usuario com tres telas:
- **Mapa de campos** — visualizacao geografica das areas monitoradas
- **Upload de imagem** — classificacao de uma folha inteira
- **Grid Scan** — analise por regioes com marcacoes visuais (imagem ou video)

**Backend (Flask)** — servidor que processa as requisicoes:
- Carrega e serve os 7 modelos de IA
- Recebe imagens/videos do frontend
- Retorna predicoes, analises agronomicas e imagens/videos anotados

Os dois servidores se comunicam por meio de endpoints REST (URLs que o frontend acessa para enviar dados e receber resultados).

---

## Entregaveis

- Backend atualizado com suporte a modelos Keras e endpoints de Grid Scan
- Modelo CustomCNN_SE integrado e funcional na aplicacao
- Nova tela de Grid Scan no frontend (imagem e video)
- Menu lateral atualizado com link para Grid Scan
- Dependencias atualizadas com TensorFlow
- Ambiente virtual configurado com todas as bibliotecas necessarias

---

## KPIs

| KPI | Meta | Resultado |
|-----|------|-----------|
| CustomCNN_SE acessivel pela aplicacao | Sim | Disponivel para selecao em todas as telas |
| Suporte a modelos Keras no backend | Sim | Deteccao automatica e carregamento funcionando |
| Grid Scan em imagens | Sim | Analise por regioes com marcacoes coloridas |
| Grid Scan em videos | Sim | Video processado frame a frame com marcacoes |
| Marcacoes coloridas por classe | Sim | 5 cores mapeadas para 5 classes de doenca |
| Interface funcional | Sim | Tela completa com modos imagem e video |
| Compatibilidade com modelos anteriores | Sim | Todos os 6 modelos PyTorch continuam funcionando |

---

## Decisoes Tecnicas

| Decisao | Justificativa |
|---------|---------------|
| Manter dois frameworks em vez de converter o modelo | Converter pesos entre frameworks pode causar perda de acuracia. Carregar o modelo original garante os mesmos resultados do treinamento |
| TensorFlow opcional | Se nao estiver instalado, o backend funciona normalmente com os outros modelos |
| Grid Scan em vez de modelo de deteccao (YOLO) | Reutiliza o modelo de classificacao que ja temos, sem precisar retreinar. Implementacao mais simples e interpretavel |
| Pular frames no video | Analisar cada pedaco de cada frame seria muito lento. Reutilizar resultados entre frames mantem a fluidez |
| PyTorch somente CPU | Economia de ~1.8 GB de espaco em disco. Para demonstracao, a velocidade em CPU e aceitavel |
| Confianca minima configuravel | Permite ao usuario ajustar a sensibilidade — valor alto reduz alarmes falsos, valor baixo aumenta deteccao |

---

## Limitacoes Conhecidas

1. **Grid Scan nao e deteccao real:** as marcacoes seguem uma grade fixa e nao contornam a lesao com precisao. Para marcacoes mais precisas, seria necessario um modelo de deteccao de objetos treinado especificamente para isso.

2. **Velocidade em video:** processar uma grade 4x4 (16 regioes) por frame usando CPU leva cerca de 2-3 segundos por frame. Videos longos podem demorar varios minutos.

3. **Regioes parciais:** quando a grade divide uma folha ao meio, regioes com bordas ou fundo podem ser classificadas incorretamente, pois o modelo foi treinado com folhas inteiras centralizadas.

4. **Sem GPU no ambiente atual:** todo o processamento roda em CPU. Com GPU, a analise de video seria significativamente mais rapida.

---

## Proximos Passos (Sprint 5)

1. **Validacao com imagens reais de campo** — testar o Grid Scan com fotos de drones para verificar a acuracia em cenarios reais
2. **Grad-CAM** — visualizar quais partes da imagem o modelo esta "olhando" para tomar a decisao, aumentando a interpretabilidade
3. **Dockerizacao** — empacotar backend e frontend em containers para facilitar a instalacao e o deploy
4. **Documentacao da API** — criar especificacao formal dos endpoints para facilitar integracao futura

---

## Fontes e Referencias

- **Squeeze-Excitation Networks:** Hu et al., *Squeeze-and-Excitation Networks*, CVPR 2018
- **Grid-based classification:** Tecnica de janela deslizante adaptada para classificacao por regioes
- **TensorFlow:** Framework de machine learning do Google, usado para carregar e executar o CustomCNN_SE
- **OpenCV:** Biblioteca de visao computacional usada para processar imagens e videos
- **FFmpeg:** Ferramenta de conversao de video usada para garantir compatibilidade com navegadores
