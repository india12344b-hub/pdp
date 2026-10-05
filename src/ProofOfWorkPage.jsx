import React, { useEffect, useMemo, useRef, useState } from "react";
import { clearIntro, deleteMedia, getMedia, getResume, getIntro, saveIntro, saveMedia, getProfile, saveProfile, saveAuthRecord, getAuthRecords } from "./pdpStorage";
import { getRoleProfile } from "./pdpProfileData";
import { getDraft, saveDraft } from "./pdpDraft";
import pdpLogo from "./pdp-logo.png";
import PdpCameraModal from "./auth/PdpCameraModal";
import AuthReviewModal from "./auth/AuthReviewModal";
import AuthDetailsModal from "./auth/AuthDetailsModal";
import AuthBadge from "./auth/AuthBadge";
import { buildRecord, recordMeta, attachAuthenticity } from "./auth/authLedger";
import { loadMemory } from "./pal/palMemory";

const MAX_VIDEO_SECONDS = 20;
const INTRO_SECONDS = 60;
const MAX_IMAGES = 20;

function initials(name = "PDP") {
  return name.trim().split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase();
}

async function optimizeHeroImage(file) {
  if (!file || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const targetW = 1920, targetH = 1080, targetRatio = targetW / targetH;
    const sourceRatio = bitmap.width / bitmap.height;
    let sw = bitmap.width, sh = bitmap.height, sx = 0, sy = 0;
    if (sourceRatio > targetRatio) { sw = Math.round(bitmap.height * targetRatio); sx = Math.round((bitmap.width - sw) / 2); }
    else if (sourceRatio < targetRatio) { sh = Math.round(bitmap.width / targetRatio); sy = Math.round((bitmap.height - sh) / 2); }
    const scale = Math.min(1, targetW / sw, targetH / sh);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw * scale); canvas.height = Math.round(sh * scale);
    canvas.getContext("2d").drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.88));
    bitmap.close();
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-pdp.webp`, { type: "image/webp", lastModified: Date.now() }) : file;
  } catch { return file; }
}

export default function CandidateMediaPage() {
  const lang = loadMemory().lang || "en";
  const t = (en, hi) => (lang === "en" ? en : hi);
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
  const heroItems = useMemo(() => {
    if (draft.heroMediaId) {
      const selected = items.find(item => String(item.id) === String(draft.heroMediaId));
      return selected ? [selected] : [];
    }
    const legacy = items.find(item => item.hero || item.category === "Hero Profile Media");
    return legacy ? [legacy] : [];
  }, [items, draft.heroMediaId]);
  const [note, setNote] = useState("");
  const [intro, setIntro] = useState(null);
  const [resumeRecord, setResumeRecord] = useState(null);
  const [status, setStatus] = useState("Loading your saved content…");
  const [ledger, setLedger] = useState([]);       // authenticity records (Media Authenticity Engine)
  const [camera, setCamera] = useState(null);     // { mode: "photo"|"video", kind: "evidence"|"intro" }
  const [reviewQueue, setReviewQueue] = useState(null); // [{ file, mode, liveEvidence, kind }]
  const [details, setDetails] = useState(null);   // item whose authenticity record is open
  const [frozen, setFrozen] = useState(getDraft().accountStatus === "frozen"); // set by PDP after a confirmed violation (the server must enforce it too)
  const fileRef = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([getResume(), getMedia(), getIntro(), getProfile(), getAuthRecords()]).then(([resume, media, savedIntro, cloudProfile, records]) => {
      if (!active) return;
      if (cloudProfile?.profile) { setDraft(saveDraft(cloudProfile.profile)); setFrozen(cloudProfile.profile.accountStatus === "frozen"); }
      setResumeRecord(resume || null);
      setLedger(records || []);
      const restored = attachAuthenticity((media || []).map(item => ({ ...item, file: item.file, url: item.url || (item.file ? URL.createObjectURL(item.file) : "") })), records || []);
      setItems(restored);
      const legacyHero = restored.find(item => item.hero || item.category === "Hero Profile Media");
      if (!getDraft().heroMediaId && legacyHero) { const nextDraft = saveDraft({ heroMediaId: legacyHero.id }); setDraft(nextDraft); saveProfile(nextDraft).catch(() => {}); }
      if (!selectedCompany && restored.find(item => item.company)?.company) setSelectedCompany(restored.find(item => item.company).company);
      if (savedIntro?.file) setIntro(attachAuthenticity([{ ...savedIntro, id: "intro", url: URL.createObjectURL(savedIntro.file) }], records || [])[0]);
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

  /* ---------- the four ways in ---------- */
  // 📷 Capture with PDP camera
  const openCamera = (mode = "photo", kind = "evidence") => { if (frozen) return; setCamera({ mode, kind }); };
  const onCameraCapture = (file, liveEvidence) => {
    const kind = camera?.kind || "evidence";
    setCamera(null);
    setReviewQueue([{ file, mode: "live", liveEvidence, kind }]);
  };
  // 📤 Upload existing media → ✅ declaration + 🔍 screening happen inside AuthReviewModal
  const queueFiles = (files) => {
    if (frozen) return;
    const next = Array.from(files || []).filter(file => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (!next.length) return;
    setReviewQueue(next.map(file => ({ file, mode: "upload", liveEvidence: null, kind: "evidence" })));
  };
  const queueIntro = (file) => {
    if (frozen || !file || !file.type.startsWith("video/")) return;
    setReviewQueue([{ file, mode: "upload", liveEvidence: null, kind: "intro" }]);
  };

  const queueHero = async (file) => {
    if (frozen || !file || (!file.type.startsWith("image/") && !file.type.startsWith("video/"))) return;
    const prepared = file.type.startsWith("image/") ? await optimizeHeroImage(file) : file;
    setReviewQueue([{ file: prepared, mode: "upload", liveEvidence: null, kind: "hero" }]);
  };

  // called by the review modal once the file passed screening and the declaration is signed
  const confirmItem = async ({ file, mode, kind, liveEvidence, report, declaration }) => {
    const meta = recordMeta(report, mode);
    if (kind === "hero") {
      // Hero is a view/selection of the same media library item — the file is not duplicated.
      const record = await saveMedia(file, { category: "Hero Profile Media", company: "", note: "Main PDP hero media", hero: true, ...meta });
      const rec = buildRecord({ id: record.id, kind: "hero", report, declaration, mode, liveEvidence, expectedName: profile.name });
      await saveAuthRecord(rec);
      setLedger(cur => [...cur.filter(r => String(r.id) !== String(record.id)), rec]);
      const nextHero = { ...record, ...meta, hero: true, file, url: record.url || URL.createObjectURL(file), authenticity: rec };
      setItems(cur => [...cur, nextHero]);
      const nextDraft = saveDraft({ heroMediaId: record.id });
      setDraft(nextDraft);
      saveProfile(nextDraft).catch(() => {});
      setStatus(`✓ ${file.type.startsWith("video/") ? "Hero video" : "Hero photo"} saved and optimised for PDP`);
      return;
    }
    if (kind === "intro") {
      const record = await saveIntro(file, meta);
      const rec = buildRecord({ id: "intro", kind: "intro", report, declaration, mode, liveEvidence, expectedName: profile.name });
      await saveAuthRecord(rec);
      setLedger(cur => [...cur.filter(r => r.id !== "intro"), rec]);
      setIntro({ ...record, ...meta, id: "intro", url: URL.createObjectURL(file), authenticity: rec });
      setStatus(report.decision === "review" ? "✓ Career introduction saved — under review" : "✓ Career introduction saved");
      return;
    }
    const record = await saveMedia(file, { category: activeCategory, company: selectedCompany, note: note.trim() || (mode === "live" ? "Captured live with PDP camera" : ""), ...meta });
    const rec = buildRecord({ id: record.id, kind: "evidence", report, declaration, mode, liveEvidence, expectedName: profile.name });
    await saveAuthRecord(rec);
    setLedger(cur => [...cur.filter(r => String(r.id) !== String(record.id)), rec]);
    setItems(cur => [...cur, { ...record, ...meta, file, url: record.url || URL.createObjectURL(file), authenticity: rec }]);
    setNote("");
    setStatus(`✓ ${mode === "live" ? "Live capture" : "Upload"} added to ${activeCategory}${selectedCompany ? ` · ${selectedCompany}` : ""}${report.decision === "review" ? " — under review" : ""}`);
  };

  const removeItem = (id) => {
    setItems(current => {
      const found = current.find(item => item.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return current.filter(item => item.id !== id);
    });
    setLedger(cur => cur.filter(r => String(r.id) !== String(id)));
    deleteMedia(id).catch(() => {});
    setStatus("Evidence removed");
  };

  const categoryItems = items.filter(item => item.category === activeCategory);
  const imageCount = items.filter(item => item.type === "image").length;
  const videoCount = items.filter(item => item.type === "video").length;

  return (
    <div className="media-page">
      <header className="media-topbar">
        <a className="media-brand" href="/"><img className="pdp-real-logo" src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
        <nav className="journey-nav"><a href="/">Home</a><a href="/professionals">For Professionals</a><a href="/upload-resume">Resume</a><a className="active" href="/build-proof">Proof of Work</a><a href="/pdp/me">My PDP</a><a href="/recruiters">Recruiters</a></nav>
        <div className="media-progress"><span>01 Resume</span><b>02 Proof of Work</b><span>03 Preview & Publish</span></div>
        <a className="media-exit" href="/">Save & Exit</a>
      </header>

      <main className="media-shell">
        {frozen && <div className="mae-frozen" role="alert"><b>🔒 {t("Your PDP account is frozen", "Aapka PDP account freeze hai")}</b>{t("AI-generated, edited or wrongly declared media was found on your profile, so adding new proof is switched off. Please contact PDP support to have your account reviewed.", "Aapke profile par AI-generated, edited ya galat declare kiya hua media mila, isliye naya proof jodna band hai. Account review ke liye PDP support se sampark karo.")}</div>}

        <section className="media-hero">
          <div className="media-kicker">BUILD YOUR PDP</div>
          <h1>Now show the work<br /><em>behind your career.</em></h1>
          <p>Your resume has created the professional structure. Add genuine photos and videos to make that experience visible.</p>
          <div className="media-profile-chip"><span>{initials(profile.name)}</span><div><strong>{profile.name}</strong><small>{profile.role} · {profile.location}</small></div><i>{resumeRecord ? "✓ Resume saved" : "⚠ Resume not connected"}</i></div>
          <div className="media-save-status">{status}</div>
        </section>

        <section className="hero-media-settings">
          <div><div className="media-kicker">MAIN PROFILE HERO</div><h2>Choose your Hero photo or video</h2><p>Use either a professional photo or a short video. PDP automatically prepares photos for a standard 16:9 social-style frame and adapts the display to every screen size.</p></div>
          <div className="hero-media-controls">
            <input id="hero-media-input" type="file" accept="image/*,video/*" hidden onChange={e => { queueHero(e.target.files?.[0]); e.target.value = ""; }} />
            <label className="hero-upload-choice" htmlFor="hero-media-input"><span>＋</span><strong>Upload photo or video</strong><small>JPG, PNG, WebP · MP4, MOV, WebM</small></label>
            <div className="hero-media-existing">
              {heroItems.length ? heroItems.map(item => <article key={item.id}><div className="hero-media-thumb">{item.type === "video" ? <video src={item.url} muted playsInline /> : <img src={item.url} alt="Selected PDP hero" />}</div><div><strong>{item.type === "video" ? "Hero Video" : "Hero Photo"}</strong><small>Active on main profile</small></div><button type="button" onClick={() => { if (String(draft.heroMediaId) === String(item.id) || item.hero || item.category === "Hero Profile Media") { const nextDraft = saveDraft({ heroMediaId: "" }); setDraft(nextDraft); saveProfile(nextDraft).catch(() => {}); setStatus("Hero media removed from the profile — media remains in your library"); } else removeItem(item.id); }}>Remove from Hero</button></article>) : <div className="hero-media-empty">No hero media selected yet.</div>}
            </div>
          </div>
        </section>

        <section className="intro-card">
          <div><div className="media-kicker">CAREER INTRODUCTION</div><h2>Tell your professional story</h2><p>A short video in your own voice. Keep it natural — around 45 seconds. Record it with the PDP camera for the strongest trust signal.</p></div>
          <div className="intro-upload">
            {intro ? <div className="intro-preview"><video src={intro.url} controls /><button onClick={() => { URL.revokeObjectURL(intro.url); setIntro(null); setLedger(cur => cur.filter(r => r.id !== "intro")); clearIntro(); setStatus("Career introduction removed"); }}>Remove</button><div className="mae-tile-badges"><AuthBadge item={intro} compact onClick={() => setDetails(intro)} /></div></div> : (
              <div className="intro-actions">
                <button className="upload-big" onClick={() => openCamera("video", "intro")}><span>●</span><strong>Record with PDP camera</strong><small>Live · up to {INTRO_SECONDS} sec · highest trust</small></button>
                <button className="upload-big" onClick={() => introRef.current?.click()}><span>▶</span><strong>Upload existing video</strong><small>MP4, MOV or WebM · screened + declaration</small></button>
              </div>
            )}
            <input ref={introRef} type="file" accept="video/*" hidden onChange={e => { queueIntro(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        </section>

        <section className="evidence-section">
          <div className="evidence-heading"><div><div className="media-kicker">PROOF OF WORK</div><h2>Add evidence by experience</h2><p>These sections are generated from your role + resume. Add only what genuinely represents your work.</p></div><div className="media-counts"><b>{videoCount}<small>videos</small></b><b>{imageCount}<small>photos</small></b></div></div>

          <div className="category-tabs">{categories.map(category => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>

          <div className="mae-panel">
            <div className="mae-panel-head"><strong>🛡 Media Authenticity</strong><p>Every photo and video is checked and recorded before it becomes proof. Capture live for the highest trust, or upload real work you already have.</p></div>
            <div className="mae-options">
              <div className="mae-option"><em>HIGHEST TRUST</em><b>📷 Capture with PDP camera</b>Take a live photo or video right now. No gallery, no editing in between.
                <div className="mae-btnrow"><button type="button" onClick={() => openCamera("photo")}>Live photo</button><button type="button" onClick={() => openCamera("video")}>● Live video</button></div></div>
              <div className="mae-option"><em>HISTORICAL WORK</em><b>📤 Upload existing media</b>Real work from the past — site photos, launch videos, presentations.
                <div className="mae-btnrow"><button type="button" onClick={() => fileRef.current?.click()}>Choose files</button></div></div>
              <div className="mae-option"><em>SIGNED RECORD</em><b>✅ Authenticity declaration</b>You confirm it's real, unedited and yours to share. PDP stores the signed record with the file.</div>
              <div className="mae-option"><em>AUTOMATIC</em><b>🔍 AI & manipulation screening</b>Checks metadata, editing software, AI labels and duplicates in your browser before anything is added.</div>
            </div>
            <p className="mae-footnote">Screening lowers risk but can't prove a file is authentic — that's why PDP combines live capture, a signed declaration and human review. Files labelled as AI-generated can't be added.</p>
          </div>

          <div className="upload-workspace">
            <div className="upload-panel">
              <div className="upload-panel-top"><div><span className="category-dot">●</span><strong>{activeCategory}</strong><small>Evidence connected to this professional area</small></div><span className="limit">Videos ~20 sec · Photos up to {MAX_IMAGES}</span></div>
              <label>CONNECT THIS EVIDENCE TO</label>
              <div className="company-connect"><input value={companyInput} onChange={e => setCompanyInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); attachCompany(); } }} placeholder="Company / organisation" /><button type="button" onClick={attachCompany}>Attach</button></div>
              {Array.from(new Set([...(draft.experience || []).map(x => x.company), ...items.map(x => x.company).filter(Boolean)])).length > 0 && <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}><option value="">General / multiple companies</option>{Array.from(new Set([...(draft.experience || []).map(x => x.company), ...items.map(x => x.company).filter(Boolean)])).map(company => <option key={company} value={company}>{company}</option>)}</select>}
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What are we seeing? Add a short context — project, event, launch, client interaction, result, your contribution…" />
              <div className="dropzone" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); queueFiles(e.dataTransfer.files); }}><div className="drop-icon">＋</div><strong>Drop existing photos or videos here</strong><span>or click to browse · each file is screened and declared</span><small>Genuine professional evidence only</small></div>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={e => { queueFiles(e.target.files); e.target.value = ""; }} />
              <div className="upload-actions"><span>Saved automatically on this device.</span><button onClick={() => { const ids = items.filter(item => item.category === activeCategory).map(item => item.id); ids.forEach(id => deleteMedia(id).catch(() => {})); setItems(current => current.filter(item => item.category !== activeCategory)); setLedger(cur => cur.filter(r => !ids.includes(r.id))); setStatus(`${activeCategory} cleared`); }}>Clear section</button></div>
            </div>

            <div className="evidence-preview-panel"><div className="preview-title"><strong>{activeCategory}</strong><span>{categoryItems.length} item{categoryItems.length === 1 ? "" : "s"}</span></div>{categoryItems.length ? <div className="media-grid">{categoryItems.map(item => <article key={item.id} className="media-tile">{item.type === "video" ? <video src={item.url} controls /> : <img src={item.url} alt="Uploaded professional evidence" />}<div><span>{item.type === "video" ? "VIDEO" : "PHOTO"}</span><button onClick={() => removeItem(item.id)}>×</button></div><div className="mae-tile-badges"><AuthBadge item={item} compact onClick={() => setDetails(item)} /></div>{item.company && <small>{item.company}</small>}</article>)}</div> : <div className="empty-preview"><span>◇</span><strong>Your evidence will appear here</strong><small>Capture or upload a real work moment, project demonstration, presentation, event, team/client interaction, product or other professional proof.</small></div>}</div>
          </div>
        </section>

        <section className="trust-strip"><div><span>✓</span><strong>Authenticity matters</strong><p>PDP is designed around genuine professional evidence. Suspicious uploads may be reviewed.</p></div><a href="#concern">Raise a concern</a></section>

        {camera && <PdpCameraModal mode={camera.mode} maxSeconds={camera.kind === "intro" ? INTRO_SECONDS : MAX_VIDEO_SECONDS} title={camera.kind === "intro" ? "Record your career introduction" : undefined} onCapture={onCameraCapture} onClose={() => setCamera(null)} />}
        {reviewQueue && <AuthReviewModal items={reviewQueue} existing={ledger} expectedName={draft.name || ""} onConfirm={confirmItem} onUseCamera={() => openCamera("photo")} onClose={() => setReviewQueue(null)} />}
        {details && <AuthDetailsModal item={details} onClose={() => setDetails(null)} />}

        <section className="media-footer"><div><div className="media-kicker">NEXT STEP</div><h2>Your PDP is taking shape.</h2><p>You can add more evidence later. Continue when the profile represents you.</p></div><a className="continue-btn" href="/pdp/me">Preview My PDP →</a></section>
      </main>
    </div>
  );
}
