import React, { useState } from "react";
import pdpLogo from "./pdp-logo.png";

export default function RecruiterLoginPage() {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("email");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => { e.preventDefault(); if (!email.trim()) return; setSubmitted(true); };

  return <div className="recruiter-login-page">
    <header className="recruiter-login-topbar"><a href="/" className="recruiter-login-brand"><img src={pdpLogo} alt="mypdp.in" /></a><a href="/recruiters" className="recruiter-login-back">← Recruiter page</a></header>
    <main className="recruiter-login-main">
      <div className="recruiter-login-art"><div className="login-art-glow" /><div className="login-art-card"><span>RECRUITER WORKSPACE</span><h2>Find talent.<br />See the proof.</h2><div><b>✓</b> Experience-linked evidence</div><div><b>✓</b> Visual work proof</div><div><b>✓</b> Faster candidate screening</div></div></div>
      <section className="recruiter-login-card">
        <div className="section-kicker">RECRUITER ACCOUNT</div><h1>Welcome back.</h1><p>Login to your PDP recruiter workspace and start discovering professionals. <strong>PDP Pal</strong> can assist you inside the workspace with requirements, candidate evidence and shortlisting.</p>
        <button type="button" className="google-login-btn" onClick={() => setSubmitted(true)}><span className="google-g">G</span> Continue with Google</button>
        <div className="login-divider"><span>or continue with email</span></div>
        <form onSubmit={submit}>
          <label>WORK EMAIL</label><input type="email" value={email} onChange={e => { setEmail(e.target.value); setSubmitted(false); }} placeholder="name@company.com" autoComplete="email" />
          {mode === "email" && <button className="login-submit" type="submit">Continue <span>→</span></button>}
        </form>
        {submitted && <div className="login-message">Your login flow is ready. Email/Google verification will be connected to the recruiter account backend.</div>}
        <p className="login-note">Recruiter accounts are for authorised hiring professionals and organisations.</p>
      </section>
    </main>
  </div>;
}
