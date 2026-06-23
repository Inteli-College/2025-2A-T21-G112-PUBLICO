---
title: "Analise e Melhoria do Dataset"
sidebar_position: 1
---

# Sprint 2 - Analise e Melhoria do Dataset

:::success Status
Sprint concluida. Dataset v3 com CLAHE, 224x224 e tres fontes geograficas entregue. Imagens sinteticas eliminadas.
:::

## Objetivo

Identificar os problemas no dataset que contribuem para a baixa acuracia (60-70%) e corrigi-los para sustentar uma performance superior na Sprint 3.

---

## O que foi feito

### 1. Download e analise dos datasets

Foram utilizadas **tres fontes de dados** de regioes geograficas distintas para maximizar diversidade e robustez do modelo:

- **JMuBEN** (Mutira Coffee Plantation, Quenia) — 58.549 imagens, 5 classes
- **BRACOL** (plantacoes de Sao Paulo, Brasil) — 7.265 crops extraidos de anotacoes YOLO, 4 classes (sem Healthy)
- **Ethiopian Coffee Leaf Disease** (Etiopia) — 3.000 imagens por classe, alta resolucao (1024x768)

### 2. Problema encontrado: desbalanceamento

| Classe | Quantidade | % | Status |
|---|---|---|---|
| Healthy | 18.983 | 32,4% | Excesso |
| Miner | 16.978 | 29,0% | Excesso |
| Leaf Rust | 8.336 | 14,2% | OK |
| Cercospora | 7.681 | 13,1% | Insuficiente |
| Phoma | 6.571 | 11,2% | Insuficiente |

**Ratio de desbalanceamento: 2,89:1** (Healthy vs Phoma)

Isso significa que o modelo via quase 3x mais exemplos de `Healthy` do que de `Phoma`, ficando viciado nas classes majoritarias e errando mais nas minoritarias — uma das causas diretas dos 60-70% de acuracia.

### 3. Problema encontrado: imagens de baixa qualidade

**304 imagens da classe Leaf Rust** apresentaram desvio padrao de pixel abaixo de 10 (imagens quase uniformes, sem informacao visual util). Essas imagens foram removidas antes do balanceamento.

### 4. Pre-processamento: CLAHE + upscale para 224x224

Duas melhorias aplicadas a **cada imagem** antes do balanceamento:

**CLAHE** (Contrast Limited Adaptive Histogram Equalization): realca o contraste localmente, destacando texturas e manchas que indicam doencas. Aplicado no canal L do espaco de cor LAB para nao distorcer as cores.

> Referencia: DenseNet201 + CLAHE atingiu **94,84% de acuracia** em cafe (vs ~87% sem CLAHE)

**Upscale para 224x224**: resolucao padrao para modelos de transfer learning (EfficientNet, ResNet). As imagens originais eram 128x128 — resolucao insuficiente para capturar detalhes finos de lesoes.

### 5. Pipeline de balanceamento com tres fontes

| Classe | JMuBEN | BRACOL | Ethiopian | Total real | Sinteticas | Final |
|---|---|---|---|---|---|---|
| Cercospora | 7.681 | 185 | 2.515 | 10.381 | ~192 leves | 10.000 |
| Healthy | 18.983 | 0 | 368 | 19.351 | 0 | 10.000 |
| Leaf Rust | 6.062* | 3.905 | 33 | 10.000 | 0 | 10.000 |
| Miner | 9.817 | 183 | 0 | 10.000 | 0 | 10.000 |
| Phoma | 6.571 | 1.614 | 1.812 | 9.997 | ~3 leves | 10.000 |
| **TOTAL** | | | | **~59.729** | **~195** | **50.000** |

*apos remocao das 304 imagens de baixo contraste

### 6. Tecnicas de augmentation aplicadas

Baseado em literatura cientifica de classificacao de doencas em plantas (2023-2024):

| Tecnica | Justificativa |
|---|---|
| Flip horizontal e vertical | Invariancia a orientacao da folha |
| Rotacao (±30°) | Folhas sao capturadas em qualquer angulo |
| Variacao de brilho e contraste (±30%) | Variacao de iluminacao em campo |
| Variacao de saturacao (±20%) | Variacao de cor entre estagios da doenca |
| Gaussian Blur leve | Simula diferentes distancias de captura |
| Combinacao aleatoria de 1 a 3 tecnicas | Maior diversidade sintetica |

---

## Entregaveis

- **Dataset v3:** `~/datasets/coffee_balanced_v3_224/` — 50.000 imagens, 10.000/classe, 224x224, CLAHE aplicado, tres fontes geograficas (Quenia, Brasil, Etiopia), quase zero sinteticas
- **Notebook:** `Modulo XV/notebooks/sprint-2/confusion_matrix_analysis.ipynb`
- **Graficos:** distribuicao por fonte, comparativo CLAHE antes/depois, amostras visuais

---

## KPIs de Qualidade

| KPI | Antes | Depois | Meta atingida |
|---|---|---|---|
| Ratio de desbalanceamento | 2,89:1 | 1,00:1 | Sim |
| Imagens corrompidas | 0 | 0 | Sim |
| Imagens baixo contraste | 304 | 0 | Sim |
| Total por classe (min) | 6.571 | 10.000 | Sim |
| Total por classe (max) | 18.983 | 10.000 | Sim |
| Resolucao | 128x128 | 224x224 | Sim |
| Pre-processamento CLAHE | Nao | Sim | Sim |
| Fontes geograficas | 1 (Quenia) | 3 (Quenia + Brasil + Etiopia) | Sim |

---

## Impacto esperado na Sprint 3

Com o dataset balanceado, o modelo vai ver a mesma quantidade de exemplos de cada doenca durante o treino. Isso tende a:

- Melhorar o recall das classes minoritarias (Phoma, Cercospora)
- Reduzir o vies para classes majoritarias (Healthy, Miner)
- Puxar a acuracia geral para proxima da meta de 85%+

---

## Fontes e Referencias

- **JMuBEN:** [Kaggle - noamaanabdulazeem/jmuben-coffee-dataset](https://www.kaggle.com/datasets/noamaanabdulazeem/jmuben-coffee-dataset) — Mutira Plantation, Quenia
- **BRACOL:** [Kaggle - jonatanfragoso/bracol-for-yolov8-detection](https://www.kaggle.com/datasets/jonatanfragoso/bracol-for-yolov8-detection) — Plantacoes de Sao Paulo, Brasil (CC BY 4.0)
- **CLAHE:** *Improving Deep Learning Classifiers Performance via Preprocessing and Class Imbalance Approaches* (MDPI Agronomy, 2023)
- **Augmentation:** *A systematic literature review on image augmentation for plant disease detection* (ScienceDirect, 2024)
