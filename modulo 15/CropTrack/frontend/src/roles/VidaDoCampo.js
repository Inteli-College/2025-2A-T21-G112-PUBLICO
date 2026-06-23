import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIELDS, TIMELINE, HEALTH_HISTORY } from './mock';
import { useActivity } from './ActivityContext';
import { Ic } from './Icons';

const KIND = {
  collect: { icon: Ic.camera, color: '#34d399', label: 'Coleta' },
  ai: { icon: Ic.cpu, color: '#6ee7b7', label: 'IA' },
  alert: { icon: Ic.alert, color: '#ef4444', label: 'Alerta' },
  action: { icon: Ic.check, color: '#d4a574', label: 'Manejo' },
};

function healthColor(h) {
  if (h >= 80) return '#34d399';
  if (h >= 68) return '#f59e0b';
  return '#ef4444';
}

export default function VidaDoCampo() {
  const nav = useNavigate();
  const { activities } = useActivity();

  const actsFor = (f) => activities.filter((a) => a.field === f.name);

  // Fazendas com timeline mock OU alguma atividade registrada
  const withTimeline = FIELDS.filter((f) => TIMELINE[f.id] || actsFor(f).length > 0);

  // Abre na fazenda da ação mais recente (se houver), senão na primeira.
  const recentField = activities[0] && FIELDS.find((f) => f.name === activities[0].field);
  const [fieldId, setFieldId] = useState(recentField?.id || withTimeline[0]?.id || 'f2');
  const field = FIELDS.find((f) => f.id === fieldId) || FIELDS[0];

  const live = actsFor(field);
  const events = [...live, ...(TIMELINE[fieldId] || [])];
  const liveCount = live.filter((a) => a.live).length;
  const history = HEALTH_HISTORY[fieldId] || [];
  const peak = Math.max(...history, 100);

  return (
    <div className="rp">
      <button className="btn ghost sm" onClick={() => nav('/app')} style={{ marginBottom: 16 }}>← Operação</button>
      <div className="rp-head">
        <span className="rp-eyebrow">§ Vida do Campo</span>
        <h1 className="rp-title">{field.name}</h1>
        <p className="rp-sub">{field.area} ha · {field.crop} · todo o histórico de manejo e diagnóstico do talhão.</p>
      </div>

      <div className="rp-tabs">
        {withTimeline.map((f) => {
          const n = actsFor(f).length;
          return (
            <button key={f.id} className={`rp-tab ${f.id === fieldId ? 'active' : ''}`} onClick={() => setFieldId(f.id)}>
              {f.name}{n > 0 && <span className="tl-tab-badge">{n}</span>}
            </button>
          );
        })}
      </div>

      <div className="rp-cols">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Linha do tempo</span>
            <span className="tl-head-meta">
              {liveCount > 0 && <span className="tl-live"><span className="tl-live-dot" /> {liveCount} ao vivo</span>}
              <span className="badge muted">{events.length} eventos</span>
            </span>
          </div>
          {events.length === 0 ? (
            <div className="empty">Sem atividade neste talhão. Crie talhões, libere e colete spots na Operação.</div>
          ) : (
            <div className="timeline">
              {events.map((e, i) => {
                const k = KIND[e.kind] || KIND.action;
                return (
                  <div className={`tl-item ${e.live ? 'tl-item-live' : ''}`} key={i} style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                    <div className="tl-dot" style={{ background: k.color, color: '#06140c' }}>
                      {k.icon({ size: 9, strokeWidth: 2.4 })}
                    </div>
                    <div className="tl-row">
                      <span className="tl-kind" style={{ color: k.color, borderColor: k.color }}>{k.label}</span>
                      <span className="tl-when">{e.when}</span>
                      {e.live && <span className="tl-badge-live">ao vivo</span>}
                    </div>
                    <div className="tl-text">{e.text}</div>
                    <div className="tl-actor">{e.actor}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="panel">
            <div className="panel-head"><span className="panel-title">Saúde do talhão</span></div>
            <div className="kpi-value" style={{ color: healthColor(field.health * 100), marginBottom: 4 }}>
              {Math.round(field.health * 100)}<small>%</small>
            </div>
            <div className="row-meta" style={{ marginBottom: 14 }}>Evolução nas últimas 6 varreduras</div>
            <div className="spark">
              {history.length === 0 ? (
                <div className="row-meta" style={{ alignSelf: 'center' }}>Sem histórico de varredura.</div>
              ) : history.map((v, i) => (
                <div key={i} className="spark-bar" style={{ height: `${(v / peak) * 100}%`, background: healthColor(v) }} title={`${v}%`} />
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><span className="panel-title">Ações sugeridas</span></div>
            <div className="row"><div className="row-main"><div className="row-name">Aplicação dirigida</div><div className="row-meta">Fungicida só nos spots 01–03 (−40% de produto)</div></div></div>
            <div className="row"><div className="row-main"><div className="row-name">Reinspeção</div><div className="row-meta">Reagendar coleta do lado norte em 7 dias</div></div></div>
            <button className="btn primary block" style={{ marginTop: 12 }}>Gerar ordem de serviço</button>
          </div>
        </div>
      </div>
    </div>
  );
}
