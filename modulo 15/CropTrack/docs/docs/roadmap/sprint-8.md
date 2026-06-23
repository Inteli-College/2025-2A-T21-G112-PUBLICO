---
title: "Sprint 8 — Go-to-Market"
sidebar_position: 5
---

# Sprint 8 — Go-to-Market e Materiais Comerciais

:::success Status
Sprint concluída. Com a validação de mercado da Sprint 7 em mãos, o arsenal comercial do Crop Track está pronto: pitch deck de 12 slides, one-pager, case de ROI com cálculo fechado, estratégia de canal para os 3 segmentos e especificação completa da landing page de conversão.
:::

---

## Objetivo

Transformar os aprendizados de mercado da Sprint 7 (TAM/SAM/SOM, concorrentes e pricing) em **narrativa de vendas**. Ao final da sprint, o time consegue apresentar o Crop Track para qualquer interlocutor — banca, fundo, cooperativa, consultor ou produtor — sem improvisar, com materiais prontos para distribuir.

A pergunta que esta sprint responde: **a narrativa comercial está pronta para qualquer interlocutor?**

:::info Framing do case
O Crop Track é posicionado como **plataforma de monitoramento de culturas perenes**, com o **café como mercado de entrada (beachhead)**. Café não foi escolha arbitrária: é o ambiente de validação mais exigente — perdas imediatas e quantificáveis, doenças bem documentadas, datasets EMBRAPA e pressão regulatória ativa. Provar no café abre o caminho para citros, eucalipto, cacau e fruticultura. Todos os materiais comerciais sustentam essa narrativa.
:::

---

## 1. Pitch Deck — 12 Slides

Formato padrão para aceleradoras, investidores-anjo e editais (BNDES Garagem, FAPESP PIPE, Embrapa). Tema escuro, verde-floresta profundo com verde brilhante de destaque, estética data-driven sem clipart. Cada slide tem uma única mensagem central.

| # | Slide | Mensagem central | Conteúdo-âncora |
|---|-------|------------------|-----------------|
| 1 | **Capa** | Quem somos em uma linha | Crop Track — "The perennial crop health monitoring platform." Validado com café, funciona com qualquer câmera. Stats: 15M+ ha de perenes no Brasil · 330K produtores de café (beachhead) · ROI 4–12× · TAM R$ 180M/ano |
| 2 | **O Problema** | Perenes são o mais valioso e o mais cego | Cultura perene = anos/décadas de investimento; não se replanta após detecção tardia. Sem visão aérea, perda composta a cada safra, gasto por medo (não por dado) e zero memória institucional |
| 3 | **Por Que Agora** | A janela está aberta — e vai fechar | Pressão macro (população 8,2→9,8 bi; +60–70% de demanda de alimento até 2050; 87% via produtividade) + janela tecnológica (drones R$ 8–25k, YOLOv8 open source, inferência cloud ~zero, 4G rural, EU Deforestation Regulation) |
| 4 | **A Solução** | Crop Track — feito para perenes | SaaS que transforma qualquer câmera/drone em inteligência fitossanitária: detecção IA multi-cultura, mapa georreferenciado, análise de vídeo, dashboard agronômico. Sem hardware proprietário |
| 5 | **Café como Beachhead** | Começamos pelo mercado mais difícil — e funcionou | Brasil = 34% da produção mundial; doenças documentadas (ferrugem, bicho-mineiro, cercospora); datasets EMBRAPA; pressão de certificação. Provar no café → expandir para citros, eucalipto, cacau, frutas |
| 6 | **Como Funciona** | Da câmera à decisão em minutos | 5 passos: capturar (celular ou drone) → upload → detecção YOLOv8 → mapa de saúde → ação informada. Celular hoje (custo zero), drone na escala (>100 ha) |
| 7 | **Mercado** | Oportunidade quantificada | TAM **R$ 180M/ano** (15M ha de perenes BR) · café isolado R$ 22,8M · SAM **R$ 11,4M/ano** (café beachhead) · SOM **R$ 120k/ano** (50 clientes, 12–18 m). Fontes: EMBRAPA, CNC, CONAB, IBGE |
| 8 | **Competição** | Ninguém é feito para perenes | Mapa de posicionamento (custo × precisão). Concorrentes ou exigem hardware, ou focam anuais, ou não têm IA aérea. Único com IA aérea + mapa de talhão + sem hardware + nativo perene |
| 9 | **Modelo de Negócio** | Métrica natural do agro: R$/ha | Starter R$ 199/mês · Fazenda R$ 0,80–1,20/ha/mês (destaque) · Cooperativa negociado (mín. R$ 2.500/mês). Ancoragem: evitar 1 aplicação em 200 ha economiza R$ 30–50k |
| 10 | **Impacto** | Números reais — fazenda 200 ha | Economia R$ 7.500–27.600/safra · ROI **4× a 12×** · −40% fungicida · habilita Rainforest Alliance/UTZ/4C e compliance EUDR |
| 11 | **Roadmap / Tração** | 5 sprints construíram, 5 documentam o go-to-market | Fase técnica concluída (plataforma + 4 detectores YOLOv8). Fase business em execução. Expansão: café → citros → eucalipto → cacau → frutas → LatAm |
| 12 | **Fechamento / Ask** | Protegemos investimentos que levam décadas | "Não monitoramos safras. Protegemos investimentos que levam décadas para crescer." Pedido: edital/seed para piloto de campo, validação de ground truth e primeiros contratos |

**Duas versões a partir desta base:**
- **Banca** (15–18 slides): adiciona metodologia TAM/SAM/SOM, sensibilidade de preço e limitações honestas.
- **Investidor** (10–12 slides): mais direta — problema → solução → tração → impacto → ask.

> Implementação de referência: prompt completo para geração do deck no Gamma em [`gamma_prompt.md`](https://github.com/Inteli-College/2025-2A-T21-G112-INTERNO).

---

## 2. One-Pager Comercial

Página A4 para deixar com gerente de cooperativa, consultor agrônomo ou representante de associação. Cópia pronta:

> ### Crop Track — A saúde do seu cafezal, antes da perda
>
> **O problema:** a ferrugem e o bicho-mineiro avançam silenciosos. Quando a vistoria manual percebe, a perda já aconteceu — até 30% do talhão afetado e R$ 160 mil+ por safra numa fazenda de 200 ha.
>
> **A solução:** o Crop Track monitora seus talhões por imagem. Você desenha o campo no mapa, sobe uma foto ou vídeo (celular ou drone) e recebe, em segundos, um diagnóstico visual das doenças — com mapa de saúde, alertas e histórico por safra.
>
> **Por que o Crop Track:**
> - 🔍 Detecção por IA (YOLOv8) — não depende do olho cansado na vistoria
> - 🗺️ Mapa de talhão georreferenciado — sabe **onde** está o foco
> - 📱 Sem hardware proprietário — funciona com o que você já tem
> - 🌱 Histórico de manejo — evidência para certificação (Rainforest Alliance, UTZ, 4C)

**Casos de uso:** imagem de campo · vídeo de linha de plantio · varredura por drone.

| Plano | Preço | Para quem |
|-------|-------|-----------|
| Starter | R$ 199/mês | Consultores RTs e fazendas < 50 ha |
| Fazenda | R$ 0,80–1,20/ha/mês | Produtores > 50 ha |
| Cooperativa | Negociado | Acesso white-label para associados |

**[ QR code → landing page / demo ]**  ·  contato: equipe G112 / Inteli

---

## 3. Case de Valor — ROI por Fazenda

Documento de 1–2 páginas que responde: **quanto o produtor economiza usando o Crop Track?**

**Fazenda-tipo:** 200 ha de café arábica, Sul de Minas, com agrônomo RT.

| Linha do cálculo | Sem Crop Track | Com Crop Track | Economia/safra |
|------------------|----------------|----------------|----------------|
| Vistorias técnicas (R$ 300–600/visita) | 8–12 visitas completas | 2–3 + monitoramento contínuo | **R$ 1.500–3.600** |
| Fungicida (R$ 150–250/ha/aplicação) | 4–6 aplicações | 2–4 (detecção precoce, −40%) | **R$ 6.000–24.000** |
| **Economia total estimada/safra** | — | — | **R$ 7.500–27.600** |
| Custo do Crop Track/ano (plano Fazenda) | — | R$ 1.920–2.880 | — |
| **ROI sobre o custo da ferramenta** | — | — | **4× a 12×** |

**Insight de ancoragem:** evitar **uma única** aplicação desnecessária de fungicida em 200 ha economiza R$ 30.000–50.000. O Crop Track a ~R$ 200/mês custa **menos de 1%** dessa economia.

> **Limitação honesta:** os números acima são estimativas baseadas em benchmarks do setor (EMBRAPA, MAPA, cooperativas), não em dados de campo próprios. A validação com ground truth real é o primeiro passo pós-projeto.

Este case serve dois públicos: o **cliente** (argumento de compra) e a **banca/investidor** (evidência de impacto potencial).

---

## 4. Estratégia de Canal

Quatro canais, priorizados pelos segmentos validados na Sprint 6.

### Canal 1 — Cooperativas (prioridade alta)
Uma cooperativa dá acesso a centenas de produtores de uma vez. Abordagem: contato direto com o gerente técnico / de inovação. Proposta: plano **Cooperativa white-label** com a marca da cooperativa.

**10 cooperativas cafeicultoras prioritárias:**

| # | Cooperativa | UF | Por que priorizar |
|---|-------------|----|--------------------|
| 1 | Cooxupé | MG | Maior cooperativa de café do mundo (~14 mil associados) |
| 2 | Minasul | MG | Forte programa de assistência técnica ("Minasul Conecta") |
| 3 | Expocaccer | MG | Cerrado Mineiro, foco em café de origem/certificado |
| 4 | Cocatrel | MG | Três Pontas, grande base de associados no Sul de MG |
| 5 | Cooparaíso | MG | São Sebastião do Paraíso, alta tecnificação |
| 6 | Coopadap | MG | São Gotardo, Alto Paranaíba |
| 7 | Coocafé | ES | Conilon e arábica capixaba |
| 8 | Cooabriel | ES | Maior cooperativa de conilon do país |
| 9 | Coamo / regionais | PR | Diversificação para o café no Norte Pioneiro |
| 10 | Garcafé | SP | Garça/Alta Mogiana, perfil de adoção digital |

### Canal 2 — Agrônomos Responsáveis Técnicos (RTs)
O RT indica o Crop Track para os clientes e ganha plano gratuito ou comissão. **Argumento:** a ferramenta *diferencia o serviço do RT, não o substitui* — ele leva diagnóstico de IA para a visita.

### Canal 3 — Eventos do Setor
Presença com demo ao vivo e captura de leads.

| Evento | UF | Janela | Formato |
|--------|----|--------|---------|
| Agrishow | SP | Abr/Mai | Estande/demo, maior feira agro das Américas |
| Expocaccer / Semana do Café | MG | Variável | Foco direto no público cafeicultor |
| ExpoAgro / feiras regionais | MG/ES | Ano todo | Relacionamento com cooperativas locais |

### Canal 4 — Conteúdo Digital
SEO + LinkedIn educando o decisor. Temas-âncora: *"como detectar ferrugem do café cedo"*, *"prejuízo do bicho-mineiro por hectare"*, *"drone vs. vistoria manual no café"*.

**Calendário editorial — 4 semanas (início imediato):**

| Semana | Peça | Canal | CTA |
|--------|------|-------|-----|
| 1 | Artigo: "Quanto custa a ferrugem que você só vê tarde" | Blog + LinkedIn | Ler o case de ROI |
| 2 | Post-carrossel: "3 sinais de doença que o olho perde na vistoria" | LinkedIn/Instagram | Agendar demo |
| 3 | Estudo de caso: fazenda 200 ha, ROI 4–12× | Blog + e-mail | Solicitar proposta |
| 4 | Vídeo curto: demo do app (criar campo → spot → diagnóstico) | LinkedIn/YouTube | Começar grátis |

---

## 5. Landing Page de Conversão — Especificação

Especificação de conteúdo e estrutura para implementação. **CTA principal: "Solicitar demonstração".**

| Seção | Conteúdo |
|-------|----------|
| **Hero** | Headline: *"A saúde do seu cafezal, detectada antes da perda."* Subheadline: *"Monitore seus talhões por imagem e identifique doenças com IA — sem hardware, sem complicação."* CTA: Solicitar demonstração |
| **O Problema** | Dado de perda (R$ 4,5 bi/ano; até 30% do talhão afetado por detecção tardia) |
| **A Solução** | Os 4 diferenciais (IA, mapa, sem hardware, histórico) com ícones |
| **Como Funciona** | 3 passos: 1) Desenhe o talhão · 2) Suba foto/vídeo · 3) Veja o diagnóstico no dashboard |
| **Planos** | Tabela Starter / Fazenda / Cooperativa |
| **Prova / Depoimentos** | *(placeholder até primeiros pilotos)* + selo "validado com benchmarks EMBRAPA/MAPA" |
| **Impacto** | ROI 4–12×, −40% fungicida, certificação habilitada |
| **CTA final** | "Solicitar demonstração" + formulário curto (nome, fazenda/cooperativa, área em ha, contato) |

---

## Documentação da Sprint

- [x] Pitch deck de 12 slides (estrutura + conteúdo-âncora por slide, alinhado ao `gamma_prompt.md`)
- [x] One-pager comercial com cópia pronta para distribuição
- [x] Case de ROI por fazenda com cálculo fechado
- [x] Estratégia de canal para os 3 segmentos + lista de 10 cooperativas
- [x] Calendário editorial de 4 semanas
- [x] Especificação completa da landing page de conversão

---

## KPIs da Sprint 8

| KPI | Meta | Status |
|-----|------|--------|
| Pitch deck completo e revisado | Sim | ✅ |
| One-pager pronto para distribuição | Sim | ✅ |
| Case de ROI com cálculo documentado | Sim | ✅ |
| Estratégia de canal definida para os 3 segmentos principais | Sim | ✅ |
| Calendário editorial de 4 semanas criado | Sim | ✅ |
| Especificação da landing page entregue | Sim | ✅ |
