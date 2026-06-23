---
title: "Visão Geral do Roadmap"
sidebar_position: 1
---

# Roadmap — Fase de Business (Sprints 6 a 10)

:::info Contexto
As 5 sprints anteriores (Módulo XV) entregaram a plataforma técnica: detecção YOLOv8, mapa de talhões, análise de vídeo e dashboard agrônomo. A fase técnica está concluída. As próximas 5 sprints encerram o projeto com foco exclusivo em **business**: planejamento, análise de mercado, materiais comerciais, impacto e entrega final.
:::

---

## Onde Estamos

Ao final da Sprint 5, o Crop Track possui:

- Plataforma web funcional (frontend React + backend Flask)
- Pipeline de detecção YOLOv8 com 4 detectores especializados
- Mapeamento de talhões com Leaflet, upload de imagem e vídeo
- Dashboard com métricas agronômicas e dados climáticos
- Persistência estruturada via SQLAlchemy + SQLite

O que **falta para o projeto estar completo**: análise de mercado documentada, modelo de negócio validado, materiais comerciais prontos e relatório de impacto consolidado.

---

## Onde Queremos Chegar

Ao final da Sprint 10, o Crop Track deve ser capaz de responder **sim** a estas perguntas:

| Pergunta | Sprint que responde |
|---|---|
| Qual é o plano para as próximas sprints? | Sprint 6 |
| Qual é o tamanho real do mercado e quanto cobrar? | Sprint 7 |
| A narrativa comercial está pronta para qualquer interlocutor? | Sprint 8 |
| Quanto impacto financeiro e ambiental a solução pode gerar? | Sprint 9 |
| Qual é o próximo passo concreto após o projeto? | Sprint 10 |

---

## Cronograma — 10 Semanas

Cada sprint tem **2 semanas** de duração. O roadmap completo cabe em 10 semanas corridas.

```
Semanas  1–2        3–4        5–6        7–8        9–10
         ─────────  ─────────  ─────────  ─────────  ─────────
Sprint   6          7          8          9          10
Foco     Planej. &  Análise    Go-to-     Impacto &  Entrega
         Roadmap    Mercado    Market     Projeções  Final
```

| Sprint | Semanas | Nome | Entregáveis principais |
|--------|---------|------|------------------------|
| **Sprint 6** | 1–2 | Planejamento e Roadmap | Roadmap das próximas sprints, mercado-alvo, modelo de negócio inicial, análise competitiva inicial |
| **Sprint 7** | 3–4 | Análise de Mercado | TAM/SAM/SOM, análise competitiva detalhada, pricing fundamentado, parcerias estratégicas |
| **Sprint 8** | 5–6 | Go-to-Market | Pitch deck, one-pager, case de ROI, estratégia de canal, especificação da landing page |
| **Sprint 9** | 7–8 | Análise de Impacto | Modelo financeiro por segmento, impacto ambiental, projeções P&L, benchmarks internacionais |
| **Sprint 10** | 9–10 | Entrega Final | Business plan completo, relatório de impacto, apresentação final |

---

## KPIs do Projeto (Sprint 10)

Estes são os indicadores que definirão o sucesso da fase de business:

| KPI | Meta |
|-----|------|
| TAM/SAM/SOM documentado com fontes primárias | Sim |
| Análise competitiva de ≥ 6 concorrentes | Sim |
| Modelo de pricing com 3 planos definidos e justificados | Sim |
| Pitch deck completo (versão banca + versão investidor) | Sim |
| ROI documentado para 3 perfis de cliente | Sim |
| Impacto ambiental quantificado | Sim |
| Business plan completo entregue | Sim |

---

## Mercado-Alvo

### Brasil como ponto de entrada

O Brasil é o **maior produtor e exportador de café do mundo**, responsável por ~34% da produção global (EMBRAPA / ICO 2023-24). São aproximadamente **330.000 propriedades cafeicultoras** (CNC — Conselho Nacional do Café), concentradas em Minas Gerais, Espírito Santo, São Paulo e Bahia.

As principais doenças do café (ferrugem, bicho-mineiro, cercospora) causam perdas anuais estimadas em **~R$ 4,5 bilhões** (US$ 900 M) somente no Brasil (EMBRAPA Café / MAPA). A detecção precoce reduz o uso de fungicidas em até 40%, com impacto direto no custo de produção e na certificação sustentável.

### Segmentos prioritários

```
┌─────────────────────────────────────────────────────┐
│  SEGMENTO 1: Grandes Fazendas (> 100 ha)            │
│  • Decisão centralizada no gestor agrônomo          │
│  • Alta disposição a pagar por ferramenta confiável │
│  • Ciclo de venda: 2–4 semanas                      │
├─────────────────────────────────────────────────────┤
│  SEGMENTO 2: Cooperativas Cafeicultoras             │
│  • Acesso a centenas de associados de uma vez       │
│  • Modelo white-label possível                      │
│  • Ciclo de venda: 4–8 semanas (comitê)             │
├─────────────────────────────────────────────────────┤
│  SEGMENTO 3: Consultores Agrônomos                  │
│  • Usam a ferramenta como diferencial de serviço    │
│  • Pagam por visita ou mensalidade leve             │
│  • Canal de aquisição de clientes finais            │
└─────────────────────────────────────────────────────┘
```

---

## Modelo de Negócio Proposto

O modelo base é **SaaS por hectare monitorado**, com três camadas:

| Plano | Público | Preço estimado | Inclui |
|-------|---------|---------------|--------|
| **Starter** | Consultores autônomos | R$ 199/mês | 5 campos, 500 análises/mês |
| **Fazenda** | Produtores (> 50 ha) | R$ 0,80–1,20/ha/mês | Campos ilimitados, vídeo, alertas |
| **Cooperativa** | Multi-tenant para associados | Negociado | White-label, relatórios, API |

A monetização por hectare é a métrica mais natural para o agronegócio — o cliente enxerga custo como insumo, não como software.

---

## Análise Competitiva (Visão Inicial)

| Concorrente | Foco | Fraqueza vs. Crop Track |
|-------------|------|------------------------|
| **Aegro** | Gestão de fazenda (ERP) | Não tem visão computacional para doenças |
| **Solinftec** | Pulverização prescritiva | Hardware dependente (frota de máquinas) |
| **Strider** | MIP (manejo integrado) | Diagnóstico manual, sem detecção por imagem |
| **John Deere Ops Center** | Telemetria de máquinas | Não foca em saúde de lavoura perene |

**Diferencial do Crop Track:** única solução que combina **mapa de talhão + detecção visual por câmera/drone + dashboard operacional** sem depender de hardware proprietário.

---

## Impacto Esperado

### Financeiro (por fazenda de 200 ha)

| Métrica | Antes do Crop Track | Com Crop Track |
|---------|---------------------|----------------|
| Vistorias manuais por safra | 8–12 visitas completas | 2–3 visitas + monitoramento contínuo |
| Custo de fungicida por ha/safra | R$ 400–600 | R$ 240–360 (redução de 40%) |
| Perda por detecção tardia | Até 30% da produção afetada | < 10% (detecção precoce) |
| Custo do Crop Track | — | R$ 1.920–2.880/ano (R$ 0,80–1,20/ha/mês × 200 ha × 12) |
| **ROI estimado** | — | **> 10× sobre o custo da ferramenta** |

### Ambiental

- Redução de aplicações desnecessárias de agroquímicos
- Menor pressão sobre certificações (Rainforest Alliance, UTZ, 4C)
- Rastreabilidade de saúde do campo por safra

---

> Os detalhes de execução de cada sprint estão nas páginas individuais desta seção.
