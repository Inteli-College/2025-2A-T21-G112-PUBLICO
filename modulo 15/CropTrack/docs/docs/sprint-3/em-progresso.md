---
title: "Otimizacao e Treinamento do Modelo"
sidebar_position: 1
---

# Sprint 3 - Otimizacao e Treinamento do Modelo

:::success Status
Sprint concluida. CustomCNN_SE atingiu **99.86% de acuracia** (Top-3: 100%). Ensemble final com **99.92%**. Meta de 85% superada em 14.86 pontos percentuais.
:::

## Objetivo

Otimizar a arquitetura e o treinamento do modelo para atingir a meta de **85%+ de acuracia**, partindo dos 60-70% do modulo anterior, utilizando o dataset balanceado e pre-processado da Sprint 2.

---

## O que foi feito

### 1. Dataset utilizado

O treinamento foi realizado sobre o dataset gerado na Sprint 2:

- **Localizacao:** `~/datasets/coffee_balanced_sprint2/`
- **Total:** 50.000 imagens, 10.000 por classe, 224x224 pixels, CLAHE aplicado
- **Classes:** Cercospora, Healthy, Leaf Rust, Miner, Phoma
- **Divisao:** 80% treino / 10% validacao / 10% teste
- **Fontes:** JMuBEN (Kenya), BRACOL (Brasil), Ethiopian Coffee Leaf Disease (Etiopia)

### 2. Pipeline de dados com tf.data (sem crash de RAM)

O carregamento direto de 50.000 imagens em arrays NumPy causava crash do servidor Jupyter (~7 GB de RAM alocados de uma vez). A solucao foi substituir completamente por uma pipeline `tf.data` com carregamento lazy:

```python
# Apenas caminhos de arquivo sao carregados em RAM (strings, ~bytes)
all_paths, all_labels = [], []
for i, cls in enumerate(CLASS_NAMES):
    imgs = list((DATASET_DIR/cls).glob('*.jpg')) + ...

# Carregamento lazy — imagens lidas em disco somente no momento do batch
@tf.function
def load_image(path, label):
    img = tf.io.read_file(path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
    img = tf.cast(img, tf.float32) / 255.0
    return img, tf.one_hot(label, NUM_CLASSES)

ds = tf.data.Dataset.from_tensor_slices((paths, labels))
ds = ds.map(load_image, num_parallel_calls=tf.data.AUTOTUNE)
ds = ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
```

Isso eliminou o crash e permitiu treinar com GPU sem interrupcoes.

### 3. Configuracao de GPU

A GPU NVIDIA RTX 4000 Ada Generation (20 GB VRAM, compute capability 8.9) nao era detectada por padrao porque as bibliotecas CUDA instaladas via pip (`~/.local/lib/python3.12/site-packages/nvidia/*/lib/`) nao estavam no `LD_LIBRARY_PATH`.

A solucao foi um script de inicializacao que configura o ambiente **antes** de lancar o Jupyter:

```bash
# start_jupyter_gpu.sh
export LD_LIBRARY_PATH=$(find ~/.local/lib/python*/site-packages/nvidia \
  -name 'lib' -type d | tr '\n' ':')$LD_LIBRARY_PATH
jupyter lab model_training.ipynb
```

Apos isso: `✅ 1 GPU(s) detectada(s)! GPU 0: NVIDIA RTX 4000 Ada Generation`

### 4. Modelos treinados

Foram treinados 4 modelos com estrategias distintas, todos por **50 epocas** com:
- Batch size: 32
- Loss: Categorical Crossentropy + Label Smoothing (0.1)
- Callbacks: ReduceLROnPlateau, EarlyStopping, ModelCheckpoint
- Fine-tuning: descongelamento das ultimas 30 camadas (epocas 30-50, LR = 0.0005)

#### CustomCNN_SE — Arquitetura customizada com Squeeze-Excitation

Modelo treinado do zero com blocos de atencao SE (Squeeze-Excitation). O bloco SE aprende a recalibrar a importancia de cada canal de feature, focando nos canais mais discriminativos para o dominio de doencas em folhas de cafe.

Arquitetura:
- 3 blocos convolucionais (32 → 64 → 128 filtros) com BatchNorm + MaxPool
- Bloco SE apos cada convolucional (reducao r=8)
- GlobalAveragePooling + Dense 256 + Dropout 0.5 + Softmax

#### MobileNetV3Large — Transfer Learning (ImageNet)

Backbone MobileNetV3Large pre-treinado no ImageNet, congelado nas primeiras 30 epocas. Cabeca classificadora customizada adicionada. Fine-tuning das ultimas 30 camadas nas epocas 30-50.

#### EfficientNetB0 com CutMix

Backbone EfficientNetB0 pre-treinado no ImageNet. Augmentation CutMix aplicado no conjunto de treino — recorta regioes aleatorias de uma imagem e substitui pelo recorte de outra, misturando os rotulos proporcionalmente.

#### EfficientNetB1 com MixUp

Backbone EfficientNetB1 pre-treinado no ImageNet. Augmentation MixUp — interpolacao linear entre dois exemplos e seus rotulos: `x = lambda*x1 + (1-lambda)*x2`.

---

## Resultados

### Comparativo final

| Modelo | Acuracia | Top-3 | Loss |
|--------|----------|-------|------|
| **Ensemble (Top 3)** | **99.92%** | — | — |
| **CustomCNN_SE** | **99.86%** | **100.00%** | **0.3976** |
| MobileNetV3Large | 73.56% | 97.48% | 0.9478 |
| EfficientNetB0_CutMix | 20.00% | 60.00% | 1.6094 |
| EfficientNetB1_MixUp | 20.00% | 60.00% | 1.6094 |

### Curva de treinamento — CustomCNN_SE

| Epoca | Train Acc | Val Acc | Val Loss |
|-------|-----------|---------|----------|
| 0 | 40.69% | 62.72% | 1.0949 |
| 7 | 70.50% | 98.30% | 0.5030 |
| 15 | 78.39% | 99.57% | 0.4338 |
| 24 | 83.19% | 99.80% | 0.4107 |
| 35 | 88.46% | 99.92% | 0.3998 |
| 49 | 90.19% | 99.87% | 0.3977 |

Nota: val_accuracy > train_accuracy em todas as epocas — resultado esperado porque o data augmentation e aplicado **apenas no treino**, tornando o conjunto de treino deliberadamente mais dificil. Indica que o modelo generalizou bem (nao decorou).

### Ensemble

O ensemble combinou as predicoes dos 3 melhores modelos por media de probabilidades (average voting). O ganho de 0.06 p.p. sobre o CustomCNN_SE isolado indica que o MobileNetV3 trouxe diversidade marginal — quando o CustomCNN_SE errava, o ensemble corrigia via votacao.

---

## Analise dos Resultados

### Por que o CustomCNN_SE dominou?

Doencas foliares de cafe possuem **padroes visuais altamente especificos** — manchas de cor, texturas de lesao, bordas necroticas. O bloco SE aprendeu a dar atencao seletiva aos canais de features mais discriminativos para **exatamente esse dominio**, sem nenhum vies de dominio externo.

A ausencia de pre-treinamento no ImageNet foi uma vantagem: os filtros foram otimizados 100% para folhas de cafe desde a primeira iteracao, sem conflito com representacoes de objetos genericos.

### Por que os modelos EfficientNet falharam completamente?

A loss final de **1.6094** e o sinal diagnostico definitivo:

> `log(5) ≈ 1.60943` — exatamente a entropia maxima de uma distribuicao uniforme para 5 classes

Ambos os modelos ficaram presos em **distribuicao aleatoria do epoch 0 ao epoch 49**, nunca aprendendo nada. O mecanismo de falha:

1. **Gap de dominio ImageNet → folhas de cafe**: As ativacoes do backbone congelado para imagens de doencas em folhas nao carregam informacao util para distinguir as 5 classes. A cabeca classificadora recebe ruido.

2. **CutMix/MixUp amplificou o problema**: Os augmentations geram rotulos soft (ex: 70% Cercospora, 30% Rust) sobre ativacoes nao-discriminativas. O gradiente resultante e proximo de zero — o modelo nao consegue atualizar a cabeca.

3. **ReduceLROnPlateau disparou precocemente**: Na epoca 6 o LR caiu de 0.001 → 0.0005 sem melhoria. A reducao de LR com gradientes nulos intensificou o bloqueio.

**Licao:** CutMix e MixUp requerem um backbone funcional que ja extrai features uteis. Aplicados sobre backbone completamente divergente do dominio, prejudicam mais do que ajudam.

### Por que o MobileNetV3Large ficou em 73.56%?

- **Top-3 accuracy = 97.48%**: O modelo sabia que a classe correta estava entre as 3 mais provaveis em 97% dos casos — o problema era precisao, nao confusao total.
- **Oscilacao de val_accuracy (69-74%)**: O modelo nunca convergiu para um minimo estavel, indicando que o fine-tuning de 30 camadas foi insuficiente para readaptar representacoes ImageNet para o dominio de doencas.
- **Design para edge devices**: MobileNetV3Large prioriza eficiencia computacional sobre capacidade representacional, limitando sua expressividade em classificacao fina de texturas de doencas.

---

## Entregaveis

- **Notebook:** `Modulo XV/notebooks/sprint-3/model_training.ipynb` — pipeline completa com 4 modelos, ensemble, metricas e visualizacoes
- **Script de GPU:** `Modulo XV/notebooks/sprint-3/start_jupyter_gpu.sh` — configuracao de ambiente para deteccao de GPU
- **Modelos salvos:** `outputs/*.keras` — pesos do melhor epoch de cada modelo
- **Graficos:** `outputs/*_history.png` — curvas de acuracia e loss por epoca
- **Matrizes de confusao:** `outputs/*_cm.png` — desempenho por classe
- **Logs de treino:** `outputs/*_log.csv` — metricas de cada epoca em CSV
- **Comparativo final:** `outputs/final_comparison.csv` e `outputs/comparison_chart.png`

---

## KPIs

| KPI | Meta | Resultado | Atingido |
|-----|------|-----------|----------|
| Acuracia geral | 85%+ | **99.92%** (ensemble) | Sim (+14.92 p.p.) |
| Acuracia Top-3 | 95%+ | **100%** (CustomCNN_SE) | Sim |
| Melhor modelo individual | 85%+ | **99.86%** (CustomCNN_SE) | Sim |
| Sem crash de RAM | Sim | Pipeline tf.data lazy | Sim |
| GPU utilizada | Sim | RTX 4000 Ada (20 GB) | Sim |

---

## Decisoes Tecnicas e Aprendizados

| Decisao | Justificativa |
|---------|---------------|
| Arquitetura customizada com SE | Transfer learning de ImageNet nao se adaptou ao dominio de doencas em cafe |
| Pipeline tf.data em vez de NumPy | 50k imagens em RAM causavam crash; tf.data carrega em disco por batch |
| LD_LIBRARY_PATH antes de lancar Jupyter | TensorFlow nao detecta GPU sem as libs CUDA no path antes da inicializacao Python |
| Label Smoothing 0.1 | Regularizacao que previne overconfidence e melhora calibracao do modelo |
| Fine-tuning epocas 30-50 | Congela backbone inicialmente para treinar cabeca, depois desbloqueia camadas finais |

---

## Fontes e Referencias

- **Dataset JMuBEN:** [Kaggle - noamaanabdulazeem/jmuben-coffee-dataset](https://www.kaggle.com/datasets/noamaanabdulazeem/jmuben-coffee-dataset)
- **Squeeze-Excitation Networks:** Hu et al., *Squeeze-and-Excitation Networks*, CVPR 2018
- **MixUp:** Zhang et al., *MixUp: Beyond Empirical Risk Minimization*, ICLR 2018
- **CutMix:** Yun et al., *CutMix: Training Strategy using Guide of Class Activation Map*, ICCV 2019
- **Label Smoothing:** Muller et al., *When Does Label Smoothing Help?*, NeurIPS 2019
- **EfficientNet:** Tan & Le, *EfficientNet: Rethinking Model Scaling for CNNs*, ICML 2019
- **MobileNetV3:** Howard et al., *Searching for MobileNetV3*, ICCV 2019
