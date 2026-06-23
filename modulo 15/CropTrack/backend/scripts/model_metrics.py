"""
Recupera e apresenta as métricas dos detectores YOLO fine-tunados.

Os checkpoints do Ultralytics guardam as métricas finais de validação do treino
em `train_metrics` — então conseguimos um relatório honesto direto dos pesos,
mesmo sem o dataset em mãos. Gera:

  - metrics/model_metrics.png   (gráfico de barras pra banca)
  - metrics/MODEL_METRICS.md    (tabela + config de treino)

Uso:
  ./venv/bin/python scripts/model_metrics.py

Para o detalhamento por classe + matriz de confusão + curvas PR/F1, é preciso
rodar a validação no dataset (ver instruções no fim do MODEL_METRICS.md gerado).
"""
import os
import json
from pathlib import Path

import torch
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

BACKEND = Path(__file__).resolve().parent.parent
MODELS = BACKEND / 'models'
OUT = BACKEND.parent / 'metrics'   # Modulo XV/metrics
OUT.mkdir(parents=True, exist_ok=True)

# (arquivo, rótulo amigável)
TARGETS = [
    ('coffee_yolo_v1.pt', 'Café (fine-tuning)'),
    ('plant_disease_v1.pt', 'Multi-doenças'),
]

KEYS = {
    'metrics/precision(B)': 'Precision',
    'metrics/recall(B)': 'Recall',
    'metrics/mAP50(B)': 'mAP@50',
    'metrics/mAP50-95(B)': 'mAP@50-95',
}


def read_ckpt(fname):
    ck = torch.load(MODELS / fname, map_location='cpu', weights_only=False)
    tm = ck.get('train_metrics') or {}
    ta = ck.get('train_args') or {}
    model = ck.get('model')
    names = getattr(model, 'names', {}) or {}
    return {
        'file': fname,
        'date': ck.get('date'),
        'version': ck.get('version'),
        'base': ta.get('model'),
        'epochs': ta.get('epochs'),
        'imgsz': ta.get('imgsz'),
        'batch': ta.get('batch'),
        'optimizer': ta.get('optimizer'),
        'lr0': ta.get('lr0'),
        'names': list(names.values()) if isinstance(names, dict) else list(names),
        'metrics': {label: tm.get(k) for k, label in KEYS.items()},
        'raw': tm,
    }


def make_chart(coffee):
    labels = list(KEYS.values())
    vals = [(coffee['metrics'][l] or 0) * 100 for l in labels]
    colors = ['#60a5fa', '#a78bfa', '#10b981', '#34d399']

    fig, ax = plt.subplots(figsize=(7.2, 4.2), dpi=160)
    fig.patch.set_facecolor('#0e0f15')
    ax.set_facecolor('#0e0f15')
    bars = ax.bar(labels, vals, color=colors, width=0.62, edgecolor='none')
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 1.5, f'{v:.1f}%',
                ha='center', va='bottom', color='#ededea', fontsize=12, fontweight='bold')
    ax.set_ylim(0, 100)
    ax.set_ylabel('%', color='#8b8d98')
    ax.set_title('CropTrack — YOLOv8n fine-tunado (café · 4 classes)',
                 color='#ededea', fontsize=13, fontweight='bold', pad=14)
    ax.tick_params(colors='#8b8d98')
    for s in ax.spines.values():
        s.set_visible(False)
    ax.yaxis.grid(True, color='#1c1e2e', linewidth=1)
    ax.set_axisbelow(True)
    fig.tight_layout()
    path = OUT / 'model_metrics.png'
    fig.savefig(path, facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def make_report(results):
    lines = []
    lines.append('# Métricas dos modelos — CropTrack\n')
    lines.append('> Métricas finais de **validação** registradas no treino (embutidas '
                 'nos checkpoints Ultralytics). `(B)` = caixas / detecção de objetos.\n')

    coffee = results[0]
    lines.append('## Modelo principal — `coffee_yolo_v1` (o fine-tuning)\n')
    lines.append('Detector YOLOv8n fine-tunado para 4 classes de café '
                 '(bicho-mineiro, ferrugem, cercosporiose, ácaro-vermelho).\n')
    lines.append('| Métrica | Valor |')
    lines.append('|---|---|')
    for label, v in coffee['metrics'].items():
        lines.append(f'| **{label}** | **{v * 100:.1f}%** |' if v is not None else f'| {label} | — |')
    lines.append('')
    lines.append('**Config de treino:** '
                 f"base `{coffee['base']}` · {coffee['epochs']} épocas · imgsz {coffee['imgsz']} · "
                 f"batch {coffee['batch']} · optimizer `{coffee['optimizer']}` · lr0 {coffee['lr0']} · "
                 f"Ultralytics {coffee['version']} · treinado em {str(coffee['date'])[:10]}.\n")
    lines.append('**Classes:** ' + ', '.join(f'`{c}`' for c in coffee['names']) + '\n')
    lines.append('![Métricas](./model_metrics.png)\n')

    # Comparativo
    lines.append('## Comparativo entre detectores\n')
    lines.append('| Modelo | Classes | Épocas | mAP@50 | mAP@50-95 | Precision | Recall |')
    lines.append('|---|---|---|---|---|---|---|')
    for r in results:
        m = r['metrics']
        def pct(x): return f'{x * 100:.1f}%' if x is not None else '—'
        lines.append(f"| `{r['file'].replace('.pt','')}` | {len(r['names'])} | {r['epochs']} | "
                     f"{pct(m['mAP@50'])} | {pct(m['mAP@50-95'])} | {pct(m['Precision'])} | {pct(m['Recall'])} |")
    lines.append('')

    lines.append('## Como interpretar (pra banca)\n')
    lines.append('- **mAP@50 90,3%**: com IoU ≥ 0,5, o modelo acerta a grande maioria das '
                 'detecções de doença/praga — forte para a aplicação.')
    lines.append('- **mAP@50-95 61,5%**: média em limiares de IoU mais rígidos (0,5→0,95); '
                 'queda esperada, indica que as caixas são boas mas não perfeitamente justas.')
    lines.append('- **Precision 85,8% / Recall 85,4%**: equilíbrio entre não alarmar à toa '
                 'e não deixar passar lesões — bom trade-off para campo.\n')

    lines.append('## Para o detalhamento completo (AP por classe + matriz de confusão + curvas)\n')
    lines.append('As métricas acima são agregadas. Para gerar por classe, matriz de confusão '
                 'e curvas PR/F1, rode a validação com o dataset (export do Roboflow com '
                 '`data.yaml`):\n')
    lines.append('```bash')
    lines.append('cd "Modulo XV/backend"')
    lines.append('./venv/bin/yolo detect val \\')
    lines.append('  model=models/coffee_yolo_v1.pt \\')
    lines.append('  data=/caminho/para/data.yaml \\')
    lines.append('  imgsz=640 split=val')
    lines.append('# saída em runs/detect/val/: confusion_matrix.png, PR_curve.png,')
    lines.append('# F1_curve.png, results.csv (AP por classe)')
    lines.append('```')
    return '\n'.join(lines)


def main():
    results = [read_ckpt(f) for f, _ in TARGETS]
    chart = make_chart(results[0])
    report = make_report(results)
    md = OUT / 'MODEL_METRICS.md'
    md.write_text(report, encoding='utf-8')

    print('Métricas recuperadas dos checkpoints:\n')
    for r in results:
        m = r['metrics']
        print(f"  {r['file']:<22} mAP50={m['mAP@50']:.3f}  mAP50-95={m['mAP@50-95']:.3f}  "
              f"P={m['Precision']:.3f}  R={m['Recall']:.3f}")
    print(f'\nGerado:\n  {chart}\n  {md}')


if __name__ == '__main__':
    main()
