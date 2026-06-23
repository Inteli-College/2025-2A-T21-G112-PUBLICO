import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loadLS, saveLS } from './storage';

// Log único de atividades — TODA ação do app entra aqui e aparece na linha do
// tempo (Vida do Campo). Persistido em localStorage (sobrevive a reload).
// activity: { id, kind, actor, text, field, when, live }
//   kind: 'collect' | 'ai' | 'alert' | 'action'
//   field: nome da fazenda à qual a ação pertence (casa com a aba da timeline)

const LS_KEY = 'ct_activity';
const Ctx = createContext(null);

export function ActivityProvider({ children }) {
  // Ao carregar do storage, são eventos históricos → live=false (sem pulso).
  const [activities, setActivities] = useState(() =>
    loadLS(LS_KEY, []).map((a) => ({ ...a, live: false })));
  const idRef = useRef(activities.reduce((m, a) => Math.max(m, a.id || 0), 0));

  useEffect(() => { saveLS(LS_KEY, activities); }, [activities]);

  const logActivity = ({ kind = 'action', actor = 'Sistema', text, field = null }) =>
    setActivities((p) => [
      { id: ++idRef.current, kind, actor, text, field, when: 'agora', live: true },
      ...p,
    ].slice(0, 200)); // guarda os últimos 200

  return (
    <Ctx.Provider value={{ activities, logActivity }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}
