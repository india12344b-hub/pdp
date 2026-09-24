import React, { useEffect, useRef, useState } from "react";

/* ---------- Config: replace these before launch ---------- */
const SIGNUP_URL = "#signup"; // TODO: your real signup / app URL
const SOCIAL = {
  linkedin: "#", // TODO
  x: "#",        // TODO
  youtube: "#",  // TODO
};

/* ---------- Content ---------- */
const IMG = {
  hero: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
  work1: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80",
  work2: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80",
  work3: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80",
  trip: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80",
  certificate: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=700&q=80",
  recruiter: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=85",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
};

const NAV_LINKS = [
  { href: "#professionals", label: "For Professionals" },
  { href: "#recruiters", label: "For Recruiters" },
  { href: "#how", label: "How It Works" },
  { href: "#about", label: "About" },
];

const PROFILES = [
  { name: "Ananya R.", role: "Product Designer", meta: "12 projects · 3 work videos", img: IMG.hero },
  { name: "Karthik M.", role: "Full-Stack Engineer", meta: "6 career videos · 8 demos", img: IMG.work2 },
  { name: "Priya S.", role: "Brand Strategist", meta: "Campaign proof · Awards", img: IMG.work1 },
  { name: "Rahul T.", role: "Operations Lead", meta: "Site photos · Testimonials", img: IMG.work3 },
];

const PROOF_CARDS = [
  { icon: "▶", title: "Career Video", text: "Candidate explains their professional journey in their own voice.", img: IMG.hero },
  { icon: "▸", title: "Work Videos", text: "Project demos, product walkthroughs, real processes.", img: IMG.work2 },
  { icon: "▦", title: "Work Photos", text: "Teams, events, client meetings, site work, awards — genuine moments.", img: IMG.work3 },
  { icon: "✓", title: "Credentials & Proof", text: "Projects, outcomes, certificates, testimonials from real people.", img: IMG.certificate },
];

const SECTORS = [
  ["Technology & IT", "Software, product, data, AI & engineering"],
  ["Design & Creative", "UI/UX, graphic, content & visual design"],
  ["Business & Finance", "Sales, marketing, finance & operations"],
  ["Education", "Teachers, trainers, mentors & academic experts"],
  ["Healthcare", "Doctors, specialists & healthcare professionals"],
  ["More Sectors", "Explore professionals across industries"],
];

const PRO_FLOW = [
  ["01", "Create", "Build your professional identity"],
  ["02", "Showcase", "Add videos, photos, projects, proof"],
  ["03", "Share", "One link across resume, LinkedIn, WhatsApp"],
  ["04", "Get Discovered", "Recruiters see the real you"],
];

const COMPANY_FLOW = [
  ["01", "Post / Search", "Upload job or explore talent"],
  ["02", "Discover", "See relevant professionals"],
  ["03", "Review Proof", "Watch work, not just claims"],
  ["04", "Connect", "Shortlist & reach out"],
];

const RECRUITER_POINTS = [
  ["▣", "Evidence over claims", "Watch career videos, project demos and real work made before the interview."],
  ["◉", "Authenticity layer", "AI-generated content is prohibited. Real-self-first is built into the platform."],
  ["⌁", "Discovery that matters", "Find relevant talent and see the proof behind their experience."],
];

const INDUSTRY_INTEREST = [
  ["Technology", 31, 78],
  ["Finance", 18, 45],
  ["Engineering", 16, 40],
  ["Healthcare", 12, 30],
];

const FOOTER_LINKS = [
  { href: "#home", icon: "⌂", label: "Home" },
  { href: "#professionals", icon: "♙", label: "For Professionals" },
  { href: "#recruiters", icon: "▣", label: "For Recruiters" },
  { href: "#how", icon: "⌁", label: "How It Works" },
  { href: "#about", icon: "▤", label: "About" },
];

/* ---------- Small shared pieces ---------- */
function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function Play({ small = false }) {
  return <span className={small ? "play play-small" : "play"} aria-hidden="true">▶</span>;
}

function Img({ src, alt = "", eager = false }) {
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function Logo() {
  return (
    <a className="brand" href="#home" aria-label="PDP home">
      <span className="brand-mark"><span /></span>
      <span>
        <strong>PDP</strong>
        <small>Professional Digital Profile</small>
      </span>
    </a>
  );
}

function FlowRow({ color, title, items }) {
  return (
    <div className={`flow-group ${color}`}>
      <h3><span aria-hidden="true">♙</span>{title}</h3>
      <div className="flow-row">
        {items.map(([num, name, desc], i) => (
          <React.Fragment key={num}>
            <div className="flow-step"><b>{num}</b><strong>{name}</strong><small>{desc}</small></div>
            {i < items.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const scrollCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".talent-card");
    if (!card) return;
    const step = card.offsetWidth + 14; // gap between cards
    const max = el.scrollWidth - el.clientWidth;

    if (dir > 0 && el.scrollLeft >= max - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    }
  };

  /* AUTO-FLOW CAROUSEL TIMER */
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      scrollCards(1);
    }, 3500); // 3.5 seconds interval

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div className="site-shell" id="home">
      <header className="topbar">
        <Logo />
        <nav id="primary-nav" className={menuOpen ? "nav open" : "nav"} aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={closeMenu}>{l.label}</a>
          ))}
          <a className="nav-cta" href={SIGNUP_URL} onClick={closeMenu}>Create Your PDP</a>
        </nav>
        <button
          type="button"
          className="menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
        >
          <span /><span /><span />
        </button>
      </header>

      <main>
        {/* HERO */}
        <section className="hero section-pad">
          <div className="hero-copy">
            <div className="eyebrow">YOUR WORK. YOUR JOURNEY. YOUR STORY.</div>
            <h1>Go Beyond Resume.<br /><em>Your Work. Your Impact.</em></h1>
            <p className="hero-text">
              The candidate-first platform where professionals prove their work through real videos,
              projects, photos and evidence — not just claims.
            </p>
            <div className="button-row">
              <a className="btn primary" href={SIGNUP_URL}>Create Your PDP — Free <Arrow /></a>
              <a className="btn ghost" href="#profiles">Explore Talent <Arrow /></a>
            </div>
            <div className="trust-row">
              <span><b>✓</b>No AI-generated showcases</span>
              <span><b>✓</b>Real proof only</span>
              <span><b>✓</b>Free for professionals</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="floating-shot shot-project">
              <Img src={IMG.work1} />
              <span><Play small /> Project Demo</span>
            </div>
            <div className="floating-shot shot-team">
              <Img src={IMG.work3} />
              <span>Team Collaboration</span>
            </div>
            <div className="floating-shot shot-photos">
              <Img src={IMG.work2} />
              <span>Work Photos</span>
            </div>
            <div className="floating-shot shot-trip">
              <Img src={IMG.trip} />
              <span>Business Trip</span>
            </div>

            <div className="phone-card">
              <div className="phone-notch" />
              <Img src={IMG.hero} alt="PDP profile preview" eager />
              <div className="phone-overlay">
                <div className="profile-mini">
                  <span className="mini-logo" aria-hidden="true">◆</span>
                  <div><b>Ananya Sharma</b><small>Product Designer</small></div>
                  <span className="qr" aria-hidden="true">▦</span>
                </div>
                <p>Designing products that help people live.</p>
                <a href="#profiles" className="mini-btn">View Profile <Arrow /></a>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="proof section-pad" id="professionals">
          <div className="section-intro">
            <div className="eyebrow">WHAT MAKES PDP DIFFERENT</div>
            <h2>Proof of Work,<br /><em>not claims.</em></h2>
            <p>A resume can say what someone has done. PDP gives them a place to show evidence of what they have actually done.</p>
            <a className="text-link" href="#how">See How It Works <Arrow /></a>
          </div>
          <div className="proof-grid">
            {PROOF_CARDS.map((card) => (
              <article className="proof-card" key={card.title}>
                <div className="card-image">
                  <Img src={card.img} />
                  <span className="card-icon" aria-hidden="true">{card.icon}</span>
                </div>
                <div className="card-body"><h3>{card.title}</h3><p>{card.text}</p></div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTORS */}
        <section className="sector-talent section-pad" id="sectors">
          <div className="section-intro">
            <div className="eyebrow">TALENT BY SECTOR</div>
            <h2>Find professionals <em>for your industry.</em></h2>
            <p>Explore PDP profiles by sector and discover people with real work, projects, photos and proof behind their experience.</p>
          </div>
          <div className="sector-grid">
            {SECTORS.map(([title, desc]) => (
              <a className="sector-card" href="#profiles" key={title}>
                <span className="sector-dot" aria-hidden="true">↗</span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </a>
            ))}
          </div>
        </section>

        {/* PEOPLE */}
        <section className="profiles section-pad" id="profiles">
          <div className="section-intro">
            <div className="eyebrow">PEOPLE ON PDP</div>
            <h2>A living exhibition<br /><em>of professionals.</em></h2>
            <p>Not a job board. A showcase of real people and the work behind their claims.</p>
            <a className="text-link" href="#sectors">Browse by Sector <Arrow /></a>
          </div>
          <div
            className="profile-showcase"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="profile-controls">
              <button type="button" onClick={() => scrollCards(-1)} aria-label="Previous profiles">←</button>
              <button type="button" onClick={() => scrollCards(1)} aria-label="Next profiles">→</button>
            </div>
            <div className="profile-track" ref={trackRef}>
              {/* Duplicated profiles array so auto-flow feels continuous */}
              {[...PROFILES, ...PROFILES].map((p, idx) => (
                <article className="talent-card" key={`${p.name}-${idx}`}>
                  <div className="talent-image">
                    <Img src={p.img} />
                    <span className="talent-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="talent-info">
                    <h3>{p.name}</h3>
                    <strong>{p.role}</strong>
                    <p>{p.meta}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine-print">Sample profiles shown for preview.</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how section-pad" id="how">
          <div className="section-intro how-title">
            <div className="eyebrow">HOW PDP WORKS</div>
            <h2>Simple. Powerful.<br /><em>Evidence-first.</em></h2>
          </div>
          <div className="how-content">
            <div className="device-wrap">
              <div className="mini-phone">
                <div className="phone-notch" />
                <Img src={IMG.hero} />
                <div className="mini-phone-content"><Play /><b>Ananya Sharma</b><small>Product Designer</small></div>
              </div>
              <div className="scribble">Real people.<br />Real work.<br />Real impact.</div>
            </div>
            <div className="flows">
              <FlowRow color="blue" title="For Professionals" items={PRO_FLOW} />
              <a className="learn" href="#professionals">Learn More <Arrow /></a>
              <FlowRow color="purple" title="For Companies" items={COMPANY_FLOW} />
              <a className="learn" href="#recruiters">Learn More <Arrow /></a>
            </div>
          </div>
        </section>

        {/* RECRUITERS */}
        <section className="recruiter-banner section-pad" id="recruiters">
          <div className="recruiter-copy">
            <div className="eyebrow">FOR RECRUITERS</div>
            <h2>See the person. See the work. See the evidence.</h2>
            <div className="recruiter-points">
              {RECRUITER_POINTS.map(([icon, title, text]) => (
                <div key={title}>
                  <b aria-hidden="true">{icon}</b>
                  <span><strong>{title}</strong><small>{text}</small></span>
                </div>
              ))}
            </div>
            <a className="btn ghost" href="#how">Learn More <Arrow /></a>
          </div>
          <div className="recruiter-image">
            <Img src={IMG.recruiter} alt="Recruiter viewing a professional profile" />
            <span>Real work.<br />Real talent.</span>
          </div>
        </section>

        {/* MARKET */}
        <section className="market section-pad" id="about">
          <div className="market-copy">
            <div className="eyebrow">WHAT THE MARKET IS LOOKING FOR</div>
            <h2>Your resume tells your story.<br /><em>Your PDP shows it.</em></h2>
            <p>Free for professionals. Built for proof.</p>
            <a className="btn primary" href={SIGNUP_URL}>Create Your PDP — Free <Arrow /></a>
          </div>
          <div className="market-visual">
            <Img src={IMG.mountain} />
            <div className="interest-panel">
              <h3>Top Industry Interest</h3>
              {INDUSTRY_INTEREST.map(([label, pct, width]) => (
                <div className="bar" key={label}>
                  <span>● {label}</span><b>{pct}%</b><i style={{ width: `${width}%` }} />
                </div>
              ))}
              <small>Sample figures for illustration. Replace with live data before launch.</small>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta section-pad" id="create">
          <div>
            <h2>Build your professional presence.</h2>
            <p>Showcase your work. Get discovered.</p>
          </div>
          <a className="btn primary" href={SIGNUP_URL}>Create Your PDP — Free <Arrow /></a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <Logo />
          <div className="footer-message">Build your professional presence.<br /><strong>Showcase your work. Get discovered.</strong></div>
          <a className="btn primary" href={SIGNUP_URL}>Create Your PDP — Free <Arrow /></a>
        </div>
        <div className="footer-bottom">
          <nav aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href}><span aria-hidden="true" style={{ fontSize: "1rem" }}>{l.icon}</span><span>{l.label}</span></a>
            ))}
          </nav>
          <div className="socials">
            <a href={SOCIAL.linkedin} aria-label="LinkedIn">in</a>
            <a href={SOCIAL.x} aria-label="X">𝕏</a>
            <a href={SOCIAL.youtube} aria-label="YouTube">▶</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;