import React, { useRef, useState } from "react";

export default function ResumeUploadPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);

  const acceptFile = (f) => {
    if (!f) return;
    const ok = /\.(pdf|doc|docx)$/i.test(f.name) || ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type);
    if (ok) { setFile(f); setSaved(false); }
  };

  return <div className="resume-page">
    <header className="resume-topbar">
      <a className="media-brand" href="/"><span className="media-mark"><span /></span><span><strong>PDP</strong><small>Professional Digital Profile</small></span></a>
      <nav className="journey-nav">
        <a href="/">Home</a><a href="/professionals">For Professionals</a><a className="active" href="/upload-resume">Resume</a><a href="/build-proof">Proof of Work</a><a href="/pdp/ananya">My PDP</a><a href="/recruiters">Recruiters</a>
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
        <div className="resume-copy"><span className="resume-number">01</span><div><h2>Upload your original resume</h2><p>Keep your original document intact. PDP will use it as the source for your professional information.</p></div></div>
        <div className={"resume-drop " + (dragging ? "dragging" : "")} onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]); }}>
          {file ? <div className="resume-file"><div className="file-icon">PDF</div><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to process</small></div><button onClick={e => { e.stopPropagation(); setFile(null); }}>Remove</button></div> : <><div className="resume-upload-icon">↑</div><strong>Drop your resume here</strong><span>or click to browse</span><small>PDF, DOC or DOCX</small></>}
          <input ref={inputRef} type="file" hidden accept=".pdf,.doc,.docx,application/pdf" onChange={e => acceptFile(e.target.files?.[0])}/>
        </div>
      </section>

      <div className="resume-note"><span>ⓘ</span><p><strong>Your original resume stays yours.</strong> PDP creates structured profile information from it; it does not fabricate experience or rewrite factual claims.</p></div>

      <section className="resume-next"><div><div className="media-kicker">NEXT STEP</div><h2>{file ? "Resume ready. Now add your proof." : "Upload your resume to continue."}</h2><p>{file ? "Continue to the Proof of Work page and connect real photos and videos to your experience." : "You can also explore the product first and come back to this step later."}</p></div><a className={"resume-continue " + (!file ? "disabled" : "")} href={file ? "/build-proof" : "#"} onClick={e => { if (!file) e.preventDefault(); }}>{file ? "Continue to Proof of Work →" : "Upload Resume First"}</a></section>
    </main>
  </div>;
}