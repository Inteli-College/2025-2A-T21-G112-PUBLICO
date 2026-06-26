# CropTrack: Early Detection of Coffee Leaf Diseases through Computer Vision

**A perennial-crop health monitoring platform.**

Final Course Project (TCC) submitted to the Institute of Technology and Leadership
(INTELI) to obtain a bachelor's degree in Computer Engineering.

**Authors:** Eduardo França Porto · Marcos Vinicyus Rosa Teixeira
**Advisor:** Prof. Rodrigo Nicola
**Team G112 · T21 · São Paulo · 2025/2A**

> Projeto **concluído**. Este README segue a estrutura do Template de TCC do Inteli
> (Trilha Empreendedora, NBR 14724).

---

## Abstract

CropTrack is a B2B computer-vision platform that detects coffee leaf diseases and
pests early, from images or video, without proprietary hardware. The work pivoted
from a from-scratch CNN **classifier** (fragile in the field, 60–70%) to a
fine-tuned **YOLOv8 object detector**, which answers *where* and *how much* disease
is present and reached **90.3% mAP@50** (precision 85.8%, recall 85.4%) on four
coffee classes. Around the model, a field platform was built (React + Flask):
georeferenced plot map, Manager → Collector → Manager workflow, asynchronous video
analysis with notification, and an agronomic dashboard. The market was sized
(TAM R$ 1.8 bi / SAM R$ 114 M / SOM R$ 1.2 M) and a per-hectare SaaS model defined
(R$ 5–10/ha/month). Validation was qualitative and measured (NPS +50, n = 8
agronomists), with a real distribution channel (Casa da Roça, PA) and a field
pilot (Jaguaré, ES). The problem was externally validated by Y Combinator's 2026
Request for Startups. The project is pre-pilot: field ground-truth validation is
the next step.

**Keywords:** computer vision; object detection; coffee; precision agriculture;
software as a service.

## Resumo

O CropTrack é uma plataforma B2B de visão computacional que detecta precocemente
doenças e pragas em folhas de café, a partir de imagem ou vídeo, sem hardware
proprietário. O trabalho pivotou de um **classificador CNN** próprio (frágil em
campo, 60–70%) para um **detector YOLOv8** fine-tunado, que responde *onde* e
*quanto* de doença há e atingiu **90,3% de mAP@50** (precisão 85,8%, recall 85,4%)
em quatro classes de café. Em volta do modelo construiu-se uma plataforma de campo
(React + Flask): mapa de talhão georreferenciado, fluxo Gestor → Coletor → Gestor,
análise de vídeo assíncrona com notificação e dashboard agronômico. O mercado foi
dimensionado (TAM R$ 1,8 bi / SAM R$ 114 M / SOM R$ 1,2 M) e definido um modelo
SaaS por hectare (R$ 5–10/ha/mês). A validação foi qualitativa e medida (NPS +50,
n = 8 agrônomos), com canal real (Casa da Roça, PA) e piloto de campo (Jaguaré,
ES). O problema foi validado externamente pela Request for Startups 2026 da Y
Combinator. O projeto é pré-piloto: a validação com ground truth de campo é o
próximo passo.

**Palavras-chave:** visão computacional; detecção de objetos; café; agricultura de
precisão; software como serviço.

---

## Summary

1. [Introduction](#1-introduction)
2. [Solution Development](#2-solution-development)
   - 2.1 [Market Premises and Hypotheses](#21-market-premises-and-hypotheses)
   - 2.2 [Market Sizing and Analysis](#22-market-sizing-and-analysis)
   - 2.3 [Competitive Analysis and Differentiators](#23-competitive-analysis-and-differentiators)
   - 2.4 [Technological Solution](#24-technological-solution)
   - 2.5 [The Business Plan](#25-the-business-plan)
   - 2.6 [Validation and Results](#26-validation-and-results)
3. [Conclusion](#3-conclusion)
4. [References](#references)
5. [Appendices](#appendices)

---

## 1. Introduction

The world must produce 60–70% more food by 2050 with no new arable land — 87% of
that growth has to come from **productivity**, and the first step is to **stop
losing what is already planted**. In Brazil, pests and diseases cost R$ 55–60
billion per year; coffee alone loses ~R$ 4.5 billion. Detection in the field is
still **manual**: slow, sub-sampled and expensive, and the producer sprays
fungicide "out of fear", not from data. Brazil is the world's largest coffee
producer (~34%), which puts it at the epicenter of these losses.

**General objective:** create and validate a computer-vision solution for early
detection of diseases/pests in coffee leaves, and develop a business plan for its
introduction to the market.

**Specific objectives:**
- Develop the detection MVP (fine-tuned YOLOv8) with field-usable confidence (~85%+);
- Build the field platform: plot map, image/video analysis, agronomic dashboard;
- Size the market (TAM/SAM/SOM) and define a revenue model;
- Validate the problem and solution qualitatively (interviews, usability/NPS);
- Map the competitive landscape and the sustainable advantage.

**Chapters.** Section 2 develops the solution — market premises and hypotheses,
market sizing, competition, the technological solution (MVP), the business plan and
the market validation. Section 3 concludes with objectives achieved, limitations
and next steps.

---

## 2. Solution Development

### 2.1 Market Premises and Hypotheses

- **Problem hypothesis.** Coffee producers detect disease too late, through manual
  scouting, spending on preventive fungicide without data and keeping no memory per
  plot — generating quantifiable losses (late rust detection on 200 ha can cost
  R$ 160k–500k/harvest).
- **Solution hypothesis.** AI detection (YOLOv8) over a cheap camera/phone,
  georeferenced, delivers an early and **localized** diagnosis (*where* and *how
  much*), turning a label into a management decision — without proprietary hardware.
- **Value hypothesis.** Producers accept SaaS **per hectare** (R$ 5–10/ha/month)
  because avoiding a **single** unnecessary fungicide application on 200 ha
  (R$ 30–50k) pays years of subscription — an ROI of 4–12×.

### 2.2 Market Sizing and Analysis

| Funnel | Value | Basis |
|---|---|---|
| **TAM** | **R$ 1.8 bi/year** | 15M ha of perennial crops in BR × R$ 10/ha/month × 12 |
| **SAM** | **R$ 114 M/year** | ~950k ha of coffee > 50 ha with connectivity + ~100 cooperatives |
| **SOM** | **R$ 1.2 M/year** | 50 clients · 200 ha avg · 12–18 months (0.25% conversion) |

Sources: EMBRAPA/MAPA, CNC, CONAB, IBGE.

**Customer segmentation and profiling.** (1) Large coffee farms (> 50 ha) —
centralized decision in the agronomist manager, high willingness to pay;
(2) Coffee cooperatives — access to hundreds of associates at once, white-label;
(3) Agronomist consultants (RTs) — use the tool as a service differentiator and as
an acquisition channel.

### 2.3 Competitive Analysis and Differentiators

| Solution | AI diagnosis | Plot map | No proprietary HW | Coffee BR |
|---|:--:|:--:|:--:|:--:|
| **CropTrack** | ✅ | ✅ | ✅ | ✅ |
| Aegro | ❌ | ❌ | ✅ | Partial |
| Taranis | ✅ | ✅ | ❌ | ❌ |
| Plantix | ✅ (phone) | ❌ | ✅ | ❌ |
| Strider | ❌ (manual) | ✅ | ✅ | Partial |
| Agronow | Partial (NDVI) | Partial | ✅ | ❌ |
| Agrio | ✅ (phone) | ❌ | ✅ | ❌ |

**Sustainable advantage (moat):** proprietary Brazilian field data that improves
every harvest; **switching cost** from the per-plot history locked in the platform;
**cooperative white-label channel** (network effect); coffee as a beachhead that
credentials the other perennials. The only competitor with comparable precision
(Taranis) costs 5–10× more and has no Brazilian operation.

### 2.4 Technological Solution

**Methodology.** Agile/Scrum across 10 two-week sprints (5 technical, 5 business).

**MVP — phases, modules and features:**
- **AI engine:** fine-tuned **YOLOv8** detection over photo and video (4 specialized
  detectors); annotated bounding boxes.
- **Georeferenced plot map** (Leaflet + satellite imagery) with collection spots.
- **Role-based field flow:** Manager → Collector → Manager (release, collect,
  validate), with **asynchronous video analysis** (background job + notification +
  persistence) and an **agronomic dashboard** (health distribution, alerts, weather,
  per-plot timeline).

**Test results (final model).** YOLOv8n fine-tuned, **≈ 3.01 M parameters**, 4
coffee classes (`brown_eye_spot`, `leaf_miner`, `leaf_rust`, `red_spider_mite`):

| Metric | Value |
|---|---|
| **mAP@50** | **90.3%** |
| mAP@50-95 | 61.5% |
| Precision | 85.8% |
| Recall | 85.4% |

The pivot from *classification* (CustomCNN, fragile in the field) to *detection*
(YOLOv8) was the central technical decision and met the ~85%+ confidence target.

### 2.5 The Business Plan

**Per-hectare SaaS** — the agribusiness's natural unit:

| Plan | Price | Audience |
|---|---|---|
| Entry | R$ 5/ha/month | Consultants and smaller farms |
| Premium | R$ 10/ha/month | Producers already using plane/drone |
| Cooperative | Negotiated (min. R$ 5,000/month) | White-label for associates |

- **Break-even:** 25–30 clients sustain the product with one dedicated person.
- **Anchoring:** the ~R$ 12k/year cost (200 ha farm) against R$ 160–500k of harvest
  loss and R$ 60–90k saved in chemicals/aircraft.
- **Channels:** cooperatives (white-label), the family network **Casa da Roça** (PA,
  9 agro stores), agronomist RTs, sector events and digital content.

### 2.6 Validation and Results

**Validation methodology.** Pain interviews with producers/agronomists; usability
test of the app with NPS measurement; identification of a real distribution channel
and a design partner for the field pilot.

**Market validation results.**
- **NPS +50** (n = 8 agronomists) — measured, not projected.
- **Distribution channel in hand:** the **Casa da Roça** network (9 agro stores in
  southeastern Pará, family business) — direct access to hundreds of producers, low CAC.
- **Design partner / pilot:** the family coffee farm in **Jaguaré (ES)** — the path
  to the first real field ground truth.
- **External validation:** **Y Combinator** named *"AI for Low-Pesticide
  Agriculture"* the #1 Request for Startups of 2026 — essentially the CropTrack thesis.

---

## 3. Conclusion

The project met its roadmap in both phases. On the technical side, the pivot from
classification to **YOLOv8 detection** took the model from a fragile PoC to a
detector with **90.3% mAP@50**, embedded in a usable field platform. On the business
side, the problem was **validated externally** (YC) and **qualitatively** (NPS +50),
with a **channel and a pilot already accessible** (Casa da Roça + Jaguaré). More than
a model, CropTrack is a product coherent with a real problem, built with transparency
about its stage.

**Limitations.** No field ground-truth validation yet (metrics are from the training
validation set); pre-pilot, no paying revenue; dataset imbalance and the
laboratory → field gap.

**Future projections.** Field pilot in Jaguaré to generate ground truth; continuous
re-training with proprietary field data; **edge inference** (model on the phone) for
offline field use; cloud production architecture (queue + stateless workers + S3 +
Postgres); expansion to citrus, eucalyptus, cocoa and fruit.

The end of the module is not the end of CropTrack — it is the start of the
go-to-market.

> *"We don't monitor harvests. We protect investments that take decades to grow."*

---

## References

- FAO. *Global Agriculture towards 2050.* / *The State of Food and Agriculture, 2025.*
- ONU. *World Population Prospects, 2024.*
- EMBRAPA Café / MAPA. Coffee disease losses in Brazil.
- CNC — Conselho Nacional do Café. Coffee properties in Brazil.
- CONAB. *Levantamento da Safra de Café, 2024/25.*
- IBGE. Agricultural census data.
- Grand View Research. *Coffee Market Report* (CAGR 5.3%).
- Y Combinator. *Requests for Startups — "AI for Low-Pesticide Agriculture", 2026.*
- Ultralytics. *YOLOv8 Documentation.*
- Agrolink / EMBRAPA. Agricultural losses from pests in Brazil.

## Appendices

Supporting material produced by the authors, in `modulo 15/CropTrack/`:

- **`docs/`** — full documentation (Docusaurus): sprint roadmap, the
  *Roadmap Validation (Expectation × Delivery)* and the *Conclusion*.
- **`backend/` · `frontend/`** — the CropTrack platform source code. Run
  instructions in `README_RUN.md`.
- **`metrics/`** — model metric charts and reports.
- **`notebooks/`** — training/analysis notebooks.

---

[Eduardo França Porto](https://www.linkedin.com/in/eduardo-franca-porto/) ·
[Marcos Vinicyus Rosa Teixeira](https://www.linkedin.com/in/marcos-teixeira-37676a24a/)
