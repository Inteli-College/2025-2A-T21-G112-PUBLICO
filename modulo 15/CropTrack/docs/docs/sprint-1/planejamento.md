---
title: "Planejamento"
sidebar_position: 1
---

# Planejamento - Sprint 1

## Objetivos do Modulo XV

Melhorar a acuracia do modelo de classificacao multi-classe de **60-70% para no minimo 85%**, tornando-o confiavel para aplicacao em campo na identificacao de doencas em folhas de cafe.

### Contexto

No modulo anterior (Modulo XIIV), desenvolvemos um modelo multi-classe que classifica folhas de cafe em 5 categorias de doencas. Porem, os resultados atuais ficam entre **60-70% de acuracia**, o que e insuficiente para uso em producao — o produtor nao pode confiar em um modelo que erra 3 a cada 10 diagnosticos.

### Estado Atual do Modelo

- **Tipo:** Classificacao multi-classe (5 classes)
- **Acuracia atual:** 60-70%
- **Meta:** Minimo 85% de acuracia
- **Gap a fechar:** 15-25 pontos percentuais

### Classes do Modelo

| Classe | Descricao | Impacto na Cultura |
|--------|-----------|-------------------|
| Healthy | Folha saudavel | Nenhum |
| Cercospora | Mancha de Cercospora | Reduz area fotossintetica, causa desfolha prematura |
| Leaf Rust | Ferrugem da folha | Perdas de ate 50% na produtividade |
| Miner | Minador da folha | Larvas que consomem tecido foliar, facilita outros patogenos |
| Phoma | Mancha de Phoma | Lesoes necroticas em folhas, frutos e ramos |

### Possiveis Causas da Baixa Acuracia

- Dataset desbalanceado entre as classes
- Qualidade insuficiente das imagens de treinamento
- Arquitetura do modelo nao otimizada para o problema
- Falta de tecnicas avancadas de data augmentation
- Hiperparametros nao ajustados adequadamente
- Confusao entre doencas com sintomas visuais semelhantes
- Gap entre imagens de laboratorio e campo

### Metas para este Modulo

- Elevar a acuracia do modelo multi-classe para no minimo **85%**
- Identificar e corrigir os fatores que limitam a performance atual
- Melhorar o dataset (qualidade, balanceamento, volume)
- Otimizar a arquitetura e o treinamento do modelo
- Validar a melhoria com imagens reais de campo
