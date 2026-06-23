# Prompt para Gamma — Crop Track Pitch Deck v2
# (Framing: plataforma de perenes, café como validação)

Cole o texto abaixo diretamente no campo de prompt do Gamma.

---

Create a 12-slide professional pitch deck for **Crop Track**, an AgTech platform for perennial crop health monitoring. Use a dark, modern theme with deep forest green as background and bright green as accent color. Style: clean, minimal, data-driven — no clipart, no cartoon icons, no emojis. Bold, confident typography. Top-tier VC pitch deck aesthetic.

---

**Slide 1 — Cover**
Title: Crop Track
Subtitle: The perennial crop health monitoring platform
Tag: Inteli · Módulo XV · AgTech
Supporting line: Validated with coffee. Works with any camera. Built for every perennial crop.
Four key stats:
- 15M+ hectares of perennial crops in Brazil alone
- 330K coffee producers — our beachhead market
- 4–12x estimated ROI per farm
- R$180M/year Brazilian TAM (all perennials)

---

**Slide 2 — The Problem**
Headline: Perennial Crops Are the Most Valuable — and the Most Blind
Opening: Annual crops get replanted every cycle. Perennial crops — coffee, citrus, eucalyptus, cocoa, fruit trees — represent years or decades of investment. A farmer cannot simply replant if a disease is detected late. Yet monitoring them is still done manually.

Four problems:
1. No aerial visibility: The agronomist walks the field on foot. In a 200-hectare perennial farm, a full inspection takes days — and diseases spread in hours.
2. Late detection = compounding loss: In perennial crops, a disease that establishes itself can damage the plant for multiple harvests, not just one. Each missed cycle multiplies the loss.
3. Spending by fear, not by data: Without visibility, producers apply fungicide preventively across the entire area. Cost: R$30,000–50,000 per application on 200 ha — repeated 3–6 times per season.
4. No institutional memory: Each harvest starts from zero. No record of which plots are most vulnerable. No pattern recognition. No improvement cycle.

---

**Slide 3 — Why Now**
Headline: The Window Is Open — And It Will Close

Left column — The Macro Pressure:
- World population: 8.2B today → 9.8B by 2050 (UN, 2024)
- Global food demand must grow +60–70% by 2050 (FAO)
- 87% of that growth must come from productivity — there is no new arable land
- Global coffee market alone: US$138B → US$369B by 2030 at CAGR 5.3%
- Brazil: 330K coffee producers, 1.9M productive hectares, 34% of world production
- The world cannot afford to lose perennial crops to preventable disease

Right column — The Technology Window:
- Drones now accessible: R$8K–25K (DJI, Horus)
- YOLOv8 open source — trainable with modest domain-specific datasets
- Cloud inference cost near zero at scale
- 4G rural coverage expanding across Brazil's growing regions
- EU Deforestation Regulation demands full crop traceability
- FAPESP/BNDES open AgTech grants available now

Bottom callout: "Five years ago this would cost 10x more and work 10x worse. The window is open today."

---

**Slide 4 — The Solution**
Headline: Crop Track — Built for Perennials
Subheadline: A SaaS platform that turns any drone into a phytosanitary intelligence system for perennial crops.

Four capabilities:
1. Multi-crop AI Detection: YOLOv8 models trained for coffee diseases today — architecture designed to expand to citrus, eucalyptus, cocoa and fruit trees. Inference via unified REST API.
2. Georeferenced Field Mapping: Draw plot polygons directly on the map. Track health by plot, by harvest, by season. The map is the memory the farm never had.
3. Any-Camera Video Analysis: Upload footage from a phone, action camera or drone. Process frame by frame, H.264 re-encoded for browser, statistics aggregated and persisted to dashboard.
4. Agronomic Intelligence Dashboard: Health heatmap by plot, detected class distribution, temporal history, integrated climate data. Every harvest builds on the last.

Key differentiator callout: Works with the phone already in the agronomist's pocket. Scales to drone for full aerial coverage. No proprietary hardware. No field installation.

---

**Slide 5 — Coffee as Beachhead**
Headline: We Started With the Hardest Market — and It Worked
Subheadline: Coffee was not an arbitrary choice. It is the most demanding validation environment for a perennial crop monitoring platform.

Left side — Why coffee as validation:
- Brazil is the world's largest producer (34% of global supply)
- Most economically sensitive perennial crop — losses are immediate and quantifiable
- Diseases (rust, leaf miner, cercospora) are well-documented and visually identifiable
- Existing EMBRAPA research datasets to train models against
- Active regulatory pressure: Rainforest Alliance, UTZ, EU Deforestation Regulation
- Premium market (specialty coffee at 9.5% CAGR) rewards quality consistency

Right side — What this unlocks:
- Proven detection accuracy in the field with YOLOv8
- Georeferenced mapping validated across real farms
- Pricing model validated with real producers (R$0.80–1.20/ha/month)
- Platform architecture ready for next crop: same drone, different model

Bottom: "Nail coffee → Expand to citrus → Eucalyptus → Cocoa → Fruit trees → Global perennials"

---

**Slide 6 — How It Works**
Headline: From Camera to Decision in Minutes
Subheadline: Works today with a phone. Scales to drone when the farm demands it.

Five steps:
1. Capture: Agronomist films the plot walking the rows with a phone — or flies a drone for complete aerial coverage. Any camera works.
2. Upload to Crop Track: Image or video sent via the web platform. Processing starts automatically.
3. YOLOv8 Detection: Specialized model identifies diseases, pests and anomalies in every frame — no manual review needed.
4. Health Map: Results plotted on the georeferenced field map. Heatmap shows exactly which plots need attention.
5. Informed Action: Agronomist intervenes only where needed. Result saved and compared to previous harvests.

Two-path callout box:
- Phone today → Zero hardware cost. Any consultant or producer starts immediately.
- Drone at scale → Full plot coverage in minutes. Ideal for farms over 100 ha.
Same platform. Same API. Same dashboard. The input is your choice.

---

**Slide 7 — Market Size**
Headline: TAM · SAM · SOM — Starting with Coffee, Expanding to All Perennials

TAM — R$180M/year (Brazil perennials):
~15 million hectares of perennial crops in Brazil (coffee, citrus, eucalyptus, cocoa, fruit trees) × R$1.00/ha/month × 12 months. Source: EMBRAPA / MAPA 2024.
Note: coffee alone = R$22.8M/year (1.9M productive ha).

SAM — R$11.4M/year (coffee beachhead):
~20,000 farms over 50 ha with connectivity and agronomist, 700K eligible hectares + 100 mid/large cooperatives. Source: IBGE + CNC.

SOM — R$120K/year (months 12–18):
50 clients, 200 ha average, R$1.00/ha/month. 0.25% SAM conversion — realistic for early-stage AgTech.
Break-even: 25–30 clients.

Expansion path shown as arrow: Coffee SAM (R$11.4M) → Brazil Perennials TAM (R$180M) → Latin America → Global

---

**Slide 8 — Competitive Positioning**
Headline: No One Is Built for Perennials

Positioning map:
- X-axis: Cost of adoption (Low → High)
- Y-axis: Diagnostic precision (Low → High)
- Crop Track: top-left quadrant (high precision, low cost, perennial-native)

Key insight: All competitors either require proprietary hardware (Solinftec, Taranis), focus on annual crops (most of the market), or lack aerial AI (Aegro, Strider, Plantix). None are built natively for perennial crop health.

Comparison table:
| Solution | Aerial AI | Field Map | Own Hardware | Perennial Focus | Est. Monthly |
|---|---|---|---|---|---|
| Crop Track | YOLOv8 drone | Yes | No | Native | R$160–300 |
| Aegro | No | No | No | No | R$529+/month |
| Solinftec | No | Partial | Yes | No | R$2,000+ |
| Strider | Manual | Yes | No | No | R$200–500 |
| Plantix | Phone only | No | No | No | Free |
| Taranis | Yes | Yes | Drone partner | No | Custom |
| Agronow | NDVI satellite | Partial | No | No | Negotiated |

Differentiator: The only platform combining aerial AI + georeferenced field map + no proprietary hardware + native perennial crop focus.

---

**Slide 9 — Business Model**
Headline: SaaS Per Monitored Hectare — Scales With the Farm
Subheadline: Producers already think in cost-per-hectare. We charge in the same unit they use for seeds, fertilizer and labor.

Three plans:
1. Starter — R$199/month: Agronomists and farms under 50 ha. 3 fields, 50 ha limit. Entry point, no commitment.
2. Farm (highlighted as recommended) — R$0.80–1.20/ha/month: Producers over 50 ha. Unlimited fields, video analysis, automated alerts, full harvest history.
3. Cooperative — Min. R$2,500/month: Multi-tenant for member farms. White-label, agronomist reports, negotiated per contract.

Price anchoring: Avoiding 1 unnecessary fungicide application on 200 ha saves R$30,000–50,000. Crop Track costs less than 1% of that saving.

Cost comparison alternatives:
- Manual inspection visit: R$300–600 per visit
- Monthly agronomist consulting: R$1,500–4,000/month
- Late rust detection loss: R$800–2,500/ha affected

---

**Slide 10 — Impact**
Headline: Real Numbers — 200 Hectare Perennial Farm

Impact table:
| Metric | Without Crop Track | With Crop Track | Saving |
|---|---|---|---|
| Manual inspections/harvest | 8–12 full field visits | 2–3 + continuous monitoring | R$1,500–3,600 |
| Fungicide applications | Preventive (no data) | Only where needed (−40%) | R$12,000–20,000/harvest |
| Loss from late detection | Up to 30% of production | Under 10% (early detection) | R$8,000–25,000/harvest |
| Annual tool cost | — | R$1,920–2,880/year | — |
| Estimated ROI | — | — | 4x to 12x |

Environmental impact section:
- 40% reduction in unnecessary agrochemical applications per farm
- Enables Rainforest Alliance, UTZ and 4C sustainability certifications
- Full traceability for EU Deforestation Regulation compliance
- Data-driven MIP (integrated pest management) replaces calendar-based spraying

---

**Slide 11 — Roadmap**
Headline: From Validation to Platform
Subheadline: 5 sprints built the technology. 5 sprints are documenting the path to market.

Technical phase — completed:
- Sprint 1–2: Dataset exploration, training pipeline, baseline classification models
- Sprint 3: CustomCNN_SE optimization, high accuracy on public dataset
- Sprint 4: Flask backend integration, Grid Scan feature
- Sprint 5: Pivot to YOLOv8 object detection, field map, dashboard, video analysis — platform ready

Business phase — in execution:
- Sprint 6: Strategic planning, market definition, initial roadmap — DONE
- Sprint 7: Full market analysis (TAM/SAM/SOM, competitive landscape, pricing) — DONE
- Sprint 8: Go-to-Market (pitch deck, one-pager, ROI case, channel strategy) — IN PROGRESS
- Sprint 9: Impact analysis (P&L projections, environmental model, benchmarks)
- Sprint 10: Final delivery — business plan, impact report, final presentation

Expansion roadmap beyond the project:
Coffee (validated) → Citrus → Eucalyptus → Cocoa → Fruit trees → Latin America

---

**Slide 12 — Closing**
Headline: Crop Track
Tagline: The health monitoring platform for perennial crops.
Subtext: Validated with coffee. Ready for every crop that takes years to grow and cannot afford to be lost.

Closing statement: "We don't monitor harvests. We protect investments that take decades to build."

Four summary metrics:
- TAM R$180M (Brazil perennials)
- SAM R$11.4M (coffee beachhead)
- SOM R$120K year 1
- ROI 4–12x per farm

Status line: Platform ready · Models trained · No proprietary hardware · Coffee validated · Perennials next

GitHub: github.com/inteli-college/2025-2A-T21-G112-INTERNO
