/*
  Authenticity ledger helpers: build the record, merge records onto media items, summarise, export a receipt.
  Storage itself (IndexedDB + /api/authenticity) lives in pdpStorage.js: saveAuthRecord / getAuthRecords / deleteAuthRecord.
*/
import { ENGINE } from "./authEngine";
import { DECLARATION_VERSION, FREEZE_WARNING, statementsFor, ORIGINS } from "./authDeclaration";

export const TIERS = {
  live: { label: "Captured live", hi: "Live captured", cls: "live", icon: "●", tip: "Captured with the PDP camera." },
  declared: { label: "Declared original · screened", hi: "Declared original · screened", cls: "declared", icon: "✓", tip: "Uploaded with a signed originality declaration; screening found no manipulation signals." },
  review: { label: "Under review", hi: "Review me", cls: "review", icon: "◐", tip: "Screening found something a person will look at. It doesn't count toward the PDP Score until reviewed." },
  legacy: { label: "Declared · not screened", hi: "Declared · not screened", cls: "legacy", icon: "○", tip: "Added before PDP screening existed." },
};

export function buildRecord({ id, report, declaration, mode, liveEvidence = null, kind = "evidence", expectedName = "" }) {
  const accepted = statementsFor(mode).map((s) => ({ id: s.id, text: s.en, accepted: !!declaration.accepted?.[s.id] }));
  return {
    id, kind, version: 1, createdAt: new Date().toISOString(),
    source: { mode, origin: mode === "live" ? "pdp-camera" : declaration.origin, originLabel: mode === "live" ? "Captured with PDP camera" : ORIGINS.find((o) => o.id === declaration.origin)?.en || "", claimedTakenOn: declaration.claimedTakenOn || null },
    file: { ...report.file, phash: report.phash },
    screening: { engine: ENGINE, ranAt: report.ranAt, decision: report.decision, tier: report.tier, badges: report.badges, flags: report.flags, positives: report.positives, checks: report.checks, metadata: report.metadata, limits: report.limits },
    declaration: { version: DECLARATION_VERSION, warningShown: FREEZE_WARNING.en, statements: accepted, signedName: declaration.signedName.trim(), expectedName, signedAt: new Date().toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "", userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "" },
    liveEvidence,
  };
}

/* Flat strings sent along with the file (the full record goes to the ledger). */
export const recordMeta = (report, mode) => ({
  captureMode: mode === "live" ? "live" : "upload",
  originalDeclared: true,
  authTier: report.tier,
  authDecision: report.decision,
  authHash: report.file.sha256,
  authFlags: report.flags.map((f) => f.id).join(","),
  authEngine: ENGINE.version,
});

export const tierOf = (item) => item?.authTier || item?.authenticity?.screening?.tier || null;

/* attachAuthenticity(items, records) → items with { authenticity, authTier } filled from the ledger */
export function attachAuthenticity(items = [], records = []) {
  const map = new Map(records.map((r) => [String(r.id), r]));
  return items.map((it) => {
    const rec = map.get(String(it.id));
    if (!rec) return it;
    return { ...it, authenticity: rec, authTier: rec.screening?.tier || it.authTier, captureMode: it.captureMode || (rec.source?.mode === "live" ? "live" : "upload"), originalDeclared: it.originalDeclared ?? true };
  });
}

export function displayTier(item) {
  const t = tierOf(item);
  if (t && TIERS[t]) return { key: t, ...TIERS[t] };
  if (item?.captureMode === "live") return { key: "live", ...TIERS.live };
  return { key: "legacy", ...TIERS.legacy };
}

export function summarise(items = [], intro = null) {
  const all = [...items, ...(intro ? [{ ...intro, type: "video" }] : [])];
  const s = { total: all.length, live: 0, declared: 0, review: 0, legacy: 0 };
  all.forEach((it) => { s[displayTier(it).key] += 1; });
  return s;
}

export function downloadReceipt(record) {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `pdp-authenticity-record-${String(record.id).slice(0, 12)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
