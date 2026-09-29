const DB_NAME = "pdp-local-data";
const DB_VERSION = 1;
const STORES = { resume: "resume", media: "media", intro: "intro" };

function openDB() {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(new Error("IndexedDB is not available"));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: "id" });
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local PDP storage"));
  });
}

async function withStore(storeName, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let request;
    try { request = action(store); } catch (error) { reject(error); return; }
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error || request?.error || new Error("PDP local storage error"));
    tx.onabort = () => reject(tx.error || new Error("PDP local storage transaction aborted"));
  });
}

export async function saveResume(file) {
  if (!file) return null;
  const record = { id: "current", name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, file };
  await withStore(STORES.resume, "readwrite", store => store.put(record));
  return record;
}

export async function getResume() {
  return withStore(STORES.resume, "readonly", store => store.get("current"));
}

export async function clearResume() {
  return withStore(STORES.resume, "readwrite", store => store.delete("current"));
}

export async function saveIntro(file) {
  if (!file) return null;
  const record = { id: "current", name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, file };
  await withStore(STORES.intro, "readwrite", store => store.put(record));
  return record;
}

export async function getIntro() {
  return withStore(STORES.intro, "readonly", store => store.get("current"));
}

export async function clearIntro() {
  return withStore(STORES.intro, "readwrite", store => store.delete("current"));
}

export async function saveMedia(file, metadata = {}) {
  if (!file) return null;
  const id = metadata.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const record = {
    id,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    type: file.type.startsWith("video/") ? "video" : "image",
    category: metadata.category || "Other Professional Evidence",
    company: metadata.company || "",
    note: metadata.note || "",
    createdAt: Date.now(),
    file,
  };
  await withStore(STORES.media, "readwrite", store => store.put(record));
  return record;
}

export async function getMedia() {
  const result = await withStore(STORES.media, "readonly", store => store.getAll());
  return (result || []).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export async function deleteMedia(id) {
  return withStore(STORES.media, "readwrite", store => store.delete(id));
}

export async function clearMedia() {
  return withStore(STORES.media, "readwrite", store => store.clear());
}
