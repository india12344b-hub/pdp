import React, { useEffect, useMemo, useRef, useState } from "react";
import { screenMedia, headline } from "./authEngine";
import { statementsFor, emptyDeclaration, isDeclarationComplete, ORIGINS, DECLARATION_VERSION } from "./authDeclaration";
import { loadMemory } from "../pal/palMemory";
import "./authStyles.css";

/*
  Authenticity review — runs the Media Authenticity Engine on each selected / captured file, shows the result in
  plain language, and collects the signed originality declaration BEFORE anything is added to the profile.

  props
    items        [{ file, mode: "upload"|"live", liveEvidence?, kind?: "evidence"|"intro" }]
    existing     ledger records already on the profile (duplicate checks)
    expectedName profile name — the typed signature should match it
    onConfirm(payload)   async; payload = { file, mode, kind, liveEvidence, report, declaration }
    onUseCamera()        optional: offered when an upload is blocked
    onClose()
*/
const ICON = { pass: "✓", review: "◐", block: "✕", info: "i" };

export default function AuthReviewModal({ items, existing = [], expectedName = "", onConfirm, onUseCamera, onClose }) {
  const lang = loadMemory().lang || "en";
  const t = (en, hi) => (lang === "en" ? en : hi);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("screening"); // screening | result
  const [progress, setProgress] = useState({ label: "", pct: 0 });
  const [report, setReport] = useState(null);
  const [decl, setDecl] = useState(emptyDeclaration());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [showTech, setShowTech] = useState(false);
  const seen = useRef(existing.slice());

  const item = items[idx];
  const mode = item?.mode === "live" ? "live" : "upload";
  const previewUrl = useMemo(() => (item ? URL.createObjectURL(item.file) : ""), [item]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(() => {
    if (!item) return;
    let alive = true;
    setPhase("screening"); setReport(null); setErr(""); setShowTech(false);
    setProgress({ label: t("Starting", "Shuru ho raha hai"), pct: 3 });
    setDecl((d) => ({ ...d, claimedTakenOn: "", origin: "own" }));
    screenMedia(item.file, {
      mode, existing: seen.current, liveEvidence: item.liveEvidence || null, claimedTakenOn: null,
      onProgress: (label, pct) => alive && setProgress({ label, pct }),
    }).then((r) => { if (alive) { setReport(r); setPhase("result"); } })
      .catch(() => { if (alive) { setErr(t("Screening could not run on this file.", "Is file par screening nahi chal payi.")); setPhase("result"); } });
    return () => { alive = false; };
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // the "when was this taken" date can change the result → re-screen only that rule cheaply
  const claimed = decl.claimedTakenOn;
  const dateFlag = useMemo(() => {
    const taken = report?.metadata?.takenAt;
    if (mode !== "upload" || !claimed || !taken) return null;
    const diff = Math.abs(new Date(claimed) - new Date(taken)) / 86400000;
    return diff > 45 ? t(`You said ${claimed}; the file says ${String(taken).slice(0, 10)}. A person will take a look.`, `Aapne ${claimed} bataya; file me ${String(taken).slice(0, 10)} hai. Ek insaan dekhega.`) : null;
  }, [claimed, report, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const finalReport = useMemo(() => {
    if (!report) return null;
    if (!dateFlag) return report;
    const flags = [...report.flags.filter((f) => f.id !== "date-mismatch"), { id: "date-mismatch", severity: "review", title: "Date you gave differs from the file", detail: dateFlag }];
    return { ...report, flags, decision: report.decision === "block" ? "block" : "review", tier: report.decision === "block" ? report.tier : "review" };
  }, [report, dateFlag]);

  const stmts = statementsFor(mode);
  const complete = isDeclarationComplete(decl, expectedName, mode);
  const head = finalReport ? headline(finalReport) : null;
  const blocked = finalReport?.decision === "block";
  const last = idx >= items.length - 1;

  const next = () => { if (last) onClose(); else setIdx((i) => i + 1); };
  const confirm = async () => {
    if (!finalReport || !complete || saving) return;
    setSaving(true); setErr("");
    try {
      await onConfirm({ file: item.file, mode, kind: item.kind || "evidence", liveEvidence: item.liveEvidence || null, report: finalReport, declaration: { ...decl } });
      seen.current = [...seen.current, { file: { sha256: finalReport.file.sha256, phash: finalReport.phash, name: item.file.name } }];
      next();
    } catch { setErr(t("Could not save this item. Please try again.", "Ye item save nahi ho paya. Dobara try karo.")); }
    setSaving(false);
  };

  if (!item) return null;
  const toggle = (id) => setDecl((d) => ({ ...d, accepted: { ...d.accepted, [id]: !d.accepted[id] } }));

  return (
    <div className="mae-overlay" role="dialog" aria-modal="true" aria-label="Authenticity review">
      <div className="mae-card mae-review">
        <div className="mae-head">
          <div>
            <span className="mae-kicker">{t("AUTHENTICITY CHECK", "AUTHENTICITY CHECK")}{items.length > 1 ? ` · ${idx + 1}/${items.length}` : ""}</span>
            <h3>{mode === "live" ? t("Review your live capture", "Apna live capture review karo") : t("Review this upload", "Ye upload review karo")}</h3>
          </div>
          <button type="button" className="mae-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="mae-body">
          <div className="mae-media">
            {item.file.type.startsWith("video/") ? <video src={previewUrl} controls muted playsInline /> : <img src={previewUrl} alt="" />}
            <small>{item.file.name} · {(item.file.size / 1048576).toFixed(1)} MB</small>
          </div>

          <div className="mae-side">
            {phase === "screening" && (
              <div className="mae-progress">
                <div className="mae-bar"><i style={{ width: `${progress.pct}%` }} /></div>
                <strong>🔍 {t("Screening for AI and manipulation…", "AI aur manipulation ke liye screening ho rahi hai…")}</strong>
                <span>{progress.label}</span>
                <small>{t("Everything is checked inside your browser — the file isn't sent anywhere for screening.", "Sab kuch aapke browser me hi check hota hai — screening ke liye file kahin nahi bheji jaati.")}</small>
              </div>
            )}

            {phase === "result" && finalReport && (
              <>
                <div className={`mae-verdict ${head.tone}`}>
                  <i>{head.tone === "pass" ? "✓" : head.tone === "review" ? "◐" : "✕"}</i>
                  <div><strong>{lang === "en" ? head.en : head.hi}</strong>
                    {finalReport.decision === "accept" && <span>{mode === "live" ? t("It will be saved as “Captured live”.", "Ye “Captured live” ki tarah save hoga.") : t("It will be saved as “Declared original · screened”.", "Ye “Declared original · screened” ki tarah save hoga.")}</span>}
                    {finalReport.decision === "review" && <span>{t("It will be saved as “Under review” and won't count toward your PDP Score until a person has looked at it.", "Ye “Under review” ki tarah save hoga aur insaan ke dekhne tak PDP Score me nahi judega.")}</span>}
                    {blocked && <span>{t("Nothing was saved.", "Kuch save nahi hua.")}</span>}
                  </div>
                </div>

                {finalReport.flags.filter((f) => f.severity !== "info").map((f) => (
                  <div key={f.id} className={`mae-flag ${f.severity}`}><b>{f.title}</b><span>{f.detail}</span></div>
                ))}
                {finalReport.positives.length > 0 && <ul className="mae-positives">{finalReport.positives.map((p) => <li key={p}>✓ {p}</li>)}</ul>}

                <button type="button" className="mae-link" onClick={() => setShowTech((v) => !v)}>{showTech ? t("Hide checks", "Checks chhupao") : t("See all checks", "Saare checks dekho")}</button>
                {showTech && (
                  <div className="mae-checks">
                    {finalReport.checks.map((c) => <div key={c.id} className={`mae-check ${c.status}`}><i>{ICON[c.status] || "i"}</i><div><b>{c.label}</b><span>{c.detail}</span></div></div>)}
                    {finalReport.flags.filter((f) => f.severity === "info").map((f) => <div key={f.id} className="mae-check info"><i>i</i><div><b>{f.title}</b><span>{f.detail}</span></div></div>)}
                    <p className="mae-limits">{finalReport.limits}</p>
                  </div>
                )}

                {blocked && (
                  <div className="mae-actions">
                    {mode === "upload" && onUseCamera && <button type="button" className="mae-primary" onClick={() => { onClose(); onUseCamera(); }}>📷 {t("Capture it live instead", "Iski jagah live capture karo")}</button>}
                    <button type="button" className="mae-ghost" onClick={next}>{last ? t("Close", "Band karo") : t("Skip this file", "Ye file chhodo")}</button>
                  </div>
                )}

                {!blocked && (
                  <div className="mae-declare">
                    <h4>✅ {t("Authenticity declaration", "Authenticity declaration")}</h4>
                    {mode === "upload" && (
                      <div className="mae-fields">
                        <label>{t("Where did this file come from?", "Ye file kahan se aayi?")}
                          <select value={decl.origin} onChange={(e) => setDecl((d) => ({ ...d, origin: e.target.value }))}>{ORIGINS.map((o) => <option key={o.id} value={o.id}>{lang === "en" ? o.en : o.hi}</option>)}</select></label>
                        <label>{t("When was it taken? (optional)", "Ye kab li gayi? (optional)")}
                          <input type="date" value={decl.claimedTakenOn} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDecl((d) => ({ ...d, claimedTakenOn: e.target.value }))} /></label>
                      </div>
                    )}
                    {stmts.map((s) => <label key={s.id} className="mae-check-row"><input type="checkbox" checked={!!decl.accepted[s.id]} onChange={() => toggle(s.id)} /><span>{lang === "en" ? s.en : s.hi}</span></label>)}
                    <label className="mae-sign">{t("Type your full name to sign", "Sign karne ke liye apna poora naam likho")}
                      <input value={decl.signedName} onChange={(e) => setDecl((d) => ({ ...d, signedName: e.target.value }))} placeholder={expectedName && !/^your professional profile$/i.test(expectedName) ? expectedName : t("Full name", "Poora naam")} autoComplete="name" /></label>
                    {decl.signedName.trim().length >= 3 && !complete && stmts.every((s) => decl.accepted[s.id]) && <small className="mae-warn">{t("The name should match your profile name.", "Naam aapke profile ke naam se milna chahiye.")}</small>}
                    <small className="mae-record-note">{t(`PDP saves this as a signed record (declaration ${DECLARATION_VERSION}, date, time and screening result) that you can download later.`, `PDP ise signed record ki tarah save karta hai (declaration ${DECLARATION_VERSION}, tareekh, samay aur screening result) jo aap baad me download kar sakte ho.`)}</small>
                    {err && <div className="mae-error small">{err}</div>}
                    <div className="mae-actions">
                      <button type="button" className="mae-ghost" onClick={next}>{last ? t("Cancel", "Cancel") : t("Skip this file", "Ye file chhodo")}</button>
                      <button type="button" className="mae-primary" disabled={!complete || saving} onClick={confirm}>{saving ? t("Saving…", "Save ho raha hai…") : finalReport.decision === "review" ? t("Add, send for review", "Add karo, review ke liye bhejo") : t("Sign & add to my proof", "Sign karo aur proof me jodo")}</button>
                    </div>
                  </div>
                )}
                {phase === "result" && err && blocked && <div className="mae-error small">{err}</div>}
              </>
            )}
            {phase === "result" && !finalReport && err && <div className="mae-error">{err}<div className="mae-actions"><button type="button" className="mae-ghost" onClick={next}>{t("Skip", "Chhodo")}</button></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
