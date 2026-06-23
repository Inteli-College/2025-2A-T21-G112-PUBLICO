---
title: "Sprint 6 — Planejamento e Roadmap"
sidebar_position: 3
---

# Sprint 6 — Planejamento Estratégico e Roadmap da Fase de Business

:::success Status
Sprint concluída. Esta sprint marca a transição da fase técnica para a fase de business do projeto.
:::

---

## Objetivo

Estruturar o planejamento estratégico das próximas sprints: definir o que será feito, em que ordem, com qual foco e quais serão os indicadores de sucesso. A entrega central é o **roadmap documentado** que orienta as Sprints 7 a 10.

---

## Contexto da Transição

As 5 sprints anteriores (Módulo XV) entregaram a plataforma técnica completa:

| Sprint | Entrega |
|--------|---------|
| Sprint 1 | Entendimento do problema, exploração do dataset, primeiros experimentos |
| Sprint 2 | Pipeline de treino, modelos base de classificação |
| Sprint 3 | Modelo otimizado CustomCNN_SE com alta acurácia em dataset público |
| Sprint 4 | Integração do modelo no backend + feature de Grid Scan |
| Sprint 5 | Pivot para detecção (YOLOv8), plataforma de campos com mapa, dashboard e vídeo |

A tecnologia está pronta. **A Sprint 6 responde: o que fazer com ela?**

---

## Entregas da Sprint

### 1. Diagnóstico da Situação Atual

Análise do estado da plataforma ao final da Sprint 5:

- O que está funcionando e pronto para demonstração
- Os gaps identificados antes da comercialização (autenticação, deploy, histórico temporal, relatórios, alertas)
- As limitações técnicas honestas do modelo em produção (generalização, ground truth real não testado)

### 2. Definição do Mercado-Alvo

Documentação dos segmentos prioritários e da oportunidade de mercado em alto nível:

- Segmento 1: Grandes fazendas de café (> 50 ha)
- Segmento 2: Cooperativas cafeicultoras
- Segmento 3: Consultores agrônomos

Para cada segmento: perfil do decisor, dor principal, ciclo de venda estimado, disposição a pagar.

### 3. Modelo de Negócio Inicial

Definição do modelo de receita base a ser validado nas próximas sprints:

- **SaaS por hectare monitorado** como modelo principal
- Proposta de planos: Starter (R$ 199/mês), Fazenda (R$ 0,80–1,20/ha/mês), Cooperativa (negociado)
- Justificativa: o agronegócio já pensa em custo por hectare — é a unidade natural

### 4. Análise Competitiva Inicial

Mapeamento rápido do cenário competitivo para orientar o posicionamento:

| Concorrente | Foco | Fraqueza vs. Crop Track |
|-------------|------|------------------------|
| Aegro | Gestão de fazenda (ERP) | Sem visão computacional para doenças |
| Solinftec | Pulverização prescritiva | Hardware dependente |
| Strider | MIP (manejo integrado) | Diagnóstico manual, sem detecção por imagem |
| John Deere Ops Center | Telemetria de máquinas | Não foca em saúde de lavoura perene |

**Diferencial central:** única solução que combina mapa de talhão + detecção visual + dashboard sem hardware proprietário.

### 5. Roadmap das Próximas 4 Sprints

O principal entregável desta sprint: o planejamento documentado do que vem a seguir.

```
Sprint 7  →  Análise de Mercado (TAM/SAM/SOM, competidores, pricing)
Sprint 8  →  Go-to-Market (pitch deck, materiais comerciais, canal)
Sprint 9  →  Análise de Impacto (ROI, impacto ambiental, projeções)
Sprint 10 →  Entrega Final (business plan, relatório de impacto, apresentação)
```

Para cada sprint: objetivo, entregas esperadas, KPIs e riscos.

### 6. Impacto Esperado — Visão Inicial

Estimativas de impacto para orientar as análises mais detalhadas das próximas sprints:

**Financeiro (fazenda de 200 ha):**
- Economia em fungicida: R$ 6.000–24.000/safra (redução de 40% nas aplicações)
- Economia em vistorias: R$ 1.500–3.600/safra
- ROI estimado sobre o custo da ferramenta: 4× a 12×

**Ambiental:**
- Redução de aplicações desnecessárias de agroquímicos
- Habilitação de certificações sustentáveis (Rainforest Alliance, UTZ, 4C)

---

## Documentação da Sprint

- Este documento de roadmap (o que está sendo lido agora)
- Diagrama de transição da fase técnica para a fase de business
- Tabela de mercado-alvo com perfis por segmento
- Análise competitiva inicial
- Modelo de negócio base com justificativa de pricing

---

## KPIs da Sprint 6

| KPI | Meta |
|-----|------|
| Roadmap das próximas 4 sprints documentado | Sim |
| Segmentos de mercado definidos | Sim |
| Modelo de negócio base definido | Sim |
| Análise competitiva inicial entregue | Sim |
| Estimativas de impacto financeiro documentadas | Sim |
