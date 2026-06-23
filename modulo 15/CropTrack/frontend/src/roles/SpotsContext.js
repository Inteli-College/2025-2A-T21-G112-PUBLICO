import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loadLS, saveLS } from './storage';

// Shared spot store — the loop: gestor libera → coletor coleta → gestor valida.
// status: 'liberado' (esperando coletor) → 'coletado' (analisado, a revisar) → 'validado'
// Persistido em localStorage para sobreviver a reload/restart.

const LS_KEY = 'ct_spots';

const Ctx = createContext(null);

export function SpotsProvider({ children }) {
  const [spots, setSpots] = useState(() => loadLS(LS_KEY, []));
  // Próximo id: continua de onde parou (maior id salvo) pra não colidir após reload.
  const idRef = useRef(spots.reduce((m, s) => Math.max(m, s.id || 0), 100));

  useEffect(() => { saveLS(LS_KEY, spots); }, [spots]);

  const releaseSpot = ({ fazenda = '', talhao = '', point, lat, lng, priority = 'media' }) =>
    setSpots((p) => [{ id: ++idRef.current, fazenda, talhao, point, lat, lng, priority, status: 'liberado', when: 'agora' }, ...p]);

  const collectSpot = (id, data) =>
    setSpots((p) => p.map((s) => (s.id === id ? { ...s, status: 'coletado', when: 'agora', collector: 'João Pereira', ...data } : s)));

  const validateSpot = (id) =>
    setSpots((p) => p.map((s) => (s.id === id ? { ...s, status: 'validado' } : s)));

  const by = (status) => spots.filter((s) => s.status === status);

  return (
    <Ctx.Provider value={{ spots, releaseSpot, collectSpot, validateSpot, by }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSpots() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSpots must be used within SpotsProvider');
  return ctx;
}
