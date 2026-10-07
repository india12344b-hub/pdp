import React, { useState } from "react";
import pdpLogo from "./pdp-logo.png";
import heroVisual from "./hero-bg.png";
import proofDevice from "./proof-device.png";
import recruiterWork from "./recruiter-work.png";
import cityBg from "./city-bg.png";
import palImage from "./pdp-pal.png";

const LOGIN = "/recruiters/login";

const proofItems = [
  ["▣", "Visual Proof", "Videos, photos, projects, presentations and real work evidence."],
  ["♙", "Relevant Experience", "Find talent with specific skills, roles and industry experience."],
  ["✓", "Trusted Information", "Work history connected to companies and real-world evidence."],
  ["◉", "Smarter Hiring", "Make faster, more confident decisions with complete context."],
];

const benefits = [
  ["ϟ", "Screen Faster", "See real skills and work upfront."],
  ["▣", "Compare Easily", "Visual format makes evaluation simple."],
  ["♙", "Reduce Interview Rounds", "Pre-qualify with real evidence."],
  ["◎", "Improve Quality of Hire", "Better fit, lower attrition."],
];

const workflow = [
  ["01", "Set Your Requirement", "Search by skills, experience, location, industry or capability."],
  ["02", "Discover Talent", "Explore verified profiles with relevant media & proof."],
  ["03", "Review & Evaluate", "Watch videos, check experience, read reviews and more."],
  ["04", "Shortlist & Connect", "Reach out via WhatsApp directly from the profile."],
];

export default function RecruiterPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const openLogin = (e) => {
    e?.preventDefault();
    setMessage("");
    setLoginOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessage("Your recruiter login flow is ready. Email verification will be connected to the recruiter account backend.");
  };

  return (
    <div className="rp-page">
      <header className="rp-nav">
        <a href="/" className="rp-brand"><img src={pdpLogo} alt="mypdp.in" /></a>
        <nav>
          <a href="/">Home</a>
          <a href="/professionals">For Professionals</a>
          <a className="active" href="/recruiters">For Recruiters</a>
          <a href="/recruiters/nexus-9">NEXUS-9</a><a href="#why">About</a>
          <a href="/recruiters/subscription">Pricing</a>
        </nav>
        <div className="rp-nav-right">
          <div className="rp-search">⌕ <span>Search by name, skills, location...</span></div>
          <a href={LOGIN} className="rp-login-outline" onClick={openLogin}>Recruiter Login</a>
          <button className="rp-access" onClick={() => { window.location.href = "/recruiters/subscription"; }}>Get Recruiter Access</button>
        </div>
      </header>

      <main>
        <section className="rp-hero">
          <div className="rp-hero-copy">
            <div className="rp-kicker">HIRE SMARTER. FASTER. BETTER.</div>
            <h1>See Real Talent.<br /><span>Not Just Resumes.</span></h1>
            <p>PDP gives you visual access to a candidate's actual work, skills and experience — so you can hire with confidence, reduce hiring risk and get better results.</p>
            <div className="rp-actions">
              <a href={LOGIN} className="rp-primary" onClick={openLogin}>♙ &nbsp; Login as Recruiter</a>
              <a href="/recruiters/nexus-9" className="rp-secondary">◉ &nbsp; Explore NEXUS-9</a>
            </div>
          </div>
          <div className="rp-hero-art">
            <img src={heroVisual} alt="Recruiter reviewing a PDP profile" />
          </div>
        </section>

        <section className="rp-section rp-difference" id="why">
          <div className="rp-heading narrow">
            <div className="rp-pill">WHY PDP IS DIFFERENT</div>
            <h2>More than a Resume.<br />It's <span>Real Proof.</span></h2>
            <p>While a resume tells you what a candidate says, PDP shows you what they've actually done.</p>
          </div>
          <div className="rp-proof-row">
            <div className="rp-compare">
              <div className="rp-compare-col"><h3>Traditional Resume</h3><p>✕ Self-declared information</p><p>✕ No proof of work</p><p>✕ Hard to verify</p><p>✕ High risk of exaggeration</p></div>
              <div className="rp-compare-col rp-highlight"><h3>PDP Profile</h3><p>✓ Verified work experience</p><p>✓ Videos, photos & projects</p><p>✓ Real company evidence</p><p>✓ Greater trust & transparency</p></div>
            </div>
            <div className="rp-device"><img src={proofDevice} alt="PDP candidate profile with proof" /></div>
            <div className="rp-proof-list">{proofItems.map(([icon,title,text]) => <div className="rp-proof-item" key={title}><i>{icon}</i><div><h3>{title}</h3><p>{text}</p></div></div>)}</div>
          </div>
        </section>

        <section className="rp-section rp-nexus-usp">
          <div className="rp-nexus-copy"><div className="rp-pill">OUR RECRUITER DIFFERENTIATOR</div><h2>Go beyond Boolean.<br/><span>Meet PDP NEXUS-9.</span></h2><p>Instead of simply matching keywords, PDP can understand the organisation, the role, the candidate's career story and available evidence — then rank the strongest fits and explain why.</p><div className="rp-nexus-actions"><a className="rp-primary" href="/recruiters/nexus-9">See NEXUS-9 in action →</a><a className="rp-secondary" href="/recruiters/candidates">Open candidate selection</a></div></div><div className="rp-nexus-mini"><div><b>Organisation DNA</b><span>+</span><b>Role DNA</b><span>+</span><b>Candidate Intelligence</b><span>+</span><b>Evidence</b></div><strong>Better Fit</strong><small>Ranked candidates with reasons, scores and areas to verify.</small></div>
        </section>

        <section className="rp-section rp-results">
          <div className="rp-work-image"><img src={recruiterWork} alt="Recruiter evaluating talent" /></div>
          <div className="rp-results-copy"><div className="rp-pill">SAVE TIME. GET BETTER OUTPUT.</div><h2>Built for Recruiters.<br /><span>Designed for Results.</span></h2><p>PDP helps you cut through the noise, so you can focus on what matters — finding the right talent.</p></div>
          <div className="rp-benefits">{benefits.map(([icon,title,text]) => <div key={title}><i>{icon}</i><h3>{title}</h3><p>{text}</p></div>)}</div>
        </section>

        <section className="rp-section rp-pal" id="pdp-pal-recruiter">
          <div className="rp-pal-art"><div className="rp-pal-orbit"></div><img src={palImage} alt="PDP Pal recruiting assistant" /></div>
          <div className="rp-pal-copy">
            <div className="rp-pill">MEET PDP PAL</div>
            <h2>Your recruiting assistant.<br /><span>Inside PDP.</span></h2>
            <p>PDP Pal helps recruiters work faster by understanding what you need, guiding you through candidate profiles and helping you make sense of the evidence — instead of making you search through everything yourself.</p>
            <div className="rp-pal-grid">
              <div><i>⌕</i><div><h3>Understand the requirement</h3><p>Turn a role requirement into the experience and capability signals that matter.</p></div></div>
              <div><i>◉</i><div><h3>Find relevant talent</h3><p>Guide your search toward profiles with matching skills, experience and proof.</p></div></div>
              <div><i>▣</i><div><h3>Explain candidate proof</h3><p>Help you quickly understand what a video, photo, project or company evidence demonstrates.</p></div></div>
              <div><i>☆</i><div><h3>Help build the shortlist</h3><p>Compare the information you have and support faster, more confident decisions.</p></div></div>
            </div>
            <div className="rp-pal-note">Ask PDP Pal questions while you recruit — by text or voice where available.</div>
          </div>
        </section>

        <section className="rp-section rp-how" id="how">
          <div className="rp-pill">HOW IT WORKS</div>
          <h2>From Discovery to Shortlist —<br />In Just a Few Steps</h2>
          <div className="rp-workflow">{workflow.map(([num,title,text],i) => <React.Fragment key={num}><div className="rp-step"><div className="rp-step-icon">{["⌕","♙","◉","☆"][i]}</div><b>{num}</b><h3>{title}</h3><p>{text}</p></div>{i<workflow.length-1 && <div className="rp-arrow">→</div>}</React.Fragment>)}</div>
        </section>

        <section className="rp-section rp-loved">
          <div><div className="rp-pill">WHAT RECRUITERS LOVE</div><h2>Real Talent. <span>Real Impact.</span></h2><p>Join leading companies already hiring on PDP with a smarter approach to recruitment.</p></div>
          <div className="rp-stats"><div><strong>10K+</strong><span>Verified Candidates</span></div><div><strong>500+</strong><span>Hiring Companies</span></div><div><strong>70%</strong><span>Faster Screening</span></div><div><strong>Higher</strong><span>Quality Hires</span></div></div>
          <div className="rp-quote">“PDP has completely changed the way we hire. We get to see real work, not just claims. It saves us hours and helps us make much better decisions.”<b>— HR Manager</b><small>Leading FMCG Company</small></div>
        </section>

        <section className="rp-cta" id="cta" style={{backgroundImage:`linear-gradient(rgba(2,12,22,.22),rgba(2,12,22,.76)), url(${cityBg})`}}>
          <h2>Ready to hire better?</h2><p>Join thousands of recruiters who trust PDP for verified, visual and authentic talent.</p>
          <div className="rp-actions"><a href={LOGIN} className="rp-primary" onClick={openLogin}>♙ &nbsp; Login as Recruiter</a><a href="/recruiters/subscription" className="rp-secondary">♙ &nbsp; Get Recruiter Access</a></div>
          <small><a href="/recruiters/subscription">View recruiter plans</a> &nbsp; | &nbsp; Questions? &nbsp;<a href="mailto:support@mypdp.in">Contact us</a> &nbsp; | &nbsp; support@mypdp.in</small>
        </section>
      </main>

      <footer className="rp-footer"><div className="rp-footer-brand"><img src={pdpLogo} alt="mypdp.in" /><span>Your Performance Display Platform</span></div><div className="rp-footer-links"><a href="/">Home</a><a href="/professionals">For Professionals</a><a href="/recruiters">For Recruiters</a><a href="/recruiters/nexus-9">NEXUS-9</a><a href="#why">About</a><a href="#cta">Contact</a></div><div className="rp-social">in &nbsp; ▶ &nbsp; 𝕏</div></footer>

      {loginOpen && <div className="rp-overlay" onMouseDown={e => e.target===e.currentTarget && setLoginOpen(false)}><div className="rp-login-modal"><button className="rp-close" onClick={()=>setLoginOpen(false)}>×</button><div className="rp-pill">RECRUITER ACCOUNT</div><h2>Welcome back.</h2><p>Login to discover PDP professionals, review proof and build your shortlist.</p><button className="rp-google" onClick={()=>setMessage("Google login will connect to the recruiter account backend.")}><b>G</b> Continue with Google</button><div className="rp-or"><span>or continue with email</span></div><form onSubmit={submit}><label>WORK EMAIL</label><input type="email" required value={email} onChange={e=>{setEmail(e.target.value);setMessage("")}} placeholder="name@company.com"/><button className="rp-primary full">Continue →</button></form>{message && <div className="rp-message">{message}</div>}<a className="rp-full-login" href={LOGIN}>Open full recruiter login page →</a></div></div>}
    </div>
  );
}
