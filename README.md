# CropTrack — Monitoramento de Culturas Perenes por Visão Computacional

Repositório público da **Equipe G112 · Turma T21 (2025/2A) · Inteli**
Eduardo França Porto · Marcos Vinicyus Rosa Teixeira — Orientador: Rodrigo Nicola

> **A saúde do cafezal, detectada antes da perda.** Projeto **concluído**.

## Resumo

O **CropTrack** detecta precocemente doenças e pragas em folhas de café (foto ou
vídeo), de forma confiável e **sem hardware proprietário**, entregando uma
**decisão de manejo georreferenciada** — não apenas um rótulo. O café é o
*beachhead* para as demais culturas perenes (citros, eucalipto, cacau, frutas).

**Modelo final:** YOLOv8n fine-tunado, ~3,01M parâmetros, 4 classes
(`brown_eye_spot`, `leaf_miner`, `leaf_rust`, `red_spider_mite`) —
**mAP@50 90,3%** · mAP@50-95 61,5% · Precision 85,8% · Recall 85,4%.

**Plataforma:** React + Flask · mapa de talhão georreferenciado · fluxo
Gestor → Coletor → Gestor · análise de vídeo assíncrona com notificação ·
dashboard agronômico · persistência.

**Mercado e negócio:** SaaS por hectare · TAM R$ 1,8 bi / SAM R$ 114M / SOM
R$ 1,2M · planos R$ 5–10/ha/mês · validação real (NPS +50, n=8) · canal
Casa da Roça (PA) · piloto na lavoura da família em Jaguaré (ES).

## A jornada técnica (o pivot)

1. **Classificação própria (CustomCNN)** — alta acurácia em dataset público, mas
   frágil em campo (60–70%) e respondendo à pergunta errada.
2. **Detecção com YOLOv8 (fine-tuning)** — passou a entregar **onde** e **quanto**,
   com menos dado, atingindo o nível de confiança exigido (mAP@50 90,3%).

## Estrutura do repositório

```
modulo 14/                  Módulo 14 (classificação / CNNs)
modulo 15/
  ├─ CropTrack/             Plataforma final (Módulo XV)
  │   ├─ backend/           API Flask + detecção YOLOv8
  │   ├─ frontend/          App React (gestor/coletor/admin)
  │   ├─ docs/              Documentação (Docusaurus) — Conclusão e
  │   │                     Validação do Roadmap
  │   ├─ metrics/           Métricas e gráficos do modelo
  │   └─ notebooks/         Notebooks de treino/análise
  └─ tcc EDUARDO.pdf
documentacao-final-projeto.md
```

Como rodar a plataforma: `modulo 15/CropTrack/README_RUN.md`.
Documentação completa (roadmap, sprints, conclusão): `modulo 15/CropTrack/docs/`.

## Conclusão

O projeto cumpriu integralmente seu roadmap nas duas fases. Na técnica, o pivot
de classificação para **detecção (YOLOv8)** levou o modelo de uma POC frágil a um
detector com **mAP@50 de 90,3%**, embarcado em uma plataforma de campo usável. Na
fase de business, o problema foi **validado externamente (Y Combinator RFS 2026)**
e **qualitativamente (NPS +50)**, com **canal e piloto já acessíveis** (Casa da
Roça + Jaguaré). Mais do que um modelo, o CropTrack é um produto coerente com um
problema real, construído com transparência sobre seu estágio (pré-piloto).

O fim do módulo não é o fim do CropTrack — é o início do *go-to-market*.

> *"Não monitoramos safras. Protegemos investimentos que levam décadas para crescer."*

---

[Eduardo França Porto](https://www.linkedin.com/in/eduardo-franca-porto/) ·
[Marcos Vinicyus Rosa Teixeira](https://www.linkedin.com/in/marcos-teixeira-37676a24a/)
