const DB_NAME = "pdp-local-data";
const DB_VERSION = 1;
const STORES = { resume: "resume", media: "media", intro: "intro" };
const TOKEN_KEY = "pdp-profile-token-v1";

function token() {
  let value = localStorage.getItem(TOKEN_KEY);
  if (!value) { value = crypto.randomUUID(); localStorage.setItem(TOKEN_KEY, value); }
  return value;
}
function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("X-PDP-Token", token());
  return fetch(path, { ...options, headers });
}
async function apiJson(path, options) {
  const res = await api(path, options);
  if (!res.ok) throw new Error(`PDP API ${res.status}`);
  return res.json();
}
async function apiFile(path) {
  const res = await api(path);
  if (!res.ok) throw new Error(`PDP API ${res.status}`);
  const blob = await res.blob();
  const type = res.headers.get("content-type") || blob.type || "application/octet-stream";
  return new File([blob], res.headers.get("x-pdp-filename") || "pdp-file", { type });
}

function openDB() {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(new Error("IndexedDB is not available"));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => { const db = request.result; Object.values(STORES).forEach(storeName => { if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: "id" }); }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local PDP storage"));
  });
}
async function withStore(storeName, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode); const store = tx.objectStore(storeName); let request;
    try { request = action(store); } catch (error) { reject(error); return; }
    tx.oncomplete = () => resolve(request?.result); tx.onerror = () => reject(tx.error || request?.error || new Error("PDP local storage error")); tx.onabort = () => reject(tx.error || new Error("PDP local storage transaction aborted"));
  });
}

export async function saveResume(file) {
  if (!file) return null;
  try {
    const form = new FormData(); form.append("file", file);
    const remote = await apiJson("/api/resume", { method: "POST", body: form });
    const record = { ...remote, file, source: "cloudflare" };
    await withStore(STORES.resume, "readwrite", store => store.put({ id: "current", ...record }));
    return record;
  } catch {
    const record = { id: "current", name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, file, source: "local" };
    await withStore(STORES.resume, "readwrite", store => store.put(record)); return record;
  }
}
export async function getResume() {
  try { const remote = await apiJson("/api/resume"); if (!remote?.exists) return withStore(STORES.resume, "readonly", store => store.get("current")); const file = await apiFile("/api/file/resume"); return { ...remote, file, source: "cloudflare" }; } catch { return withStore(STORES.resume, "readonly", store => store.get("current")); }
}
export async function clearResume() { try { await api("/api/resume", { method: "DELETE" }); } catch {} return withStore(STORES.resume, "readwrite", store => store.delete("current")); }

export async function saveIntro(file) {
  if (!file) return null;
  try { const form = new FormData(); form.append("file", file); const remote = await apiJson("/api/intro", { method: "POST", body: form }); const record = { ...remote, file, source: "cloudflare" }; await withStore(STORES.intro, "readwrite", store => store.put({ id: "current", ...record })); return record; }
  catch { const record = { id: "current", name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, file, source: "local" }; await withStore(STORES.intro, "readwrite", store => store.put(record)); return record; }
}
export async function getIntro() {
  try { const remote = await apiJson("/api/intro"); if (!remote?.exists) return withStore(STORES.intro, "readonly", store => store.get("current")); const file = await apiFile("/api/file/intro"); return { ...remote, file, source: "cloudflare" }; } catch { return withStore(STORES.intro, "readonly", store => store.get("current")); }
}
export async function clearIntro() { try { await api("/api/intro", { method: "DELETE" }); } catch {} return withStore(STORES.intro, "readwrite", store => store.delete("current")); }

export async function saveMedia(file, metadata = {}) {
  if (!file) return null;
  try {
    const form = new FormData(); form.append("file", file); Object.entries(metadata).forEach(([k, v]) => form.append(k, v ?? ""));
    const remote = await apiJson("/api/media", { method: "POST", body: form });
    const record = { ...remote, file, source: "cloudflare" }; await withStore(STORES.media, "readwrite", store => store.put(record)); return record;
  } catch {
    const id = metadata.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`; const record = { id, name: file.name, size: file.size, mimeType: file.type, type: file.type.startsWith("video/") ? "video" : "image", category: metadata.category || "Other Professional Evidence", company: metadata.company || "", note: metadata.note || "", createdAt: Date.now(), file, source: "local" };
    await withStore(STORES.media, "readwrite", store => store.put(record)); return record;
  }
}
export async function getMedia() {
  try { const remote = await apiJson("/api/media"); return (remote || []).map(item => ({ ...item, url: item.url || `/api/file/media/${item.id}?token=${encodeURIComponent(token())}`, source: "cloudflare" })); }
  catch { const result = await withStore(STORES.media, "readonly", store => store.getAll()); return (result || []).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); }
}
export async function deleteMedia(id) { try { await api(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" }); } catch {} return withStore(STORES.media, "readwrite", store => store.delete(id)); }
export async function clearMedia() { try { await api("/api/media", { method: "DELETE" }); } catch {} return withStore(STORES.media, "readwrite", store => store.clear()); }

export async function saveProfile(profile) {
  try { return await apiJson("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) }); }
  catch { return null; }
}
export async function getProfile() {
  try { return await apiJson("/api/profile"); } catch { return null; }
}
