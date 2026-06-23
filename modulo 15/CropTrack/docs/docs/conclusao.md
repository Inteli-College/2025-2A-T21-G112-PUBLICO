---
title: "Conclusão"
sidebar_position: 99
---

# Conclusão do Projeto

> CropTrack — Monitoramento de culturas perenes por visão computacional.
> Equipe G112 · Inteli · Engenharia de Computação — Eduardo França Porto e Marcos Vinicyus Rosa Teixeira.

## 1. Retomada do problema e do objetivo

O projeto partiu de uma constatação macro e de uma motivação pessoal. No plano macro,
o mundo precisa produzir **60–70% mais alimento até 2050** sem terra agriculturável
nova — o que obriga ganhos de **produtividade por hectare** e, antes disso, a **redução
das perdas** do que já se planta (pragas e doenças custam **R$ 55–60 bi/ano** ao
Brasil). No plano pessoal, a origem familiar na cafeicultura tornou o café o ponto de
partida natural e o *beachhead* tecnicamente mais exigente.

O objetivo definido foi: **detectar precocemente doenças e pragas em folhas de café a
partir de imagens, de forma confiável e sem hardware proprietário**, entregando ao
produtor não um rótulo isolado, mas uma **decisão de manejo georreferenciada**. Este
documento conclui o Módulo XV consolidando o que foi entregue, os resultados, as
limitações honestas e os próximos passos.

## 2. O que foi entregue

A entrega final não é um modelo solto, e sim uma **plataforma de campo funcional**:

- **Motor de IA (YOLOv8) sobre imagem e vídeo** — detecção com *bounding boxes* que
  respondem **onde** e **quanto** de doença há, e não apenas *se* há.
- **Mapa de talhão georreferenciado** (Leaflet + imagery de satélite) — o gestor
  desenha o polígono do talhão e libera *spots* de coleta.
- **Fluxo operacional por papéis** — Gestor → Coletor → Gestor (libera, coleta a
  campo, valida), com **dashboard agronômico** (distribuição de saúde, alertas,
  clima, histórico).
- **Análise de vídeo assíncrona** — o vídeo do talhão é processado em segundo plano;
  o usuário navega livremente e é **notificado ao concluir**, com o resultado anotado
  **persistido** e disponível no painel do gestor.
- **Linha do tempo "Vida do Campo"** — toda ação (criar talhão, liberar spot, coletar,
  validar) é registrada por fazenda e exibida cronologicamente.
- **Persistência** — estado da operação sobrevive a recarga; vídeos analisados são
  armazenados no backend.

A plataforma roda **sem hardware proprietário** — celular hoje, drone na escala —, o
que ataca diretamente a barreira de adoção do produtor familiar (78% do segmento).

## 3. Resultados técnicos

O modelo final é um **YOLOv8n fine-tunado** para 4 classes de café (`brown_eye_spot`,
`leaf_miner`, `leaf_rust`, `red_spider_mite`), com **≈ 3,01 milhões de parâmetros** e
pesos de **~6 MB** — leve o suficiente para rodar em CPU e, futuramente, no próprio
dispositivo do coletor.

As métricas de **validação registradas no treinamento** foram:

| Métrica | Valor |
|---|---|
| mAP@50 | **90,3%** |
| mAP@50-95 | 61,5% |
| Precision | 85,8% |
| Recall | 85,4% |

O `mAP@50` de **90,3%** supera com folga o patamar de ~85% que estabelecemos como
limiar de confiança para uma decisão de manejo real, e contrasta com o detector
multi-doenças generalista (mAP@50 de 33% sobre 29 classes) — evidência de que o
**foco no café** foi a escolha técnica correta.

> **Nota de honestidade:** essas métricas vêm do conjunto de validação do treino, não
> de *ground truth* coletado em campo real. Essa validação de campo é o primeiro passo
> pós-projeto (Seção 6).

## 4. A jornada técnica e a decisão-chave

O resultado acima não foi o ponto de partida — foi o desfecho de um **pivot técnico
maduro**:

1. **Tentativa 1 — modelo próprio (CustomCNN).** Abordagem de *classificação* de
   folha. Obteve alta acurácia em dataset público, mas **caía para 60–70% em condição
   realista** e, conceitualmente, respondia à pergunta errada: classificar a folha não
   localiza nem quantifica o foco no talhão.
2. **Tentativa 2 — fine-tuning de YOLOv8 (o pivot).** A troca de *classificação* por
   **detecção de objetos** mudou a natureza da resposta: passou a entregar **onde** e
   **quanto**, com esforço de dados muito menor que treinar do zero, e atingiu o nível
   de confiança exigido.

Reconhecer o teto da Tentativa 1 e migrar deliberadamente para detecção é, em si, um
dos principais resultados de aprendizado de engenharia do projeto.

## 5. Validação de mercado e modelo de negócio

A relevância do problema foi **validada externamente**: em 2026 a **Y Combinator**
publicou "*AI for Low-Pesticide Agriculture*" como a **primeira** de suas *Requests for
Startups*, descrevendo quase palavra por palavra a tese da CropTrack — IA detectando
pragas em tempo real sobre câmeras baratas. A diferença é que **o produto já foi
construído**.

O modelo de negócio é **SaaS cobrado por hectare** — a unidade que o agro já entende:

- TAM **R$ 1,8 bi/ano** → SAM **R$ 114M/ano** → SOM **R$ 1,2M/ano** (50 clientes ·
  200 ha médios · 12–18 meses).
- Planos por valor: **Entrada R$ 5/ha/mês** (consultores e fazendas menores),
  **Premium R$ 10/ha/mês** (quem já usa avião/drone) e **Cooperativa** negociada
  (white-label, mín. R$ 5.000/mês).
- Âncora de valor: o investimento de ~R$ 12k/ano (fazenda de 200 ha) frente a uma
  perda de safra de **R$ 160–500k** e à economia de **R$ 60–90k** em veneno/avião —
  cada R$ 1 investido protege dezenas de reais.

A validação de mercado **não é só projeção** — há tração qualitativa medida:

- **NPS +50** (n = 8 agrônomos) em teste de usabilidade — métrica medida, não estimada.
- **Canal de distribuição na mão:** a rede **Casa da Roça** (9 lojas agro no sudeste do
  Pará, negócio da família) dá acesso direto a centenas de produtores, com baixo CAC.
- **Design partner / piloto:** a lavoura da família em **Jaguaré (ES)** é o site do
  primeiro piloto — o caminho para o primeiro *ground truth* de campo real.

> **Honestidade de estágio:** a CropTrack é **pré-piloto, sem receita real**. A
> diferença é que o problema está **validado externamente** (YC), **qualitativamente**
> (NPS +50, entrevistas) e com **canal e campo já acessíveis** (Casa da Roça + Jaguaré).
> Preferimos validação documentada a inventar tração.

## 6. Arquitetura, escalabilidade e viabilidade de produção

Embora o entregável seja um protótipo monolítico (React + Flask), a topologia foi
desenhada para a evolução em nuvem:

- **Microsserviço de inferência separado da API** (perfis de escala opostos),
  alimentado por **fila (SQS)** com **workers stateless autoescaláveis e *scale-to-zero***.
- **Armazenamento de objetos (S3)** para mídia e artefatos; **Postgres (+PostGIS)**
  para dados relacionais e geoespaciais; **SNS** para notificações.
- **Modelo no Hugging Face Hub / endpoint** ou em container próprio — como o yolov8n é
  leve, CPU + *spot* é o caminho mais econômico.

A carga "análise por hectare" é **bursty, paralela e *inference-bound***, o que torna a
escala horizontal por profundidade de fila a estratégia natural. A análise de custo
mostrou que o **custo marginal é menor que US$ 0,01 por hectare analisado** (dominado por
armazenamento/transferência de mídia, não por compute), com um piloto operável por
**~US$ 150–270/mês** — ou **~US$ 20–60/mês** em pegada *serverless*. Ou seja, a
viabilidade econômica de operação está demonstrada.

## 7. Limitações

Em coerência com a postura de honestidade do projeto:

- **Sem validação de campo com *ground truth* real** — as métricas são de validação de
  treino; o desempenho sob sombra, poeira e fundo de campo ainda precisa ser medido.
- **Modo demonstração** atribui rótulos de doença para fins de UX; não é laudo
  fitossanitário validado.
- **Pré-tração** — sem clientes pagantes, sem métricas de receita/retenção reais.
- **Dataset** com desbalanceamento e *gap* laboratório → campo; doenças visualmente
  próximas (cercospora × phoma) seguem como risco de confusão.

## 8. Trabalhos futuros

1. **Piloto de campo em Jaguaré (ES)** — a lavoura da família — para gerar *ground
   truth* real, medir o desempenho em produção e converter a **carta de intenção da
   rede Casa da Roça (PA)** nos primeiros contratos.
2. **Re-treino contínuo** com o dado proprietário de campo — o *fosso* competitivo que
   melhora a cada safra.
3. **Inferência na borda** (modelo no celular) para diagnóstico **offline** no campo,
   onde a conectividade é ruim, reservando a nuvem para vídeo/drone e agregação.
4. **Produção em nuvem** conforme a arquitetura da Seção 6 (fila + workers + S3 +
   Postgres/PostGIS).
5. **Expansão de culturas** — provar no café credencia citros, eucalipto, cacau e
   fruticultura.
6. **Captação** — FAPESP PIPE, BNDES Garagem, Embrapa, AgTech Garage.

## 9. Aprendizados

- **Técnicos:** saber *abandonar* uma abordagem (classificação própria) ao bater no
  teto vale mais que insistir; *fine-tuning* de um modelo enxuto supera treinar do zero
  quando o dado é escasso; a engenharia em volta do modelo (mapa, fila, persistência,
  notificação) é o que transforma um `.pt` em produto.
- **De produto e negócio:** modelar a receita na unidade do cliente (hectare); cobrir
  os eixos de avaliação (produto, mercado, modelo, competição) com dados rotulados; e
  que **honestidade de estágio** é vantagem, não fraqueza, diante de uma banca.
- **De equipe:** o pivot e a entrega de uma plataforma demonstrável em poucas sprints
  exigiram decisão técnica conjunta e foco no que move o ponteiro.

## 10. Considerações finais

A CropTrack entrega o que se propôs: **detecção precoce e georreferenciada de doenças
do café, com confiança acima de 90% de mAP@50, embarcada em uma plataforma de campo
usável e sem hardware proprietário**, com arquitetura e economia de operação
desenhadas para escalar. Mais do que um modelo, é um produto coerente com um problema
real, validado externamente e construído com transparência sobre seu estágio.

O projeto nasceu na lavoura de café da família de um dos integrantes. O fim deste
módulo não é um ponto final — é o início do *go-to-market*: levar a solução **de volta
ao campo, agora como produto**.

> *"Não monitoramos safras. Protegemos investimentos que levam décadas para crescer."*
