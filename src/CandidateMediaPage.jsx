import React, { useMemo, useRef, useState } from "react";
import { PROFILE_DATA, getRoleProfile, buildShortlistTools } from "./pdpProfileData";

const MAX_VIDEO_SECONDS = 20;
const MAX_IMAGES = 20;

function initials(name = "PDP") {
  return name.trim().split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase();
}

export default function CandidateMediaPage() {
  const profile = PROFILE_DATA.profile;
  const roleProfile = getRoleProfile(profile);
  const categories = useMemo(() => buildShortlistTools(profile, roleProfile, PROFILE_DATA.experience || []), [profile, roleProfile]);
  const [activeCategory, setActiveCategory] = useState(categories[0] || "Professional Evidence");
  const [selectedCompany, setSelectedCompany] = useState(PROFILE_DATA.experience?.[0]?.company || "");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [intro, setIntro] = useState(null);
  const fileRef = useRef(null);
  const introRef = useRef(null);

  const addFiles = (files) => {
    const next = Array.from(files || []).filter(file => file.type.startsWith("image/") || file.type.startsWith("video/"));
    if (!next.length) return;
    const mapped = next.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      category: activeCategory,
      company: selectedCompany,
      note: note.trim(),
    }));
    setItems(current => [...current, ...mapped]);
    setNote("");
  };

  const removeItem = (id) => {
    setItems(current => {
      const found = current.find(item => item.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return current.filter(item => item.id !== id);
    });
  };

  const setIntroVideo = (file) => {
    if (!file || !file.type.startsWith("video/")) return;
    setIntro({ file, url: URL.createObjectURL(file) });
  };

  const categoryItems = items.filter(item => item.category === activeCategory);
  const imageCount = items.filter(item => item.type === "image").length;
  const videoCount = items.filter(item => item.type === "video").length;

  return (
    <div className="media-page">
      <header className="media-topbar">
        <a className="media-brand" href="/"><span className="media-mark"><span /></span><span><strong>PDP</strong><small>Professional Digital Profile</small></span></a>
        <div className="media-progress"><span>01 Resume</span><b>02 Proof of Work</b><span>03 Preview & Publish</span></div>
        <a className="media-exit" href="/">Save & Exit</a>
      </header>

      <main className="media-shell">
        <section className="media-hero">
          <div className="media-kicker">BUILD YOUR PDP</div>
          <h1>Now show the work<br /><em>behind your career.</em></h1>
          <p>Your resume has created the professional structure. Add genuine photos and videos to make that experience visible.</p>
          <div className="media-profile-chip"><span>{initials(profile.name)}</span><div><strong>{profile.name}</strong><small>{profile.role} · {profile.location}</small></div><i>✓ Resume processed</i></div>
        </section>

        <section className="intro-card">
          <div><div className="media-kicker">CAREER INTRODUCTION</div><h2>Tell your professional story</h2><p>A short video in your own voice. Keep it natural — around 45 seconds.</p></div>
          <div className="intro-upload">
            {intro ? <div className="intro-preview"><video src={intro.url} controls /><button onClick={() => { URL.revokeObjectURL(intro.url); setIntro(null); }}>Remove</button></div> : <button className="upload-big" onClick={() => introRef.current?.click()}><span>▶</span><strong>Upload career video</strong><small>MP4, MOV or WebM · approx. 45 sec</small></button>}
            <input ref={introRef} type="file" accept="video/*" hidden onChange={e => setIntroVideo(e.target.files?.[0])} />
          </div>
        </section>

        <section className="evidence-section">
          <div className="evidence-heading"><div><div className="media-kicker">PROOF OF WORK</div><h2>Add evidence by experience</h2><p>These sections are generated from your role + resume. Add only what genuinely represents your work.</p></div><div className="media-counts"><b>{videoCount}<small>videos</small></b><b>{imageCount}<small>photos</small></b></div></div>

          <div className="category-tabs">{categories.map(category => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}<button className={activeCategory === "Other Professional Evidence" ? "active" : ""} onClick={() => setActiveCategory("Other Professional Evidence")}>Other Evidence</button></div>

          <div className="upload-workspace">
            <div className="upload-panel">
              <div className="upload-panel-top"><div><span className="category-dot">●</span><strong>{activeCategory}</strong><small>Evidence connected to this professional area</small></div><span className="limit">Videos ~20 sec · Photos up to {MAX_IMAGES}</span></div>
              <label>CONNECT THIS EVIDENCE TO</label>
              <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}><option value="">General / multiple companies</option>{PROFILE_DATA.experience?.map(exp => <option key={exp.company} value={exp.company}>{exp.company} · {exp.role}</option>)}</select>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What are we seeing? Add a short context — project, event, launch, client interaction, result, your contribution…" />
              <div className="dropzone" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}><div className="drop-icon">＋</div><strong>Drop photos or videos here</strong><span>or click to browse · multiple files allowed</span><small>Genuine professional evidence only</small></div>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={e => addFiles(e.target.files)} />
              <div className="upload-actions"><span>Nothing to upload? You can skip this section.</span><button onClick={() => setItems(current => current.filter(item => item.category !== activeCategory))}>Clear section</button></div>
            </div>

            <div className="evidence-preview-panel"><div className="preview-title"><strong>{activeCategory}</strong><span>{categoryItems.length} item{categoryItems.length === 1 ? "" : "s"}</span></div>{categoryItems.length ? <div className="media-grid">{categoryItems.map(item => <article key={item.id} className="media-tile">{item.type === "video" ? <video src={item.url} controls /> : <img src={item.url} alt="Uploaded professional evidence" />}<div><span>{item.type === "video" ? "VIDEO" : "PHOTO"}</span><button onClick={() => removeItem(item.id)}>×</button></div>{item.company && <small>{item.company}</small>}</article>)}</div> : <div className="empty-preview"><span>◇</span><strong>Your evidence will appear here</strong><small>Upload a real work moment, project demonstration, presentation, event, team/client interaction, product or other professional proof.</small></div>}</div>
          </div>
        </section>

        <section className="trust-strip"><div><span>✓</span><strong>Authenticity matters</strong><p>PDP is designed around genuine professional evidence. Suspicious uploads may be reviewed.</p></div><a href="#concern">Raise a concern</a></section>

        <section className="media-footer"><div><div className="media-kicker">NEXT STEP</div><h2>Your PDP is taking shape.</h2><p>You can add more evidence later. Continue when the profile represents you.</p></div><a className="continue-btn" href="/pdp/ananya">Preview My PDP →</a></section>
      </main>
    </div>
  );
}
