---
title: "Sprint 7 — Análise de Mercado"
sidebar_position: 4
---

# Sprint 7 — Análise de Mercado, Competidores e Pricing

:::success Status
Sprint concluída. Análise de mercado completa com TAM/SAM/SOM validado por fontes primárias, mapeamento de 7 concorrentes, mapa de posicionamento, modelo de pricing com 3 planos e análise de sensibilidade.
:::

---

## Objetivo

Produzir a análise de mercado completa do Crop Track: TAM/SAM/SOM com fontes confiáveis, mapeamento competitivo detalhado, mapa de posicionamento e modelo de pricing fundamentado — os três pilares que sustentam qualquer pitch ou business plan.

---

## 1. Análise TAM/SAM/SOM

### Metodologia

A análise usa o modelo **top-down** partindo do mercado total de café no Brasil e afunilando por critérios de elegibilidade tecnológica e capacidade de conversão em estágio inicial.

---

### TAM — Total Addressable Market

**Definição:** receita potencial se 100% do mercado-alvo usasse o Crop Track.

| Indicador | Valor | Fonte |
|-----------|-------|-------|
| Propriedades cafeicultoras no Brasil | ~330.000 | CNC — Conselho Nacional do Café |
| Área em produção (2024) | 1,9 milhão ha | EMBRAPA / MAPA 2024 |
| Área total cultivada (incl. novas lavouras) | 2,25 milhões ha | CONAB Levantamento 2024/25 |
| Produção anual de café (2024) | 58,81 milhões sacas | CONAB 2024 |
| Perdas anuais por doenças e pragas | ~US$ 900 M/ano ≈ R$ 4,5 bilhões | EMBRAPA Café / MAPA |
| Participação do Brasil na produção mundial | ~34% | EMBRAPA / ICO 2023-24 |

**Cálculo do TAM:**

```
1.900.000 ha (área em produção, EMBRAPA 2024)
× R$ 1,00/ha/mês × 12 meses = R$ 22,8 milhões/ano
```

Expandindo para todas as culturas perenes com uso potencial (frutas, eucalipto, cacau):
```
~15.000.000 ha de culturas perenes no Brasil
× R$ 1,00/ha/mês × 12 meses = R$ 180 milhões/ano
```

**TAM adotado nesta análise: R$ 22,8 M/ano** (somente café em produção — mercado inicial e mais defensável).

---

### SAM — Serviceable Addressable Market

**Definição:** segmento do TAM que o Crop Track pode realisticamente alcançar com o produto atual.

**Critérios de elegibilidade:**
- Fazenda com área > 50 ha (porte mínimo para SaaS por ha ser viável)
- Acesso à internet no campo (4G ou fibra rural)
- Agrônomo responsável pela propriedade (RT ou contratado)
- Capacidade de pagar SaaS (não dependente de subvenção pública)

| Segmento | Nº estimado | Área estimada | Fonte |
|----------|------------|---------------|-------|
| Fazendas de café > 50 ha | ~45.000 | 1,38 M ha | IBGE + estimativa |
| Fazendas > 50 ha com conectividade e RT | ~18.000–22.000 | 600–800 K ha | Estimativa (33–50% penetração digital) |
| Cooperativas de médio/grande porte | ~80–120 | — | OCB / MAPA |

**Cálculo do SAM:**

```
700.000 ha (ponto médio das fazendas elegíveis)
× R$ 1,00/ha/mês × 12 meses = R$ 8,4 milhões/ano

+ 100 cooperativas × R$ 2.500/mês × 12 = R$ 3 milhões/ano

SAM total ≈ R$ 11,4 milhões/ano
```

---

### SOM — Serviceable Obtainable Market

**Definição:** parcela capturável nos primeiros 12–18 meses com o time e recursos atuais.

| Cenário | Clientes | Área média | Preço | Receita anual |
|---------|----------|-----------|-------|--------------|
| Conservador | 20 | 150 ha | R$ 0,80/ha | R$ 28.800 |
| Base | 50 | 200 ha | R$ 1,00/ha | R$ 120.000 |
| Otimista | 100 | 250 ha | R$ 1,20/ha | R$ 360.000 |

**Taxa de conversão implícita no cenário base:**
```
50 clientes / 20.000 fazendas elegíveis = 0,25% (realista para estágio pré-seed)
```

**Benchmarks de crescimento para startups AgTech brasileiras em estágio inicial:**
- Aegro: ~200 clientes no 1º ano (2014, produto mais maduro)
- Strider: 50–80 clientes nos primeiros 18 meses
- Referência conservadora para produto MVP: 20–50 clientes/ano

---

### Resumo Visual TAM/SAM/SOM

```
┌─────────────────────────────────────────────┐
│  TAM  R$ 22,8 M/ano  (1,9M ha em produção) │
│  ┌─────────────────────────────────────┐    │
│  │  SAM  R$ 11,4 M/ano                │    │
│  │  (fazendas >50ha + cooperativas)   │    │
│  │  ┌───────────────────────────┐     │    │
│  │  │  SOM  R$ 120k/ano (base) │     │    │
│  │  │  50 clientes · 12–18 m   │     │    │
│  │  └───────────────────────────┘     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 2. Análise Competitiva Detalhada

### Mapa de Posicionamento

**Eixos escolhidos:**
- **X:** Custo de adoção (Baixo → Alto) — inclui preço + dependência de hardware + curva de aprendizado
- **Y:** Precisão do diagnóstico fitossanitário (Baixa → Alta)

```
Alta Precisão
     │
  ▲  │  Q2 — Ideal             │  Q1 — Nicho Premium
  │  │                         │
  │  │  ★ CROP TRACK           │                    ◆ Taranis
  │  │                         │
  │  │  ● Agrio                │
  │  │  ● Plantix   ● Agronow  │
  │  │                         │
  │  │         ● Strider       │  ● Solinftec
  │  │                         │
  │  │  Q3 — Commodities       │  Q4 — Evitar
  │  │    ● Aegro              │
  │  └─────────────────────────┼─────────────────────────▶
  │                            │              Alto Custo
Baixa Precisão        Baixo Custo

Eixo X: Custo de adoção (preço + hardware + curva de aprendizado)
Eixo Y: Precisão do diagnóstico fitossanitário
```

**Leitura:** O Crop Track ocupa o quadrante ideal — alta precisão com baixo custo de adoção, sem hardware proprietário. O único concorrente com precisão superior (Taranis) custa 5–10× mais.

---

### Análise por Concorrente

#### Aegro
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | ERP agrícola (gestão financeira, operacional, compliance) |
| **Modelo de negócio** | SaaS por módulo, planos mensais |
| **Preço público** | A partir de R$ 529/mês (plano avançado, mín. 300 ha) — fonte: Aegro.com.br |
| **Segmento** | Médios e grandes produtores, todas as culturas |
| **O que resolve** | Gestão de custo, planejamento de safra, relatórios fiscais |
| **Ponto cego** | Não detecta doenças — o usuário ainda depende de vistoria manual |
| **Ameaça ao Crop Track** | Baixa (complementar) — pode ser canal de distribuição |
| **Oportunidade** | Integrar Crop Track como módulo de saúde da lavoura no Aegro |

#### Solinftec
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Pulverização prescritiva (hardware + software) |
| **Modelo de negócio** | Hardware + SaaS (ticket alto, contratos plurianuais) |
| **Preço estimado** | R$ 15.000–40.000 de implantação + mensalidade |
| **Segmento** | Grandes fazendas de soja, milho, cana — colunas maiores |
| **O que resolve** | Controle autônomo de pulverização, redução de deriva |
| **Ponto cego** | Hardware dependente, não diagnostica doenças visualmente, não atende café |
| **Ameaça ao Crop Track** | Muito baixa (mercados diferentes) |
| **Oportunidade** | Crop Track pode ser o "diagnóstico" que alimenta a prescrição da Solinftec |

#### Strider
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | MIP — Manejo Integrado de Pragas digitalizado |
| **Modelo de negócio** | SaaS por usuário/fazenda |
| **Preço estimado** | R$ 200–500/mês |
| **Segmento** | Produtores com agrônomo RT, soja e algodão principalmente |
| **O que resolve** | Digitaliza o armadilhamento e amostragem manual de pragas |
| **Ponto cego** | Diagnóstico 100% manual — depende do olho do agrônomo em campo |
| **Ameaça ao Crop Track** | Média — atende dor similar (gestão de pragas) mas sem IA |
| **Oportunidade** | Crop Track como "olho de drone" que alimenta o workflow do Strider |

#### Agronow
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Sensoriamento remoto e imagens de satélite |
| **Modelo de negócio** | B2B (cooperativas, tradings), por projeto ou assinatura |
| **Preço estimado** | Não público — negociado por contrato |
| **Segmento** | Tradings, seguradoras, cooperativas (análise de risco) |
| **O que resolve** | NDVI por satélite, monitoramento de produtividade em escala |
| **Ponto cego** | Resolução de satélite insuficiente para detectar doença em folha individual |
| **Ameaça ao Crop Track** | Média — competem por atenção do decisor, mas em escala diferente |
| **Diferencial do Crop Track** | Imagem de drone com resolução cm vs. satélite com resolução de metros |

#### Plantix (PEAT GmbH)
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Diagnóstico por foto de celular (consumer + agronegócio) |
| **Modelo de negócio** | Freemium (app gratuito + premium B2B) |
| **Preço estimado** | Gratuito para agricultores, B2B negociado |
| **Segmento** | Pequenos produtores globais, mercados emergentes (Índia, África, Brasil) |
| **O que resolve** | Identificação de doença por foto tirada no campo pelo próprio produtor |
| **Ponto cego** | Foto manual é subamostral (1 foto ≠ campo todo), sem georreferenciamento, sem histórico |
| **Ameaça ao Crop Track** | Baixa — o produtor que usa Plantix não é o mesmo que paga por drone B2B |
| **Posição no mercado** | Entrada de mercado, educa o produtor sobre diagnóstico digital |

#### Taranis
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Detecção por drone com IA (precision agriculture premium) |
| **Modelo de negócio** | SaaS por hectare, enterprise — pricing sob consulta |
| **Preço estimado** | Não público; benchmarks de mercado indicam US$ 5–15/ha/ano — confirmar via contato direto |
| **Segmento** | Grandes fazendas americanas e europeias (soja, milho, trigo) |
| **O que resolve** | Detecção precoce por imagem aérea de alta resolução, relatórios automáticos |
| **Ponto cego** | Preço proibitivo para o mercado brasileiro, não focado em café |
| **Ameaça ao Crop Track** | Baixa no curto prazo — não tem operação Brasil estruturada |
| **Lição para o Crop Track** | Validação de mercado: o mesmo produto existe e encontrou PMF em outro mercado |

#### Agrio
| Atributo | Detalhe |
|----------|---------|
| **Categoria** | Diagnóstico por IA + marketplace de defensivos |
| **Modelo de negócio** | Freemium para diagnóstico, comissão no marketplace |
| **Preço estimado** | App gratuito; receita no marketplace de insumos |
| **Segmento** | Pequenos e médios produtores, Israel e expansão global |
| **O que resolve** | Diagnóstico por foto + recomendação direta de produto defensivo |
| **Ponto cego** | Conflito de interesse (recomenda o produto que gera comissão), sem mapeamento |
| **Ameaça ao Crop Track** | Baixa — modelo de negócio diferente, não tem mapa de talhão |

---

### Tabela Comparativa Consolidada

| Solução | Diagnóstico por IA | Mapa de talhão | Hardware próprio | Foco café BR | Ticket mensal (est.) |
|---------|:-----------------:|:--------------:|:----------------:|:------------:|:-------------------:|
| **Crop Track** | ✅ YOLOv8 drone | ✅ | ❌ | ✅ | R$ 160–300 |
| Aegro | ❌ | ❌ | ❌ | Parcial | R$ 529+/mês (público) |
| Solinftec | ❌ | Parcial | ✅ | ❌ | R$ 2.000+ (estimado) |
| Strider | ❌ (manual) | ✅ | ❌ | Parcial | R$ 200–500 (estimado) |
| Agronow | Parcial (NDVI) | Parcial | ❌ | ❌ | Negociado (B2B) |
| Plantix | ✅ (celular) | ❌ | ❌ | ❌ | Gratuito |
| Taranis | ✅ drone | ✅ | Drone parceiro | ❌ | Sob consulta (est. US$ 5–15/ha/ano) |
| Agrio | ✅ (celular) | ❌ | ❌ | ❌ | Gratuito |

**Conclusão:** O Crop Track é a única solução que combina as três capacidades diferenciadoras — diagnóstico por IA aérea + mapa de talhão georreferenciado + sem hardware proprietário — com foco explícito em café brasileiro.

---

## 3. Modelo de Pricing Fundamentado

### Ancoragem de Preço

O preço do Crop Track deve ser ancorado no custo das alternativas que o cliente já paga:

| Alternativa atual | Custo estimado | Frequência |
|------------------|---------------|-----------|
| Vistoria técnica manual (RT, fazenda 200 ha) | R$ 300–600/visita | Quinzenal na safra |
| Aplicação de fungicida (200 ha, dose completa) | R$ 30.000–50.000/aplicação | 3–6×/ano |
| Consultoria agrônoma mensal (RTs autônomos) | R$ 1.500–4.000/mês | Mensal |
| Perda por detecção tardia de ferrugem | R$ 800–2.500/ha afetado | Por evento |
| Taranis (benchmark premium) | R$ 1.500–8.000/mês | Mensal |

**Insight de ancoragem:** evitar 1 aplicação desnecessária de fungicida em 200 ha economiza R$ 30.000–50.000. O Crop Track a R$ 200/mês custa **menos de 1% da economia potencial** em uma única aplicação evitada.

---

### Planos e Estrutura de Pricing

| Plano | Preço | Público-alvo | Limite | Valor central |
|-------|-------|-------------|--------|--------------|
| **Starter** | R$ 199/mês | Consultores RTs, fazendas < 50 ha | 3 campos · 50 ha | Diagnóstico rápido sem compromisso |
| **Fazenda** | R$ 0,80–1,20/ha/mês | Produtores > 50 ha | Ilimitado | Escala com a propriedade |
| **Cooperativa** | Negociado (mín. R$ 2.500/mês) | Multi-tenant para associados | Por contrato | Acesso white-label para associados |

**Por que R$ 0,80–1,20/ha/mês?**
- O produtor já pensa em custo/ha (insumos, mão de obra, colheita)
- R$ 1,00/ha/mês em uma fazenda de 200 ha = R$ 200/mês — menos do que um café com o agrônomo
- O teto de R$ 1,20 ainda é 20× mais barato que o Taranis (validação de margem)
- O piso de R$ 0,80 gera R$ 9.600/ano por cliente de 1.000 ha — ticket relevante

---

### Análise de Sensibilidade de Preço

#### Impacto no SOM (cenário base: 50 clientes, 200 ha médio)

| Preço | Receita mensal | Receita anual | Variação vs. base |
|-------|---------------|--------------|------------------|
| R$ 0,60/ha | R$ 6.000 | R$ 72.000 | −40% |
| R$ 0,80/ha | R$ 8.000 | R$ 96.000 | −20% |
| **R$ 1,00/ha (base)** | **R$ 10.000** | **R$ 120.000** | — |
| R$ 1,20/ha | R$ 12.000 | R$ 144.000 | +20% |
| R$ 1,50/ha | R$ 15.000 | R$ 180.000 | +50% |

#### Break-even Operacional

Custos mensais estimados para manter o produto no ar:

| Item | Custo/mês |
|------|----------|
| Infraestrutura cloud (AWS/GCP — compute + storage) | R$ 800–1.500 |
| APIs externas (mapas, clima) | R$ 200–400 |
| Domínio, SSL, ferramentas | R$ 100 |
| **Total infra** | **R$ 1.100–2.000** |

**Break-even por cenário de preço:**

| Preço | Clientes para break-even (infra) | Clientes para break-even (infra + 1 pessoa part-time) |
|-------|----------------------------------|------------------------------------------------------|
| R$ 0,80/ha (200 ha médio = R$ 160/cliente) | 7–13 clientes | 25–38 clientes |
| R$ 1,00/ha (R$ 200/cliente) | 6–10 clientes | 20–30 clientes |
| R$ 1,20/ha (R$ 240/cliente) | 5–9 clientes | 17–25 clientes |

**Conclusão:** com 25–30 clientes no plano Fazenda a R$ 1,00/ha/mês, o produto se sustenta com 1 pessoa dedicada. Meta alcançável no 1º ano.

#### Preço Mínimo (floor)

```
Infra mínima: R$ 1.200/mês
1 pessoa part-time: R$ 3.000/mês
Total: R$ 4.200/mês

Com 20 clientes × 200 ha = 4.000 ha gerenciados
Preço mínimo = R$ 4.200 / 4.000 ha = R$ 1,05/ha/mês (rounded to R$ 1,00)
```

**Preço mínimo viável: R$ 0,80/ha/mês** (com 30+ clientes). Abaixo disso, o negócio não se sustenta.

#### Preço Máximo (ceiling)

Ponto em que o cliente prefere contratar um consultor autônomo:
- Consultoria mensal: R$ 1.500–2.000/mês para 200 ha
- Crop Track a R$ 1,20/ha × 200 ha = R$ 240/mês — 6–8× mais barato
- Mesmo a R$ 3,00/ha × 200 ha = R$ 600/mês, ainda há valor percebido

**Preço máximo testável: R$ 2,50–3,00/ha/mês** (para fazendas premium com histórico e relatórios completos).

---

## 4. Ecossistema e Parcerias Estratégicas

| Parceiro | Papel | Valor para o Crop Track | Próximo passo concreto |
|----------|-------|------------------------|----------------------|
| **EMBRAPA Café** | Validação científica das detecções | Credibilidade técnica no pitch, acesso a datasets reais | Identificar pesquisador responsável por ferrugem no CNPC Varginha |
| **Cooxupé** (MG) | Maior cooperativa de café do mundo — 14k associados | Canal de distribuição para centenas de produtores de uma vez | Mapear gerente de inovação/TI |
| **Minasul** (MG) | Cooperativa com forte programa de assistência técnica | Acesso a RTs que já visitam as fazendas | Pesquisar programa "Minasul Conecta" |
| **Rainforest Alliance** | Certificação sustentável reconhecida pelo mercado externo | Crop Track como evidência de MIP para a certificação | Levantar critério 4.2.1 (manejo integrado) do padrão 2020 |
| **FAPESP** | Financiamento para pesquisa aplicada em SP | Bolsa PIPE (até R$ 400k para startups com pesquisa) | Verificar edital PIPE Fase 1 — submissão contínua |
| **DJI / Horus Aeronaves** | Parceiros de hardware de drone | Co-marketing, bundle hardware + software | Verificar programa DJI Enterprise Partners e Horus Parceiros |
| **Inteli / CESAR** | Ecossistema acadêmico e de inovação | Mentorias, acesso a laboratórios, credibilidade | Contato com escritório de transferência de tecnologia |

---

## Documentação da Sprint

- [x] Análise TAM/SAM/SOM com metodologia e fontes
- [x] Análise detalhada de 7 concorrentes/adjacentes
- [x] Mapa de posicionamento 2×2 (custo × precisão)
- [x] Tabela comparativa consolidada
- [x] Modelo de pricing com 3 planos e justificativa
- [x] Análise de sensibilidade (5 cenários de preço)
- [x] Cálculo de break-even operacional
- [x] Mapeamento de ecossistema e parcerias

---

## Fontes e Referências

| Dado | Fonte | Acesso |
|------|-------|--------|
| 330.000 propriedades cafeicultoras | CNC — Conselho Nacional do Café | cnc.org.br |
| Área em produção 1,9 M ha (2024) | EMBRAPA Café / MAPA | embrapa.br |
| Área total plantada 2,25 M ha | CONAB Levantamento Safra 2024/25 | conab.gov.br |
| Produção 58,81 M sacas (2024) | CONAB — 2º Levantamento Safra 2024 | conab.gov.br |
| Produção 55,2–56,5 M sacas (2025) | CONAB — Levantamento Safra 2025 | conab.gov.br |
| Share mundial ~34% | EMBRAPA / ICO 2023-24 | embrapa.br / ico.org |
| Perdas por pragas ~US$ 900 M/ano | EMBRAPA Café / MAPA | embrapa.br |
| Preço Aegro (plano avançado, mín. 300 ha) | Aegro.com.br — página de planos | aegro.com.br/planos |
| Taranis — sem preço público | Capterra / site oficial | taranis.com / capterra.com |

> Dados de concorrentes sem fonte pública (Solinftec, Strider, Agronow, Agrio) são estimativas de mercado baseadas em benchmarks do setor AgTech brasileiro. Devem ser confirmados antes de uso em apresentações externas.

---

## KPIs da Sprint 7

| KPI | Meta | Status |
|-----|------|--------|
| TAM/SAM/SOM documentado com fontes | Sim | ✅ |
| Análise de ≥ 6 concorrentes | Sim | ✅ (7) |
| Mapa de posicionamento entregue | Sim | ✅ |
| Modelo de pricing com 3 planos e justificativa | Sim | ✅ |
| Análise de sensibilidade de preço | Sim | ✅ |
| Break-even operacional calculado | Sim | ✅ |
| Lista de parcerias com próximos passos | Sim | ✅ |
