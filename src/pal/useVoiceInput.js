import { useCallback, useEffect, useRef, useState } from "react";
import { LANGS, L } from "./palLang";
import { repairTranscript, bestAlt, domainVocab } from "./palSpeech";

/*
  useVoiceInput — speech input built for real-world speaking.
  - Keeps listening through pauses; finishes after `silenceMs` of quiet (so long sentences are not cut off).
  - Restarts itself if the browser ends the session early (common on Android / after short pauses).
  - Asks the browser for 3 alternative hearings per phrase and picks the one that is confident AND sounds like PDP.
  - Repairs fast / unclear speech (fillers, stutters, spoken letters and numbers, near-miss spellings).
  - Reports confidence, so the UI can ask "Did you say…?" instead of acting on a bad guess.
  - Explains failures (no speech, mic blocked, mic busy, offline) instead of failing silently.

  onResult({ text, raw, confidence, confident, alternatives })
*/

export const VOICE_ISSUES = {
  "no-speech": L("I didn't catch anything. Move closer to the mic or to a quieter spot, then tap the mic again.", "Kuch sunai nahi diya. Mic ke paas aao ya shaant jagah par jao, phir mic dobara dabao."),
  "mic-blocked": L("Microphone permission is blocked. Allow the mic in your browser's site settings, or type instead.", "Mic ki permission blocked hai. Browser ki site settings me mic allow karo, ya type karo."),
  "mic-busy": L("I can't reach the microphone — another app may be using it.", "Mic tak nahi pahunch pa rahi — shayad koi aur app use kar raha hai."),
  network: L("Voice recognition needs an internet connection right now. You can type instead.", "Voice recognition ke liye abhi internet chahiye. Aap type kar sakte ho."),
  unsupported: L("Voice input isn't available in this browser. Try Chrome or Edge, or type.", "Is browser me voice input available nahi hai. Chrome ya Edge try karo, ya type karo."),
};

export function useVoiceInput({ lang, getVocab, onResult, silenceMs = 1800, maxMs = 60000 }) {
  const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState("");
  const [issue, setIssue] = useState("");

  const st = useRef({});
  const recRef = useRef(null);
  const langRef = useRef(lang); langRef.current = lang;
  const vocabRef = useRef(getVocab); vocabRef.current = getVocab;
  const cbRef = useRef(onResult); cbRef.current = onResult;

  const clearTimers = () => { const s = st.current; clearTimeout(s.silence); clearTimeout(s.max); clearTimeout(s.first); clearTimeout(s.fallback); };

  const finalize = useCallback(() => {
    const s = st.current;
    if (s.done) return;
    s.done = true;
    clearTimers();
    setListening(false);
    setCaption("");
    const segs = s.segments || [];
    s.segments = [];
    if (!segs.length) { if (!s.fatal) setIssue("no-speech"); return; }

    const vocab = vocabRef.current?.() || domainVocab();
    const chosen = segs.map((alts) => bestAlt(alts, vocab));
    const join = (arr) => repairTranscript(arr.map((c) => c.transcript.trim()).join(" "), vocab);
    const text = join(chosen);
    if (!text) { setIssue("no-speech"); return; }

    const confs = chosen.map((c) => c.confidence).filter((c) => c > 0);
    const confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null; // null = browser gave no score

    // alternatives: swap the least confident phrase for its other hearings
    const alternatives = [];
    const weakest = chosen.reduce((k, c, i, arr) => (segs[i].length > 1 && (k < 0 || c.confidence < arr[k].confidence) ? i : k), -1);
    if (weakest >= 0) {
      for (const a of segs[weakest]) {
        if (a.transcript === chosen[weakest].transcript) continue;
        const variant = join(chosen.map((c, i) => (i === weakest ? a : c)));
        if (variant && variant !== text && !alternatives.includes(variant)) alternatives.push(variant);
        if (alternatives.length >= 2) break;
      }
    }
    cbRef.current?.({ text, raw: chosen.map((c) => c.transcript).join(" "), confidence, confident: confidence === null || confidence >= 0.7, alternatives });
  }, []);

  const begin = useCallback(() => {
    const s = st.current;
    const rec = new SR();
    s.sessionId = (s.sessionId || 0) + 1;
    const sid = s.sessionId;
    rec.lang = LANGS[langRef.current]?.speech || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      s.heard = true;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const key = `${sid}:${i}`;
          if (s.seen.has(key)) continue;
          s.seen.add(key);
          const alts = [];
          for (let j = 0; j < r.length; j++) alts.push({ transcript: r[j].transcript, confidence: r[j].confidence || 0 });
          s.segments.push(alts);
        } else interim += r[0].transcript;
      }
      setCaption((s.segments.map((a) => a[0].transcript).join(" ") + " " + interim).trim());
      clearTimeout(s.silence);
      s.silence = setTimeout(() => stop(), silenceMs);
    };
    rec.onerror = (e) => {
      const err = e.error;
      if (err === "aborted") return;
      if (err === "no-speech") return; // handled by onend / finalize
      s.fatal = true;
      setIssue(err === "not-allowed" || err === "service-not-allowed" ? "mic-blocked" : err === "audio-capture" ? "mic-busy" : err === "network" ? "network" : "no-speech");
    };
    rec.onend = () => {
      if (sid !== s.sessionId) return;
      if (s.stopped || s.fatal) { finalize(); return; }
      if (Date.now() - s.startedAt < maxMs && s.restarts < 4) { s.restarts += 1; try { begin(); } catch { finalize(); } } else finalize();
    };
    recRef.current = rec;
    rec.start();
  }, [SR, finalize, maxMs, silenceMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    const s = st.current;
    s.stopped = true;
    clearTimeout(s.silence);
    try { recRef.current?.stop(); } catch { finalize(); return; }
    clearTimeout(s.fallback);
    s.fallback = setTimeout(finalize, 1500); // safety net if the browser never fires onend
  }, [finalize]);

  const start = useCallback(() => {
    if (!SR) { setIssue("unsupported"); return; }
    try { window.speechSynthesis?.cancel(); } catch {}
    setIssue("");
    setCaption("");
    const s = st.current;
    Object.assign(s, { segments: [], seen: new Set(), stopped: false, fatal: false, done: false, heard: false, restarts: 0, startedAt: Date.now() });
    try {
      begin();
      s.max = setTimeout(() => stop(), maxMs);
      s.first = setTimeout(() => { if (!st.current.heard) stop(); }, 7000); // nothing heard for 7s → give up politely
    } catch { setListening(false); setIssue("mic-busy"); }
  }, [SR, begin, stop, maxMs]);

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  useEffect(() => () => { clearTimers(); st.current.stopped = true; try { recRef.current?.abort(); } catch {} }, []);

  return { supported: !!SR, listening, caption, issue, clearIssue: () => setIssue(""), start, stop, toggle };
}
