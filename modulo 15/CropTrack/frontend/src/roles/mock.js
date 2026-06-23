// Mock data for the role-based platform demo (VP presentation).
// All static & consistent across personas — no backend required.

export const KPIS = {
  fields: 8,
  avgHealth: 0.78,
  openAlerts: 5,
  pendingTasks: 6,
  activeCollectors: 2,
  scansToday: 23,
  haMonitored: 1480,
};

export const COLLECTORS = [
  { id: 'c1', name: 'João Pereira', region: 'Jaguaré · Setor A', active: true, done: 5, total: 7 },
  { id: 'c2', name: 'Maria Santos', region: 'Jaguaré · Setor B', active: true, done: 3, total: 4 },
  { id: 'c3', name: 'Carlos Lima', region: 'Sul · Boa Vista', active: false, done: 0, total: 6 },
];

// Fazendas da operação. Cada fazenda tem N talhões (o gestor delimita cada
// talhão no mapa e libera os spots dele para o coletor).
export const FAZENDAS = [
  { id: 'f1', name: 'Boa Vista', area: 212, crop: 'Café Arábica', health: 0.86, alerts: 0, lastScan: 'há 2h', status: 'ok', center: [-21.1282, -44.2552],
    talhoes: [
      { id: 'f1a', name: 'Sede', area: 120, center: [-21.1278, -44.2548] },
      { id: 'f1b', name: 'Córrego', area: 92, center: [-21.1289, -44.2559] },
    ] },
  { id: 'f2', name: 'Córrego Fundo', area: 148, crop: 'Café Arábica', health: 0.58, alerts: 3, lastScan: 'há 1h', status: 'critical', center: [-21.1350, -44.2621],
    talhoes: [
      { id: 'f2a', name: 'Bordadura Norte', area: 60, center: [-21.1342, -44.2616] },
      { id: 'f2b', name: 'Baixada', area: 88, center: [-21.1358, -44.2628] },
    ] },
  { id: 'f3', name: 'Serra Verde', area: 305, crop: 'Café Arábica', health: 0.72, alerts: 1, lastScan: 'há 5h', status: 'attention', center: [-21.1421, -44.2702],
    talhoes: [
      { id: 'f3a', name: 'Encosta', area: 140, center: [-21.1415, -44.2696] },
      { id: 'f3b', name: 'Vale', area: 95, center: [-21.1428, -44.2710] },
      { id: 'f3c', name: 'Topo', area: 70, center: [-21.1432, -44.2690] },
    ] },
  { id: 'f4', name: 'Boa Esperança', area: 190, crop: 'Conilon', health: 0.81, alerts: 0, lastScan: 'ontem', status: 'ok', center: [-21.1302, -44.2681],
    talhoes: [
      { id: 'f4a', name: 'Talhão 1', area: 110, center: [-21.1298, -44.2676] },
      { id: 'f4b', name: 'Talhão 2', area: 80, center: [-21.1308, -44.2687] },
    ] },
  { id: 'f5', name: 'Alto do Café', area: 240, crop: 'Café Arábica', health: 0.67, alerts: 1, lastScan: 'há 3h', status: 'attention', center: [-21.1391, -44.2561],
    talhoes: [
      { id: 'f5a', name: 'Meia-encosta', area: 130, center: [-21.1386, -44.2556] },
      { id: 'f5b', name: 'Baixo', area: 110, center: [-21.1396, -44.2567] },
    ] },
];

// Alias de compatibilidade (fazendas = nível superior)
export const FIELDS = FAZENDAS;

export const TASKS = [
  { id: 't1', field: 'Córrego Fundo', spots: 4, due: 'Hoje 14:00', assignedTo: 'c1', priority: 'alta', status: 'pending' },
  { id: 't2', field: 'Boa Vista', spots: 3, due: 'Hoje 16:00', assignedTo: 'c1', priority: 'media', status: 'in_progress' },
  { id: 't3', field: 'Serra Verde', spots: 5, due: 'Amanhã 08:00', assignedTo: 'c2', priority: 'media', status: 'pending' },
  { id: 't4', field: 'Alto do Café', spots: 2, due: 'Hoje 11:00', assignedTo: 'c1', priority: 'alta', status: 'done' },
];

// Spots inside a coletor task (checklist)
export const TASK_SPOTS = {
  t1: [
    { id: 's1', name: 'Spot 01 · linha 14', done: true, result: 'leaf_rust', via: 'photo' },
    { id: 's2', name: 'Spot 02 · linha 22', done: false },
    { id: 's3', name: 'Spot 03 · bordadura N', done: false },
    { id: 's4', name: 'Spot 04 · baixada', done: false },
  ],
  t2: [
    { id: 's1', name: 'Spot 01 · entrada', done: true, result: 'healthy' },
    { id: 's2', name: 'Spot 02 · linha 8', done: false },
    { id: 's3', name: 'Spot 03 · linha 30', done: false },
  ],
};

export const ALERTS = [
  { id: 'a1', field: 'Córrego Fundo', type: 'Ferrugem', level: 'alto', when: 'há 1h', note: 'Foco em 3 spots, lado norte. Incidência subindo 2 safras seguidas.' },
  { id: 'a2', field: 'Córrego Fundo', type: 'Bicho-mineiro', level: 'medio', when: 'há 1h', note: 'Minas ativas na bordadura, época de estiagem.' },
  { id: 'a3', field: 'Serra Verde', type: 'Cercosporiose', level: 'medio', when: 'há 5h', note: 'Manchas em mudas do replantio.' },
  { id: 'a4', field: 'Alto do Café', type: 'Ácaro-vermelho', level: 'baixo', when: 'há 3h', note: 'Pontual, monitorar.' },
];

export const REVIEW_QUEUE = [
  { id: 'r1', field: 'Córrego Fundo', collector: 'João Pereira', spot: 'Spot 02', result: 'leaf_rust', conf: 0.88, when: 'há 20min' },
  { id: 'r2', field: 'Córrego Fundo', collector: 'João Pereira', spot: 'Spot 03', result: 'leaf_miner', conf: 0.74, when: 'há 22min' },
  { id: 'r3', field: 'Boa Vista', collector: 'Maria Santos', spot: 'Spot 01', result: 'healthy', conf: 0.96, when: 'há 35min' },
  { id: 'r4', field: 'Serra Verde', collector: 'Maria Santos', spot: 'Spot 05', result: 'brown_eye_spot', conf: 0.81, when: 'há 1h' },
];

// "Vida do campo" — event timeline per field
export const TIMELINE = {
  f2: [
    { kind: 'action', actor: 'Ana (Agrônoma)', text: 'Recomendou aplicação dirigida de fungicida nos spots 01–03', when: 'há 10min' },
    { kind: 'alert', actor: 'CropTrack', text: 'Alerta ALTO de ferrugem — foco no lado norte', when: 'há 1h' },
    { kind: 'ai', actor: 'Visão Computacional', text: 'Detecção: leaf_rust 88%, leaf_miner 74% em 4 spots', when: 'há 20min' },
    { kind: 'collect', actor: 'João Pereira', text: 'Coletou 4 spots no talhão Córrego Fundo', when: 'há 25min' },
    { kind: 'action', actor: 'Ana (Agrônoma)', text: 'Abriu tarefa de coleta — prioridade alta', when: 'há 3h' },
    { kind: 'ai', actor: 'Visão Computacional', text: 'Varredura por drone — saúde média caiu para 58%', when: 'ontem' },
  ],
  f1: [
    { kind: 'ai', actor: 'Visão Computacional', text: 'Varredura — saúde 86%, sem focos relevantes', when: 'há 2h' },
    { kind: 'collect', actor: 'Maria Santos', text: 'Coletou 3 spots', when: 'há 35min' },
    { kind: 'action', actor: 'Ana (Agrônoma)', text: 'Marcou talhão como saudável, sem ação', when: 'há 30min' },
  ],
};

export const HEALTH_HISTORY = {
  f2: [82, 80, 76, 71, 65, 58], // last 6 scans — declining
  f1: [80, 82, 84, 83, 85, 86],
};

// Contas da plataforma (admin + gestores/agrônomos). Coletores são equipe de
// campo, gerenciada pelo Gestor (ver COLLECTORS), não pelo Admin.
export const USERS = [
  { id: 'u1', name: 'Ana Ribeiro', role: 'Agrônoma (Gestor)', region: 'Matriz', status: 'ativo' },
  { id: 'u2', name: 'Bruno Costa', role: 'Agrônomo (Gestor)', region: 'Cerrado Mineiro', status: 'ativo' },
  { id: 'u3', name: 'Roberto Alves', role: 'Admin', region: 'Matriz', status: 'ativo' },
];

export const PLAN = {
  name: 'Cooperativa',
  seats: 12,
  seatsUsed: 5,
  fields: 8,
  ha: 1480,
  mrr: 'R$ 4.200',
  renew: '12/07/2026',
  modelVersion: 'CropTrack Vision · v1',
};

export const DISEASE_LABELS = {
  healthy: { label: 'Saudável', color: '#34d399' },
  leaf_rust: { label: 'Ferrugem', color: '#ef4444' },
  brown_eye_spot: { label: 'Cercosporiose', color: '#f97316' },
  leaf_miner: { label: 'Bicho-mineiro', color: '#a855f7' },
  red_spider_mite: { label: 'Ácaro-vermelho', color: '#dc2626' },
};

export function collectorById(id) {
  return COLLECTORS.find((c) => c.id === id);
}
