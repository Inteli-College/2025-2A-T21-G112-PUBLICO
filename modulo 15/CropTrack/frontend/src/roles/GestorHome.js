import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FIELDS, ALERTS, DISEASE_LABELS, COLLECTORS } from './mock';
import { useSpots } from './SpotsContext';
import { useVideoJob } from './VideoJobContext';
import { useActivity } from './ActivityContext';
import { loadLS, saveLS } from './storage';
import GestorMap from './GestorMap';
import WeatherWidget from '../components/WeatherWidget';
import { Ic } from './Icons';

function healthColor(h) {
  if (h >= 0.8) return '#34d399';
  if (h >= 0.68) return '#f59e0b';
  return '#ef4444';
}
const alertColor = { alto: '#ef4444', medio: '#f97316', baixo: '#8b8d98' };
const avgHealth = FIELDS.reduce((a, f) => a + f.health, 0) / FIELDS.length;

// centroide e área (ha) aproximada de um polígono lat/lng
function centroid(ll) {
  const s = ll.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
  return [s[0] / ll.length, s[1] / ll.length];
}
function polygonHa(ll) {
  const R = 111320;
  const latc = ll.reduce((a, p) => a + p[0], 0) / ll.length;
  const pts = ll.map(([la, lo]) => [lo * R * Math.cos((latc * Math.PI) / 180), la * R]);
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return Math.abs(area / 2) / 10000;
}

export default function GestorHome() {
  const nav = useNavigate();
  const { spots, by, releaseSpot, validateSpot } = useSpots();
  const { analyzedVideos } = useVideoJob();
  const { logActivity } = useActivity();
  const [talhoesMap, setTalhoesMap] = useState(() =>
    loadLS('ct_talhoes', Object.fromEntries(FIELDS.map((f) => [f.id, f.talhoes]))));
  const [fazendaId, setFazendaId] = useState('f2');
  const [talhaoId, setTalhaoId] = useState('f2a');
  const [areas, setAreas] = useState(() => loadLS('ct_areas', {})); // polígono por talhão
  const [drawing, setDrawing] = useState(false);

  // Persiste talhões criados e áreas desenhadas (sobrevive a reload).
  useEffect(() => { saveLS('ct_talhoes', talhoesMap); }, [talhoesMap]);
  useEffect(() => { saveLS('ct_areas', areas); }, [areas]);
  const [naming, setNaming] = useState(null); // { ll, center } aguardando nome
  const [newName, setNewName] = useState('');
  const [flash, setFlash] = useState(null);
  const [videoReview, setVideoReview] = useState(null); // spot whose video is being watched
  const [savedVideos, setSavedVideos] = useState([]); // persisted videos from the backend

  // Load persisted analyzed videos; refetch whenever a new one finishes.
  useEffect(() => {
    let active = true;
    axios.get('/api/videos')
      .then((r) => { if (active) setSavedVideos(r.data.videos || []); })
      .catch(() => {});
    return () => { active = false; };
  }, [analyzedVideos.length]);

  const fazenda = FIELDS.find((f) => f.id === fazendaId);
  const talhoes = talhoesMap[fazendaId];
  const talhao = talhoes.find((t) => t.id === talhaoId) || talhoes[0];
  const area = areas[talhao.id];

  const liberados = by('liberado');
  const aRevisar = by('coletado');
  const validados = by('validado');

  function pickFazenda(id) {
    setFazendaId(id);
    setTalhaoId(talhoesMap[id][0].id);
  }
  function showFlash(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1700);
  }
  function handleRelease(lat, lng) {
    if (drawing) return;
    releaseSpot({ fazenda: fazenda.name, talhao: talhao.name, lat, lng, point: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    logActivity({ kind: 'action', actor: 'Ana (Agrônoma)', field: fazenda.name,
      text: `Liberou um spot de coleta em ${talhao.name}` });
    showFlash(`Spot liberado em ${fazenda.name} · ${talhao.name}`);
  }
  // terminou de desenhar o polígono → pede o nome do novo talhão
  function handleArea(ll) {
    setDrawing(false);
    setNewName('');
    setNaming({ ll, center: centroid(ll), fazendaId });
  }
  function createTalhao(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const fzId = naming.fazendaId || fazendaId;
    const fz = FIELDS.find((f) => f.id === fzId) || fazenda;
    const id = `${fzId}-${Date.now()}`;
    const t = { id, name: newName.trim(), area: Math.round(polygonHa(naming.ll)), center: naming.center };
    setTalhoesMap((p) => ({ ...p, [fzId]: [...(p[fzId] || []), t] }));
    setAreas((p) => ({ ...p, [id]: naming.ll }));
    setFazendaId(fzId);
    setTalhaoId(id);
    setNaming(null);
    logActivity({ kind: 'action', actor: 'Ana (Agrônoma)', field: fz.name,
      text: `Criou o talhão "${t.name}" (~${t.area} ha)` });
    showFlash(`Talhão "${t.name}" criado em ${fz.name}`);
  }

  return (
    <div className="rp">
      <div className="rp-head">
        <span className="rp-eyebrow">§ Operação · Visão do Gestor</span>
        <h1 className="rp-title">Bom dia, Ana</h1>
        <p className="rp-sub">Marque os pontos de coleta no mapa do talhão — os coletores capturam em campo e a análise volta aqui pra validar.</p>
      </div>

      <div className="rp-kpis">
        <div className="kpi"><div className="kpi-label">Spots liberados</div><div className="kpi-value" style={{ color: '#6ee7b7' }}>{liberados.length}</div></div>
        <div className="kpi"><div className="kpi-label">A revisar</div><div className="kpi-value" style={{ color: '#fdba74' }}>{aRevisar.length}</div></div>
        <div className="kpi"><div className="kpi-label">Validados</div><div className="kpi-value">{validados.length}</div></div>
        <div className="kpi"><div className="kpi-label">Saúde média</div><div className="kpi-value" style={{ color: healthColor(avgHealth) }}>{Math.round(avgHealth * 100)}<small>%</small></div></div>
      </div>

      {/* MAPA — delimitar talhão + liberar spots */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
        <div className="panel-head" style={{ padding: '16px 18px 12px' }}>
          <div className="map-head-left">
            <span className="panel-title">Fazenda</span>
            <select className="field-select" value={fazendaId} onChange={(e) => pickFazenda(e.target.value)} disabled={drawing}>
              {FIELDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <span className="panel-title">Talhão</span>
            <select className="field-select" value={talhaoId} onChange={(e) => setTalhaoId(e.target.value)} disabled={drawing}>
              {talhoes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <span className="map-hint">{drawing ? '· clique os vértices; clique no 1º ponto p/ fechar' : '· clique para liberar um spot'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="map-legend">
              <span><i style={{ background: '#34d399' }} /> Liberado</span>
              <span><i style={{ background: '#f59e0b' }} /> Coletado</span>
              <span><i style={{ background: '#60a5fa' }} /> Validado</span>
            </div>
            {drawing
              ? <button className="btn sm" onClick={() => setDrawing(false)}>{Ic.x({ size: 14 })} Cancelar</button>
              : <button className="btn primary sm" onClick={() => setDrawing(true)}>{Ic.plus({ size: 14 })} Novo talhão</button>}
          </div>
        </div>
        <div className="gestor-map">
          <GestorMap spots={spots} area={area} center={talhao.center} drawing={drawing} onRelease={handleRelease} onAreaComplete={handleArea} />
          {flash && <div className="map-flash">{Ic.check({ size: 15 })} {flash}</div>}
        </div>
      </div>

      <div className="rp-cols">
        <div>
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Spots liberados</span>
              <span className="badge muted">{liberados.length} aguardando coleta</span>
            </div>
            {liberados.length === 0 && <div className="empty">Clique no mapa para liberar um spot.</div>}
            {liberados.map((s) => (
              <div className="row" key={s.id}>
                <span className="row-ic" style={{ color: '#34d399' }}>{Ic.pin({ size: 16 })}</span>
                <div className="row-main">
                  <div className="row-name">{s.fazenda} · {s.talhao}</div>
                  <div className="row-meta">{s.point} · {s.when}</div>
                </div>
                {s.priority === 'alta' && <span className="badge critical">alta</span>}
                <span className="badge ok">liberado</span>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Coletores em campo</span>
              <span className="badge muted">{COLLECTORS.filter((c) => c.active).length} ativos</span>
            </div>
            {COLLECTORS.map((c) => (
              <div className="collector" key={c.id}>
                <div className={`avatar ${c.active ? '' : 'off'}`}>{c.name[0]}</div>
                <div className="row-main">
                  <div className="row-name">{c.name}</div>
                  <div className="row-meta">{c.region}</div>
                </div>
                <span className="badge muted">{c.done}/{c.total} coletas</span>
                <span className={`badge ${c.active ? 'ok' : 'muted'}`}>
                  <span className="badge-dot" style={{ background: c.active ? '#34d399' : '#5a5c6a' }} />
                  {c.active ? 'em campo' : 'offline'}
                </span>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Alertas fitossanitários</span>
              <span className="badge critical">{ALERTS.filter((a) => a.level === 'alto').length} altos</span>
            </div>
            {ALERTS.slice(0, 3).map((a) => (
              <div className="alert-item" key={a.id}>
                <div className="alert-bar" style={{ background: alertColor[a.level] }} />
                <div className="alert-body">
                  <div className="alert-top">
                    <span className="alert-type">{a.type}</span>
                    <span className={`badge ${a.level}`}>{a.level}</span>
                  </div>
                  <div className="alert-note">{a.field} — {a.note}</div>
                </div>
              </div>
            ))}
            <button className="panel-link" style={{ marginTop: 8 }} onClick={() => nav('/app/vida-do-campo')}>Ver vida do campo →</button>
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Análises a revisar</span>
              <span className="badge attention">{aRevisar.length} na fila</span>
            </div>
            {aRevisar.length === 0 && <div className="empty">Tudo revisado.</div>}
            {aRevisar.map((s) => {
              const d = DISEASE_LABELS[s.result] || { label: s.result, color: '#8b8d98' };
              return (
                <div className="review" key={s.id}>
                  <span className="review-thumb" style={{ color: '#9fb3a8' }}>{s.via === 'video' ? Ic.video({ size: 18 }) : Ic.leaf({ size: 18 })}</span>
                  <div className="row-main">
                    <div className="row-name">{s.fazenda} · {s.talhao}</div>
                    <div className="row-meta">{s.point} · {s.collector} · {s.when}</div>
                  </div>
                  <span className="result-chip" style={{ color: d.color }}>
                    <span className="badge-dot" style={{ background: d.color }} /> {d.label}
                  </span>
                  {s.via === 'video' && s.videoUrl && (
                    <button className="btn sm" onClick={() => setVideoReview({
                      videoUrl: s.videoUrl,
                      title: 'Vídeo do talhão',
                      subtitle: `${s.fazenda} · ${s.talhao} · ${s.point}`,
                      spotId: s.id,
                      field: s.fazenda,
                      talhao: s.talhao,
                    })}>{Ic.video({ size: 14 })} Ver vídeo</button>
                  )}
                  <button className="btn primary sm" onClick={() => {
                    validateSpot(s.id);
                    logActivity({ kind: 'action', actor: 'Ana (Agrônoma)', field: s.fazenda,
                      text: `Validou o diagnóstico${s.talhao ? ` · ${s.talhao}` : ''} — ${d.label}` });
                  }}>Validar</button>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Vídeos analisados</span>
              <span className="badge muted">{savedVideos.length}</span>
            </div>
            {savedVideos.length === 0 && <div className="empty">Os vídeos analisados aparecem aqui.</div>}
            {savedVideos.map((v) => {
              const total = v.stats?.totalDetections || 0;
              const classes = v.stats?.classes ? Object.keys(v.stats.classes).length : 0;
              return (
                <div className="review" key={v.id}>
                  <span className="review-thumb" style={{ color: '#9fb3a8' }}>{Ic.video({ size: 18 })}</span>
                  <div className="row-main">
                    <div className="row-name">{v.filename || 'Vídeo analisado'}</div>
                    <div className="row-meta">{total} detecções · {classes} classes</div>
                  </div>
                  <button className="btn primary sm" onClick={() => setVideoReview({
                    videoUrl: v.url,
                    title: v.filename || 'Vídeo analisado',
                    subtitle: `${total} detecções · ${classes} classes`,
                  })}>{Ic.video({ size: 14 })} Assistir</button>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Clima · {talhao.name}</span>
              <span className="badge muted">tempo real</span>
            </div>
            <WeatherWidget latitude={talhao.center[0]} longitude={talhao.center[1]} />
          </div>
        </div>
      </div>

      {/* MODAL — rever o vídeo analisado de um spot */}
      {videoReview && (
        <div className="ct-modal-backdrop" onClick={() => setVideoReview(null)}>
          <div className="ct-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="ct-modal-head">
              <div className="ct-modal-icon">{Ic.video({ size: 19 })}</div>
              <div>
                <h3>{videoReview.title}</h3>
                <p>{videoReview.subtitle}</p>
              </div>
            </div>
            <video
              src={videoReview.videoUrl}
              controls
              autoPlay
              style={{ width: '100%', borderRadius: 12, background: '#000', marginBottom: 12 }}
            />
            {videoReview.spotId != null && (
              <button className="btn primary block" onClick={() => {
                validateSpot(videoReview.spotId);
                logActivity({ kind: 'action', actor: 'Ana (Agrônoma)', field: videoReview.field,
                  text: `Validou a análise de vídeo${videoReview.talhao ? ` · ${videoReview.talhao}` : ''}` });
                setVideoReview(null);
              }}>
                {Ic.check({ size: 14 })} Validar análise
              </button>
            )}
            <button className="btn ghost block" onClick={() => setVideoReview(null)}>Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL — nomear o talhão recém-desenhado */}
      {naming && (
        <div className="ct-modal-backdrop" onClick={() => setNaming(null)}>
          <div className="ct-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="ct-modal-head">
              <div className="ct-modal-icon">{Ic.hexagon({ size: 19 })}</div>
              <div>
                <h3>Novo talhão</h3>
                <p>~{Math.round(polygonHa(naming.ll))} ha desenhados</p>
              </div>
            </div>
            <form className="spot-form" onSubmit={createTalhao}>
              <label>Fazenda
                <select value={naming.fazendaId || fazendaId} onChange={(e) => setNaming({ ...naming, fazendaId: e.target.value })}>
                  {FIELDS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label>Nome do talhão
                <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Talhão da Sede" />
              </label>
              <button className="btn primary block" type="submit">{Ic.plus({ size: 14 })} Criar talhão</button>
              <button className="btn ghost block" type="button" onClick={() => setNaming(null)}>Descartar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
