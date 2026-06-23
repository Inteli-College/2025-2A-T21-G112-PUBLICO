import React, { useState } from 'react';
import { DISEASE_LABELS } from './mock';
import { useSpots } from './SpotsContext';
import { useActivity } from './ActivityContext';
import SpotUploader from '../components/SpotUploader';
import { Ic } from './Icons';

const COFFEE_CLASSES = ['leaf_rust', 'brown_eye_spot', 'leaf_miner', 'red_spider_mite', 'healthy'];

export default function ColetorHome() {
  const { by, collectSpot } = useSpots();
  const { logActivity } = useActivity();
  const [capture, setCapture] = useState(null); // { id, field, point, mode }

  const liberados = by('liberado');
  const coletadas = [...by('coletado'), ...by('validado')];
  const total = liberados.length + coletadas.length;
  const pct = total ? Math.round((coletadas.length / total) * 100) : 0;

  function handleComplete(res) {
    let result = 'healthy';
    const classes = res?.videoStats?.classes;
    if (classes && Object.keys(classes).length) {
      // Video: pick the most frequent disease/pest class (fallback healthy).
      const ranked = Object.entries(classes)
        .filter(([c]) => COFFEE_CLASSES.includes(c) && c !== 'healthy')
        .sort((a, b) => b[1] - a[1]);
      if (ranked.length) result = ranked[0][0];
    } else {
      const raw = res?.detections?.[0]?.class || res?.health_assessment?.label || 'healthy';
      result = COFFEE_CLASSES.includes(raw) ? raw : 'healthy';
    }
    collectSpot(capture.id, {
      via: capture.mode === 'video' ? 'video' : 'photo',
      result,
      videoUrl: res?.videoUrl || null,
    });
    const d = DISEASE_LABELS[result] || { label: result };
    logActivity({
      kind: capture.mode === 'video' ? 'ai' : 'collect',
      actor: 'João Pereira',
      field: capture.fazenda,
      text: `${capture.mode === 'video' ? 'Vídeo analisado' : 'Foto coletada'}${capture.talhao ? ` · ${capture.talhao}` : ''} — ${d.label}`,
    });
    setCapture(null);
  }

  return (
    <div className="rp coletor-wrap">
      <div className="rp-head">
        <span className="rp-eyebrow">§ Campo · João Pereira</span>
        <h1 className="rp-title">Minhas missões</h1>
        <p className="rp-sub">Jaguaré · Setor A — capture os pontos liberados pelo agrônomo.</p>
      </div>

      <div className="game-bar">
        <div className="game-stat"><span className="game-num">{coletadas.length}</span><span className="game-lbl">coletadas</span></div>
        <div className="game-progress"><div className="game-progress-fill" style={{ width: `${pct}%` }} /></div>
        <div className="game-stat"><span className="game-num">{total}</span><span className="game-lbl">no setor</span></div>
      </div>

      <div className="game-section-title">{Ic.target({ size: 15 })} Liberadas ({liberados.length})</div>
      {liberados.length === 0 && <div className="empty">Sem missões no momento. Bom trabalho.</div>}
      {liberados.map((s) => (
        <div className="task-card" key={s.id}>
          <div className="task-top">
            <span className="task-field">{s.fazenda}</span>
            {s.priority === 'alta'
              ? <span className="badge critical">prioridade alta</span>
              : <span className="badge muted">liberado · {s.when}</span>}
          </div>
          <div className="task-meta"><span>{Ic.pin({ size: 14 })} {s.talhao} · {s.point}</span></div>
          <div className="capture-btns" style={{ marginTop: 12 }}>
            <button className="btn primary sm" onClick={() => setCapture({ ...s, mode: 'image' })}>{Ic.camera({ size: 15 })} Foto</button>
            <button className="btn sm" onClick={() => setCapture({ ...s, mode: 'video' })}>{Ic.video({ size: 15 })} Vídeo</button>
          </div>
        </div>
      ))}

      {coletadas.length > 0 && (
        <>
          <div className="game-section-title" style={{ marginTop: 22 }}>{Ic.check({ size: 15 })} Coletadas hoje</div>
          {coletadas.map((s) => {
            const d = DISEASE_LABELS[s.result] || { label: s.result, color: '#8b8d98' };
            return (
              <div className="task-card done" key={s.id}>
                <div className="task-top">
                  <span className="task-field">{s.fazenda}</span>
                  <span className="result-chip" style={{ color: d.color }}>
                    <span className="badge-dot" style={{ background: d.color }} /> {d.label}
                  </span>
                </div>
                <div className="task-meta">
                  <span>{Ic.pin({ size: 14 })} {s.talhao} · {s.point}</span>
                  <span>{s.via === 'video' ? Ic.video({ size: 14 }) : Ic.camera({ size: 14 })} {s.via === 'video' ? 'vídeo' : 'foto'}</span>
                  {s.status === 'validado' && <span style={{ color: '#6ee7b7', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Ic.shield({ size: 14 })} validado</span>}
                </div>
              </div>
            );
          })}
        </>
      )}

      {capture && (
        <div className="ct-modal-backdrop" onClick={() => setCapture(null)}>
          <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ct-modal-head">
              <div className="ct-modal-icon">{Ic.layers({ size: 19 })}</div>
              <div>
                <h3>Análise do Talhão</h3>
                <p>{capture.fazenda} · {capture.talhao} · {capture.point}</p>
              </div>
            </div>
            <SpotUploader
              initialMode={capture.mode}
              fieldId={1}
              latitude={-19.86}
              longitude={-40.39}
              onUploadComplete={handleComplete}
              onCancel={() => setCapture(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
