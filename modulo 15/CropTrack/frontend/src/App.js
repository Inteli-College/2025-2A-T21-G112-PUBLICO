import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './components/Dashboard';
import ImageUploader from './components/ImageUploader';
import VideoAnalyzer from './components/VideoAnalyzer';
import VideoJobToast from './components/VideoJobToast';
import { RoleProvider, useRole, ROLES, ROLE_ORDER } from './roles/RoleContext';
import { SpotsProvider } from './roles/SpotsContext';
import { VideoJobProvider } from './roles/VideoJobContext';
import { ActivityProvider } from './roles/ActivityContext';
import GestorHome from './roles/GestorHome';
import ColetorHome from './roles/ColetorHome';
import AdminHome from './roles/AdminHome';
import VidaDoCampo from './roles/VidaDoCampo';
import GuiaDoencas from './roles/GuiaDoencas';
import './roles/roles.css';
import './App.css';

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

const I = (paths) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const Icon = {
  fields: I(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></>),
  upload: I(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>),
  scan: I(<><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" /></>),
  life: I(<><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>),
  map: I(<><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15" /><path d="M15 6v15" /></>),
  tasks: I(<><path d="M11 3 8 6 6.5 4.5" /><path d="M11 9l-3 3-1.5-1.5" /><path d="M11 15l-3 3-1.5-1.5" /><path d="M16 5h5" /><path d="M16 11h5" /><path d="M16 17h5" /></>),
  guide: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>),
  admin: I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  back: I(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>),
  brand: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 4 C 9 10, 6 16, 8 22 C 10 28, 20 28, 22 22 C 24 16, 21 10, 16 4 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 6 L 16 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Role-aware navigation                                                      */
/* -------------------------------------------------------------------------- */

const NAV_BY_ROLE = {
  gestor: [
    { to: '/app', label: 'Operação', icon: Icon.fields, end: true },
    { to: '/app/vida-do-campo', label: 'Vida do Campo', icon: Icon.life },
    { to: '/app/guia', label: 'Guia de Doenças', icon: Icon.guide },
  ],
  coletor: [
    { to: '/app', label: 'Minhas Missões', icon: Icon.tasks, end: true },
    { to: '/app/guia', label: 'Guia de Doenças', icon: Icon.guide },
  ],
  admin: [
    { to: '/app', label: 'Administração', icon: Icon.admin, end: true },
  ],
};

function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <div className="role-switch">
      <span className="role-switch-label">Ver como</span>
      {ROLE_ORDER.map((r) => (
        <button
          key={r}
          className={`role-switch-btn ${role === r ? 'active' : ''}`}
          onClick={() => setRole(r)}
          title={ROLES[r].desc}
        >
          <span className="role-dot">{ROLES[r].avatar}</span>
          {ROLES[r].label}
        </button>
      ))}
    </div>
  );
}

function Sidebar() {
  const { role, meta } = useRole();
  const nav = NAV_BY_ROLE[role] || NAV_BY_ROLE.gestor;
  return (
    <aside className="app-sidebar">
      <Link to="/" className="app-sidebar-brand" aria-label="CropTrack home">
        {Icon.brand}
      </Link>

      <RoleSwitcher />

      <nav className="app-sidebar-nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `app-sidebar-icon ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="app-sidebar-indicator" />}
                <span className="app-sidebar-icon-svg">{item.icon}</span>
                <span className="app-sidebar-tooltip">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-bottom">
        <Link to="/" className="app-sidebar-home" aria-label="Back to landing">
          {Icon.back}
          <span className="app-sidebar-tooltip">Voltar para o site</span>
        </Link>
        <div className="app-sidebar-avatar" title={meta.full}>{meta.avatar}</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const location = useLocation();
  const meta = {
    '/app/upload': { eyebrow: '§ Diagnóstico', title: 'Análise de imagem', subtitle: 'Suba a foto de uma folha e receba o diagnóstico.' },
    '/app/scan': { eyebrow: '§ Diagnóstico por IA', title: 'Análise por IA', subtitle: 'Detecção de doenças e pragas em foto ou vídeo do talhão.' },
  };
  // Self-headed routes hide the generic topbar
  const selfHeaded = ['/app', '/app/campos', '/app/vida-do-campo', '/app/guia'];
  if (selfHeaded.includes(location.pathname)) return null;
  const m = meta[location.pathname] || meta['/app/scan'];

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <div className="app-topbar-titles">
          <span className="app-topbar-eyebrow">{m.eyebrow}</span>
          <h1 className="app-topbar-title">{m.title}</h1>
          <p className="app-topbar-sub">{m.subtitle}</p>
        </div>
        <div className="app-topbar-meta">
          <span className="app-topbar-dot" />
          <span className="app-topbar-status">Sistema online</span>
        </div>
      </div>
    </header>
  );
}

function RoleHome() {
  const { role } = useRole();
  if (role === 'coletor') return <ColetorHome />;
  if (role === 'admin') return <AdminHome />;
  return <GestorHome />;
}

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Topbar />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
      <VideoJobToast />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Router                                                                     */
/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <RoleProvider>
      <ActivityProvider>
      <SpotsProvider>
        <VideoJobProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<RoleHome />} />
            <Route path="vida-do-campo" element={<VidaDoCampo />} />
            <Route path="guia" element={<GuiaDoencas />} />
            <Route path="campos" element={<Dashboard />} />
            <Route path="upload" element={<ImageUploader />} />
            <Route path="scan" element={<VideoAnalyzer />} />
          </Route>
          </Routes>
        </Router>
        </VideoJobProvider>
      </SpotsProvider>
      </ActivityProvider>
    </RoleProvider>
  );
}
