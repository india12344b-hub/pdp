/*
  PDP Pal — engine.
  Pal's brain is a list of SOURCES. Each source is { id, priority, run(ctx) } and returns a reply or null.
  The highest-priority source that returns a reply wins. To teach Pal something new, register another source:

    registerSource({ id: "jobs", priority: 55, run: async (ctx) => ctx.norm.includes("job") ? { text: "..." } : null });

  A future AI source (e.g. Cloudflare Workers AI) would be registered with a LOW priority, so it only
  answers what every PDP source could not.

  ctx = { raw, norm, page, lang, session, memory }
  reply = { text, cards?, links?, chips?, actions?, session?, lang? }
*/

const sources = [];

export function registerSource(src) {
  const i = sources.findIndex((s) => s.id === src.id);
  if (i >= 0) sources.splice(i, 1);
  sources.push(src);
  sources.sort((a, b) => b.priority - a.priority);
}

export async function respond(ctx) {
  for (const s of sources) {
    try {
      const r = await s.run(ctx);
      if (r) return { ...r, source: s.id };
    } catch { /* a broken source must never break Pal */ }
  }
  return null;
}

export function pageKey(path = window.location.pathname) {
  const p = path.replace(/\/$/, "") || "/";
  if (p === "/professionals") return "professionals";
  if (p === "/pdp" || p === "/pdp/me") return "profile";
  if (p === "/recruiters") return "recruiter";
  if (p === "/build-proof" || p === "/candidate-media") return "proof";
  if (["/upload-resume", "/resume", "/create"].includes(p)) return "resume";
  if (/^\/[a-z0-9][a-z0-9-]{2,39}$/i.test(p)) return "profile";
  return "home";
}
