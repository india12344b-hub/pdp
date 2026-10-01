import React, { useCallback, useEffect, useRef, useState } from "react";
import palImg from "./pdp-pal.png";
import "./pdpPal.css";

/*
  PDP Pal — free, API-free recruiter assistant.
  - Rule-based (keywords + synonyms), runs fully in the browser.
  - Chat + voice input (Web Speech API) + optional spoken replies.
  - Floating and draggable; position is remembered.

  Usage:
    <PdpPal
      profiles={[{ name, role, location, experience, proofCount, haystack, url }]}
      onSearch={(text) => ...}      // optional: sync the page search with what Pal understood
      onShortlist={(profile) => ...} // optional
    />
*/

const POS_KEY = "pdp-pal-pos-v1";
const SIZE = 64;
const MARGIN = 12;

const STOP = new Set([
  "i","need","want","looking","for","a","an","the","with","in","at","of","and","or","who","has","have","is","are",
  "me","find","show","give","candidate","candidates","profile","profiles","person","professional","years","year",
  "yrs","yr","experience","exp","chahiye","chaiye","mujhe","hai","ho","wala","wale","ka","ki","ke","mein","se",
  "ko","dikhao","dikha","do","karo","aur","koi","kuch","plus","min","minimum","saal","sal","to","on","from","please","pls",
]);

const SYN = {
  sales: ["sales", "business development", "revenue", "account"],
  designer: ["designer", "design", "ux", "ui"],
  design: ["design", "designer", "ux", "ui"],
  developer: ["developer", "engineer", "software"],
  engineer: ["engineer", "developer", "software"],
  marketing: ["marketing", "brand", "campaign", "growth"],
  teacher: ["teacher", "educator", "teaching", "academic"],
  fmcg: ["fmcg", "consumer goods", "fast moving"],
  ux: ["ux", "user experience", "research"],
  research: ["research", "ux", "usability"],
  leadership: ["leadership", "led", "team", "mentor"],
  distributor: ["distributor", "distribution", "channel"],
  gtm: ["gtm", "go-to-market", "go to market"],
  bangalore: ["bangalore", "bengaluru"],
  bengaluru: ["bangalore", "bengaluru"],
  mumbai: ["mumbai", "bombay"],
  gurgaon: ["gurgaon", "gurugram"],
  gurugram: ["gurgaon", "gurugram"],
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const expand = (t) => SYN[t] || [t];

function tokenize(text) {
  const words = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9/&+\- ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+\+?$/.test(w));
  return [...new Set(words)];
}

function readPos() {
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.x === "number" && typeof p.y === "number") return p;
    }
  } catch {}
  return null;
}
function savePos(p) {
  try { window.localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch {}
}

const GREETING = {
  from: "pal",
  text: "Hi! Mai PDP Pal hoon. Bolo ya likho kaisa candidate chahiye — role, skill, experience ya location. Example: “FMCG sales manager 5 saal Delhi”.",
};

export default function PdpPal({ profiles = [], onSearch, onShortlist }) {
  const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pos, setPos] = useState(() => {
    const saved = readPos();
    const w = window.innerWidth, h = window.innerHeight;
    const p = saved || { x: w - SIZE - 20, y: h - SIZE - 24 };
    return { x: clamp(p.x, MARGIN, w - SIZE - MARGIN), y: clamp(p.y, MARGIN, h - SIZE - MARGIN) };
  });
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(true);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const [lastResults, setLastResults] = useState([]);

  const recRef = useRef(null);
  const listRef = useRef(null);
  const dragRef = useRef(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  /* ---------- viewport ---------- */
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setVp({ w, h });
      setPos((p) => ({ x: clamp(p.x, MARGIN, w - SIZE - MARGIN), y: clamp(p.y, MARGIN, h - SIZE - MARGIN) }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => { try { recRef.current?.abort(); window.speechSynthesis?.cancel(); } catch {} }, []);

  /* ---------- drag (launcher + panel header) ---------- */
  const bindDrag = (onTap) => ({
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest("button[data-nodrag]")) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      dragRef.current = { sx: e.clientX, sy: e.clientY, ox: posRef.current.x, oy: posRef.current.y, moved: false };
    },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      setPos({
        x: clamp(d.ox + dx, MARGIN, window.innerWidth - SIZE - MARGIN),
        y: clamp(d.oy + dy, MARGIN, window.innerHeight - SIZE - MARGIN),
      });
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

  /* ---------- speech ---------- */
  const speak = useCallback((text) => {
    if (!speakOn || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[“”]/g, ""));
      u.lang = lang;
      window.speechSynthesis.speak(u);
    } catch {}
  }, [speakOn, lang]);

  const say = useCallback((text, cards) => {
    setMessages((m) => [...m, { from: "pal", text, cards }]);
    speak(text);
  }, [speak]);

  /* ---------- brain ---------- */
  const search = (text) => {
    const yearsMatch = text.match(/(\d+)\s*\+?\s*(?:years?|yrs?|yr|saal|sal)\b/i);
    const need = yearsMatch ? parseInt(yearsMatch[1], 10) : null;
    const tokens = tokenize(text);

    if (!profiles.length) {
      say("Abhi koi live PDP profile nahi hai. Candidate profiles banenge to mai unhe yahan search kar dunga.");
      return;
    }
    if (!tokens.length && need === null) {
      say("Thoda detail do — role, skill ya location. Example: “product designer 8 saal Bengaluru”.");
      return;
    }

    onSearch?.(text);

    let tooJunior = false;
    const results = profiles
      .map((p) => {
        const hay = (p.haystack || "").toLowerCase();
        const hits = tokens.filter((t) => expand(t).some((w) => hay.includes(w)));
        const ratio = tokens.length ? hits.length / tokens.length : 1;
        const py = parseFloat(p.experience);
        const lowExp = need !== null && !Number.isNaN(py) && py < need;
        return { p, hits, ratio, lowExp };
      })
      .filter((r) => {
        if (r.ratio < 0.5) return false;
        if (r.lowExp) { tooJunior = true; return false; }
        return true;
      })
      .sort((a, b) => b.ratio - a.ratio);

    setLastResults(results.map((r) => r.p));

    if (!results.length) {
      say(
        tooJunior
          ? `Role match hai, lekin experience ${need}+ saal se kam hai. Experience thoda kam karke try karo.`
          : "Koi match nahi mila. Keywords badal ke try karo (jaise role ya skill ka naam).",
      );
      return;
    }
    const first = results[0];
    const proof = first.p.proofCount ? ` ${first.p.proofCount} proof items attached hain.` : " Abhi proof media attach nahi hui.";
    say(
      `${results.length} profile${results.length > 1 ? "s" : ""} mile.${first.hits.length ? ` Match: ${first.hits.join(", ")}.` : ""}${proof} Sirf live PDP profiles dikha raha hoon.`,
      results.map((r) => r.p),
    );
  };

  const handle = (raw) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "me", text }]);
    setInput("");
    const q = text.toLowerCase();
    const short = q.split(/\s+/).length <= 4;

    if (/^(hi+|hello|hey|namaste|namaskar)\b/.test(q)) return say("Namaste! Kaisa candidate dhundhna hai?");
    if (/\bhelp\b|kya kar|what can|kaise use/.test(q)) {
      return say("Mai role, skill, experience aur location se live PDP profiles dhundh sakta hoon. Commands: “shortlist karo”, “proof dikhao”, “naya search”. Voice ke liye mic dabao.");
    }
    if (/shortlist|save kar|add to list/.test(q)) {
      if (!lastResults.length) return say("Pehle search karo, phir shortlist kar dunga.");
      lastResults.forEach((p) => onShortlist?.(p));
      return say(`${lastResults[0].name} ko shortlist kar diya.`);
    }
    if (short && /proof|open|view|dekh|profile dikhao/.test(q)) {
      if (!lastResults.length) return say("Pehle search karo, phir proof dikha dunga.");
      const target = lastResults[0];
      say(`${target.name} ka PDP khol raha hoon.`);
      setTimeout(() => { window.location.href = target.url || "/pdp/me"; }, 600);
      return;
    }
    if (/^(clear|reset|naya|new search)/.test(q)) {
      setLastResults([]);
      return say("Ho gaya. Naya search batao.");
    }
    search(text);
  };

  /* ---------- voice ---------- */
  const toggleMic = () => {
    if (!SR) return say("Is browser me voice input available nahi hai. Chrome ya Edge try karo, ya type karo.");
    if (listening) { recRef.current?.stop(); return; }
    try {
      window.speechSynthesis?.cancel();
      const rec = new SR();
      rec.lang = lang;
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
      rec.onend = () => {
        setListening(false);
        if (finalText.trim()) handle(finalText);
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  /* ---------- layout ---------- */
  const pw = Math.min(360, vp.w - MARGIN * 2);
  const ph = Math.min(500, vp.h - 96);
  const panelLeft = clamp(pos.x + SIZE - pw, MARGIN, vp.w - pw - MARGIN);
  let panelTop = pos.y - ph - 12;
  if (panelTop < MARGIN) panelTop = clamp(pos.y + SIZE + 12, MARGIN, vp.h - ph - MARGIN);

  const quick = ["Sales manager 5 saal", "Product designer", "Shortlist karo", "Help"];

  return (
    <>
      {open && (
        <section className="pal-panel" style={{ left: panelLeft, top: panelTop, width: pw, height: ph }} role="dialog" aria-label="PDP Pal assistant">
          <header className="pal-head" {...bindDrag(null)}>
            <img src={palImg} alt="" />
            <div>
              <strong>PDP Pal</strong>
              <small>Recruiter assistant · drag to move</small>
            </div>
            <div className="pal-head-actions">
              <button data-nodrag type="button" onClick={() => setLang((l) => (l === "en-IN" ? "hi-IN" : "en-IN"))} title="Voice language">{lang === "en-IN" ? "EN" : "हि"}</button>
              <button data-nodrag type="button" className={speakOn ? "on" : ""} onClick={() => { setSpeakOn((s) => !s); try { window.speechSynthesis?.cancel(); } catch {} }} title="Pal replies aloud">{speakOn ? "🔊" : "🔈"}</button>
              <button data-nodrag type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
          </header>

          <div className="pal-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`pal-msg ${m.from}`}>
                <p>{m.text}</p>
                {m.cards?.map((c) => (
                  <a key={c.name} className="pal-card" href={c.url || "/pdp/me"}>
                    <b>{c.name}</b>
                    <span>{c.role}{c.location ? ` · ${c.location}` : ""}</span>
                    <em>{c.proofCount || 0} proof items · View PDP →</em>
                  </a>
                ))}
              </div>
            ))}
            {listening && <div className="pal-msg pal"><p>🎙 Sun raha hoon…</p></div>}
          </div>

          <div className="pal-quick">
            {quick.map((q) => <button key={q} type="button" onClick={() => handle(q)}>{q}</button>)}
          </div>

          <form className="pal-input" onSubmit={(e) => { e.preventDefault(); handle(input); }}>
            <button type="button" className={`pal-mic ${listening ? "live" : ""}`} onClick={toggleMic} aria-label="Voice input" title={SR ? "Speak" : "Voice not supported in this browser"}>🎙</button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or speak your requirement…" />
            <button type="submit" className="pal-send" disabled={!input.trim()} aria-label="Send">→</button>
          </form>
        </section>
      )}

      <div className="pal-launcher" style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE }} {...bindDrag(() => { setOpen((o) => !o); setHint(false); })} role="button" tabIndex={0} aria-label="Open PDP Pal" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); setHint(false); } }}>
        <img src={palImg} alt="PDP Pal" draggable="false" />
        {hint && !open && <span className="pal-hint">Need help finding talent?</span>}
      </div>
    </>
  );
}
