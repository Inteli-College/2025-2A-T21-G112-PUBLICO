---
title: "Problematica"
sidebar_position: 4
---

# Problematica

## Acuracia Insuficiente do Modelo Atual

O modelo multi-classe desenvolvido no modulo anterior classifica folhas de cafe em 5 categorias de doencas, porem apresenta uma acuracia de apenas **60-70%**. Isso significa que o modelo **erra entre 3 e 4 diagnosticos a cada 10**, o que e inaceitavel para uso em campo:

- O produtor nao pode confiar em recomendacoes de manejo baseadas em diagnosticos com essa taxa de erro
- Tratamentos aplicados incorretamente geram **custos desnecessarios** e **impacto ambiental**
- A baixa confiabilidade impede a adocao comercial da solucao

## Por que a Acuracia esta Baixa?

Fatores provaveis que contribuem para a performance atual de 60-70%:

| Fator | Impacto |
|-------|---------|
| Dataset desbalanceado | Modelo enviesado para classes com mais amostras |
| Qualidade das imagens | Imagens de baixa resolucao ou com ruido prejudicam o aprendizado |
| Similaridade entre doencas | Cercospora e Phoma tem sintomas visuais parecidos, confundindo o modelo |
| Arquitetura do modelo | Pode nao ser a mais adequada para o nivel de complexidade do problema |
| Hiperparametros | Learning rate, regularizacao e outras configs podem nao estar otimizados |
| Gap laboratorio vs campo | Modelo treinado com imagens de laboratorio nao generaliza bem para campo |

## Meta: 85% de Acuracia

A meta de **85% minimo** foi definida porque:

- Representa um diagnostico correto em pelo menos **17 de cada 20 analises**
- E um patamar aceitavel para ferramenta de apoio a decisao em agricultura
- Viabiliza a comercializacao da solucao como produto confiavel
- Permite ao produtor tomar decisoes de manejo com confianca razoavel

## Desafio Tecnico

Fechar o gap de **15-25 pontos percentuais** exige uma abordagem sistematica:

1. **Diagnosticar** quais classes tem pior performance e por que
2. **Melhorar os dados** (mais amostras, melhor qualidade, melhor balanceamento)
3. **Otimizar o modelo** (arquitetura, hiperparametros, tecnicas de treinamento)
4. **Validar** que a melhoria se sustenta com imagens reais de campo
