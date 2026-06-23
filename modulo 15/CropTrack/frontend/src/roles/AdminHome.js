import React, { useState } from 'react';
import { USERS, FIELDS, PLAN, DISEASE_LABELS } from './mock';
import { Ic } from './Icons';

function healthColor(h) {
  if (h >= 0.8) return '#34d399';
  if (h >= 0.68) return '#f59e0b';
  return '#ef4444';
}
const roleBadge = (role) => (role.includes('Admin') ? 'critical' : role.includes('Gestor') ? 'ok' : 'muted');
const statusCls = (s) => ({ ok: 'ok', attention: 'attention', critical: 'critical' }[s] || 'muted');

// Diagnósticos recentes da operação (todas as fazendas)
const DIAG = [
  { key: 'healthy', n: 180 },
  { key: 'leaf_rust', n: 42 },
  { key: 'brown_eye_spot', n: 31 },
  { key: 'leaf_miner', n: 28 },
];

export default function AdminHome() {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState(USERS);
  const [invite, setInvite] = useState(null); // form { name, role, region } | null

  const totalHa = FIELDS.reduce((a, f) => a + f.area, 0);
  const avgHealth = FIELDS.reduce((a, f) => a + f.health, 0) / FIELDS.length;
  const totalTalhoes = FIELDS.reduce((a, f) => a + (f.talhoes ? f.talhoes.length : 0), 0);
  const openAlerts = FIELDS.reduce((a, f) => a + f.alerts, 0);
  const activeUsers = users.filter((u) => u.status === 'ativo').length;
  const totalDiag = DIAG.reduce((a, d) => a + d.n, 0);

  const toggleUser = (id) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' } : u)));
  const removeUser = (id) => setUsers((p) => p.filter((u) => u.id !== id));
  const submitInvite = (e) => {
    e.preventDefault();
    if (!invite.name.trim()) return;
    setUsers((p) => [...p, {
      id: `u${Date.now()}`,
      name: invite.name.trim(),
      role: invite.role,
      region: invite.region.trim() || '—',
      status: 'ativo',
    }]);
    setInvite(null);
  };

  const TABS = [['overview', 'Visão Geral'], ['users', 'Usuários & Papéis'], ['fields', 'Fazendas'], ['plan', 'Impacto & Plano']];

  return (
    <div className="rp">
      <div className="rp-head">
        <span className="rp-eyebrow">§ Administração</span>
        <h1 className="rp-title">Painel da operação</h1>
        <p className="rp-sub">Visão analítica de todas as fazendas, equipe e plano da Cooperativa.</p>
      </div>

      <div className="rp-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={`rp-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {/* ---------- VISÃO GERAL ---------- */}
      {tab === 'overview' && (
        <>
          <div className="rp-kpis">
            <div className="kpi"><div className="kpi-label">Fazendas</div><div className="kpi-value">{FIELDS.length}<small> · {totalTalhoes} talhões</small></div></div>
            <div className="kpi"><div className="kpi-label">Hectares monitorados</div><div className="kpi-value">{totalHa.toLocaleString('pt-BR')}</div></div>
            <div className="kpi"><div className="kpi-label">Saúde média</div><div className="kpi-value" style={{ color: healthColor(avgHealth) }}>{Math.round(avgHealth * 100)}<small>%</small></div></div>
            <div className="kpi"><div className="kpi-label">Alertas abertos</div><div className="kpi-value" style={{ color: '#fca5a5' }}>{openAlerts}</div></div>
            <div className="kpi"><div className="kpi-label">Usuários ativos</div><div className="kpi-value">{activeUsers}</div></div>
            <div className="kpi"><div className="kpi-label">Receita mensal</div><div className="kpi-value" style={{ fontSize: 24, color: 'var(--emerald-bright)' }}>{PLAN.mrr}</div></div>
          </div>

          <div className="rp-cols">
            <div className="panel">
              <div className="panel-head"><span className="panel-title">Saúde por fazenda</span></div>
              <table className="rp-table">
                <thead><tr><th>Fazenda</th><th>Talhões</th><th>Saúde</th><th>Alertas</th><th>Status</th></tr></thead>
                <tbody>
                  {FIELDS.map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.name}<div style={{ fontSize: 11, color: 'var(--ink-text-faint)' }}>{f.crop} · {f.area} ha</div></td>
                      <td><span className="badge muted">{f.talhoes ? f.talhoes.length : 0}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="health-bar"><div className="health-fill" style={{ width: `${f.health * 100}%`, background: healthColor(f.health) }} /></div>
                          <span className="health-pct" style={{ color: healthColor(f.health) }}>{Math.round(f.health * 100)}%</span>
                        </div>
                      </td>
                      <td>{f.alerts > 0 ? <span className="badge critical">{f.alerts}</span> : <span className="badge muted">0</span>}</td>
                      <td><span className={`badge ${statusCls(f.status)}`}>{f.lastScan}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">Diagnósticos recentes</span><span className="badge muted">{totalDiag} análises</span></div>
                <div className="diag-bars">
                  {DIAG.map((d) => {
                    const lbl = DISEASE_LABELS[d.key] || { label: d.key, color: '#8b8d98' };
                    const pct = Math.round((d.n / totalDiag) * 100);
                    return (
                      <div className="diag-row" key={d.key}>
                        <span className="diag-name" style={{ color: lbl.color }}>{lbl.label}</span>
                        <div className="diag-track"><div className="diag-fill" style={{ width: `${pct}%`, background: lbl.color }} /></div>
                        <span className="diag-n">{d.n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">Modelo de IA ativo</span><span className="badge ok">produção</span></div>
                <div className="row">
                  <span className="row-ic" style={{ color: '#6ee7b7' }}>{Ic.cpu({ size: 18 })}</span>
                  <div className="row-main">
                    <div className="row-name">{PLAN.modelVersion}</div>
                    <div className="row-meta">Detecção de doenças e pragas em café</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- USUÁRIOS (CRUD funcional) ---------- */}
      {tab === 'users' && (
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Equipe ({users.length})</span>
            <button className="btn primary sm" onClick={() => setInvite({ name: '', role: 'Agrônomo (Gestor)', region: '' })}>{Ic.plus({ size: 14 })} Convidar usuário</button>
          </div>
          <table className="rp-table">
            <thead><tr><th>Nome</th><th>Papel</th><th>Região</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{u.name[0]}</div>{u.name}
                  </div></td>
                  <td><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--ink-text-dim)' }}>{u.region}</td>
                  <td>
                    <button className={`badge ${u.status === 'ativo' ? 'ok' : 'muted'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => toggleUser(u.id)}>
                      {u.status}
                    </button>
                  </td>
                  <td><button className="btn ghost sm" onClick={() => removeUser(u.id)}>{Ic.x({ size: 13 })} Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="row-meta" style={{ marginTop: 10 }}>Clique no status para ativar/inativar o usuário.</p>
        </div>
      )}

      {/* ---------- FAZENDAS (cada uma com seus talhões) ---------- */}
      {tab === 'fields' && (
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Fazendas ({FIELDS.length}) · {totalTalhoes} talhões</span>
            <button className="btn primary sm">{Ic.plus({ size: 14 })} Nova fazenda</button>
          </div>
          {FIELDS.map((f) => (
            <div className="fazenda-row" key={f.id}>
              <div className="fazenda-head">
                <div>
                  <div className="row-name">{f.name}</div>
                  <div className="row-meta">{f.crop} · {f.area} ha · saúde <span style={{ color: healthColor(f.health), fontWeight: 600 }}>{Math.round(f.health * 100)}%</span></div>
                </div>
                <span className="badge muted">{f.talhoes ? f.talhoes.length : 0} talhões</span>
              </div>
              <div className="talhao-chips">
                {(f.talhoes || []).map((t) => (
                  <span className="talhao-chip" key={t.id}>{t.name} · {t.area} ha</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- IMPACTO & PLANO ---------- */}
      {tab === 'plan' && (
        <>
          {/* Hero de impacto / ROI */}
          <div className="impact-hero">
            <div>
              <div className="impact-eyebrow">Impacto da plataforma nesta safra</div>
              <div className="impact-big">R$ 206.000<span> economizados</span></div>
              <div className="impact-sub">Você investe <b>R$ 50.400/ano</b> na plataforma e economiza <b>R$ 206 mil por safra</b> — cada R$ 1 investido devolve R$ 4,10.</div>
            </div>
            <div className="roi-badge"><span className="roi-num">4,1×</span><span className="roi-lbl">retorno</span></div>
          </div>

          <div className="rp-cols">
            <div className="panel">
              <div className="panel-head"><span className="panel-title">De onde vem a economia</span></div>
              <div className="save-row"><span>−40% de fungicida (1.095 ha)</span><b>R$ 52.000</b></div>
              <div className="save-row"><span>Vistorias manuais evitadas</span><b>R$ 14.000</b></div>
              <div className="save-row"><span>Perda evitada por detecção precoce</span><b>R$ 140.000</b></div>
              <div className="save-row total"><span>Total economizado / safra</span><b style={{ color: 'var(--emerald-bright)' }}>R$ 206.000</b></div>
            </div>

            <div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">Detecção precoce</span></div>
                <div className="impact-stats">
                  <div><div className="impact-num">23</div><div className="impact-lbl">focos achados cedo</div></div>
                  <div><div className="impact-num">412<small> ha</small></div><div className="impact-lbl">protegidos</div></div>
                  <div><div className="impact-num">−1.180<small> L</small></div><div className="impact-lbl">defensivo evitado</div></div>
                </div>
                <p className="row-meta" style={{ marginTop: 12 }}>Ferrugem, cercosporiose e bicho-mineiro identificados antes de virar prejuízo.</p>
              </div>
              <div className="panel" style={{ background: 'var(--emerald-ink)', borderColor: 'rgba(52,211,153,0.25)' }}>
                <div className="panel-title" style={{ marginBottom: 4 }}>Plano {PLAN.name} · {PLAN.ha.toLocaleString('pt-BR')} ha</div>
                <p className="row-meta" style={{ marginBottom: 14 }}>{PLAN.seatsUsed}/{PLAN.seats} assentos · renova em {PLAN.renew}. Há talhões sem monitoramento — proteja mais hectares.</p>
                <div className="cta-actions">
                  <button className="btn primary">{Ic.plus({ size: 14 })} Expandir monitoramento</button>
                  <button className="btn">Baixar relatório de impacto</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- MODAL CONVIDAR USUÁRIO ---------- */}
      {invite && (
        <div className="ct-modal-backdrop" onClick={() => setInvite(null)}>
          <div className="ct-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="ct-modal-head">
              <div className="ct-modal-icon">{Ic.plus({ size: 19 })}</div>
              <div>
                <h3>Convidar usuário</h3>
                <p>Adicione um agrônomo ou admin à operação.</p>
              </div>
            </div>
            <form className="spot-form" onSubmit={submitInvite}>
              <label>Nome
                <input autoFocus value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="Ex.: Carla Mendes" />
              </label>
              <div className="spot-form-row">
                <label>Papel
                  <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                    <option>Agrônomo (Gestor)</option>
                    <option>Admin</option>
                  </select>
                </label>
                <label>Região
                  <input value={invite.region} onChange={(e) => setInvite({ ...invite, region: e.target.value })} placeholder="Ex.: Sul de Minas" />
                </label>
              </div>
              <button className="btn primary block" type="submit">{Ic.plus({ size: 14 })} Adicionar usuário</button>
              <button className="btn ghost block" type="button" onClick={() => setInvite(null)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
