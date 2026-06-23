// Persistência simples em localStorage (estado do site sobrevive a F5/restart).

export function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

export function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* quota cheia / modo privado — ignora */
  }
}
