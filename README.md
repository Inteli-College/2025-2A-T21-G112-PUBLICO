# CropTrack: Early Detection of Coffee Leaf Diseases through Computer Vision

**A perennial-crop health monitoring platform.**

Final Course Project (TCC) submitted to the Institute of Technology and Leadership
(INTELI) to obtain a bachelor's degree in Computer Engineering.

**Authors:** Eduardo França Porto · Marcos Vinicyus Rosa Teixeira
**Advisor:** Prof. Rodrigo Nicola
**Team G112 · T21 · São Paulo · 2025/2A**

> Project **completed**. This README follows the structure of INTELI's Final Course
> Project template (Entrepreneurial track, NBR 14724).

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

Global food security is, this century, fundamentally a productivity problem. The
United Nations projects the world population will grow from 8.2 billion (2025) to
9.8 billion by 2050 — an additional 1.6 billion people, most of them in emerging
economies whose diets are simultaneously becoming more protein- and coffee-intensive.
The Food and Agriculture Organization (FAO) estimates that meeting this demand
requires global agricultural output to rise **60–70%** by 2050. Crucially, there is
no longer abundant arable land to expand into: of the projected production growth,
the FAO attributes **87% to productivity gains** (more per hectare), 7% to higher
cropping intensity and only 6% to area expansion. The strategic conclusion is direct
— the future of food depends on producing more with what already exists, and the
first step is to **stop losing what is already planted**.

The losses are large and concrete. In Brazil, pests and diseases cost agriculture an
estimated **R$ 55–60 billion per year** (Agrolink/EMBRAPA), and productivity drops of
up to **40%** are documented depending on the crop and region. In coffee specifically,
diseases such as leaf rust, leaf miner and brown eye spot (cercospora) cause losses
of roughly **R$ 4.5 billion per year** (≈ US$ 900 million; EMBRAPA Café/MAPA). Brazil
is the world's largest producer and exporter of coffee (~34% of global output), with
~330,000 coffee properties and 1.9 million hectares in production — which means each
percentage point of productivity lost in Brazil reverberates through the entire
global supply chain.

Despite the availability and falling cost of technology, the field remains largely
**analog**. Disease detection is still done by **manual scouting**: an agronomist
walks a fraction of the plot, by eye, on a fortnightly basis. This is expensive,
slow and sub-sampled, and it pushes the producer to spray fungicide on a fixed
calendar — **out of fear, not out of data** — with no institutional memory of what
happened in each plot across harvests. Adoption is the bottleneck, not the technology:
~78% of Brazilian coffee producers are family operations with low digitalization,
so any solution must be **simple and hardware-free** to be adopted at all.

A unique technological window now makes the solution viable: open-source computer
vision models (YOLOv8) trainable with modest data, near-zero cloud inference cost,
expanding rural 4G coverage, affordable cameras and drones, and regulatory pressure
for traceability (EU Deforestation Regulation). External validation came in 2026,
when Y Combinator named *"AI for Low-Pesticide Agriculture"* its **#1 Request for
Startups** — a near-verbatim description of the CropTrack thesis.

**General objective.** Create and validate a computer-vision solution for early
detection of diseases and pests in coffee leaves, and develop a business plan for
its introduction to the market.

**Specific objectives.**
- Develop the detection MVP (a fine-tuned YOLOv8 model) with field-usable confidence
  (a target of ~85%+ on the chosen metric);
- Build the field platform around the model: georeferenced plot map, image and video
  analysis, role-based workflow and an agronomic dashboard;
- Size the addressable market (TAM/SAM/SOM) with primary sources and define a
  defensible revenue model;
- Validate the problem and the solution qualitatively (interviews and usability/NPS)
  and secure a real distribution channel and a field pilot;
- Map the competitive landscape and articulate the sustainable competitive advantage.

**Document structure.** Section 2 develops the solution: it states the market
premises and the problem/solution/value hypotheses (2.1), sizes the market and
profiles the customer (2.2), analyzes competitors and differentiators (2.3),
describes the technological solution and the MVP results (2.4), presents the business
plan (2.5) and reports the market validation (2.6). Section 3 concludes, stating
whether the objectives were achieved, the honest limitations and the future
projections for the venture.

---

## 2. Solution Development

### 2.1 Market Premises and Hypotheses

The project was structured around three explicit, falsifiable hypotheses, in the
lean-startup tradition — a problem hypothesis, a solution hypothesis and a value
hypothesis — each tied to a way of being validated.

**Problem hypothesis.** *Coffee producers detect disease too late.* Detection today
relies on manual scouting, which is sub-sampled by construction (the agronomist sees
a fraction of the plot) and reactive. The economic consequence is twofold: first,
producers over-apply fungicide preventively, paying for chemicals they may not need;
second, when a focus of disease such as leaf rust is finally noticed, the loss has
already compounded. On a 200-hectare farm, late rust detection can mean
**R$ 160,000–500,000** of lost production in a single harvest — far more than any
monitoring technology would cost. There is also no per-plot memory: each harvest
restarts from zero, with no historical basis to guide management.

**Solution hypothesis.** *AI detection over a cheap camera, georeferenced, delivers an
early and localized diagnosis.* By running an object-detection model (YOLOv8) over a
photo or video captured with a phone or drone, the platform returns not a single
label but bounding boxes that answer **where** the disease is in the plot and **how
much** of it there is. Tied to a georeferenced plot map, this transforms a diagnosis
into a **management decision** (targeted application, re-inspection), without any
proprietary hardware — addressing the adoption barrier directly.

**Value hypothesis.** *Producers accept a per-hectare SaaS because the saving dwarfs
the price.* The agribusiness already reasons in cost-per-hectare (inputs, labor,
harvest), so charging per hectare is the natural unit. The anchoring is strong:
avoiding a **single** unnecessary fungicide application on 200 hectares saves
**R$ 30,000–50,000**, while the platform costs on the order of **R$ 12,000/year** for
the same farm — an ROI in the range of **4× to 12×**, i.e., the tool pays for itself
many times over with one avoided spray.

These hypotheses were not left theoretical: Section 2.6 reports how each was probed
through interviews, a usability test with measured NPS, and the securing of a real
channel and pilot.

### 2.2 Market Sizing and Analysis

The market was sized top-down, starting from the total perennial-crop opportunity in
Brazil and funneling by technological eligibility and early-stage conversion capacity.
Pricing in this sizing uses the Premium reference of **R$ 10/ha/month** (the price
accepted by producers who already pay for aircraft/drone services — see 2.5).

**TAM — Total Addressable Market.** Brazil has roughly **15 million hectares** of
perennial crops with potential use (coffee, citrus, eucalyptus, cocoa, fruit). At
R$ 10/ha/month over twelve months, the total addressable market is:

```
15,000,000 ha × R$ 10/ha/month × 12 = R$ 1.8 billion/year
```

Restricting to coffee in production alone (1.9 million hectares, EMBRAPA/MAPA 2024)
gives an addressable coffee-only figure of ~R$ 228 million/year — the immediate,
most defensible beachhead within the larger perennial TAM.

**SAM — Serviceable Addressable Market.** Not every hectare is reachable with the
current product. The eligibility criteria are: farm area above 50 ha (so per-hectare
SaaS is viable), field connectivity (rural 4G or fiber), a responsible agronomist,
and the capacity to pay without public subsidy. Applying these filters yields roughly
**950,000 eligible hectares** of coffee plus around 100 medium/large cooperatives:

```
950,000 ha × R$ 10/ha/month × 12        = R$ 114 million/year
(plus ~100 cooperatives as a white-label channel layer)
SAM ≈ R$ 114 million/year
```

**SOM — Serviceable Obtainable Market.** The share realistically capturable in the
first 12–18 months with the current team and resources. The base scenario is 50
clients with an average of 200 ha:

```
50 clients × 200 ha × R$ 10/ha/month × 12 = R$ 1.2 million/year
```

This implies an implicit conversion of **0.25%** of the ~20,000 eligible farms — a
conservative figure for a pre-seed stage, consistent with Brazilian AgTech benchmarks
(e.g., Strider reached 50–80 clients in its first 18 months).

```
TAM  R$ 1.8 bi/year   (15M ha of perennials)
 └ SAM  R$ 114 M/year   (coffee > 50 ha + cooperatives)
    └ SOM  R$ 1.2 M/year   (50 clients · 12–18 months)
```

**Customer segmentation and profiling.** Three priority segments were defined:

| Segment | Decision profile | Pain | Sales cycle |
|---|---|---|---|
| Large farms (> 50 ha) | Centralized in the manager agronomist | Loss from late detection; over-spraying | 2–4 weeks |
| Coffee cooperatives | Innovation/technical committee | Need to serve hundreds of associates and prove sustainable management | 4–8 weeks |
| Agronomist consultants (RTs) | The consultant himself | Differentiate the service; cover the whole plot | Per service |

The cooperative is strategically the highest-leverage channel — a single contract
reaches hundreds of producers and enables a white-label offer; the agronomist RT,
in turn, is both a user and an acquisition channel for end clients.

### 2.3 Competitive Analysis and Differentiators

The competitive landscape was mapped on two axes — **diagnosis precision** (low →
high) and **adoption cost** (low → high, including price, hardware dependency and
learning curve). CropTrack occupies the ideal quadrant: high precision at low
adoption cost, with no proprietary hardware.

| Solution | AI diagnosis | Plot map | No proprietary HW | Coffee BR | Est. ticket |
|---|:--:|:--:|:--:|:--:|---|
| **CropTrack** | ✅ YOLOv8 | ✅ | ✅ | ✅ | R$ 5–10/ha/month |
| Aegro | ❌ | ❌ | ✅ | Partial | R$ 529+/month |
| Solinftec | ❌ | Partial | ✅ HW | ❌ | R$ 2,000+ |
| Strider | ❌ (manual) | ✅ | ✅ | Partial | R$ 200–500 |
| Agronow | Partial (NDVI) | Partial | ✅ | ❌ | Negotiated |
| Plantix | ✅ (phone) | ❌ | ✅ | ❌ | Free |
| Taranis | ✅ (drone) | ✅ | Drone | ❌ | US$ 5–15/ha/yr |
| Agrio | ✅ (phone) | ❌ | ✅ | ❌ | Free |

Read individually: **Aegro** is a farm-management ERP with no disease vision (a
potential distribution partner, not a competitor); **Solinftec** does prescriptive
spraying but is hardware-dependent and does not diagnose disease visually nor serve
coffee; **Strider** digitizes integrated pest management but the diagnosis remains
100% manual; **Agronow** uses satellite NDVI whose resolution (meters) cannot detect
disease on an individual leaf; **Plantix** and **Agrio** do phone-photo diagnosis but
without georeferencing, plot map or history (and Plantix's user is not the B2B payer);
**Taranis** is the closest in capability (drone AI) but costs 5–10× more and has no
structured Brazilian operation.

**Sustainable advantage (moat).** Anyone can train a YOLO model — what cannot be
copied is (i) **proprietary Brazilian field data** that improves with every harvest;
(ii) the **switching cost** created by the per-plot history locked in the platform;
(iii) the **cooperative white-label channel**, which produces a network effect; and
(iv) **coffee as a beachhead**, the most demanding validation environment, which
credentials expansion into the other perennials.

### 2.4 Technological Solution

**Development methodology.** The project ran on an agile (Scrum) cadence across ten
two-week sprints — five technical and five business. The technical phase (Sprints
1–5) delivered the model and the platform; the business phase (Sprints 6–10) delivered
market analysis, go-to-market materials, impact analysis and the final consolidation.

**The technical journey (a deliberate pivot).** The first approach (Sprints 1–3) was
a from-scratch **classification** stack: custom CNNs (CustomCNN, and variants inspired
by ResNet/EfficientNet) over a large balanced coffee-leaf dataset. On the public test
set the best model reached very high accuracy, but two limits emerged: it fell to
**60–70% in realistic field conditions** (the classifiers learned global colour
shortcuts and failed to generalize), and, conceptually, classification answers the
wrong question — *is the leaf sick?* — without locating or quantifying the focus in
the plot. The decision (Sprint 5) was to **pivot from classification to object
detection**, fine-tuning **YOLOv8**. Detection returns *where* and *how much*, with a
far smaller data requirement than training from scratch, and reached the field-usable
confidence target. Recognizing the ceiling of the first attempt and migrating
deliberately is itself one of the project's main engineering results.

**MVP — modules and features.** Around the model, a full field platform was built
(React frontend, Flask backend):
- **AI engine:** YOLOv8 detection over photo and video, with annotated bounding boxes
  and multiple specialized detectors;
- **Georeferenced plot map** (Leaflet + satellite imagery): the manager draws the
  plot polygon and releases collection spots;
- **Role-based field workflow** (Manager → Collector → Manager): release, field
  collection, and validation, persisted across sessions;
- **Asynchronous video analysis:** long videos are processed in the background; the
  user can navigate away and is **notified on completion**, with the annotated result
  persisted and available on the manager's dashboard;
- **Agronomic dashboard:** health distribution, alerts, weather, and a per-plot
  activity timeline ("Field Life").

**Test results (final model).** The production detector is a **YOLOv8n** fine-tuned
for four coffee classes, with **≈ 3.01 million parameters** and ~6 MB of weights —
small enough to run on CPU and, in the future, on the collector's device:

| Metric | Value |
|---|---|
| **mAP@50** | **90.3%** |
| mAP@50-95 | 61.5% |
| Precision | 85.8% |
| Recall | 85.4% |

The 90.3% mAP@50 comfortably exceeds the ~85% confidence threshold set as a condition
for a real management decision, and contrasts with a generalist multi-disease detector
(33% mAP@50 over 29 classes) — evidence that focusing on coffee was the correct
technical choice.

**Production architecture (designed for scale).** Although the deliverable is a
monolithic prototype, the topology was designed to evolve in the cloud: an inference
microservice separated from the API, fed by a queue (SQS) with stateless,
auto-scaling workers (scale-to-zero); object storage (S3) for media and artifacts; a
relational database (Postgres + PostGIS) for plots and analyses; and notifications
(SNS). Because YOLOv8n is small and CPU-friendly, the analysis is inexpensive — the
estimated marginal cost is **under US$ 0.01 per hectare analyzed** — and a pilot can
operate for ~US$ 150–270/month (or ~US$ 20–60/month in a serverless footprint).

### 2.5 The Business Plan

The business model is **per-hectare SaaS**, priced by value, with three tiers:

| Plan | Price | Audience | Value |
|---|---|---|---|
| Entry | R$ 5/ha/month | Consultants and smaller farms (skeptics) | Quick diagnosis, low commitment |
| Premium | R$ 10/ha/month | Producers already using aircraft/drone | Scales with the property |
| Cooperative | Negotiated (min. R$ 5,000/month) | Multi-tenant for associates | White-label, reports |

**Price anchoring.** The price is anchored on the alternatives the customer already
pays: a manual technical visit (R$ 300–600), a full fungicide application on 200 ha
(R$ 30,000–50,000, 3–6×/year), monthly agronomic consulting (R$ 1,500–4,000). Against
these, R$ 5–10/ha/month is a fraction of the cost — and a small fraction of the loss
it prevents.

**Break-even and unit economics.** Monthly operating cost (infrastructure plus one
dedicated person) is on the order of R$ 4,200–8,000. The product becomes
self-sustaining with **25–30 clients** on the Premium plan — a target achievable in
the first year. The ROI for the client (4–12×) sustains the willingness to pay, and
the value anchor (one avoided spray) keeps the price well below the customer's
perceived value ceiling.

**Financial projection (labeled, base scenario).** With documented assumptions (CAC
R$ 500–1,500; annual churn 15–25%, a B2B-SMB SaaS benchmark), the base projection is:

| Metric | 12 months | 24 months | 36 months |
|---|---|---|---|
| Active clients | 15 | 45 | 100 |
| MRR | R$ 8k | R$ 24k | R$ 55k |
| Break-even | — | Month 18–22 | — |

These are projections, explicitly labeled as such; the venture is pre-revenue and the
churn/CAC figures are benchmarks, not measured values.

**Channels.** Four channels, prioritized by segment: cooperatives (white-label, the
highest-leverage); the family network **Casa da Roça** (9 agro stores in southeastern
Pará, an immediate low-CAC channel); agronomist RTs (the tool differentiates their
service); and sector events plus digital content for inbound.

### 2.6 Validation and Results

**Validation methodology.** Validation was deliberately empirical rather than
theoretical: (i) pain interviews with producers and agronomists to confirm the
problem hypothesis; (ii) a usability test of the application with measured **NPS**;
and (iii) the active securing of a distribution channel and a design partner for the
field pilot, to confirm the path to real adoption.

**Market validation results.**
- **NPS +50** (n = 8 agronomists) — a measured, not projected, metric: of the eight
  respondents, the distribution skews to promoters, confirming receptivity.
- **Pain confirmed:** the eight interviews consistently reported late detection,
  manual scouting and preventive spending "out of fear" — corroborating the problem
  hypothesis.
- **Distribution channel in hand:** the **Casa da Roça** network — 9 agro stores in
  southeastern Pará, a family business — is willing to sign a letter of intent as a
  channel, giving direct access to hundreds of producers with no initial CAC.
- **Design partner / pilot:** the family coffee farm in **Jaguaré (ES)** is the site
  of the first pilot — the path to the first real field ground truth for the model.
- **External validation:** Y Combinator's 2026 Request for Startups placed *"AI for
  Low-Pesticide Agriculture"* as its #1 priority, validating the problem at a global
  level of authority.

Taken together, these results move the project beyond a theoretical exercise: the
problem is validated externally and qualitatively, and both the channel and the
field are already accessible — the conditions for converting the first contracts.

---

## 3. Conclusion

The objectives set out for the project were achieved. On the technical side, the
deliberate pivot from classification to **YOLOv8 detection** took the model from a
fragile proof of concept to a detector with **90.3% mAP@50**, embedded in a usable,
hardware-free field platform (map, role-based workflow, asynchronous video, dashboard).
On the business side, the problem was **validated externally** (Y Combinator) and
**qualitatively** (NPS +50, interviews), the market was sized with primary sources
(TAM R$ 1.8 bi / SAM R$ 114 M / SOM R$ 1.2 M), a defensible per-hectare revenue model
was defined, and a real distribution channel (Casa da Roça) and field pilot (Jaguaré)
were secured. More than a model, CropTrack is a product coherent with a real problem,
built with transparency about its stage.

**Limitations (stated honestly).** The model's metrics come from the training
validation set, not from field-collected ground truth — performance under field
shade, dust and background still needs to be measured. The venture is pre-pilot, with
no paying revenue, so financial figures are projections labeled as such. The dataset
carries imbalance and a laboratory → field gap, and visually similar diseases
(cercospora × phoma) remain a confusion risk.

**Future projections.** The immediate next step is the **field pilot in Jaguaré** to
generate real ground truth and convert the Casa da Roça letter of intent into the
first contracts. Beyond that: continuous re-training with the proprietary field data
that constitutes the moat; **edge inference** (the model running on the collector's
phone) for offline use where rural connectivity is poor; the cloud production
architecture described in 2.4; and expansion from coffee into citrus, eucalyptus,
cocoa and fruit. Funding will be pursued through applied-research grants (FAPESP PIPE,
BNDES Garagem, EMBRAPA) and AgTech accelerators.

The end of the module is not the end of CropTrack — it is the start of the
go-to-market: taking the solution back to the field, now as a product.

> *"We don't monitor harvests. We protect investments that take decades to grow."*

---

## References

- FAO. *Global Agriculture towards 2050.* Rome: Food and Agriculture Organization.
- FAO. *The State of Food and Agriculture, 2025.*
- UNITED NATIONS. *World Population Prospects, 2024.* New York: UN DESA.
- EMBRAPA CAFÉ / MAPA. *Perdas por doenças e pragas na cafeicultura brasileira.*
- CNC — CONSELHO NACIONAL DO CAFÉ. *Propriedades cafeicultoras no Brasil.*
- CONAB. *Acompanhamento da Safra Brasileira de Café — Levantamento 2024/25.*
- IBGE. *Censo Agropecuário.*
- GRAND VIEW RESEARCH. *Coffee Market Size & Trends Report* (CAGR 5.3%).
- AGROLINK / EMBRAPA. *Pragas causam perdas de até R$ 55 bilhões à agricultura no Brasil.*
- Y COMBINATOR. *Requests for Startups — "AI for Low-Pesticide Agriculture", 2026.*
- ULTRALYTICS. *YOLOv8 Documentation.* Available at: docs.ultralytics.com.

## Appendices

Supporting material produced by the authors, in `modulo 15/CropTrack/`:

- **`docs/`** — full project documentation (Docusaurus): the sprint roadmap
  (Sprints 1–10), the *Roadmap Validation (Expectation × Delivery)* and the
  *Conclusion*.
- **`backend/` · `frontend/`** — the CropTrack platform source code. Run
  instructions in `README_RUN.md`.
- **`metrics/`** — model metric charts and reports (confusion matrix, per-class
  metrics, mAP).
- **`notebooks/`** — training and analysis notebooks.

---

[Eduardo França Porto](https://www.linkedin.com/in/eduardo-franca-porto/) ·
[Marcos Vinicyus Rosa Teixeira](https://www.linkedin.com/in/marcos-teixeira-37676a24a/)
