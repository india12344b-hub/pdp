import React from "react";
import { displayTier } from "./authLedger";
import "./authStyles.css";

/* Small trust badge for a media item: Captured live / Declared original · screened / Under review / Declared · not screened */
export default function AuthBadge({ item, compact = false, onClick }) {
  const t = displayTier(item);
  const El = onClick ? "button" : "span";
  return <El type={onClick ? "button" : undefined} onClick={onClick} className={`mae-badge ${t.cls}${compact ? " compact" : ""}`} title={t.tip}><i>{t.icon}</i>{compact ? t.label.split(" · ")[0] : t.label}</El>;
}
