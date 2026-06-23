"""
Valida um detector YOLO contra o dataset e gera os gráficos que a banca quer:
matriz de confusão (com FP/FN), AP por classe e curvas PR / F1.

Uso:
  ./venv/bin/python scripts/yolo_val.py /caminho/para/data.yaml [models/coffee_yolo_v1.pt]

O `data.yaml` é o do export do dataset (Roboflow/YOLO), apontando as pastas
`val/` (ou `valid/`) de imagens e labels. Saídas copiadas para:

  Modulo XV/metrics/confusion_matrix.png        <- FP / FN por classe
  Modulo XV/metrics/confusion_matrix_normalized.png
  Modulo XV/metrics/PR_curve.png
  Modulo XV/metrics/F1_curve.png
  Modulo XV/metrics/MODEL_METRICS_per_class.md  <- AP / P / R por classe
"""
import sys
import shutil
from pathlib import Path

from ultralytics import YOLO

BACKEND = Path(__file__).resolve().parent.parent
OUT = BACKEND.parent / 'metrics'
OUT.mkdir(parents=True, exist_ok=True)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    data_yaml = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else str(BACKEND / 'models' / 'coffee_yolo_v1.pt')

    print(f'Modelo: {model_path}')
    print(f'Dataset: {data_yaml}\n')

    model = YOLO(model_path)
    metrics = model.val(data=data_yaml, imgsz=640, split='val', plots=True, conf=0.001, iou=0.6)
    save_dir = Path(metrics.save_dir)

    # Copia os gráficos relevantes para metrics/
    for name in ['confusion_matrix.png', 'confusion_matrix_normalized.png',
                 'PR_curve.png', 'F1_curve.png', 'P_curve.png', 'R_curve.png', 'results.png']:
        src = save_dir / name
        if src.exists():
            shutil.copy(src, OUT / name)

    # Tabela por classe
    names = model.names
    lines = ['# Métricas por classe — `' + Path(model_path).name + '`\n']
    lines.append('| Classe | Imagens | Instâncias | Precision | Recall | mAP@50 | mAP@50-95 |')
    lines.append('|---|---|---|---|---|---|---|')
    try:
        p = metrics.box.p; r = metrics.box.r
        ap50 = metrics.box.ap50; ap = metrics.box.ap
        for i, ci in enumerate(metrics.box.ap_class_index):
            cls = names[int(ci)]
            lines.append(f'| {cls} | — | — | {p[i]*100:.1f}% | {r[i]*100:.1f}% | '
                         f'{ap50[i]*100:.1f}% | {ap[i]*100:.1f}% |')
    except Exception as e:
        lines.append(f'\n(não foi possível detalhar por classe: {e})')
    mp, mr, map50, map95 = metrics.box.mean_results()
    lines.append(f'| **Todas** | — | — | **{mp*100:.1f}%** | **{mr*100:.1f}%** | '
                 f'**{map50*100:.1f}%** | **{map95*100:.1f}%** |')
    (OUT / 'MODEL_METRICS_per_class.md').write_text('\n'.join(lines), encoding='utf-8')

    print(f'\nValidação concluída. Resultados originais em: {save_dir}')
    print(f'Copiado para: {OUT}')
    print('\nResumo:')
    print(f'  mAP@50={map50*100:.1f}%  mAP@50-95={map95*100:.1f}%  P={mp*100:.1f}%  R={mr*100:.1f}%')


if __name__ == '__main__':
    main()
