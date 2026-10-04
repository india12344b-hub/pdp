import React, { useMemo, useState } from "react";
import { askProfile, dossierWords } from "./pal/askPdp";
import { L, LANGS, clean, pick } from "./pal/palLang";
import { domainVocab } from "./pal/palSpeech";
import { useVoiceInput, VOICE_ISSUES } from "./pal/useVoiceInput";
import * as mem from "./pal/palMemory";
import "./askPdp.css";

/*
  Ask this PDP — a recruiter asks a question about THIS professional.
  Answers come only from the profile's own documented experience and proof (see ./pal/askPdp.js). No AI, no guessing.

  Props:
    profile        { name, role, location, skills, about, introduction, stats }
    experience     [{ company, role, years, desc, highlight, tags }]
    media          uploaded proof items [{ company, category, note, type, url }]
    suggestions    experience areas to suggest, e.g. ["Distributor Management", ...]
    onOpenExperience(company)   scroll to / open that company's experience card
*/

const BADGE = {
  yes: { en: "Documented", hi: "Documented", cls: "yes", icon: "✓" },
  partial: { en: "Partly documented", hi: "Partly documented", cls: "partial", icon: "◐" },
  no: { en: "Not documented", hi: "Documented nahi", cls: "no", icon: "○" },
  info: { en: "Summary", hi: "Summary", cls: "info", icon: "i" },
};

export default function AskThisPdp({ profile, experience = [], media = [], suggestions = [], onOpenExperience }) {
  const [lang, setLang] = useState(() => mem.loadMemory().lang || "en");
  const [q, setQ] = useState("");
  const [history, setHistory] = useState([]);
  const [pending, setPending] = useState(null);

  const dossier = useMemo(() => ({
    name: profile?.name, role: profile?.role, location: profile?.location, experienceYears: profile?.stats?.experience,
    skills: profile?.skills || [], about: profile?.about, introduction: profile?.introduction, experience, media,
  }), [profile, experience, media]);

  const ready = experience.length > 0 || (profile?.skills || []).length > 0 || media.length > 0;
  const first = (profile?.name || "this professional").split(" ")[0];

  const run = (text) => {
    const question = String(text || "").trim();
    if (!question) return;
    const norm = clean(question);
    let res = null;
    try { res = askProfile(question, norm, dossier); } catch { res = null; }
    if (!res) {
      res = { verdict: "info", evidence: [], headline: L(`Ask about a skill, company or area — for example “Has ${first} handled distributor management?”`, `Skill, company ya area ke baare me poochho — jaise “Kya ${first} ne distributor management handle kiya hai?”`) };
    }
    setHistory((h) => [{ q: question, res, id: Date.now() }, ...h].slice(0, 5));
    setQ("");
    setPending(null);
  };

  const voice = useVoiceInput({
    lang,
    getVocab: () => domainVocab(dossierWords(dossier)),
    onResult: (r) => { setQ(r.text); if (r.confident) run(r.text); else setPending(r); },
  });

  const changeLang = (k) => { setLang(k); mem.saveMemory({ lang: k }); };
  const t = (en, hi) => (lang === "en" ? en : hi);

  const chips = [
    { label: L("Summary", "Summary"), q: "tell me about this candidate" },
    { label: L("Show proof", "Proof dikhao"), q: "show his proof" },
    ...suggestions.slice(0, 4).map((s) => ({ label: L(`Has ${first} worked in ${s}?`, `Kya ${first} ne ${s} me kaam kiya?`), q: `does he have ${s} experience` })),
  ];

  return (
    <section className="pdp3-card-section ask-pdp" id="ask">
      <div className="ask-head">
        <div>
          <div className="ask-kicker">ASK THIS PDP</div>
          <h2>{t(`Ask about ${first}'s work`, `${first} ke kaam ke baare me poochho`)}</h2>
          <p>{t("Answers come only from this profile's documented experience and proof. Nothing is guessed.", "Jawab sirf is profile ke documented experience aur proof se aate hain. Andaza nahi lagaya jaata.")}</p>
        </div>
        <div className="ask-lang" role="group" aria-label="Language">
          {Object.entries(LANGS).map(([k, v]) => <button key={k} type="button" className={lang === k ? "on" : ""} onClick={() => changeLang(k)}>{v.label}</button>)}
        </div>
      </div>

      {!ready ? (
        <div className="ask-empty">{t("This profile doesn't have enough documented experience yet. Once experience, skills or proof are added, you can ask questions here.", "Is profile me abhi kaafi documented experience nahi hai. Experience, skills ya proof add hone par yahan sawal pooch sakte ho.")}</div>
      ) : (
        <>
          <form className="ask-form" onSubmit={(e) => { e.preventDefault(); run(q); }}>
            <button type="button" className={`ask-mic ${voice.listening ? "live" : ""}`} onClick={() => { setPending(null); voice.toggle(); }} aria-label="Ask by voice" title={voice.supported ? t("Speak — take your time, tap again to finish", "Bolo — aaram se, khatam hone par dobara dabao") : t("Voice not supported in this browser", "Is browser me voice supported nahi")}>🎙</button>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(`e.g. Has ${first} handled distributor management?`, `jaise: Kya ${first} ne distributor management handle kiya hai?`)} />
            <button type="submit" className="ask-send" disabled={!q.trim()}>{t("Ask", "Poochho")}</button>
          </form>

          {voice.listening && <div className="ask-note live">🎙 {voice.caption || t("Listening… speak naturally, take your time", "Sun rahi hoon… aaram se boliye")}</div>}
          {!voice.listening && voice.issue && <div className="ask-note warn">{pick(VOICE_ISSUES[voice.issue], lang)}</div>}
          {!voice.listening && pending && (
            <div className="ask-note">
              {t("Did you say:", "Kya aapne ye kaha:")} <b>“{pending.text}”</b>
              <span className="ask-note-actions">
                <button type="button" onClick={() => run(pending.text)}>{t("Yes, ask", "Haan, poochho")}</button>
                {pending.alternatives?.map((a) => <button key={a} type="button" onClick={() => run(a)}>{a}</button>)}
                <button type="button" onClick={() => { setPending(null); voice.start(); }}>{t("Try again", "Dobara bolo")}</button>
              </span>
            </div>
          )}

          <div className="ask-chips">{chips.map((c) => { const label = pick(c.label, lang); return <button key={label} type="button" onClick={() => run(c.q)}>{label}</button>; })}</div>

          {history.map(({ q: question, res, id }, i) => {
            const b = BADGE[res.verdict] || BADGE.info;
            return (
              <article className="ask-answer" key={id}>
                <div className="ask-q">{question}</div>
                <div className="ask-a">
                  <span className={`ask-badge ${b.cls}`}>{b.icon} {b[lang] || b.en}</span>
                  <p>{pick(res.headline, lang)}</p>
                  {res.evidence?.length > 0 && (
                    <div className="ask-evidence">
                      {res.evidence.map((e, k) => (
                        <div className="ask-ev" key={k}>
                          {e.url && e.kind === "proof" && e.mediaType !== "video" && <img src={e.url} alt="" loading="lazy" />}
                          <div>
                            <small>{e.kind === "experience" ? t("EXPERIENCE", "EXPERIENCE") : e.kind === "proof" ? t("PROOF", "PROOF") : e.kind === "skill" ? t("SKILL", "SKILL") : t("STORY", "STORY")}{e.company ? ` · ${e.company}` : ""}</small>
                            <strong>{e.title}</strong>
                            {e.text && <span>{e.text}</span>}
                            {e.kind === "experience" && <em>{e.proofCount ? t(`${e.proofCount} proof item${e.proofCount === 1 ? "" : "s"} attached`, `${e.proofCount} proof items attached`) : t("No proof media attached yet", "Abhi proof media attach nahi")}</em>}
                            {e.company && onOpenExperience && <button type="button" onClick={() => onOpenExperience(e.company)}>{t("View experience →", "Experience dekho →")}</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {i === 0 && res.followups?.length > 0 && (
                    <div className="ask-chips small">{res.followups.map((f) => { const label = pick(f.label, lang); return <button key={label} type="button" onClick={() => run(f.q)}>{label}</button>; })}</div>
                  )}
                </div>
              </article>
            );
          })}
        </>
      )}
    </section>
  );
}
