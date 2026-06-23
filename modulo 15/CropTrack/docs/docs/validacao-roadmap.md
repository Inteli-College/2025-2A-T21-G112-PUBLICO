---
title: "Validação do Roadmap — Expectativa × Entrega"
sidebar_position: 98
---

# Validação do Roadmap — Expectativa × Entrega

> Fechamento do projeto: confronto entre o que foi **planejado** (roadmap das
> Sprints 1–10) e o que foi **efetivamente entregue**, com as divergências
> reconciliadas de forma honesta. Legenda: ✅ entregue como planejado ·
> 🔁 entregue com mudança/evolução · ➕ entregue além do plano · ⚠️ não concluído.

:::info Resumo
O projeto cumpriu o roadmap nas duas fases — **técnica (Sprints 1–5)** e
**business (Sprints 6–10)**. Houve duas evoluções deliberadas em relação ao
plano original: o **preço por valor** (de R$ 1/ha para R$ 5–10/ha, escalando o
mercado) e o **canal de entrada** (de uma lista teórica de cooperativas para o
canal concreto **Casa da Roça + piloto em Jaguaré**). Ambas estão refletidas na
apresentação final e na [Conclusão](./conclusao).
:::

---

## Fase Técnica — Sprints 1–5

| Sprint | Expectativa | Entrega | Status |
|---|---|---|---|
| 1 | Entender o problema, explorar dataset, 1ºs experimentos | Feito; problema e dataset de café mapeados | ✅ |
| 2 | Pipeline de treino + modelos base de classificação | CNNs base treinadas | ✅ |
| 3 | Modelo otimizado (CustomCNN_SE) com alta acurácia | Alta acurácia em dataset público — **mas frágil em campo (60–70%)** | 🔁 |
| 4 | Integração do modelo no backend + Grid Scan | Backend Flask + feature de varredura | ✅ |
| 5 | **Pivot para detecção (YOLOv8)** + plataforma de campos | Plataforma React/Flask, mapa, vídeo, dashboard, 4 detectores | ✅ |

**Validação técnica (resultado real):** detector **YOLOv8n fine-tunado**,
**≈ 3,01M parâmetros**, 4 classes de café, **mAP@50 90,3%** · mAP@50-95 61,5% ·
P 85,8% · R 85,4% (métricas de validação de treino). O pivot de *classificação*
→ *detecção* foi a decisão técnica central e cumpriu a meta de confiança (~85%+).

➕ **Entregue além do plano técnico:** análise de vídeo **assíncrona** (job em
background + notificação), **persistência** (localStorage + backend), **log de
atividades / linha do tempo por fazenda**, **persistência de vídeos analisados**
no backend e endpoints de reset.

---

## Fase Business — Sprints 6–10

### Sprint 6 — Planejamento e Roadmap
| Expectativa (KPI) | Entrega | Status |
|---|---|---|
| Roadmap das próximas 4 sprints | Documentado | ✅ |
| Segmentos de mercado definidos | Grandes fazendas, cooperativas, consultores | ✅ |
| Modelo de negócio base | SaaS por hectare definido | ✅ |
| Análise competitiva inicial | 4 concorrentes mapeados | ✅ |
| Estimativas de impacto financeiro | ROI 4–12× estimado | ✅ |

### Sprint 7 — Análise de Mercado
| Expectativa (KPI) | Entrega | Status |
|---|---|---|
| TAM/SAM/SOM com fontes | Documentado (EMBRAPA, CNC, CONAB, IBGE) | 🔁 *(ver reconciliação de preço)* |
| Análise de ≥ 6 concorrentes | 7 concorrentes detalhados | ✅ |
| Mapa de posicionamento 2×2 | Custo × precisão | ✅ |
| Pricing com 3 planos + justificativa | Starter/Fazenda/Cooperativa | 🔁 *(preço evoluiu)* |
| Análise de sensibilidade + break-even | 5 cenários + break-even 25–30 clientes | ✅ |
| Parcerias estratégicas | Ecossistema mapeado | ✅ |

### Sprint 8 — Go-to-Market
| Expectativa (KPI) | Entrega | Status |
|---|---|---|
| Pitch deck completo | Deck final da banca (tema escuro, narrativa completa) | ✅ |
| One-pager comercial | Cópia pronta | ✅ |
| Case de ROI por fazenda | Cálculo fechado (R$ 7,5–27,6k/safra, ROI 4–12×) | ✅ |
| Estratégia de canal (3 segmentos) | Cooperativas, RTs, eventos, conteúdo | 🔁 *(canal real: Casa da Roça)* |
| Calendário editorial | 4 semanas | ✅ |
| Spec da landing page | Entregue | ✅ |

### Sprint 9 — Análise de Impacto
| Expectativa (KPI) | Entrega | Status |
|---|---|---|
| ROI para 3 perfis de cliente | 50/200/500 ha + cooperativa | ✅ |
| Impacto ambiental quantificado | Agroquímico evitado + certificações | ✅ |
| Projeções financeiras (3 cenários) | P&L 12/24/36 meses | ✅ |
| Mapa de stakeholders | Completo | ✅ |
| Benchmarks internacionais | Plantix, Taranis, Agrio | ✅ |

### Sprint 10 — Entrega Final
| Expectativa (KPI) | Entrega | Status |
|---|---|---|
| Business plan completo | Consolidado (docs + [Conclusão](./conclusao)) | ✅ |
| Relatório de impacto | Síntese técnica + mercado + limitações | ✅ |
| Pitch deck (banca + investidor) | Deck final apresentado | ✅ |
| Roteiro de 20 min | Preparado | ✅ |
| ≥ 10 perguntas da banca mapeadas | Banco de Q&A | ✅ |
| Documentação de continuidade | Esta validação + Conclusão | ✅ |

➕ **Entregue além do plano de business:** **validação qualitativa real** medida
(**NPS +50**, n = 8 agrônomos), **canal de distribuição concreto** (rede
**Casa da Roça**, 9 lojas no PA) e **design partner / piloto** definido
(lavoura da família em **Jaguaré-ES**) — tração que o roadmap só previa como
"próximo passo".

---

## Reconciliação das divergências (honesta)

Onde a entrega final diferiu do plano, e qual valor prevalece:

| Tema | Plano (roadmap) | Entrega final (defesa) | Por quê |
|---|---|---|---|
| **Preço** | R$ 1,00/ha/mês (Starter R$199 + Fazenda R$0,80–1,20) | **R$ 5/ha (Entrada) · R$ 10/ha (Premium) · Cooperativa** | Preço **por valor**: quem já paga avião/drone aceita ticket maior |
| **TAM/SAM/SOM** | R$ 22,8M (café) / R$ 11,4M / R$ 120k | **R$ 1,8 bi / R$ 114M / R$ 1,2M** | Reflexo do reajuste de preço (10×) sobre as mesmas bases de área |
| **Canal de entrada** | Lista de 10 cooperativas (Cooxupé, Minasul…) | **Casa da Roça (PA)** + piloto **Jaguaré (ES)** | Canal e campo **já acessíveis** via rede da família |
| **Métrica de modelo** | Acurácia de classificação | **mAP@50 90,3%** (detecção, 4 classes) | Pivot p/ detecção mudou a métrica natural |
| **Tração** | Projeções (LTV/CAC, P&L) | **NPS +50 medido** + projeções rotuladas | Validação medida pesa mais que projeção |

:::tip Valor que prevalece
Para qualquer artefato futuro (pitch, business plan), adotar os **números da
defesa final**: preço **R$ 5–10/ha/mês**, **TAM R$ 1,8 bi / SAM R$ 114M /
SOM R$ 1,2M**, canal **Casa da Roça + Jaguaré**, e a métrica **mAP@50 90,3%**.
:::

---

## Pontos de atenção remanescentes (para corrigir nos materiais)

Levantados na revisão do deck final — não bloqueiam a entrega, mas devem ser
ajustados nos materiais de divulgação:

- **Marca:** padronizar **"CropTrack"** (uma palavra, como no produto) — o deck
  usa "Crop Track".
- **Slide de modelo de negócio:** o card de entrada exibe "R$ 1/ha" com exemplo
  de "R$ 12.000/ano" (que corresponde a **R$ 5/ha**) — corrigir para R$ 5/ha.
- **Métricas:** o painel exibido (88,8% de acurácia, matriz de 5 classes) é uma
  visualização **ilustrativa**; o número medido e defensável é o **mAP@50 90,3%**
  do checkpoint.
- **Capa:** confirmar o número do módulo (XV vs. XVI).

---

## Veredito

O roadmap foi **cumprido integralmente** nas duas fases, com **entregas acima do
previsto** no lado de engenharia (vídeo assíncrono, persistência, métricas) e de
tração (NPS, canal, piloto). As divergências em relação ao plano são **evoluções
deliberadas e documentadas**, não falhas de execução. O projeto está pronto para
a defesa e para continuidade — ver [Conclusão](./conclusao).
