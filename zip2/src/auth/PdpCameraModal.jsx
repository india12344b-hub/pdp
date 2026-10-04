import React, { useEffect, useRef, useState } from "react";
import { toGray, motionScore } from "./authForensics";
import { loadMemory } from "../pal/palMemory";
import "./authStyles.css";

/*
  PDP camera — live capture only (no gallery). While the camera runs it keeps a tiny "live evidence" log:
  which camera, resolution, whether the scene was really changing, session id and timestamps. That log travels with the
  photo/video into the Media Authenticity Engine.
  NOTE: a browser cannot prove a camera is genuine by itself. For tamper-proof capture, the server must issue a nonce
  and sign the result (see WORKER_AUTHENTICITY_SPEC.md).
*/
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export default function PdpCameraModal({ mode = "photo", maxSeconds = 20, title, onCapture, onClose }) {
  const lang = loadMemory().lang || "en";
  const t = (en, hi) => (lang === "en" ? en : hi);
  const videoRef = useRef(null), canvasRef = useRef(null), streamRef = useRef(null), recRef = useRef(null), chunksRef = useRef([]);
  const probeRef = useRef({ samples: [], timer: null }), stopTimer = useRef(null), tick = useRef(null);
  const session = useRef({ id: uuid(), startedAt: Date.now() });
  const [facing, setFacing] = useState("user");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const stopStream = () => {
    clearInterval(probeRef.current.timer); clearInterval(tick.current); clearTimeout(stopTimer.current);
    streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      stopStream(); setReady(false); setError("");
      if (!navigator.mediaDevices?.getUserMedia) { setError(t("This browser does not support camera capture.", "Is browser me camera capture supported nahi hai.")); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: mode === "video" });
        if (cancelled) { stream.getTracks().forEach((tr) => tr.stop()); return; }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0], s = track?.getSettings?.() || {};
        session.current = { ...session.current, label: track?.label || "", settings: { width: s.width, height: s.height, frameRate: s.frameRate, facingMode: s.facingMode || facing } };
        requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); setReady(true); } });
        // liveness probe: tiny grayscale snapshots every 350 ms → is the scene actually changing?
        const c = document.createElement("canvas"); c.width = 32; c.height = 32;
        probeRef.current = { samples: [], timer: setInterval(() => {
          const v = videoRef.current; if (!v || !v.videoWidth) return;
          const ctx = c.getContext("2d", { willReadFrequently: true }); ctx.drawImage(v, 0, 0, 32, 32);
          const d = ctx.getImageData(0, 0, 32, 32);
          probeRef.current.samples = [...probeRef.current.samples.slice(-9), toGray({ data: d.data, width: 32, height: 32 })];
        }, 350) };
      } catch { setError(t("Camera permission wasn't granted, or no camera was found.", "Camera ki permission nahi mili, ya camera nahi mila.")); }
    })();
    return () => { cancelled = true; stopStream(); };
  }, [facing]); // eslint-disable-line react-hooks/exhaustive-deps

  const evidence = () => {
    const sm = probeRef.current.samples; let motion = 0;
    for (let i = 1; i < sm.length; i++) motion = Math.max(motion, motionScore(sm[i - 1], sm[i]));
    const track = streamRef.current?.getVideoTracks?.()[0], st = track?.getSettings?.() || {};
    return {
      sessionId: session.current.id, startedAt: new Date(session.current.startedAt).toISOString(), capturedAt: new Date().toISOString(),
      device: { label: session.current.label || track?.label || "", facingMode: st.facingMode || facing, width: st.width, height: st.height, frameRate: st.frameRate },
      motionScore: +motion.toFixed(2), probeSamples: sm.length, userAgent: navigator.userAgent, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    };
  };

  const finish = (file) => { const ev = evidence(); stopStream(); onCapture(file, ev); };

  const shoot = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => { if (blob) finish(new File([blob], `pdp-live-photo-${Date.now()}.jpg`, { type: "image/jpeg", lastModified: Date.now() })); }, "image/jpeg", 0.92);
  };

  const startRec = () => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === "undefined") { setError(t("Live video recording isn't supported in this browser.", "Is browser me live video recording supported nahi hai.")); return; }
    chunksRef.current = [];
    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const type = rec.mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      finish(new File([blob], `pdp-live-video-${Date.now()}.${type.includes("mp4") ? "mp4" : "webm"}`, { type, lastModified: Date.now() }));
    };
    rec.start(); setRecording(true); setElapsed(0);
    const t0 = Date.now();
    tick.current = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 250);
    stopTimer.current = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, maxSeconds * 1000);
  };
  const stopRec = () => { if (recRef.current?.state === "recording") recRef.current.stop(); };
  const close = () => { try { if (recRef.current?.state === "recording") { recRef.current.onstop = null; recRef.current.stop(); } } catch {} stopStream(); onClose(); };

  return (
    <div className="mae-overlay" role="dialog" aria-modal="true" aria-label="PDP camera">
      <div className="mae-card mae-camera">
        <div className="mae-head">
          <div><span className="mae-kicker">{t("LIVE PDP CAMERA", "LIVE PDP CAMERA")}</span><h3>{title || (mode === "photo" ? t("Capture a live photo", "Live photo khicho") : t("Record a live video", "Live video record karo"))}</h3></div>
          <button type="button" className="mae-x" onClick={close} aria-label="Close">×</button>
        </div>
        {error ? <div className="mae-error">{error}</div> : (
          <div className="mae-viewport">
            <video ref={videoRef} className={`mae-preview ${facing === "user" ? "mirror" : ""}`} muted playsInline />
            {recording && <span className="mae-rec">● REC {elapsed}s / {maxSeconds}s</span>}
          </div>
        )}
        <canvas ref={canvasRef} hidden />
        <p className="mae-tip">{t("Point the camera at real work — your site, team, product or presentation. Photos of screens or printouts aren't accepted.", "Camera ko asli kaam par rakho — site, team, product ya presentation. Screen ya printout ki photo accept nahi hoti.")}</p>
        <div className="mae-actions">
          <button type="button" className="mae-ghost" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} disabled={recording || !!error}>⟲ {t("Flip camera", "Camera badlo")}</button>
          <span className="mae-spacer" />
          <button type="button" className="mae-ghost" onClick={close}>{t("Cancel", "Cancel")}</button>
          {!error && mode === "photo" && <button type="button" className="mae-primary" onClick={shoot} disabled={!ready}>{t("Capture photo", "Photo khicho")}</button>}
          {!error && mode === "video" && !recording && <button type="button" className="mae-primary" onClick={startRec} disabled={!ready}>{t("Start recording", "Recording shuru karo")}</button>}
          {!error && mode === "video" && recording && <button type="button" className="mae-primary stop" onClick={stopRec}>{t("Stop & review", "Rokho aur review karo")}</button>}
        </div>
      </div>
    </div>
  );
}
