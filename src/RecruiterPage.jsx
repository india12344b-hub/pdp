import React from "react";
import pdpLogo from "./pdp-logo.png";

const RECRUITER_LOGIN = "/recruiters/login";

const BENEFITS = [
  ["01", "See proof, not just promises", "Go beyond a resume. Review relevant work photos, videos, projects and company-linked evidence before spending time on a call."],
  ["02", "Search by real experience", "Describe the capability you need and discover professionals through the work they have actually documented — not only job titles and keywords."],
  ["03", "Cut screening time", "A recruiter can understand role, tenure, skills, proof and credibility from one structured PDP instead of opening multiple documents and links."],
  ["04", "Reach the right person faster", "Shortlist profiles, save them for later and connect through WhatsApp when a candidate looks relevant."],
];

const DIFFERENT = [
  ["Resume", "What a professional says they have done"],
  ["PDP", "What they say + where they worked + visual proof of the work"],
  ["Recruiter outcome", "Less guesswork, faster screening and better-quality conversations"],
];

const WORKFLOW = [
  ["01", "Define", "Tell PDP what kind of professional or capability you need."],
  ["02", "Discover", "PDP surfaces relevant professional profiles and experience signals."],
  ["03", "Verify visually", "Open the PDP and inspect company-linked photos, videos, projects and reviews."],
  ["04", "Shortlist", "Save the profiles worth progressing — without losing them in a spreadsheet."],
  ["05", "Connect", "Reach the professional through the available contact channel, including WhatsApp."],
];

export default function RecruiterPage() {
  return (
    <div className="recruiter-page recruiter-landing">
      <header className="recruiter-topbar recruiter-marketing-bar">
        <a className="recruiter-brand" href="/"><img className="pdp-real-logo" src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
        <nav>
          <a className="active" href="#why-pdp">Why PDP</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#recruiter-benefits">Benefits</a>
          <a href="#trust">Trust & Proof</a>
        </nav>
        <div className="recruiter-auth-actions">
          <a className="recruiter-login-link" href={RECRUITER_LOGIN}>Recruiter Login</a>
          <a className="recruiter-primary-small" href={RECRUITER_LOGIN}>Get Recruiter Access</a>
        </div>
      </header>

      <main>
        <section className="recruiter-landing-hero" id="why-pdp">
          <div className="recruiter-hero-copy">
            <div className="recruiter-eyebrow">PDP FOR RECRUITERS</div>
            <h1>Hire with <em>more confidence.</em><br />Spend less time screening.</h1>
            <p className="recruiter-hero-lead">PDP gives recruiters a candidate-first professional profile where experience is connected to visual proof — so you can understand a person before the interview, not after it.</p>
            <div className="recruiter-hero-actions">
              <a className="recruiter-primary-btn" href={RECRUITER_LOGIN}>Login to Recruiter Account <span>→</span></a>
              <a className="recruiter-secondary-btn" href="#how-it-works">See how PDP works <span>↓</span></a>
            </div>
            <div className="recruiter-trust-line"><span>✓ Candidate-first</span><span>✓ Visual proof of work</span><span>✓ Built for faster screening</span></div>
          </div>
          <div className="recruiter-hero-visual" aria-label="PDP recruiter experience preview">
            <div className="recruiter-glow" />
            <div className="recruiter-screen recruiter-screen-main">
              <div className="screen-top"><span className="screen-dot" /><span>Candidate PDP</span><b>87 PDP Score</b></div>
              <div className="screen-profile">
                <div className="screen-avatar">RS</div>
                <div><strong>Senior Sales Professional</strong><small>8+ years · Distributor Management · BTL · New Markets</small></div>
                <span className="screen-verified">✓ Verified</span>
              </div>
              <div className="screen-proof-grid">
                <div><b>Work Proof</b><span>6 videos · 18 photos</span></div>
                <div><b>Experience</b><span>3 companies · 8+ years</span></div>
                <div><b>Reviews</b><span>4.8 ★ · 12 reviews</span></div>
              </div>
              <div className="screen-media-row"><span>▶ Project video</span><span>▣ Company proof</span><span>▣ Field activity</span></div>
            </div>
            <div className="recruiter-float recruiter-float-match"><small>RELEVANT EXPERIENCE</small><strong>Distributor Management · 5 yrs</strong><span>Evidence available</span></div>
            <div className="recruiter-float recruiter-float-time"><b>Less screening noise</b><span>One profile → experience → proof</span></div>
          </div>
        </section>

        <section className="recruiter-section recruiter-difference" id="recruiter-benefits">
          <div className="recruiter-section-heading"><div className="section-kicker">WHY PDP IS DIFFERENT</div><h2>A resume tells you what happened.<br /><em>PDP helps you see the evidence.</em></h2><p>The recruiter experience is designed around one question: <strong>“Can I trust what I am seeing enough to move this candidate forward?”</strong></p></div>
          <div className="recruiter-difference-grid">
            {DIFFERENT.map(([title, text], i) => <div className={`difference-card ${i === 1 ? "featured" : ""}`} key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section className="recruiter-section" id="trust">
          <div className="recruiter-section-heading centered"><div className="section-kicker">WHAT YOU GET</div><h2>Less searching. More understanding.</h2><p>PDP brings the most useful recruiter signals together before you spend time interviewing.</p></div>
          <div className="recruiter-benefit-grid">
            {BENEFITS.map(([num, title, text]) => <article className="recruiter-benefit-card" key={num}><b>{num}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </section>

        <section className="recruiter-section recruiter-workflow" id="how-it-works">
          <div className="recruiter-section-heading"><div className="section-kicker">HOW A RECRUITER USES PDP</div><h2>Requirement → Talent → Proof → Decision</h2><p>No need to upload a job opening on this page. This space is about helping recruiters discover and evaluate talent.</p></div>
          <div className="recruiter-workflow-grid">
            {WORKFLOW.map(([num, title, text]) => <div className="workflow-card" key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section className="recruiter-section recruiter-use-cases">
          <div className="recruiter-use-panel">
            <div><div className="section-kicker">USE PDP FOR REAL RECRUITING WORK</div><h2>Especially useful when a CV is not enough.</h2><p>For sales, operations, field roles, marketing, technical work, design, service and other roles where the difference is often in <strong>what the person has actually handled</strong>.</p></div>
            <div className="use-tags"><span>Distributor handling</span><span>BTL / Activations</span><span>Product launches</span><span>New market development</span><span>Client handling</span><span>Project work</span><span>Field execution</span><span>UX / Research</span></div>
          </div>
        </section>

        <section className="recruiter-section recruiter-cta">
          <div><div className="section-kicker">READY TO RECRUIT DIFFERENTLY?</div><h2>Start with a recruiter account.</h2><p>Login to discover PDP professionals, review their evidence and build your shortlist.</p></div>
          <a className="recruiter-primary-btn" href={RECRUITER_LOGIN}>Recruiter Login <span>→</span></a>
        </section>
      </main>
      <footer className="recruiter-footer"><span>mypdp.in</span><span>Trust · Transparency · Real Talent</span><a href={RECRUITER_LOGIN}>Recruiter Login</a></footer>
    </div>
  );
}
