import React, { useCallback, useEffect, useRef, useState } from "react";
import palImg from "./pdp-pal.png";
import "./pdpPal.css";
import { respond, pageKey } from "./pal/palEngine";
import { welcome } from "./pal/palSources"; // importing this file also registers Pal's built-in sources
import { PAGE_SUGGESTIONS } from "./pal/palKnowledge";
import { LANGS, L, pick, clean } from "./pal/palLang";
import * as mem from "./pal/palMemory";

/*
  PDP Pal — floating, draggable, API-free assistant for the whole site.
  Mount ONCE (main.jsx): <PdpPal />. She reads the current page and PDP data herself.
  Brain: ./pal/*  (engine + sources + knowledge + memory + data adapters)
*/

const POS_KEY = "pdp-pal-pos-v1";
const VISIT_KEY = "pdp-pal-visit-counted";
const SIZE = 64;
const MARGIN = 12;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function readPos() {
  try {
    const p = JSON.parse(window.localStorage.getItem(POS_KEY) || "null");
    if (p && typeof p.x === "number" && typeof p.y === "number") return p;
  } catch {}
  return null;
}
const savePos = (p) => { try { window.localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {} };

export default function PdpPal() {
  const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const page = useRef(pageKey()).current;

  const sessionRef = useRef(null);
  if (!sessionRef.current) sessionRef.current = mem.loadSession();

  const [lang, setLang] = useState(() => mem.loadMemory().lang || "en");
  const [messages, setMessages] = useState(() => sessionRef.current.messages || []);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pos, setPos] = useState(() => {
    const w = window.innerWidth, h = window.innerHeight;
    const p = readPos() || { x: w - SIZE - 20, y: h - SIZE - 24 };
    return { x: clamp(p.x, MARGIN, w - SIZE - MARGIN), y: clamp(p.y, MARGIN, h - SIZE - MARGIN) };
  });
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(true);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);

  const recRef = useRef(null);
  const listRef = useRef(null);
  const dragRef = useRef(null);
  const bootRef = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;
  const langRef = useRef(lang);
  langRef.current = lang;

  /* ---------- session helpers ---------- */
  const patchSession = useCallback((patch) => {
    sessionRef.current = { ...sessionRef.current, ...patch };
    mem.saveSession(sessionRef.current);
  }, []);

  /* ---------- speech out ---------- */
  const speak = useCallback((text, l) => {
    if (!speakOn || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[“”✓○]/g, ""));
      u.lang = LANGS[l]?.speech || "en-IN";
      window.speechSynthesis.speak(u);
    } catch {}
  }, [speakOn]);

  /* ---------- add a Pal message (reply objects are bilingual; pick once, here) ---------- */
  const addPal = useCallback((reply, l) => {
    const text = pick(reply.text, l);
    setMessages((m) => [...m, {
      from: "pal", text,
      cards: reply.cards,
      links: (reply.links || []).map((x) => ({ url: x.url, label: pick(x.label, l) })),
      chips: (reply.chips || []).map((c) => ({ label: pick(c.label, l), send: c.send })),
    }]);
    speak(text, l);
  }, [speak]);

  /* ---------- boot: welcome / "you're now on…" + visit counter ---------- */
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const s = sessionRef.current;
    const memory = mem.loadMemory();
    const navigated = s.messages.length > 0 && s.currentPage && s.currentPage !== page;
    if (!s.messages.length || navigated) addPal(welcome({ page, session: s, memory, navigated }), langRef.current);
    patchSession({ currentPage: page });
    if (!window.sessionStorage.getItem(VISIT_KEY)) {
      try { window.sessionStorage.setItem(VISIT_KEY, "1"); } catch {}
      mem.saveMemory({ visits: (memory.visits || 0) + 1, lastVisit: Date.now() });
    }
    mem.saveMemory({ lastPage: page });
  }, [page, addPal, patchSession]);

  /* keep the chat log in the session so it survives page changes */
  useEffect(() => {
    const slim = messages.slice(-30).map((m) => ({ ...m, cards: m.cards?.map(({ id, name, role, location, experience, skills, companies, proofCount, url }) => ({ id, name, role, location, experience, skills, companies, proofCount, url })) }));
    patchSession({ messages: slim });
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, patchSession]);

  /* ---------- viewport, hint, cleanup ---------- */
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setVp({ w, h });
      setPos((p) => ({ x: clamp(p.x, MARGIN, w - SIZE - MARGIN), y: clamp(p.y, MARGIN, h - SIZE - MARGIN) }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => { const t = setTimeout(() => setHint(false), 8000); return () => clearTimeout(t); }, []);
  useEffect(() => () => { try { recRef.current?.abort(); window.speechSynthesis?.cancel(); } catch {} }, []);

  /* ---------- drag (launcher + panel header) ---------- */
  const bindDrag = (onTap) => ({
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest("[data-nodrag]")) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      dragRef.current = { sx: e.clientX, sy: e.clientY, ox: posRef.current.x, oy: posRef.current.y, moved: false };
    },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      setPos({ x: clamp(d.ox + dx, MARGIN, window.innerWidth - SIZE - MARGIN), y: clamp(d.oy + dy, MARGIN, window.innerHeight - SIZE - MARGIN) });
    },
    onPointerUp: () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (d.moved) savePos(posRef.current);
      else if (onTap) onTap();
    },
    onPointerCancel: () => { dragRef.current = null; },
  });

  /* ---------- run a reply ---------- */
  const apply = (r, l) => {
    if (!r) return;
    const nextLang = r.lang || l;
    if (r.lang) { setLang(r.lang); langRef.current = r.lang; mem.saveMemory({ lang: r.lang }); }
    if (r.actions?.some((a) => a.type === "forget")) {
      mem.forgetAll();
      sessionRef.current = { ...mem.loadSession(), currentPage: page };
      mem.saveSession(sessionRef.current);
      mem.saveMemory({ lang: nextLang });
      setMessages([]);
    }
    if (r.session) patchSession(r.session);
    addPal(r, nextLang);
    (r.actions || []).forEach((a) => {
      if (a.type === "navigate") setTimeout(() => { window.location.href = a.url; }, 700);
      if (a.type === "event") window.dispatchEvent(new CustomEvent(a.name, { detail: a.detail }));
    });
  };

  const handle = async (raw) => {
    const text = String(raw || "").trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "me", text }]);
    setInput("");
    const l = langRef.current;
    const ctx = { raw: text, norm: clean(text), page, lang: l, session: sessionRef.current, memory: mem.loadMemory() };
    apply(await respond(ctx), l);
  };

  const changeLang = (k) => {
    if (k === lang) return;
    setLang(k);
    langRef.current = k;
    mem.saveMemory({ lang: k });
    try { window.speechSynthesis?.cancel(); } catch {}
    addPal({ text: L("Switched to English.", "Ab main Hinglish me baat karungi.") }, k);
  };

  /* ---------- voice in ---------- */
  const toggleMic = () => {
    if (!SR) return addPal({ text: L("Voice input isn't available in this browser. Try Chrome or Edge, or type.", "Is browser me voice input available nahi hai. Chrome ya Edge try karo, ya type karo.") }, lang);
    if (listening) { recRef.current?.stop(); return; }
    try {
      window.speechSynthesis?.cancel();
      const rec = new SR();
      rec.lang = LANGS[lang].speech;
      rec.interimResults = true;
      rec.continuous = false;
      let finalText = "";
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t; else interim += t;
        }
        setInput(finalText || interim);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => { setListening(false); if (finalText.trim()) handle(finalText); };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch { setListening(false); }
  };

  /* ---------- layout ---------- */
  const pw = Math.min(360, vp.w - MARGIN * 2);
  const ph = Math.min(500, vp.h - 96);
  const panelLeft = clamp(pos.x + SIZE - pw, MARGIN, vp.w - pw - MARGIN);
  let panelTop = pos.y - ph - 12;
  if (panelTop < MARGIN) panelTop = clamp(pos.y + SIZE + 12, MARGIN, vp.h - ph - MARGIN);

  const quick = PAGE_SUGGESTIONS[page] || PAGE_SUGGESTIONS.home;
  const t = (en, hi) => (lang === "en" ? en : hi);

  return (
    <>
      {open && (
        <section className="pal-panel" style={{ left: panelLeft, top: panelTop, width: pw, height: ph }} role="dialog" aria-label="PDP Pal assistant">
          <header className="pal-head" {...bindDrag(null)}>
            <img src={palImg} alt="" />
            <div className="pal-title">
              <strong>PDP Pal</strong>
              <small>{t("Drag to move", "Drag karke hilao")}</small>
            </div>
            <div className="pal-head-actions">
              <div className="pal-lang" data-nodrag role="group" aria-label="Language">
                {Object.entries(LANGS).map(([k, v]) => (
                  <button key={k} data-nodrag type="button" className={lang === k ? "on" : ""} onClick={() => changeLang(k)}>{v.label}</button>
                ))}
              </div>
              <button data-nodrag type="button" className={speakOn ? "on" : ""} onClick={() => { setSpeakOn((s) => !s); try { window.speechSynthesis?.cancel(); } catch {} }} title={t("Pal replies aloud", "Pal bol ke jawab de")}>{speakOn ? "🔊" : "🔈"}</button>
              <button data-nodrag type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
          </header>

          <div className="pal-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`pal-msg ${m.from}`}>
                <p>{m.text}</p>
                {m.cards?.map((c) => (
                  <a key={c.id || c.name} className="pal-card" href={c.url || "/pdp/me"} onClick={() => patchSession({ selectedCandidate: c })}>
                    <b>{c.name}</b>
                    <span>{c.role}{c.location ? ` · ${c.location}` : ""}</span>
                    <em>{c.proofCount || 0} {t("proof items · View PDP →", "proof items · PDP dekho →")}</em>
                  </a>
                ))}
                {m.links?.map((x) => <a key={x.url + x.label} className="pal-link" href={x.url}>{x.label} →</a>)}
                {m.chips?.length > 0 && i === messages.length - 1 && (
                  <div className="pal-inline-chips">{m.chips.map((c) => <button key={c.label} type="button" onClick={() => handle(c.send)}>{c.label}</button>)}</div>
                )}
              </div>
            ))}
            {listening && <div className="pal-msg pal"><p>🎙 {t("Listening…", "Sun rahi hoon…")}</p></div>}
          </div>

          <div className="pal-quick">
            {quick.map((q) => { const label = pick(q.label, lang); return <button key={label} type="button" onClick={() => handle(q.send)}>{label}</button>; })}
          </div>

          <form className="pal-input" onSubmit={(e) => { e.preventDefault(); handle(input); }}>
            <button type="button" className={`pal-mic ${listening ? "live" : ""}`} onClick={toggleMic} aria-label="Voice input" title={SR ? t("Speak", "Bolo") : t("Voice not supported in this browser", "Is browser me voice supported nahi")}>🎙</button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type or speak…", "Type karo ya bolo…")} />
            <button type="submit" className="pal-send" disabled={!input.trim()} aria-label="Send">→</button>
          </form>
        </section>
      )}

      <div className="pal-launcher" style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE }} {...bindDrag(() => { setOpen((o) => !o); setHint(false); })} role="button" tabIndex={0} aria-label="Open PDP Pal" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); setHint(false); } }}>
        <img src={palImg} alt="PDP Pal" draggable="false" />
        {hint && !open && <span className="pal-hint">{t("Need help? Ask Pal", "Madad chahiye? Pal se poochho")}</span>}
      </div>
    </>
  );
}
