import React, { useEffect, useState } from "react";
import { saveProfile } from "./pdpStorage";
import { getDraft, saveDraft } from "./pdpDraft";
import pdpLogo from "./pdp-logo.png";
import "./professionalLogin.css";

const GOOGLE_CLIENT_ID = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "";

export default function ProfessionalLoginPage() {
  const [email, setEmail] = useState(getDraft().email || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || document.querySelector("script[data-pdp-google-identity]")) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true; script.dataset.pdpGoogleIdentity = "true";
    script.onerror = () => showNotice("Google sign-in could not load. You can use email sign-in instead.", "error");
    document.head.appendChild(script);
  }, []);

  const showNotice = (message, type = "info") => { setNotice(message); setNoticeType(type); };

  const continueToResume = async (accountEmail) => {
    const draft = saveDraft({ email: accountEmail });
    await saveProfile({ ...draft, email: accountEmail }).catch(() => null);
    window.location.assign("/upload-resume");
  };

  const sendEmailCode = async (event) => {
    event?.preventDefault?.();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showNotice("Please enter a valid email address.", "error");
      return;
    }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/auth/email/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, purpose: "professional-onboarding" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "PDP email sign-in is not connected to the server yet.");
      setEmail(normalizedEmail); setStep("code");
      showNotice(data.message || "Check your inbox for your one-time sign-in code.", "success");
    } catch (error) {
      showNotice(error.message || "Could not send a sign-in code. Please try again.", "error");
    } finally { setBusy(false); }
  };

  const verifyEmailCode = async (event) => {
    event.preventDefault();
    if (!code.trim()) { showNotice("Enter the one-time code sent to your email.", "error"); return; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/auth/email/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.authenticated !== true) throw new Error(data.message || "The code could not be verified. Please check it and try again.");
      await continueToResume(email.trim().toLowerCase());
    } catch (error) {
      showNotice(error.message || "Email verification failed.", "error");
    } finally { setBusy(false); }
  };

  const googleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      showNotice("Google sign-in is not live yet. The Cloudflare authentication endpoint and VITE_GOOGLE_CLIENT_ID must be configured before accounts can be securely created.", "error");
      return;
    }
    if (!window.google?.accounts?.id) {
      showNotice("Google sign-in could not load. Check your connection and try again.", "error");
      return;
    }
    setBusy(true); setNotice("");
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const response = await fetch("/api/auth/google", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.authenticated !== true || !data.email) throw new Error(data.message || "Google sign-in could not be verified by PDP.");
          await continueToResume(data.email);
        } catch (error) {
          showNotice(error.message || "Google sign-in failed.", "error");
        } finally { setBusy(false); }
      }
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        setBusy(false);
        showNotice("Google sign-in popup was not shown. Please use email sign-in instead.", "error");
      }
    });
  };

  return <div className="pl-page">
    <header className="pl-topbar">
      <a href="/" aria-label="PDP home"><img src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
      <div className="pl-topbar-right"><span>Already have a profile?</span><a href="/pdp/me">View PDP</a></div>
    </header>
    <main className="pl-layout">
      <section className="pl-story">
        <div className="pl-eyebrow"><span className="pl-dot" /> YOUR CAREER, WITH PROOF</div>
        <h1>Your work deserves to be <em>seen.</em></h1>
        <p>Build a professional profile that goes beyond a resume—with real work evidence, career details and your own PDP link.</p>
        <div className="pl-benefits">
          <div><span>01</span><section><strong>Start with what you have</strong><small>Upload your existing resume, or create your profile manually.</small></section></div>
          <div><span>02</span><section><strong>Show real evidence</strong><small>Upload past work or capture new photos and videos through PDP.</small></section></div>
          <div><span>03</span><section><strong>Review before publishing</strong><small>You stay in control of the information shown on your profile.</small></section></div>
        </div>
        <div className="pl-trust-note"><span>✓</span> Free to create · You control what you publish</div>
      </section>

      <section className="pl-auth-card">
        <div className="pl-card-heading"><div className="pl-mini-mark">✓</div><div><div className="pl-eyebrow">PROFESSIONAL ACCESS</div><h2>Let’s get you started</h2><p>Sign in or create your PDP account.</p></div></div>
        <button className="pl-google-button" type="button" onClick={googleSignIn} disabled={busy}><span className="pl-google-g">G</span> Continue with Google</button>
        <div className="pl-or"><span /> <small>OR CONTINUE WITH EMAIL</small> <span /></div>
        {step === "email" ? <form onSubmit={sendEmailCode}>
          <label className="pl-label" htmlFor="pl-email">Email address</label>
          <input id="pl-email" className="pl-input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <button className="pl-primary-button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Continue with email →"}</button>
          <p className="pl-microcopy">We’ll send a one-time code to verify your email. No password to remember.</p>
        </form> : <form onSubmit={verifyEmailCode}>
          <div className="pl-code-heading"><strong>Check your email</strong><button type="button" onClick={() => { setStep("email"); setCode(""); setNotice(""); }}>Change email</button></div>
          <p className="pl-sent-to">Enter the sign-in code sent to <strong>{email}</strong>.</p>
          <label className="pl-label" htmlFor="pl-code">One-time code</label>
          <input id="pl-code" className="pl-input" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter code" value={code} onChange={e => setCode(e.target.value)} required />
          <button className="pl-primary-button" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify & continue →"}</button>
          <button className="pl-resend" type="button" onClick={sendEmailCode} disabled={busy}>Send a new code</button>
        </form>}
        {notice && <div className={`pl-notice ${noticeType}`} role="status">{notice}</div>}
        <div className="pl-next-note"><span>Next step</span><p>After sign-in, upload your resume. Don’t have one? You’ll be able to create your profile manually.</p></div>
        <p className="pl-terms">By continuing, you agree to use PDP honestly and provide authentic information and evidence.</p>
      </section>
    </main>
    <footer className="pl-footer"><a href="/professionals">← Back to For Professionals</a><span>Professional Digital Profile</span><a href="/recruiters">For Recruiters →</a></footer>
  </div>;
}
