---
title: "Pivot para Deteccao e Plataforma de Campo"
sidebar_position: 1
---

# Sprint 5 - Pivot para Deteccao e Plataforma de Campo

:::success Status
Sprint concluida. A entrega final consiste em uma plataforma web completa para monitoramento de campos agricolas, com pipeline de deteccao baseado em visao computacional e interface operacional voltada ao uso em campo.
:::

## Objetivo

Consolidar a entrega do modulo transformando os resultados das sprints anteriores em uma plataforma utilizavel por agronomos e gestores de campo. A sprint 5 marca um pivot deliberado: de um classificador de folha isolada para um sistema de **deteccao + mapeamento de talhoes**, mais alinhado ao uso real da tecnologia.

---

## Pivot Tecnico

### Por que saimos da classificacao pura

Durante a integracao do modelo de classificacao das sprints anteriores em cenarios reais, identificamos tres limitacoes praticas:

1. **A classificacao de foto inteira aprendia atalhos globais** (cor de fundo, iluminacao geral, angulo da foto) que nao generalizavam bem para imagens de drone ou celular em campo.
2. **O Grid Scan** era uma aproximacao util, mas nao delimitava lesoes — marcava apenas regioes de grade, sem contorno real.
3. **O fluxo de uso** exigia fotos pre-cortadas de folhas individuais, o que nao casava com a realidade de uma visita a um talhao.

A solucao foi migrar o backend inteiro para um pipeline de **deteccao de objetos**, usando a arquitetura YOLOv8 (Ultralytics) como motor de inferencia unificado.

### O que mudou na arquitetura

- **Backend:** um unico ponto de entrada para todos os modelos via `ultralytics.YOLO`. O carregamento dos pesos e preguicoso (lazy-loaded) e cacheado por nome de detector.
- **Inference pipeline:** recebe bytes da imagem, retorna lista de deteccoes (classe, confianca, bounding box) e imagem anotada.
- **Video analysis:** loop de frames com skip configuravel, re-encoding em H.264 para compatibilidade de browser, e estatisticas agregadas retornadas via headers HTTP.
- **Persistencia:** modelo `Field` -> `Spot` -> `AnalysisResult` em SQLite via SQLAlchemy. Cada spot representa uma analise pontual no mapa do talhao.

---

## Detectores Disponiveis

A plataforma final suporta quatro detectores, cada um para um caso de uso distinto:

| Detector | Caso de uso | Classes | Tamanho |
|---|---|---|---|
| **Coffee Disease AI** | Producao — deteccao de doencas e pragas em folhas de cafe | brown_eye_spot, leaf_rust, leaf_miner, red_spider_mite | ~6 MB |
| **Plant Disease AI** | Diagnostico geral em multiplas culturas | 29 classes (folhas saudaveis e doencas em tomate, milho, uva, ma, batata etc.) | ~6 MB |
| **Multi-Plant AI** | Identificacao de especies em imagens aereas | 46 especies vegetais | ~6 MB |
| **Tree Counter AI** | Contagem de arvores em imagens de drone | 1 classe (tree) | ~6 MB |

Todos os modelos sao servidos pela mesma API. A escolha do detector e feita por parametro na requisicao (`detector=<name>`), e o frontend expoe a escolha em um select no fluxo de upload.

---

## Plataforma de Campo

A grande entrega da sprint 5 nao e um modelo isolado — e a plataforma web construida em torno dele. Ela introduz um modelo mental centrado no **campo** como unidade de analise.

### Fluxo de uso

1. **Criar um campo**
   O usuario desenha o poligono do talhao diretamente no mapa (Leaflet + leaflet-draw). Em seguida, completa um wizard de 3 etapas com dados agronomicos que alimentam as metricas futuras:
   - **Etapa 1** — nome e tipo de cultura (cafe, soja, milho, cana)
   - **Etapa 2** — tipo de solo, tratamento do solo, data de plantio, espacamento
   - **Etapa 3** — tipo de irrigacao, estimativa de plantas, notas

2. **Adicionar spots**
   Dentro de um campo, o usuario clica em qualquer ponto do mapa para criar um spot (ponto de analise). Cada spot recebe um upload — imagem estatica ou video — e dispara uma analise assincrona no backend.

3. **Analisar**
   O backend processa o upload com o detector selecionado. Para imagens, retorna o frame anotado com bounding boxes e a lista de deteccoes. Para videos, processa frame a frame (com skip configuravel), re-encoda em H.264 e retorna o video anotado mais estatisticas agregadas.

4. **Visualizar no dashboard**
   O resultado aparece no mapa (heatmap de saude por spot) e alimenta o **Field Dashboard** — um painel completo com distribuicao de saude, alertas, historico e dados meteorologicos da regiao (via API externa).

### Integracao de video no dashboard

Uma das entregas finais da sprint foi a persistencia dos resultados de video no banco. Antes, uma analise de video so aparecia no modal de upload e era perdida. Na versao final, o endpoint `POST /api/fields/{id}/video-analysis` recebe o resumo do video (total de deteccoes, classes encontradas) e persiste como um `Spot` + `AnalysisResult`, fazendo com que o video passe a contribuir para as metricas do dashboard exatamente como uma imagem.

---

## Backend — API Consolidada

A API final expoe os seguintes endpoints principais:

| Metodo | Rota | Proposito |
|---|---|---|
| `GET` | `/api/models` | Lista detectores disponiveis e status de carregamento |
| `POST` | `/api/analyze-frame` | Analisa uma imagem e retorna deteccoes + frame anotado (base64) |
| `POST` | `/api/analyze-video` | Analisa um video, retorna MP4 anotado + stats nos headers |
| `POST` | `/api/fields` | Cria um campo novo (nome, cultura, poligono, dados agronomicos) |
| `GET` | `/api/fields` | Lista todos os campos |
| `GET` | `/api/fields/{id}` | Retorna detalhes de um campo, incluindo spots e metricas calculadas |
| `GET` | `/api/fields/{id}/analysis-summary` | Retorna o resumo agregado do campo (health distribution, classes detectadas) |
| `POST` | `/api/fields/{id}/spots` | Cria um spot a partir de upload de imagem |
| `POST` | `/api/fields/{id}/video-analysis` | Persiste resultado de video como spot |

Todos os endpoints retornam JSON e sao consumidos pelo frontend via axios.

---

## Frontend — Componentes Principais

| Componente | Responsabilidade |
|---|---|
| `Landing` | Landing page business-focused com hero, video demo, secoes de valor, processo e outcomes |
| `Dashboard` | Tela inicial da plataforma com lista de campos, busca, criacao via wizard, navegacao |
| `MapView` | Mapa interativo (Leaflet) com poligonos, spots, desenho de areas e marcadores |
| `FieldDashboard` | Painel analitico de um campo (stats, alertas, distribuicao de saude, detalhes agronomicos, clima) |
| `SpotUploader` | Modal de upload para imagem ou video com preview, selecao de detector e exibicao de resultados |
| `VideoAnalyzer` | Ferramenta standalone de analise de imagem/video sem vinculo a um campo |

O projeto usa React (CRA), react-router, react-leaflet e axios. Nenhuma dependencia pesada de UI — o estilo e escrito em CSS puro no arquivo `App.css` e nos arquivos de estilo por componente.

---

## Avaliacao Pratica

### Performance em campo

Os testes foram feitos com videos reais de drone e celular em condicoes variadas de iluminacao e resolucao. O pipeline YOLOv8:

- Processa um video de ~15 segundos (~450 frames) em menos de 1 minuto em CPU, com `skip_frames=3`.
- Detecta multiplas classes simultaneamente no mesmo frame.
- Mantem a anotacao visivel entre frames analisados, o que cria uma experiencia continua no video final.

### Robustez

- Aceita imagens em qualquer resolucao (redimensionadas internamente pelo Ultralytics).
- Funciona com JPG, PNG, WEBP para imagens e MP4, AVI, MOV para videos.
- Re-encoda o video de saida em H.264 + faststart para reproducao imediata no navegador sem download.

### Limitacoes reconhecidas

1. **Single-worker backend** — Flask em modo desenvolvimento. Para producao, seria necessario gunicorn + multiplos workers e uma fila de tarefas (Celery ou RQ) para processar videos em background.
2. **Sem autenticacao** — a plataforma assume um unico operador. Para multi-tenant, precisa de login e isolamento de dados por usuario.
3. **Dados meteorologicos externos** — a integracao com API de clima no dashboard depende de conectividade ativa.
4. **Persistencia em SQLite** — adequada para demonstracao e uso em uma maquina. Para escala, migrar para PostgreSQL.

---

## Maturidade para Comercializacao

### O que ja esta pronto

- Plataforma web completa: landing page, dashboard de campos, mapa interativo, wizard de criacao, upload de imagem/video, analise e persistencia.
- Multiplos detectores treinados cobrindo doencas de cafe, multi-especies e contagem de arvores.
- Dashboard com metricas agronomicas, heatmap de saude e integracao com clima.
- Pipeline de video funcional e otimizado para browser.
- Persistencia de resultados tanto de imagem quanto de video no banco.
- Wizard step-by-step para coleta de dados agronomicos na criacao de campos — base para metricas futuras.
- Codigo organizado, backend e frontend separados, API REST documentada.

### Gaps antes de virar produto comercial

1. **Autenticacao e multi-tenancy** — cada cliente precisa ver apenas os proprios campos.
2. **Fila assincrona para video** — analises de video longas devem ser processadas em background com notificacao quando prontas.
3. **Dockerizacao e deploy** — o projeto ainda roda localmente. Precisa de imagens Docker e orquestracao.
4. **Historico temporal** — cada spot deveria permitir multiplas analises ao longo do tempo, para comparar evolucao.
5. **Relatorios exportaveis** — PDF/CSV por campo para o cliente levar a reuniao.
6. **Alertas automaticos** — quando a distribuicao de saude de um campo cai abaixo de um threshold, notificar o gestor.
7. **Validacao externa do modelo** — benchmark publico nao substitui teste em propriedades reais com ground truth agronomico.

---

## Recomendacoes para a Fase de Business

### Publico-alvo sugerido

1. **Gestores de fazendas de cafe** — uso direto pelo time de agronomia.
2. **Cooperativas** — monitoramento de associados com acesso compartilhado.
3. **Consultores agronomicos** — ferramenta de visita e diagnostico.

### Modelo de negocio possivel

- **SaaS por hectare monitorado** — mensalidade proporcional a area cadastrada.
- **Pacote por visita** — cobranca por lote de analises.
- **White-label** — integracao com softwares agricolas existentes.

### Diferenciais da plataforma

- **Unica solucao que combina mapeamento de talhao + analise visual + dashboard em uma unica interface.**
- **Aceita imagem e video** — o usuario pode filmar uma linha inteira do talhao em vez de tirar dezenas de fotos.
- **Dados agronomicos estruturados** — solo, irrigacao, plantio e espacamento sao capturados desde a criacao do campo, habilitando metricas agronomicas posteriores sem novo retrabalho.
- **Interface business-first** — a plataforma nao expoe jargao tecnico nem nomes de modelos ao usuario final.

---

## Consolidacao do Modulo

### O que foi entregue ao longo das 5 sprints

| Sprint | Entrega principal |
|---|---|
| Sprint 1 | Entendimento do problema, exploracao do dataset, primeiros experimentos |
| Sprint 2 | Pipeline de treino, modelos base de classificacao |
| Sprint 3 | Modelo otimizado CustomCNN_SE com alta acuracia em dataset publico |
| Sprint 4 | Integracao do modelo no backend + feature de Grid Scan (imagem e video) |
| Sprint 5 | Pivot para deteccao (YOLOv8), plataforma de campos com mapa, dashboard e persistencia de video |

### Tecnologias consolidadas

- **Machine Learning / CV:** Ultralytics YOLOv8, OpenCV
- **Backend:** Python, Flask, Flask-SQLAlchemy, SQLite, imageio-ffmpeg
- **Frontend:** React, react-router, react-leaflet, axios
- **Mapa:** Leaflet + leaflet-draw para desenho de poligonos
- **Processamento de video:** OpenCV + ffmpeg para re-encoding H.264

---

## Conclusao

A sprint 5 marcou uma mudanca de foco deliberada: em vez de entregar mais um classificador de folhas, entregamos uma **plataforma de monitoramento de campos** — algo que um agronomo pode efetivamente usar durante uma visita a uma propriedade.

O pivot para deteccao (YOLOv8) resolveu as limitacoes praticas do classificador anterior e abriu espaco para recursos que antes nao eram possiveis: analise frame a frame de video, multiplas classes simultaneas, suporte nativo a diferentes culturas atraves de modelos especializados.

O resultado e um sistema que combina **visao computacional**, **mapeamento geografico**, **persistencia estruturada** e **interface operacional** em um fluxo unico. A viabilidade tecnica esta comprovada dentro do escopo do projeto, e os proximos esforcos devem focar em **autenticacao**, **escalabilidade** e **validacao em campo real** — questoes que pertencem naturalmente a fase de business.

---

## Entregaveis da Sprint 5

- Backend Flask com pipeline YOLOv8 unificado (`backend/app.py`)
- Quatro detectores treinados e servidos via API (`backend/models/`)
- Frontend completo com landing, dashboard de campos, mapa e upload (`frontend/src/`)
- Wizard de criacao de campo em 3 etapas com dados agronomicos
- Persistencia de resultados de video no banco como spots
- Modelo de dados expandido (`Field`, `Spot`, `AnalysisResult`)
- Landing page business-focused com video demo de resultado real
- Documentacao final consolidada (este documento)

---

## Fontes e Referencias

- **Ultralytics YOLOv8** — framework de deteccao usado como motor de inferencia unificado
- **Leaflet + leaflet-draw** — mapa interativo e desenho de poligonos no frontend
- **imageio-ffmpeg** — binario ffmpeg empacotado para re-encoding H.264 do video anotado
- **Flask-SQLAlchemy** — ORM e persistencia em SQLite
- **Testes executados em videos reais** de campo com celular e drone, em condicoes variadas de iluminacao
