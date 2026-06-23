"""
Matriz de confusão ILUSTRATIVA do detector YOLOv8 (café · 4 classes).

ATENÇÃO: os números são um mock para validar o visual/layout — NÃO são uma
avaliação real. Foram calibrados só para bater com as métricas agregadas reais
do modelo (Precision ~85,8% / Recall ~85,4%). Para a matriz REAL, rode
`scripts/yolo_val.py <data.yaml>` contra o dataset.

Convenção (igual à do Ultralytics): eixo X = classe verdadeira, eixo Y = classe
prevista. Inclui a classe `healthy` (saudável): uma doença prevista como
saudável é um FALSO NEGATIVO (o perigoso — deixa passar); uma folha saudável
prevista como doença é um falso positivo (alarme à toa).
"""
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent.parent.parent / 'metrics'
OUT.mkdir(parents=True, exist_ok=True)

LABELS = ['healthy', 'brown_eye_spot', 'leaf_miner', 'leaf_rust', 'red_spider_mite']

# M[pred][true] — colunas (true) somam o nº de instâncias reais de cada classe.
# Off-diagonais na coluna 'healthy' = saudável previsto como doença (FP);
# off-diagonais na linha 'healthy' = doença prevista como saudável (FN).
# Dataset desbalanceado de propósito (como na vida real) + erros plausíveis:
# red_spider_mite (raro) tem recall mais baixo; leaf_rust <-> brown_eye_spot
# se confundem (lesões marrons); algumas doenças caem em "healthy" (FN).
M = np.array([
    # true: health  bes  miner rust mite
    [285,    8,    9,    7,    6],   # pred healthy   (doenças -> "saudável" = FN)
    [  5,  168,    4,   11,    2],   # pred brown_eye_spot
    [  2,    3,  157,    2,   14],   # pred leaf_miner
    [  6,   18,    3,  218,    3],   # pred leaf_rust
    [  2,    3,    7,    2,   95],   # pred red_spider_mite
])


def main():
    n = len(LABELS)
    fig, ax = plt.subplots(figsize=(7.6, 6.4), dpi=160)
    im = ax.imshow(M, cmap='Blues', vmin=0, vmax=M.max())

    ax.set_xticks(range(n)); ax.set_yticks(range(n))
    ax.set_xticklabels(LABELS, rotation=35, ha='right', fontsize=10)
    ax.set_yticklabels(LABELS, fontsize=10)
    ax.set_xlabel('Verdadeiro (True)', fontsize=11)
    ax.set_ylabel('Previsto (Predicted)', fontsize=11)
    ax.set_title('CropTrack — YOLOv8n café · Matriz de Confusão (ilustrativa)',
                 fontsize=12, fontweight='bold', pad=12)

    thr = M.max() * 0.55
    for i in range(n):
        for j in range(n):
            v = M[i, j]
            ax.text(j, i, str(v), ha='center', va='center',
                    color='white' if v > thr else '#1a1a1a',
                    fontsize=11, fontweight='bold' if i == j else 'normal')

    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.tick_params(labelsize=9)
    # destaca a diagonal (acertos)
    for k in range(n):
        ax.add_patch(plt.Rectangle((k - 0.5, k - 0.5), 1, 1, fill=False,
                                   edgecolor='#10b981', lw=2))
    fig.tight_layout()
    path = OUT / 'confusion_matrix_yolo_ilustrativa.png'
    fig.savefig(path)
    plt.close(fig)

    # métricas derivadas da matriz (sanity-check vs. os ~85% reais)
    diag = np.array([M[k, k] for k in range(n)])
    col_tot = M.sum(axis=0)              # instâncias reais por classe
    row_tot = M.sum(axis=1)             # previsões por classe
    recall = diag / col_tot
    precision = diag / row_tot
    print(f'Gerado: {path}\n')
    print(f"{'classe':<18} {'P':>6} {'R':>6}")
    for i, c in enumerate(LABELS):
        print(f'{c:<18} {precision[i]*100:5.1f}% {recall[i]*100:5.1f}%')
    print(f"{'MÉDIA':<18} {precision.mean()*100:5.1f}% {recall.mean()*100:5.1f}%   (meta ilustrativa ~89%)")


if __name__ == '__main__':
    main()
