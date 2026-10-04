const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", ...extra } });
const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS", "access-control-allow-headers": "Content-Type,X-PDP-Token" };

async function hash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function tokenFrom(request) { return request.headers.get("X-PDP-Token") || new URL(request.url).searchParams.get("token") || ""; }

async function profileId(env, request) {
  const raw = tokenFrom(request); if (!raw) return null;
  const tokenHash = await hash(raw);
  const row = await env.PDP_DB.prepare("SELECT id FROM profiles WHERE token_hash = ?").bind(tokenHash).first();
  return row?.id || null;
}

async function ensureProfile(env, request) {
  const raw = tokenFrom(request); if (!raw) throw new Error("Missing PDP token");
  const tokenHash = await hash(raw);
  const found = await env.PDP_DB.prepare("SELECT id FROM profiles WHERE token_hash = ?").bind(tokenHash).first();
  if (found?.id) return found.id;
  const id = crypto.randomUUID();
  await env.PDP_DB.prepare("INSERT INTO profiles (id, token_hash, profile_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").bind(id, tokenHash, "{}", Date.now(), Date.now()).run();
  return id;
}

function key(profileId, kind, id = "current") { return `profiles/${profileId}/${kind}/${id}`; }
async function putFile(env, objectKey, file) { await env.PDP_MEDIA.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } }); }

// --- PUBLIC PROFILE LOOKUP (No Token Needed for Recruiters) ---
async function handlePublicProfile(env, pdpId) {
  // Query by pdp_id OR fallback to profile id
  let row = await env.PDP_DB.prepare("SELECT id, profile_json FROM profiles WHERE pdp_id = ? OR id = ?").bind(pdpId, pdpId).first();
  
  if (!row) {
    // If not found in pdp_id column directly, search inside JSON payload for custom customUrl / pdpId field
    const allProfiles = await env.PDP_DB.prepare("SELECT id, profile_json FROM profiles").all();
    for (const p of (allProfiles.results || [])) {
      try {
        const parsed = JSON.parse(p.profile_json || "{}");
        if (parsed.pdpId === pdpId || parsed.customUrl === pdpId || parsed.username === pdpId) {
          row = p;
          break;
        }
      } catch (e) {}
    }
  }

  if (!row) return json({ error: "Profile not found" }, 404, cors);

  const internalId = row.id;
  const profileData = JSON.parse(row.profile_json || "{}");

  // Fetch Public Files and Media linked to this profile
  const files = await env.PDP_DB.prepare("SELECT kind, name, mime_type, size FROM files WHERE profile_id = ?").bind(internalId).all();
  const media = await env.PDP_DB.prepare("SELECT id, name, size, mime_type, type, category, company, note, created_at FROM media WHERE profile_id = ? ORDER BY created_at ASC").bind(internalId).all();

  const formattedMedia = (media.results || []).map(m => ({
    ...m,
    url: `/api/public/file/media/${m.id}?pdpId=${encodeURIComponent(pdpId)}`
  }));

  return json({
    profile: profileData,
    files: (files.results || []).map(f => ({
      kind: f.kind,
      name: f.name,
      size: f.size,
      type: f.mime_type,
      url: `/api/public/file/${f.kind}?pdpId=${encodeURIComponent(pdpId)}`
    })),
    media: formattedMedia
  }, 200, cors);
}

// --- PUBLIC FILE SERVING (For Public Images/Videos/Resume) ---
async function handlePublicFile(env, request, kind, pdpId, mediaId = null) {
  let row;
  if (kind === "media") {
    row = await env.PDP_DB.prepare("SELECT name, mime_type, object_key FROM media WHERE id = ?").bind(mediaId).first();
  } else {
    let pRow = await env.PDP_DB.prepare("SELECT id FROM profiles WHERE pdp_id = ? OR id = ?").bind(pdpId, pdpId).first();
    const pid = pRow?.id || pdpId;
    row = await env.PDP_DB.prepare("SELECT name, mime_type, object_key FROM files WHERE profile_id = ? AND kind = ? ORDER BY created_at DESC LIMIT 1").bind(pid, kind).first();
  }

  if (!row || !row.object_key) return new Response("Not found", { status: 404, headers: cors });

  const object = await env.PDP_MEDIA.get(row.object_key);
  if (!object) return new Response("Not found", { status: 404, headers: cors });

  const headers = new Headers(cors);
  headers.set("content-type", row.mime_type || "application/octet-stream");
  headers.set("cache-control", "public, max-age=86400"); // Cache public files
  headers.set("x-pdp-filename", row.name || "pdp-file");
  return new Response(object.body, { headers });
}

// --- PRIVATE/AUTHENTICATED HANDLERS ---
async function handleProfile(env, request) {
  if (request.method === "GET") {
    const id = await profileId(env, request); if (!id) return json({ profile: null }, 404, cors);
    const row = await env.PDP_DB.prepare("SELECT profile_json FROM profiles WHERE id = ?").bind(id).first();
    return json({ profile: JSON.parse(row?.profile_json || "{}") }, 200, cors);
  }
  const id = await ensureProfile(env, request);
  const profile = await request.json();
  
  // Extract pdp_id/customUrl if set in JSON and save to database column if column exists
  const pdpId = profile.pdpId || profile.customUrl || null;
  if (pdpId) {
    try {
      await env.PDP_DB.prepare("UPDATE profiles SET profile_json = ?, pdp_id = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(profile), pdpId, Date.now(), id).run();
    } catch(e) {
      await env.PDP_DB.prepare("UPDATE profiles SET profile_json = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(profile), Date.now(), id).run();
    }
  } else {
    await env.PDP_DB.prepare("UPDATE profiles SET profile_json = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(profile), Date.now(), id).run();
  }
  
  return json({ profile }, 200, cors);
}

async function handleSingleFile(env, request, kind) {
  const id = await ensureProfile(env, request);
  if (request.method === "GET") {
    const row = await env.PDP_DB.prepare("SELECT name, mime_type, size, object_key FROM files WHERE profile_id = ? AND kind = ? ORDER BY created_at DESC LIMIT 1").bind(id, kind).first();
    if (!row) return json({ exists: false }, 200, cors);
    return json({ exists: true, name: row.name, size: row.size, type: row.mime_type, url: `/api/file/${kind}?token=${encodeURIComponent(tokenFrom(request))}` }, 200, cors);
  }
  if (request.method === "DELETE") {
    const row = await env.PDP_DB.prepare("SELECT object_key FROM files WHERE profile_id = ? AND kind = ? ORDER BY created_at DESC LIMIT 1").bind(id, kind).first();
    if (row?.object_key) await env.PDP_MEDIA.delete(row.object_key);
    await env.PDP_DB.prepare("DELETE FROM files WHERE profile_id = ? AND kind = ?").bind(id, kind).run();
    return json({ ok: true }, 200, cors);
  }
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "file required" }, 400, cors);
  const objectKey = key(id, kind);
  await putFile(env, objectKey, file);
  await env.PDP_DB.prepare("DELETE FROM files WHERE profile_id = ? AND kind = ?").bind(id, kind).run();
  await env.PDP_DB.prepare("INSERT INTO files (id, profile_id, kind, name, mime_type, size, object_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, kind, file.name, file.type, file.size, objectKey, Date.now()).run();
  return json({ name: file.name, size: file.size, type: file.type, url: `/api/file/${kind}?token=${encodeURIComponent(tokenFrom(request))}` }, 200, cors);
}

async function handleFile(env, request, kind, mediaId = null) {
  const id = await profileId(env, request); if (!id) return new Response("Unauthorized", { status: 401, headers: cors });
  let row;
  if (kind === "media") row = await env.PDP_DB.prepare("SELECT name, mime_type, object_key FROM media WHERE id = ? AND profile_id = ?").bind(mediaId, id).first();
  else row = await env.PDP_DB.prepare("SELECT name, mime_type, object_key FROM files WHERE profile_id = ? AND kind = ? ORDER BY created_at DESC LIMIT 1").bind(id, kind).first();
  if (!row) return new Response("Not found", { status: 404, headers: cors });
  const object = await env.PDP_MEDIA.get(row.object_key); if (!object) return new Response("Not found", { status: 404, headers: cors });
  const headers = new Headers(cors); headers.set("content-type", row.mime_type || "application/octet-stream"); headers.set("cache-control", "private, max-age=3600"); headers.set("x-pdp-filename", row.name || "pdp-file");
  return new Response(object.body, { headers });
}

async function handleMedia(env, request) {
  const id = await ensureProfile(env, request);
  if (request.method === "GET") {
    const rows = await env.PDP_DB.prepare("SELECT id, name, size, mime_type, type, category, company, note, created_at FROM media WHERE profile_id = ? ORDER BY created_at ASC").bind(id).all();
    return json((rows.results || []).map(r => ({ ...r, url: `/api/file/media/${r.id}?token=${encodeURIComponent(tokenFrom(request))}` })), 200, cors);
  }
  if (request.method === "DELETE") {
    const rows = await env.PDP_DB.prepare("SELECT object_key FROM media WHERE profile_id = ?").bind(id).all();
    for (const row of rows.results || []) if (row.object_key) await env.PDP_MEDIA.delete(row.object_key);
    await env.PDP_DB.prepare("DELETE FROM media WHERE profile_id = ?").bind(id).run();
    return json({ ok: true }, 200, cors);
  }
  const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File)) return json({ error: "file required" }, 400, cors);
  const mediaId = crypto.randomUUID(); const objectKey = key(id, "media", mediaId);
  await putFile(env, objectKey, file);
  const category = String(form.get("category") || "Other Professional Evidence"); const company = String(form.get("company") || ""); const note = String(form.get("note") || ""); const type = file.type.startsWith("video/") ? "video" : "image";
  await env.PDP_DB.prepare("INSERT INTO media (id, profile_id, name, size, mime_type, type, category, company, note, object_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(mediaId, id, file.name, file.size, file.type, type, category, company, note, objectKey, Date.now()).run();
  return json({ id: mediaId, name: file.name, size: file.size, mimeType: file.type, type, category, company, note, createdAt: Date.now(), url: `/api/file/media/${mediaId}?token=${encodeURIComponent(tokenFrom(request))}` }, 200, cors);
}

async function deleteMedia(env, request, id) {
  const profile = await profileId(env, request); if (!profile) return json({ error: "unauthorized" }, 401, cors);
  const row = await env.PDP_DB.prepare("SELECT object_key FROM media WHERE id = ? AND profile_id = ?").bind(id, profile).first();
  if (row?.object_key) await env.PDP_MEDIA.delete(row.object_key);
  await env.PDP_DB.prepare("DELETE FROM media WHERE id = ? AND profile_id = ?").bind(id, profile).run();
  return json({ ok: true }, 200, cors);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url); const path = url.pathname;
    try {
      // --- PUBLIC API ROUTES ---
      if (path.startsWith("/api/public/profile/")) {
        const pdpId = path.replace("/api/public/profile/", "");
        return handlePublicProfile(env, pdpId);
      }
      if (path.startsWith("/api/public/file/media/")) {
        const mediaId = path.split("/").pop();
        const pdpId = url.searchParams.get("pdpId");
        return handlePublicFile(env, request, "media", pdpId, mediaId);
      }
      if (path.startsWith("/api/public/file/")) {
        const kind = path.replace("/api/public/file/", "");
        const pdpId = url.searchParams.get("pdpId");
        return handlePublicFile(env, request, kind, pdpId);
      }

      // --- EXISTING AUTHENTICATED ROUTES ---
      if (path === "/api/profile") return handleProfile(env, request);
      if (path === "/api/resume") return handleSingleFile(env, request, "resume");
      if (path === "/api/intro") return handleSingleFile(env, request, "intro");
      if (path === "/api/media") return handleMedia(env, request);
      if (path.startsWith("/api/media/")) return deleteMedia(env, request, path.split("/").pop());
      if (path === "/api/file/resume") return handleFile(env, request, "resume");
      if (path === "/api/file/intro") return handleFile(env, request, "intro");
      if (path.startsWith("/api/file/media/")) return handleFile(env, request, "media", path.split("/").pop());
      if (path === "/api/health") return json({ ok: true, service: "PDP" }, 200, cors);
      
      return env.ASSETS.fetch(request);
    } catch (error) { return json({ error: error?.message || "PDP server error" }, 500, cors); }
  }
};