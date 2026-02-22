// Lightweight in-app event logger (max 100 entries, localStorage-backed)
const MAX_ENTRIES = 100;
const KEY = 'alchemize_app_log';

function getLog() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function saveLog(entries) {
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch {}
}

export function logEvent(type, screen, action, status, extra = {}) {
  const entries = getLog();
  entries.unshift({
    ts: new Date().toISOString(),
    type,
    screen,
    action,
    status,
    ...extra
  });
  saveLog(entries.slice(0, MAX_ENTRIES));
}

export function getEvents() {
  return getLog();
}

export function clearEvents() {
  saveLog([]);
}

export function copyReport() {
  const lines = getLog().map(e =>
    `[${e.ts}] ${e.type} | ${e.screen} | ${e.action} | ${e.status}${e.error ? ' | ERR: ' + e.error : ''}`
  );
  const text = lines.join('\n') || '(no events)';
  navigator.clipboard?.writeText(text).catch(() => {});
  return text;
}