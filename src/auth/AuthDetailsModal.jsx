import React from "react";
import AuthBadge from "./AuthBadge";
import { displayTier, downloadReceipt } from "./authLedger";
import { loadMemory } from "../pal/palMemory";
import "./authStyles.css";

/* What PDP knows about one piece of proof: how it was added, what screening found, what was declared. */
export default function AuthDetailsModal({ item, onClose }) {
  const lang = loadMemory().lang || "en";
  const t = (en, hi) => (lang === "en" ? en : hi);
  const rec = item?.authenticity;
  const tier = displayTier(item);
  return (
    <div className="mae-overlay" role="dialog" aria-modal="true" aria-label="Authenticity record" onClick={onClose}>
      <div className="mae-card mae-details" onClick={(e) => e.stopPropagation()}>
        <div className="mae-head"><div><span className="mae-kicker">{t("AUTHENTICITY RECORD", "AUTHENTICITY RECORD")}</span><h3>{item?.note || item?.category || t("Proof item", "Proof item")}</h3></div><button type="button" className="mae-x" onClick={onClose} aria-label="Close">×</button></div>
        <p><AuthBadge item={item} /></p>
        <p className="mae-tier-tip">{tier.tip}</p>
        {!rec && <div className="mae-flag info"><b>{t("No screening record", "Screening record nahi hai")}</b><span>{t("This item was added before PDP screening existed, or on another device. It counts at a reduced weight in the PDP Score.", "Ye item PDP screening se pehle ya kisi aur device se add hua tha. PDP Score me iska weight kam hai.")}</span></div>}
        {rec && (
          <>
            <dl className="mae-dl">
              <div><dt>{t("Added", "Add hua")}</dt><dd>{new Date(rec.createdAt).toLocaleString()}</dd></div>
              <div><dt>{t("Source", "Source")}</dt><dd>{rec.source?.originLabel}{rec.source?.claimedTakenOn ? ` · ${t("taken", "li gayi")} ${rec.source.claimedTakenOn}` : ""}</dd></div>
              <div><dt>{t("Signed by", "Sign kiya")}</dt><dd>{rec.declaration?.signedName} · {new Date(rec.declaration?.signedAt).toLocaleString()}</dd></div>
              <div><dt>{t("Declaration", "Declaration")}</dt><dd>{rec.declaration?.version} · {rec.declaration?.statements?.filter((s) => s.accepted).length}/{rec.declaration?.statements?.length} {t("statements accepted", "statements accept")}</dd></div>
              <div><dt>{t("File fingerprint", "File fingerprint")}</dt><dd className="mono">{String(rec.file?.sha256 || "").slice(0, 24)}…</dd></div>
              <div><dt>{t("Screened by", "Screening")}</dt><dd>{rec.screening?.engine?.name} v{rec.screening?.engine?.version}</dd></div>
            </dl>
            <div className="mae-checks">
              {rec.screening?.checks?.map((c) => <div key={c.id} className={`mae-check ${c.status}`}><i>{{ pass: "✓", review: "◐", block: "✕", info: "i" }[c.status] || "i"}</i><div><b>{c.label}</b><span>{c.detail}</span></div></div>)}
              {rec.screening?.flags?.filter((f) => f.severity !== "info").map((f) => <div key={f.id} className={`mae-flag ${f.severity}`}><b>{f.title}</b><span>{f.detail}</span></div>)}
            </div>
            <p className="mae-limits">{rec.screening?.limits}</p>
            <div className="mae-actions"><button type="button" className="mae-ghost" onClick={() => downloadReceipt(rec)}>⬇ {t("Download record (JSON)", "Record download karo (JSON)")}</button><button type="button" className="mae-primary" onClick={onClose}>{t("Close", "Band karo")}</button></div>
          </>
        )}
        {!rec && <div className="mae-actions"><button type="button" className="mae-primary" onClick={onClose}>{t("Close", "Band karo")}</button></div>}
      </div>
    </div>
  );
}
