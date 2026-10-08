import React, { useEffect, useState } from "react";
import { setAuthToken } from "./pdpStorage";
import pdpLogo from "./pdp-logo.png";

const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "";

export default function RecruiterLoginPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || document.querySelector("script[data-pdp-google-identity]")) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.pdpGoogleIdentity = "true";
    script.onerror = () => showNotice("Google sign-in could not load. You can use email sign-in instead.", "error");
    document.head.appendChild(script);
  }, []);

  const showNotice = (message, type = "info") => {
    setNotice(message);
    setNoticeType(type);
  };

  const finishLogin = (accountEmail, authToken) => {
    if (authToken) setAuthToken(authToken);
    localStorage.setItem("pdp-account-role", "recruiter");
    localStorage.setItem("pdp-account-email", accountEmail);
    window.location.assign("/recruiters/candidates");
  };

  const continueWithEmail = async (event) => {
    event?.preventDefault?.();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showNotice("Please enter a valid work email address.", "error");
      return;
    }
    setBusy(true); setNotice("");
    try {
      // Phase 1: frictionless email login. No OTP/password is required.
      const token = crypto.randomUUID();
      setAuthToken(token);
      finishLogin(normalizedEmail, token);
    } catch (error) {
      showNotice(error.message || "Could not continue with email. Please try again.", "error");
    } finally { setBusy(false); }
  };

  const googleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      showNotice("Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID and connect the /api/auth/google endpoint.", "error");
      return;
    }
    if (!window.google?.accounts?.id) {
      showNotice("Google sign-in could not load. Please use email sign-in instead.", "error");
      return;
    }
    setBusy(true);
    setNotice("");
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential, role: "recruiter" })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.authenticated !== true || !data.email) throw new Error(data.message || "Google sign-in could not be verified by PDP.");
          finishLogin(data.email, data.token);
        } catch (error) {
          showNotice(error.message || "Google sign-in failed.", "error");
        } finally {
          setBusy(false);
        }
      }
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        setBusy(false);
        showNotice("Google sign-in popup was not shown. Please use email sign-in instead.", "error");
      }
    });
  };

  return <div className="recruiter-login-page">
    <header className="recruiter-login-topbar"><a href="/" className="recruiter-login-brand"><img src={pdpLogo} alt="mypdp.in" /></a><a href="/recruiters" className="recruiter-login-back">← Recruiter page</a></header>
    <main className="recruiter-login-main">
      <div className="recruiter-login-art"><div className="login-art-glow" /><div className="login-art-card"><span>RECRUITER WORKSPACE</span><h2>Find talent.<br />See the proof.</h2><div><b>✓</b> Experience-linked evidence</div><div><b>✓</b> Visual work proof</div><div><b>✓</b> Faster candidate screening</div></div></div>
      <section className="recruiter-login-card">
        <div className="section-kicker">RECRUITER ACCOUNT</div><h1>Welcome back.</h1><p>Login to your PDP recruiter workspace and start discovering professionals. <strong>PDP Pal</strong> can assist you inside the workspace with requirements, candidate evidence and shortlisting.</p>
        <button type="button" className="google-login-btn" onClick={googleSignIn} disabled={busy}><span className="google-g">G</span> Continue with Google</button>
        <div className="login-divider"><span>or continue with email</span></div>
        <form onSubmit={continueWithEmail}>
          <label>WORK EMAIL</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" required />
          <button className="login-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : <>Continue <span>→</span></>}</button>
          <p className="login-note">No OTP or password required for now. Email verification can be added later.</p>
        </form>
        {notice && <div className={`login-message ${noticeType}`} role="status">{notice}</div>}
        <div className="recruiter-trial-card"><strong>New to PDP?</strong><span>Start with 3 free candidate searches. No credit card required.</span><a href="/recruiters/subscription">View plans & subscription →</a></div><p className="login-note">Recruiter accounts are for authorised hiring professionals and organisations.</p>
      </section>
    </main>
  </div>;
}
