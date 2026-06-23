import React, { createContext, useContext, useEffect, useState } from 'react';

export const ROLES = {
  gestor: {
    key: 'gestor',
    label: 'Gestor',
    full: 'Agrônomo / Gestor',
    desc: 'Acompanha a operação, revisa diagnósticos e decide o manejo.',
    avatar: 'G',
  },
  coletor: {
    key: 'coletor',
    label: 'Coletor',
    full: 'Operador de campo',
    desc: 'Recebe as tarefas do dia e captura as imagens no talhão.',
    avatar: 'C',
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    full: 'Administrador',
    desc: 'Configura usuários, talhões, modelos e o plano da operação.',
    avatar: 'A',
  },
};

export const ROLE_ORDER = ['gestor', 'coletor', 'admin'];

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('ct_role') || 'gestor';
    } catch {
      return 'gestor';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ct_role', role);
    } catch {
      /* ignore */
    }
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole, meta: ROLES[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
