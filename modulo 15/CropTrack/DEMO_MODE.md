# Modo Demonstração (CROPTRACK_DEMO)

Modo de **apresentação** do fluxo de detecção, usado quando o modelo de produção
não retorna detecções em filmagens de campo reais (gap laboratório → campo, ainda
não validado com ground truth). **Default desligado** — sem a flag, o backend usa
só o comportamento real (honesto).

> ⚠️ É uma demonstração do *fluxo do produto* (UX), não diagnóstico fitossanitário
> validado. As caixas vêm de um detector de folhas real; o rótulo de doença é
> atribuído para apresentação. Apresente como "fluxo do produto", não como laudo.

## Como ligar

```bash
cd "Modulo XV/backend"
CROPTRACK_DEMO=1 PORT=5001 ./venv/bin/python app.py
```

(`PORT=5001` evita o conflito com o AirPlay Receiver do macOS na porta 5000. O
proxy do frontend já aponta para 5001.)

## Modelo necessário (não versionado — 109 MB)

O modo demo usa um detector de **folha individual** (YOLO11x, classe única `leaf`).
Baixe os pesos para `Modulo XV/backend/models/yolo11x_leaf.pt`:

```bash
cd "Modulo XV/backend/models"
curl -L "https://huggingface.co/pedromiguelsanchez/yolo-plant-leaf-detection/resolve/main/yolo11x_leaf.pt" \
  -o yolo11x_leaf.pt
```

Fonte: [pedromiguelsanchez/yolo-plant-leaf-detection](https://huggingface.co/pedromiguelsanchez/yolo-plant-leaf-detection)
(YOLO11x, licença MIT). Se o arquivo não existir, o backend cai para detecções
sintéticas automaticamente.

## Como funciona

1. **Detecção real**: o detector de folhas roda no frame e devolve muitas caixas
   sobre folhas individuais reais.
2. **Rótulo por folha (track-ID)**: cada folha recebe um rótulo **uma vez** ao
   aparecer — a maioria `healthy`, ~22% com uma das 4 classes de café
   (`leaf_rust`, `brown_eye_spot`, `leaf_miner`, `red_spider_mite`). O rótulo
   **gruda na folha** e é herdado por IOU nas re-detecções (não pisca, não troca).
3. **Tracking (optical flow)**: entre re-detecções (a cada 18 frames), cada caixa
   segue o movimento real da folha via Lucas-Kanade, deslizando com a câmera.

Parâmetros em `app.py`: `_DEMO_DISEASE_RATIO` (proporção doente/sadio),
`_DEMO_MAX_BOXES`, `redetect` (intervalo de re-detecção no `analyze_video`).
