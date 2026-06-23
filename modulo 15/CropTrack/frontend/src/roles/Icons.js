import React from 'react';

// Consistent stroke icon set (24px grid, currentColor) — replaces emojis.
const S = (children, p = {}) => (
  <svg
    width={p.size || 16}
    height={p.size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={p.strokeWidth || 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', flex: 'none', ...p.style }}
    aria-hidden
  >
    {children}
  </svg>
);

export const Ic = {
  camera: (p) => S(<><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3.2" /></>, p),
  video: (p) => S(<><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m16 10 6-3v10l-6-3" /></>, p),
  check: (p) => S(<path d="M20 6 9 17l-5-5" />, p),
  checkCircle: (p) => S(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>, p),
  target: (p) => S(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>, p),
  zap: (p) => S(<path d="M13 2 4 14h7l-1 8 10-12h-7l0-8Z" />, p),
  pin: (p) => S(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>, p),
  alert: (p) => S(<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>, p),
  cpu: (p) => S(<><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></>, p),
  leaf: (p) => S(<><path d="M11 20A7 7 0 0 1 4 13C4 8 8 4 20 4c0 8-5 12-9 12Z" /><path d="M4 21c3-3 6-5 10-6" /></>, p),
  plus: (p) => S(<path d="M12 5v14M5 12h14" />, p),
  layers: (p) => S(<><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>, p),
  shield: (p) => S(<><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></>, p),
  hexagon: (p) => S(<path d="M12 2 20.5 7v10L12 22 3.5 17V7L12 2Z" />, p),
  x: (p) => S(<path d="M18 6 6 18M6 6l12 12" />, p),
};
