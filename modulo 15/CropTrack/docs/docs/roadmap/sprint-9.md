---
title: "Sprint 9 — Análise de Impacto"
sidebar_position: 6
---

# Sprint 9 — Análise de Impacto e Projeções Financeiras

:::tip Tema Central
Com produto pronto e materiais comerciais em mãos, esta sprint quantifica o impacto que o Crop Track pode gerar — financeiro, ambiental e social — e constrói as projeções que sustentam o modelo de negócio.
:::

---

## Objetivo

Produzir análises quantitativas de impacto que sirvam a dois propósitos: convencer o cliente de que a ferramenta tem ROI claro, e convencer o investidor ou banca de que o negócio tem escala e propósito.

---

## Entregas da Sprint

### 1. Modelo de Impacto Financeiro (por Segmento)

Documento que quantifica o impacto econômico gerado pelo Crop Track para cada perfil de cliente, com premissas explícitas e sensibilidade de cenários.

**Para fazendas de café (caso base: 200 ha, MG):**

| Item | Sem Crop Track | Com Crop Track | Fonte da premissa |
|------|---------------|---------------|-------------------|
| Vistorias de campo por safra | 8–12 visitas completas | 2–3 + monitoramento contínuo | Benchmarks EMBRAPA |
| Custo por vistoria técnica | R$ 300–600 | — | Tabela de honorários CREA |
| Economia em vistorias/safra | — | R$ 1.500–3.600 | Cálculo próprio |
| Aplicações de fungicida/ha/safra | 4–6 | 2–4 (detecção precoce) | Dados MAPA / literatura |
| Custo médio de aplicação/ha | R$ 150–250 | — | Cooperativas cafeicultoras |
| Economia em fungicida/safra | — | R$ 6.000–24.000 (200 ha) | Cálculo próprio |
| Custo do Crop Track/safra | — | R$ 1.920–2.880 | Plano Fazenda × 12 meses |
| **ROI estimado** | — | **4× a 12×** | — |

Além do caso base, calcular para:
- Fazenda pequena (50 ha)
- Fazenda grande (500 ha)
- Cooperativa com 100 associados (média de 80 ha cada)

### 2. Análise de Impacto Ambiental

O impacto ambiental é cada vez mais relevante para certificações (Rainforest Alliance, UTZ, 4C) e para fundos de impacto. Quantificar:

**Agroquímicos evitados:**
- Aplicações desnecessárias evitadas × dose média por ha × número de clientes projetados
- Conversão para kg de ingrediente ativo evitado por safra

**Contribuição para certificações:**
- Rainforest Alliance exige rastreabilidade de aplicações e evidência de manejo integrado de pragas (MIP)
- O histórico do Crop Track (spot → análise → ação de manejo) fornece exatamente esse registro
- Valor financeiro da certificação: prêmio de preço de US$ 0,05–0,20/kg de café certificado

**Emissões evitadas:**
- Redução de diesel (máquinas de aplicação) proporcional às aplicações economizadas
- Conversão para kg CO₂ equivalente (referência: Inventário SEEG/Observatório do Clima)

### 3. Projeções Financeiras do Negócio (12, 24 e 36 meses)

Modelo de P&L simplificado para os três cenários (pessimista, base, otimista):

**Premissas comuns:**
- Ticket médio Fazenda: R$ 1.920/ano (200 ha × R$ 0,80/ha/mês × 12)
- Ticket médio Cooperativa: R$ 24.000/ano
- CAC estimado: R$ 500–1.500 (baseado em custo de eventos + tempo de vendas)
- Churn anual estimado: 15–25% (benchmark SaaS B2B SMB)
- Custo fixo mensal (infra, time mínimo): R$ 5.000–8.000

| Métrica | 12 meses (base) | 24 meses (base) | 36 meses (base) |
|---------|----------------|----------------|----------------|
| Clientes ativos | 15 | 45 | 100 |
| MRR | R$ 8.000 | R$ 24.000 | R$ 55.000 |
| ARR | R$ 96.000 | R$ 288.000 | R$ 660.000 |
| Ponto de equilíbrio | — | Mês 18–22 | — |

### 4. Análise de Stakeholders e Ecossistema

Mapa dos atores que influenciam a adoção do Crop Track — não só os clientes diretos:

| Stakeholder | Papel | Como engajar |
|-------------|-------|-------------|
| Agrônomos RTs | Influenciam a decisão de compra do produtor | Parceria: ferramenta gratuita para o RT que indica |
| Cooperativas | Canal de acesso a centenas de produtores | Plano white-label com marca da cooperativa |
| EMBRAPA / Epamig | Validação científica do modelo | Co-publicação de resultados de field test |
| Certificadoras (RA, UTZ) | Reconhecimento do histórico do app como evidência de MIP | Reunião técnica para mapear requisitos |
| Fundos de impacto (SP Ventures, Barn Invest) | Captação de recurso | Pitch com dados de impacto desta sprint |
| BNDES / FAPESP PIPE | Edital público | Inscrição com business plan da Sprint 9 |

### 5. Benchmarks Internacionais

Para contextualizar o Crop Track no cenário global de AgTech:

- **Plantix** (Alemanha/Índia): 10M de usuários, diagnóstico por foto no celular — modelo freemium, receita via insumos parceiros
- **Taranis** (Israel/EUA): detecção por drone com IA, foco em grandes operações, ticket alto (> US$ 10/acre/ano)
- **Agrio** (Israel): similar ao Plantix, foco em pequenos produtores, monetização via marketplace de defensivos
- **Insight**: o Crop Track se posiciona entre Plantix (muito simples, grátis) e Taranis (muito caro, hardware dependente) — nicho ainda sem solução dominante no Brasil

---

## Documentação da Sprint

- Modelo de impacto financeiro por segmento (planilha + documento explicativo)
- Análise de impacto ambiental com premissas e fontes
- Projeções financeiras P&L em 3 cenários e 3 horizontes
- Mapa de stakeholders com estratégia de engajamento
- Benchmarks internacionais documentados

---

## KPIs da Sprint 9

| KPI | Meta |
|-----|------|
| ROI calculado para 3 perfis de cliente | Sim |
| Impacto ambiental quantificado (kg de agroquímico evitado) | Sim |
| Projeções financeiras em 3 cenários | Sim |
| Mapa de stakeholders completo | Sim |
| Benchmarks de 3 concorrentes internacionais documentados | Sim |
