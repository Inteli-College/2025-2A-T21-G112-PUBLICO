"""
Painel de métricas padrão (Accuracy, Precision, Recall, F1) derivado da matriz
de confusão ILUSTRATIVA do YOLO (mesma do `yolo_confusion_illustrative.py`),
para manter tudo coerente.

Gera:
  Modulo XV/metrics/metrics_panel.png            (cards + tabela por classe)
  Modulo XV/metrics/MODEL_METRICS_ilustrativo.md (tabela em markdown)

Lembrete: números ilustrativos (mock), calibrados em ~89%. Para os reais, rode
`scripts/yolo_val.py <data.yaml>` contra o dataset.
"""
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from yolo_confusion_illustrative import M, LABELS  # reusa a mesma matriz

OUT = Path(__file__).resolve().parent.parent.parent / 'metrics'
OUT.mkdir(parents=True, exist_ok=True)


def compute():
    n = len(LABELS)
    diag = np.array([M[k, k] for k in range(n)], dtype=float)
    support = M.sum(axis=0).astype(float)     # instâncias reais por classe (colunas)
    pred_tot = M.sum(axis=1).astype(float)    # previsões por classe (linhas)
    recall = diag / support
    precision = diag / pred_tot
    f1 = 2 * precision * recall / (precision + recall)
    accuracy = diag.sum() / M.sum()
    macro = (precision.mean(), recall.mean(), f1.mean())
    w = support / support.sum()
    weighted = ((precision * w).sum(), (recall * w).sum(), (f1 * w).sum())
    return dict(precision=precision, recall=recall, f1=f1, support=support,
                accuracy=accuracy, macro=macro, weighted=weighted)


def make_panel(r):
    fig = plt.figure(figsize=(8.6, 6.2), dpi=160)
    fig.patch.set_facecolor('white')
    fig.suptitle('CropTrack — YOLOv8n café · Métricas (ilustrativas)',
                 fontsize=14, fontweight='bold', y=0.97)

    # --- Cards no topo ---
    cards = [
        ('Acurácia',  r['accuracy'],  '#10b981'),
        ('Precision',  r['macro'][0], '#3b82f6'),
        ('Recall',     r['macro'][1], '#8b5cf6'),
        ('F1-score',   r['macro'][2], '#f59e0b'),
    ]
    ax_cards = fig.add_axes([0.04, 0.62, 0.92, 0.26]); ax_cards.axis('off')
    for i, (name, val, color) in enumerate(cards):
        x = i / 4 + 0.012
        ax_cards.add_patch(plt.Rectangle((x, 0.05), 1/4 - 0.024, 0.9,
                                         transform=ax_cards.transAxes,
                                         facecolor=color, alpha=0.10,
                                         edgecolor=color, lw=1.4, zorder=1))
        ax_cards.text(x + (1/4 - 0.024)/2, 0.62, f'{val*100:.1f}%',
                      transform=ax_cards.transAxes, ha='center', va='center',
                      fontsize=24, fontweight='bold', color=color)
        ax_cards.text(x + (1/4 - 0.024)/2, 0.22, name,
                      transform=ax_cards.transAxes, ha='center', va='center',
                      fontsize=11, color='#374151')

    # --- Tabela por classe ---
    ax_tbl = fig.add_axes([0.04, 0.04, 0.92, 0.50]); ax_tbl.axis('off')
    cols = ['Classe', 'Precision', 'Recall', 'F1', 'Suporte']
    rows = []
    for i, c in enumerate(LABELS):
        rows.append([c, f"{r['precision'][i]*100:.1f}%", f"{r['recall'][i]*100:.1f}%",
                     f"{r['f1'][i]*100:.1f}%", f"{int(r['support'][i])}"])
    rows.append(['Macro média', f"{r['macro'][0]*100:.1f}%", f"{r['macro'][1]*100:.1f}%",
                 f"{r['macro'][2]*100:.1f}%", f"{int(r['support'].sum())}"])
    rows.append(['Média ponderada', f"{r['weighted'][0]*100:.1f}%", f"{r['weighted'][1]*100:.1f}%",
                 f"{r['weighted'][2]*100:.1f}%", f"{int(r['support'].sum())}"])

    tbl = ax_tbl.table(cellText=rows, colLabels=cols, loc='center', cellLoc='center')
    tbl.auto_set_font_size(False); tbl.set_fontsize(11); tbl.scale(1, 1.6)
    n = len(LABELS)
    for (ri, ci), cell in tbl.get_celld().items():
        cell.set_edgecolor('#e5e7eb')
        if ri == 0:  # header
            cell.set_facecolor('#111827'); cell.set_text_props(color='white', fontweight='bold')
        elif ri > n:  # macro/weighted
            cell.set_facecolor('#f3f4f6'); cell.set_text_props(fontweight='bold')
        elif ci == 0:
            cell.set_text_props(fontweight='bold')
    path = OUT / 'metrics_panel.png'
    fig.savefig(path, facecolor='white')
    plt.close(fig)
    return path


def make_md(r):
    L = ['# Métricas padrão (ilustrativas) — YOLOv8n café\n',
         f'**Acurácia geral: {r["accuracy"]*100:.1f}%**\n',
         '| Classe | Precision | Recall | F1 | Suporte |',
         '|---|---|---|---|---|']
    for i, c in enumerate(LABELS):
        L.append(f"| {c} | {r['precision'][i]*100:.1f}% | {r['recall'][i]*100:.1f}% | "
                 f"{r['f1'][i]*100:.1f}% | {int(r['support'][i])} |")
    L.append(f"| **Macro média** | {r['macro'][0]*100:.1f}% | {r['macro'][1]*100:.1f}% | "
             f"{r['macro'][2]*100:.1f}% | {int(r['support'].sum())} |")
    L.append(f"| **Média ponderada** | {r['weighted'][0]*100:.1f}% | {r['weighted'][1]*100:.1f}% | "
             f"{r['weighted'][2]*100:.1f}% | {int(r['support'].sum())} |")
    L.append('\n> Números ilustrativos calibrados em ~89%. Métricas: '
             '**Precision** = acertos / previsões da classe; **Recall** = acertos / '
             'instâncias reais; **F1** = média harmônica de P e R; **Acurácia** = '
             'acertos totais / total.')
    p = OUT / 'MODEL_METRICS_ilustrativo.md'
    p.write_text('\n'.join(L), encoding='utf-8')
    return p


def main():
    r = compute()
    panel = make_panel(r)
    md = make_md(r)
    print('Métricas (ilustrativas):')
    print(f"  Acurácia: {r['accuracy']*100:.1f}%")
    print(f"  Macro  -> P {r['macro'][0]*100:.1f}%  R {r['macro'][1]*100:.1f}%  F1 {r['macro'][2]*100:.1f}%")
    print(f"  Ponder. -> P {r['weighted'][0]*100:.1f}%  R {r['weighted'][1]*100:.1f}%  F1 {r['weighted'][2]*100:.1f}%")
    print(f'\nGerado:\n  {panel}\n  {md}')


if __name__ == '__main__':
    main()
