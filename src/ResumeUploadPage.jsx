import React, { useEffect, useRef, useState } from "react";
import { clearResume, getResume, saveResume } from "./pdpStorage";
import { getDraft, saveDraft } from "./pdpDraft";
import pdpLogo from "./pdp-logo.png";

export default function ResumeUploadPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("Loading saved resume…");
  const [draft, setDraft] = useState(getDraft());

  useEffect(() => {
    getResume().then(record => {
      if (record?.file) { setFile(record.file); setSaved(true); setStatus("✓ Resume saved on this device"); }
      else setStatus("No resume saved yet");
    }).catch(() => setStatus("Local save is unavailable in this browser"));
  }, []);

  const acceptFile = (f) => {
    if (!f) return;
    const ok = /\.(pdf|doc|docx)$/i.test(f.name) || ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type);
    if (ok) {
      setFile(f);
      setSaved(false);
      setStatus("Saving resume…");
      saveResume(f).then(() => { setSaved(true); setStatus("✓ Resume saved — ready for the next step"); }).catch(() => setStatus("Resume selected, but could not be saved locally"));
    } else {
      setStatus("Please choose a PDF, DOC or DOCX resume.");
    }
  };

  return <div className="resume-page">
    <header className="resume-topbar">
      <a className="media-brand" href="/"><img className="pdp-real-logo" src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
      <nav className="journey-nav">
        <a href="/">Home</a><a href="/professionals">For Professionals</a><a className="active" href="/upload-resume">Resume</a><a href="/build-proof">Proof of Work</a><a href="/pdp/me">My PDP</a><a href="/recruiters">Recruiters</a>
      </nav>
      <a className="resume-exit" href="/">Save & Exit</a>
    </header>

    <main className="resume-shell">
      <div className="resume-progress"><span className="done">01 Resume</span><i>→</i><span>02 Proof of Work</span><i>→</i><span>03 Preview & Publish</span></div>
      <section className="resume-hero">
        <div className="media-kicker">CREATE YOUR PDP</div>
        <h1>Start with your <em>resume.</em></h1>
        <p>Upload your existing resume. PDP uses it to create your structured professional profile. You review the information before anything is published.</p>
      </section>

      <section className="resume-card">
        <div className="resume-copy"><span className="resume-number">01</span><div><h2>Upload your original resume</h2><p>Keep your original document intact. PDP will use it as the source for your professional information.</p><div className="resume-points"><span>✓ Employment & roles</span><span>✓ Education & certifications</span><span>✓ Skills & experience areas</span><span>✓ Achievements & projects</span></div></div></div>
        <div className={"resume-drop " + (dragging ? "dragging" : "")} onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]); }}>
          {file ? <div className="resume-file"><div className="file-icon">PDF</div><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to process</small></div><button onClick={async e => { e.stopPropagation(); await clearResume(); setFile(null); setSaved(false); setStatus("Resume removed from this device"); }}>Remove</button></div> : <><div className="resume-upload-icon">↑</div><strong>Drop your resume here</strong><span>or click to browse</span><small>PDF, DOC or DOCX</small></>}
          <input ref={inputRef} type="file" hidden accept=".pdf,.doc,.docx,application/pdf" onChange={e => acceptFile(e.target.files?.[0])}/>
        </div>
      </section>

      <div className={"resume-save-status " + (saved ? "saved" : "")}> <span>{status}</span></div>
      {file && <section className="resume-profile-details">
        <div><div className="media-kicker">PROFILE PREVIEW</div><h2>Tell PDP who this resume belongs to.</h2><p>These details are saved with your PDP draft. We will connect automated resume extraction here in the data layer next — nothing is invented.</p></div>
        <div className="resume-profile-grid">
          <label>FULL NAME<input value={draft.name} onChange={e => { const value = e.target.value; setDraft(saveDraft({ name: value })); }} placeholder="Your full name" /></label>
          <label>CURRENT / MOST RECENT ROLE<input value={draft.role} onChange={e => { const value = e.target.value; setDraft(saveDraft({ role: value })); }} placeholder="e.g. Business Development Manager" /></label>
          <label>LOCATION<input value={draft.location} onChange={e => { const value = e.target.value; setDraft(saveDraft({ location: value })); }} placeholder="City, Country" /></label>
        </div>
      </section>}

      <div className="resume-note"><span>ⓘ</span><p><strong>Your original resume stays yours.</strong> PDP creates structured profile information from it; it does not fabricate experience or rewrite factual claims.</p></div>

      <section className="resume-next"><div><div className="media-kicker">NEXT STEP</div><h2>{file ? "Resume ready. Now add your proof." : "Upload your resume to continue."}</h2><p>{file ? "Continue to the Proof of Work page and connect real photos and videos to your experience." : "You can also explore the product first and come back to this step later."}</p></div><a className={"resume-continue " + (!file ? "disabled" : "")} href={file ? "/build-proof" : "#"} onClick={e => { if (!file) e.preventDefault(); }}>{file ? "Continue to Proof of Work →" : "Upload Resume First"}</a></section>
    </main>
  </div>;
}
