import React, { useState } from "react";
import pdpLogo from "./pdp-logo.png";
import cityBg from "./city-bg.png";
import palImage from "./pdp-pal.png";

const plans = [
  {
    name: "Starter",
    badge: "Best for small teams",
    price: "₹1,999",
    suffix: "/ month",
    text: "A simple way to start hiring with PDP.",
    features: ["Up to 50 candidate searches / month", "Verified PDP profiles", "Videos, photos & project proof", "Basic filters: location, skills, experience", "WhatsApp connect", "Email support"],
    cta: "Start with 3 Free Searches",
    primary: true,
  },
  {
    name: "Professional",
    badge: "Most Popular",
    price: "₹4,999",
    suffix: "/ month",
    text: "For growing teams with regular hiring needs.",
    features: ["Up to 200 candidate searches / month", "Advanced filters: industry, role, skills", "PDP Score & talent ranking", "Compare candidates side by side", "WhatsApp & email connect", "Priority support"],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    badge: "Custom plan",
    price: "Custom Pricing",
    suffix: "",
    text: "For large teams and high-volume hiring.",
    features: ["Unlimited candidate searches", "Dedicated account manager", "ATS / HR tool integrations", "Advanced analytics & reports", "Bulk hiring support", "Priority support"],
    cta: "Contact Sales",
  },
];

const rows = [
  ["Monthly candidate searches", "50", "200", "Custom"],
  ["Verified PDP profiles", "✓", "✓", "✓"],
  ["Videos, photos & project proof", "✓", "✓", "✓"],
  ["Advanced search filters", "—", "✓", "✓"],
  ["PDP Score & ranking", "—", "✓", "✓"],
  ["Compare candidates", "—", "✓", "✓"],
  ["WhatsApp connect", "✓", "✓", "✓"],
  ["Priority / dedicated support", "—", "✓", "✓"],
];

export default function RecruiterSubscriptionPage() {
  const [trialStarted, setTrialStarted] = useState(false);

  const startTrial = () => {
    setTrialStarted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rsub-page">
      <header className="rsub-nav">
        <a href="/" className="rsub-brand"><img src={pdpLogo} alt="mypdp.in" /></a>
        <nav>
          <a href="/">Home</a>
          <a href="/professionals">For Professionals</a>
          <a href="/recruiters">For Recruiters</a>
          <a className="active" href="/recruiters/subscription">Pricing</a>
        </nav>
        <div className="rsub-nav-actions">
          <a href="/recruiters/login" className="rsub-login">Recruiter Login</a>
          <a href="/recruiters/subscription" className="rsub-top-cta" onClick={(e) => { e.preventDefault(); startTrial(); }}>3 Free Searches</a>
        </div>
      </header>

      {trialStarted && <div className="rsub-trial-banner"><strong>3 free candidate searches.</strong> No credit card required. Explore PDP before choosing a plan. <button onClick={() => setTrialStarted(false)}>×</button></div>}

      <main>
        <section className="rsub-hero">
          <div className="rsub-hero-copy">
            <div className="rsub-kicker">RECRUITER SUBSCRIPTION</div>
            <h1>Find the Right Talent.<br /><span>Faster.</span></h1>
            <p>Unlock access to verified, visually proven talent. Start with <strong>3 free candidate searches</strong>, then choose a plan that fits your hiring needs.</p>
            <div className="rsub-mini-benefits">
              <span>ϟ <b>Save Time</b><small>Skip endless CVs</small></span>
              <span>◉ <b>See Real Proof</b><small>Videos, photos & work</small></span>
              <span>✓ <b>Hire with Confidence</b><small>Trusted profiles</small></span>
            </div>
          </div>
          <div className="rsub-hero-art">
            <div className="rsub-profile-float">
              <div className="rsub-profile-video"><span>▶</span><b>Rahul Sharma</b><small>Senior Software Engineer</small></div>
              <div className="rsub-score"><strong>87</strong><small>PDP Score /100</small></div>
              <div className="rsub-tags"><i>React</i><i>Node.js</i><i>AWS</i><i>+3</i></div>
            </div>
            <div className="rsub-pal-bubble"><img src={palImage} alt="PDP Pal" /><div><b>PDP Pal</b><span>Found 9 candidates who match your requirement. Want to see the strongest proof?</span></div></div>
          </div>
        </section>

        <section className="rsub-plans" id="plans">
          <div className="rsub-section-heading"><div className="rsub-pill">CHOOSE YOUR PLAN</div><h2>Simple Plans. <span>Powerful Results.</span></h2><p>Start with <strong>3 free searches</strong>. Upgrade when you are ready.</p></div>
          <div className="rsub-new-card"><b>New to PDP?</b><span>Try it free with 3 searches. No credit card required.</span></div>
          <div className="rsub-plan-grid">
            {plans.map((plan) => <article className={`rsub-plan ${plan.primary ? "featured" : ""}`} key={plan.name}>
              <div className="rsub-plan-badge">{plan.badge}</div>
              <h3>{plan.name}</h3>
              <p className="rsub-plan-text">{plan.text}</p>
              <div className="rsub-price">{plan.price} <small>{plan.suffix}</small></div>
              <ul>{plan.features.map((f) => <li key={f}><span>✓</span>{f}</li>)}</ul>
              <button className={plan.primary ? "rsub-primary" : "rsub-secondary"} onClick={() => plan.primary ? startTrial() : window.alert("Subscription checkout will be connected here.")}>{plan.cta}</button>
            </article>)}
          </div>
        </section>

        <section className="rsub-compare">
          <div className="rsub-section-heading left"><div className="rsub-pill">COMPARE PLANS</div><h2>Everything you need to <span>hire smarter.</span></h2></div>
          <div className="rsub-compare-grid">
            <div className="rsub-table-wrap"><table><thead><tr><th>Feature</th><th>Starter</th><th>Professional</th><th>Enterprise</th></tr></thead><tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i > 0 && c === "✓" ? "yes" : ""}>{c}</td>)}</tr>)}</tbody></table></div>
            <aside className="rsub-pal-card"><img src={palImage} alt="PDP Pal" /><div className="rsub-pill">MEET PDP PAL</div><h3>Your recruiting assistant.</h3><p>PDP Pal helps you understand requirements, find relevant skills and experience, explain candidate proof and support shortlist decisions.</p><ul><li>✓ Understand hiring needs</li><li>✓ Find relevant experience</li><li>✓ Explain proof & media</li><li>✓ Compare options faster</li></ul><a href="/recruiters/login">Try PDP Pal Now →</a></aside>
          </div>
        </section>

        <section className="rsub-cta" style={{backgroundImage:`linear-gradient(rgba(2,12,22,.35),rgba(2,12,22,.84)), url(${cityBg})`}}>
          <div className="rsub-pill">READY TO HIRE SMARTER?</div><h2>Get started with <span>3 free searches.</span></h2><p>Explore real talent first. Subscribe when PDP proves its value.</p><button onClick={startTrial}>Start Free Trial →</button><small>No credit card required</small>
        </section>
      </main>

      <footer className="rsub-footer"><div><img src={pdpLogo} alt="mypdp.in" /><span>Your Performance Display Platform</span></div><nav><a href="/">Home</a><a href="/professionals">For Professionals</a><a href="/recruiters">For Recruiters</a><a href="/recruiters/login">Recruiter Login</a></nav></footer>
    </div>
  );
}
