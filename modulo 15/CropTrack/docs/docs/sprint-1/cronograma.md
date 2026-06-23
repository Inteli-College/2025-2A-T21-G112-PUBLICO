---
title: "Cronograma"
sidebar_position: 2
---

# Cronograma do Modulo XV

### Sprint 1 - Estruturacao e Planejamento
**Status:** Concluido

**Objetivo:** Diagnosticar as causas da baixa acuracia (60-70%) e definir estrategia para atingir 85%+.

**Atividades:**
- Documentacao inicial do modulo (escopo, objetivos, entregaveis)
- Analise das limitacoes do modelo atual
- Identificacao das causas provaveis da baixa acuracia
- Definicao da estrategia de melhoria

**Entregaveis:**
- Plano de trabalho
- Documentacao de planejamento

---

### Sprint 2 - Analise de Dados e Melhoria do Dataset
**Status:** Concluido

**Objetivo:** Melhorar a qualidade e o balanceamento do dataset para sustentar uma acuracia superior.

**Atividades:**
- Analisar a distribuicao atual das classes no dataset
- Identificar classes com pior performance (confusion matrix do modelo atual)
- Buscar e incorporar novos dados para classes sub-representadas
- Aplicar tecnicas de pre-processamento e limpeza de dados
- Rebalancear o dataset entre as 5 classes
- Definir KPIs de qualidade dos dados

**Entregaveis:**
- Dataset revisado e rebalanceado
- Relatorio de analise de dados (distribuicao, qualidade, gaps)
- Mapeamento das classes com pior performance

---

### Sprint 3 - Otimizacao e Treinamento do Modelo
**Status:** Em progresso

**Objetivo:** Otimizar a arquitetura e o treinamento do modelo para atingir a meta de 85%+ de acuracia.

**Atividades:**
- Testar diferentes arquiteturas CNN (customizadas e pre-treinadas)
- Implementar/melhorar tecnicas de data augmentation (Mixup, CutMix, etc.)
- Ajustar hiperparametros (learning rate, batch size, epochs, regularizacao)
- Aplicar tecnicas avancadas de treinamento (mixed precision, label smoothing, gradient clipping)
- Treinar e comparar multiplas versoes do modelo
- Focar na melhoria das classes com pior desempenho

**Entregaveis:**
- Modelos retreinados/otimizados
- Relatorio comparativo de performance (antes vs depois)
- Metricas detalhadas por classe (accuracy, precision, recall, F1-score)

---

### Sprint 4 - Testes e Validacao com Imagens Reais
**Status:** Em progresso

**Objetivo:** Validar que a melhoria de acuracia se sustenta com imagens reais de campo.

**Atividades:**
- Testar o modelo otimizado com imagens reais de diferentes condicoes
- Medir metricas de desempenho por classe em dados reais
- Analisar confianca das predicoes por tipo de doenca
- Comparar performance antes (60-70%) vs depois da otimizacao
- Identificar classes que ainda precisam de ajuste e iterar

**Entregaveis:**
- Relatorio de testes com imagens reais
- Analise de confianca por classe
- Comparativo de acuracia: modelo anterior vs modelo otimizado

---

### Sprint 5 - Avaliacao de Viabilidade e Documentacao Final
**Status:** Em progresso

**Objetivo:** Consolidar resultados e preparar a transicao para o foco em business.

**Atividades:**
- Consolidar resultados finais de acuracia e performance
- Avaliar se a meta de 85%+ foi atingida
- Avaliar maturidade do modelo para sustentar um produto comercial
- Documentar limitacoes, riscos e proximos passos
- Preparar documentacao final e recomendacoes para fase business

**Entregaveis:**
- Relatorio conclusivo de viabilidade tecnica
- Documentacao final do modulo
- Analise de prontidao para comercializacao
- Recomendacoes para o proximo modulo (foco business)

---

## Escopo

Entregaveis de maior impacto para o negocio:

- Modelo multi-classe com acuracia de no minimo 85%
- Dataset revisado, limpo e rebalanceado
- Validacao do modelo otimizado com imagens reais
- Relatorio de viabilidade tecnica para integracao na solucao Crop Track
- Analise de prontidao para transicao ao business
