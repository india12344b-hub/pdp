/*
  PDP Pal — memory.
  Session  (sessionStorage): what is happening in this visit — last search, results, selected candidate, chat log.
  Memory   (localStorage)  : what Pal remembers between visits on THIS device — language, recent searches, last page.
  Nothing leaves the browser. "forget me" clears everything.
  When PDP has a backend, saveMemory/loadMemory are the only two functions to point at an API.
*/

const S_KEY = "pdp-pal-session-v1";
const M_KEY = "pdp-pal-memory-v1";
const U_KEY = "pdp-pal-unanswered-v1";

export const DEFAULT_SESSION = { lastIntent: null, lastQuery: "", lastResults: [], selectedCandidate: null, currentPage: "", messages: [] };
const DEFAULT_MEMORY = { lang: "en", visits: 0, lastVisit: 0, lastPage: "", searches: [], lastOpened: null };

function read(store, key, def) {
  try { const raw = store.getItem(key); return raw ? { ...def, ...JSON.parse(raw) } : { ...def }; } catch { return { ...def }; }
}
function write(store, key, val) { try { store.setItem(key, JSON.stringify(val)); } catch {} }

export const loadSession = () => read(window.sessionStorage, S_KEY, DEFAULT_SESSION);
export const saveSession = (s) => write(window.sessionStorage, S_KEY, s);

export const loadMemory = () => read(window.localStorage, M_KEY, DEFAULT_MEMORY);
export function saveMemory(patch) {
  const next = { ...loadMemory(), ...patch };
  write(window.localStorage, M_KEY, next);
  return next;
}
export function rememberSearch(q) {
  const m = loadMemory();
  return saveMemory({ searches: [q, ...(m.searches || []).filter((x) => x !== q)].slice(0, 5) });
}

/* Questions Pal could not answer — review these to decide what to teach her next. */
export function logUnanswered(q, page) {
  try {
    const list = JSON.parse(window.localStorage.getItem(U_KEY) || "[]");
    list.unshift({ q, page, at: Date.now() });
    window.localStorage.setItem(U_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}
export function forgetAll() {
  try { window.localStorage.removeItem(M_KEY); window.localStorage.removeItem(U_KEY); window.sessionStorage.removeItem(S_KEY); } catch {}
}
