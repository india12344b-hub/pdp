import React, { useEffect, useMemo, useRef, useState } from "react";
import { clearIntro, deleteMedia, getMedia, getResume, getIntro, saveIntro, saveMedia, getProfile, saveProfile } from "./pdpStorage";
import { getRoleProfile } from "./pdpProfileData";
import { getDraft, saveDraft } from "./pdpDraft";
import pdpLogo from "./pdp-logo.png";

const MAX_VIDEO_SECONDS = 20;
const MAX_IMAGES = 20;

function initials(name = "PDP") {
  return name.trim().split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase();
}

export default function CandidateMediaPage() {
  const [draft, setDraft] = useState(getDraft());
  const profile = { name: draft.name || "Your Professional Profile", role: draft.role || "Professional Profile", location: draft.location || "Add your location" };
  const roleProfile = getRoleProfile(profile);
  const categories = useMemo(() => {
    const roleAreas = (roleProfile?.shortlistTools || []).slice(0, 6);
    return [...new Set([...roleAreas, "Projects & Achievements", "Leadership & Team", "Other Professional Evidence"])];
  }, [roleProfile]);
  const [activeCategory, setActiveCategory] = useState(categories[0] || "Other Professional Evidence");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [intro, setIntro] = useState(null);
  const [resumeRecord, setResumeRecord] = useState(null);
  const [status, setStatus] = useState("Loading your saved content…");
  const [originalDeclared, setOriginalDeclared] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState("photo");
  const [cameraError, setCameraError] = useState("");
  const cameraVideoRef = useRef(null);
  const cameraCanvasRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const fileRef = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([getResume(), getMedia(), getIntro(), getProfile()]).then(([resume, media, savedIntro, cloudProfile]) => {
      if (!active) return;
      if (cloudProfile?.profile) setDraft(saveDraft(cloudProfile.profile));
      setResumeRecord(resume || null);
      const restored = (media || []).map(item => ({ ...item, file: item.file, url: item.url || (item.file ? URL.createObjectURL(item.file) : "") }));
      setItems(restored);
      if (!selectedCompany && restored.find(item => item.company)?.company) setSelectedCompany(restored.find(item => item.company).company);
      if (savedIntro?.file) setIntro({ ...savedIntro, url: URL.createObjectURL(savedIntro.file) });
      setStatus(resume ? "✓ Resume connected" : "No saved resume found — upload one first");
    }).catch(() => setStatus("Could not load saved content"));
    return () => { active = false; };
  }, []);

  const attachCompany = () => {
    const value = companyInput.trim();
    if (!value) return;
    const next = saveDraft({ experience: [...(getDraft().experience || []).filter(x => x.company !== value), { company: value, role: draft.role || "Professional Role", years: "", desc: "Candidate-added work experience", highlight: "Candidate-uploaded evidence", tags: [activeCategory] }] });
    setDraft(next);
    setSelectedCompany(value);
    saveProfile(next).catch(() => {});
    setStatus(`✓ ${value} connected to this evidence`);
  };

  const addFiles = (files) => {
    const next = Array.from(files || []).filter(file => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (!next.length) return;
    Promise.all(next.map(file => saveMedia(file, {
      category: activeCategory,
      company: selectedCompany,
      note: note.trim(),
      captureMode: "upload",
      originalDeclared: originalDeclared
    })))
      .then(records => {
        const mapped = records.map(record => ({ ...record, file: record.file, url: record.url || URL.createObjectURL(record.file) }));
        setItems(current => [...current, ...mapped]);
        setNote("");
        setOriginalDeclared(false);
        setStatus(`✓ ${mapped.length} file${mapped.length === 1 ? "" : "s"} saved to ${activeCategory}${selectedCompany ? ` · ${selectedCompany}` : ""}`);
      })
      .catch(() => setStatus("Upload selected, but could not save it locally"));
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks?.().forEach(track => track.stop());
    cameraStreamRef.current = null;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    setCameraOpen(false);
  };

  const openCamera = async (mode = "photo") => {
    setCameraMode(mode);
    setCameraError("");
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === "video"
      });
      cameraStreamRef.current = stream;
      requestAnimationFrame(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError("Camera permission was not granted or this browser does not support camera capture.");
    }
  };

  const captureLivePhoto = async () => {
    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], `pdp-live-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
      try {
        const record = await saveMedia(file, {
          category: activeCategory,
          company: selectedCompany,
          note: note.trim() || "Captured live with PDP camera",
          captureMode: "live",
          originalDeclared: true
        });
        const mapped = { ...record, file, url: record.url || URL.createObjectURL(file), captureMode: "live", originalDeclared: true };
        setItems(current => [...current, mapped]);
        setNote("");
        setStatus("✓ Live photo captured and added to your proof");
        stopCamera();
      } catch {
        setStatus("Live photo captured, but could not be saved");
      }
    }, "image/jpeg", 0.92);
  };

  const startLiveVideo = () => {
    const stream = cameraStreamRef.current;
    if (!stream || typeof MediaRecorder === "undefined") {
      setCameraError("Live video recording is not supported in this browser.");
      return;
    }
    recordedChunksRef.current = [];
    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(type => MediaRecorder.isTypeSupported(type)) || "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data?.size) recordedChunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "video/webm" });
      const file = new File([blob], `pdp-live-video-${Date.now()}.webm`, { type: blob.type });
      try {
        const record = await saveMedia(file, {
          category: activeCategory,
          company: selectedCompany,
          note: note.trim() || "Captured live with PDP camera",
          captureMode: "live",
          originalDeclared: true
        });
        const mapped = { ...record, file, url: record.url || URL.createObjectURL(file), captureMode: "live", originalDeclared: true };
        setItems(current => [...current, mapped]);
        setNote("");
        setStatus("✓ Live video captured and added to your proof");
      } catch {
        setStatus("Live video captured, but could not be saved");
      } finally {
        stopCamera();
      }
    };
    recorder.start();
    setStatus("● Recording live video… maximum 20 seconds");
    window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, MAX_VIDEO_SECONDS * 1000);
  };

  const captureLive = () => cameraMode === "photo" ? captureLivePhoto() : startLiveVideo();

  const removeItem = (id) => {
    setItems(current => {
      const found = current.find(item => item.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return current.filter(item => item.id !== id);
    });
    deleteMedia(id).catch(() => {});
    setStatus("Evidence removed");
  };

  const setIntroVideo = (file) => {
    if (!file || !file.type.startsWith("video/")) return;
    saveIntro(file).then(record => {
      setIntro({ ...record, url: URL.createObjectURL(record.file) });
      setStatus("✓ Career introduction saved");
    }).catch(() => setStatus("Career video selected, but could not be saved locally"));
  };

  const categoryItems = items.filter(item => item.category === activeCategory);
  const imageCount = items.filter(item => item.type === "image").length;
  const videoCount = items.filter(item => item.type === "video").length;

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks?.().forEach(track => track.stop());
  }, []);

  return (
    <div className="media-page">
      <header className="media-topbar">
        <a className="media-brand" href="/"><img className="pdp-real-logo" src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
        <nav className="journey-nav"><a href="/">Home</a><a href="/professionals">For Professionals</a><a href="/upload-resume">Resume</a><a className="active" href="/build-proof">Proof of Work</a><a href="/pdp/me">My PDP</a><a href="/recruiters">Recruiters</a></nav>
        <div className="media-progress"><span>01 Resume</span><b>02 Proof of Work</b><span>03 Preview & Publish</span></div>
        <a className="media-exit" href="/">Save & Exit</a>
      </header>

      <main className="media-shell">
        <section className="media-hero">
          <div className="media-kicker">BUILD YOUR PDP</div>
          <h1>Now show the work<br /><em>behind your career.</em></h1>
          <p>Your resume has created the professional structure. Add genuine photos and videos to make that experience visible.</p>
          <div className="media-profile-chip"><span>{initials(profile.name)}</span><div><strong>{profile.name}</strong><small>{profile.role} · {profile.location}</small></div><i>{resumeRecord ? "✓ Resume saved" : "⚠ Resume not connected"}</i></div>
          <div className="media-save-status">{status}</div>
        </section>

        <section className="intro-card">
          <div><div className="media-kicker">CAREER INTRODUCTION</div><h2>Tell your professional story</h2><p>A short video in your own voice. Keep it natural — around 45 seconds.</p></div>
          <div className="intro-upload">
            {intro ? <div className="intro-preview"><video src={intro.url} controls /><button onClick={() => { URL.revokeObjectURL(intro.url); setIntro(null); clearIntro(); setStatus("Career introduction removed"); }}>Remove</button></div> : <button className="upload-big" onClick={() => introRef.current?.click()}><span>▶</span><strong>Upload career video</strong><small>MP4, MOV or WebM · approx. 45 sec</small></button>}
            <input ref={introRef} type="file" accept="video/*" hidden onChange={e => setIntroVideo(e.target.files?.[0])} />
          </div>
        </section>

        <section className="evidence-section">
          <div className="evidence-heading"><div><div className="media-kicker">PROOF OF WORK</div><h2>Add evidence by experience</h2><p>These sections are generated from your role + resume. Add only what genuinely represents your work.</p></div><div className="media-counts"><b>{videoCount}<small>videos</small></b><b>{imageCount}<small>photos</small></b></div></div>

          <div className="category-tabs">{categories.map(category => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>

          <div className="pdp-authenticity-tools">
            <div>
              <strong>Give your proof a higher trust signal</strong>
              <p>Capture a photo/video live through PDP, or upload an older genuine work file. For uploaded files, only tick the declaration if it is your original, unedited, non-AI-created work.</p>
            </div>
            <div className="pdp-live-actions">
              <button type="button" onClick={() => openCamera("photo")}>📷 Live Photo</button>
              <button type="button" onClick={() => openCamera("video")}>● Live Video</button>
            </div>
            <label className="pdp-original-check"><input type="checkbox" checked={originalDeclared} onChange={e => setOriginalDeclared(e.target.checked)} /> I confirm this uploaded file is original, unedited and not AI-created.</label>
          </div>

          <div className="upload-workspace">
            <div className="upload-panel">
              <div className="upload-panel-top"><div><span className="category-dot">●</span><strong>{activeCategory}</strong><small>Evidence connected to this professional area</small></div><span className="limit">Videos ~20 sec · Photos up to {MAX_IMAGES}</span></div>
              <label>CONNECT THIS EVIDENCE TO</label>
              <div className="company-connect"><input value={companyInput} onChange={e => setCompanyInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); attachCompany(); } }} placeholder="Company / organisation" /><button type="button" onClick={attachCompany}>Attach</button></div>
              {Array.from(new Set([...(draft.experience || []).map(x => x.company), ...items.map(x => x.company).filter(Boolean)])).length > 0 && <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}><option value="">General / multiple companies</option>{Array.from(new Set([...(draft.experience || []).map(x => x.company), ...items.map(x => x.company).filter(Boolean)])).map(company => <option key={company} value={company}>{company}</option>)}</select>}
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What are we seeing? Add a short context — project, event, launch, client interaction, result, your contribution…" />
              <div className="dropzone" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}><div className="drop-icon">＋</div><strong>Drop photos or videos here</strong><span>or click to browse · multiple files allowed</span><small>Genuine professional evidence only</small></div>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={e => addFiles(e.target.files)} />
              <div className="upload-actions"><span>Saved automatically on this device.</span><button onClick={() => { const ids = items.filter(item => item.category === activeCategory).map(item => item.id); ids.forEach(id => deleteMedia(id).catch(() => {})); setItems(current => current.filter(item => item.category !== activeCategory)); setStatus(`${activeCategory} cleared`); }}>Clear section</button></div>
            </div>

            <div className="evidence-preview-panel"><div className="preview-title"><strong>{activeCategory}</strong><span>{categoryItems.length} item{categoryItems.length === 1 ? "" : "s"}</span></div>{categoryItems.length ? <div className="media-grid">{categoryItems.map(item => <article key={item.id} className="media-tile">{item.type === "video" ? <video src={item.url} controls /> : <img src={item.url} alt="Uploaded professional evidence" />}<div><span>{item.type === "video" ? "VIDEO" : "PHOTO"}</span><button onClick={() => removeItem(item.id)}>×</button></div>{item.company && <small>{item.company}</small>}</article>)}</div> : <div className="empty-preview"><span>◇</span><strong>Your evidence will appear here</strong><small>Upload a real work moment, project demonstration, presentation, event, team/client interaction, product or other professional proof.</small></div>}</div>
          </div>
        </section>

        <section className="trust-strip"><div><span>✓</span><strong>Authenticity matters</strong><p>PDP is designed around genuine professional evidence. Suspicious uploads may be reviewed.</p></div><a href="#concern">Raise a concern</a></section>

        {cameraOpen && <div className="pdp-camera-overlay" role="dialog" aria-modal="true">
          <div className="pdp-camera-card">
            <div className="pdp-camera-head"><div><span className="media-kicker">LIVE PDP CAPTURE</span><h3>{cameraMode === "photo" ? "Capture a live photo" : "Record a live video"}</h3></div><button type="button" onClick={stopCamera}>×</button></div>
            {cameraError ? <div className="pdp-camera-error">{cameraError}</div> : <video ref={cameraVideoRef} className="pdp-camera-preview" muted={cameraMode === "photo"} playsInline />}
            <canvas ref={cameraCanvasRef} hidden />
            <div className="pdp-camera-actions">
              {!cameraError && <button type="button" className="continue-btn" onClick={captureLive}>{cameraMode === "photo" ? "Capture Photo" : "Start Video"}</button>}
              <button type="button" className="media-exit" onClick={stopCamera}>Cancel</button>
            </div>
          </div>
        </div>}

        <section className="media-footer"><div><div className="media-kicker">NEXT STEP</div><h2>Your PDP is taking shape.</h2><p>You can add more evidence later. Continue when the profile represents you.</p></div><a className="continue-btn" href="/pdp/me">Preview My PDP →</a></section>
      </main>
    </div>
  );
}
