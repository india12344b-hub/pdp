import React, { useEffect, useRef, useState } from "react";

/* ---------- Config ---------- */
const SIGNUP_URL = "#signup";
const SOCIAL = {
  linkedin: "#",
  x: "#",
  youtube: "#",
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
  profileAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  caseStudy: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
  achievements: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  endorsements: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80",
  dashboard: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
};

const NAV_LINKS = [
  { href: "/professionals", label: "For Professionals" },
  { href: "#recruiters", label: "For Recruiters" },
  { href: "#how", label: "How It Works" },
  { href: "#about", label: "About" },
];

const SECTORS = [
  { id: "all", title: "All Sectors" },
  { id: "tech", title: "Technology & IT" },
  { id: "design", title: "Design & Creative" },
  { id: "business", title: "Business & Finance" },
  { id: "education", title: "Education" },
  { id: "healthcare", title: "Healthcare" },
];

const ALL_PROFILES = [
  { name: "Ananya R.", role: "Product Designer", sector: "design", meta: "12 projects · 3 work videos", img: IMG.hero },
  { name: "Karthik M.", role: "Full-Stack Engineer", sector: "tech", meta: "6 career videos · 8 demos", img: IMG.work2 },
  { name: "Priya S.", role: "Brand Strategist", sector: "business", meta: "Campaign proof · Awards", img: IMG.work1 },
  { name: "Rahul T.", role: "Operations Lead", sector: "business", meta: "Site photos · Testimonials", img: IMG.work3 },
  { name: "Dr. Ayesha K.", role: "Medical Specialist", sector: "healthcare", meta: "Research · Clinic logs", img: IMG.hero },
  { name: "Vikram P.", role: "UI/UX Researcher", sector: "design", meta: "8 Case Studies · Wireframes", img: IMG.work1 },
];

const PROOF_CARDS = [
  { icon: "▶", title: "Career Video", text: "Candidate explains their professional journey in their own voice.", img: IMG.hero },
  { icon: "▸", title: "Work Videos", text: "Project demos, product walkthroughs, real processes.", img: IMG.work2 },
  { icon: "▦", title: "Work Photos", text: "Teams, events, client meetings, site work, awards — genuine moments.", img: IMG.work3 },
  { icon: "✓", title: "Credentials & Proof", text: "Projects, outcomes, certificates, testimonials from real people.", img: IMG.certificate },
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

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function Play({ small = false }) {
  return <span className={small ? "play play-small" : "play"} aria-hidden="true">▶</span>;
}

function Img({ src, alt = "", eager = false }) {
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function Logo({ onNavigate }) {
  return (
    <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); onNavigate("/"); }} aria-label="PDP home">
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

/* ---------- Sub-View: Professionals Page ---------- */
function ProfessionalsView({ onNavigate }) {
  return (
    <div className="pd2-page">
      {/* Topbar */}
      <header className="pd2-topbar">
        <div className="pd2-brand" onClick={() => onNavigate("/")} style={{ cursor: "pointer" }}>
          <div className="pd2-mark"><span /></div>
          <div>
            <strong>PDP</strong>
            <small>FOR PROFESSIONALS</small>
          </div>
        </div>

        <nav>
          <a href="#pd2-how" className="active">How It Works</a>
          <a href="#pd2-features">Features</a>
          <a href="#pd2-proof">Proof & Credibility</a>
          <a href="#pd2-testimonials">Testimonials</a>
          <a href="#pd2-story">Career Story</a>
        </nav>

        <a href={SIGNUP_URL} className="pd2-header-cta">Get Started</a>

        <button className="pd2-menu" aria-label="Toggle Menu">
          <span /><span /><span />
        </button>
      </header>

      {/* Hero */}
      <section className="pd2-hero">
        <div className="pd2-hero-copy">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate("/"); }} className="pd2-back">
            <span>←</span> Back to Main Landing
          </a>
          <h1>
            Stand Out to Employers with a <em>Living Profile</em>
          </h1>
          <p>
            Transform your static resume into an interactive, proof-backed digital portfolio designed for modern professionals and recruiters.
          </p>
          <div className="pd2-actions">
            <a href={SIGNUP_URL} className="pd2-btn primary">Create Your PDP</a>
            <a href="#pd2-proof" className="pd2-btn outline">View Proof Demo</a>
          </div>
          <div className="pd2-trust">
            <span><b>✓</b> Verified Credentials</span>
            <span><b>✓</b> Recruiter Ready</span>
          </div>
        </div>

        <div className="pd2-hero-art">
          <div className="pd2-hero-glow" />
          <Img src={IMG.hero} alt="Professional Hero" className="pd2-hero-person" />

          {/* Floating Badges */}
          <div className="pd2-float career">
            <span>Career Video</span>
            <i>▶</i>
          </div>
          <div className="pd2-float photos">
            <span>Work Photos</span>
          </div>
          <div className="pd2-float projects">
            <span>Projects</span>
          </div>
          <div className="pd2-float cert">
            <div className="pd2-cert-art">📜</div>
            <span>Certifications</span>
          </div>
          <div className="pd2-float achievement">
            <div className="pd2-mini-chart">📈</div>
            <span>Achievements</span>
          </div>
          <div className="pd2-float recommendation">
            <div className="pd2-people">👥</div>
            <span>Recommendations</span>
          </div>

          {/* Profile Card */}
          <div className="pd2-profile-card">
            <div className="pd2-avatar">
              <Img src={IMG.profileAvatar} alt="Ananya Sharma" />
            </div>
            <div>
              <strong>Ananya Sharma <span>•</span></strong>
              <small>Product Designer</small>
              <p>Designing products that people love.</p>
              <div className="pd2-tags">
                <i>UI/UX</i>
                <i>Design</i>
                <i>Product</i>
              </div>
            </div>
            <div className="pd2-qr">📱</div>
          </div>
        </div>
      </section>

      {/* Section 01 */}
      <section className="pd2-section pd2-two-col" id="pd2-how">
        <div className="pd2-section-copy">
          <div className="pd2-no">01</div>
          <div>
            <h2>Turn Your Resume Into Your Professional Identity</h2>
            <p>
              Upload your existing resume. We structure your experience into a living professional profile that stands out to recruiters and peers alike.
            </p>
          </div>
        </div>

        <div className="pd2-resume-art">
          <div className="pd2-paper">
            <span>📄</span>
            <b>Your Resume</b>
            <small>(PDF)</small>
          </div>
          <div className="pd2-arrow">→</div>
          <div className="pd2-mini-profile">
            <Img src={IMG.profileAvatar} alt="Ananya" />
            <strong>Ananya Sharma <small>•</small></strong>
            <em>Product Designer</em>
            <div className="pd2-list">
              <span><i /> Experience ────────</span>
              <span><i /> Skills ────────</span>
              <span><i /> Projects ────────</span>
              <span><i /> Education ────────</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: Proof */}
      <section className="pd2-section pd2-proof-section" id="pd2-proof">
        <div className="pd2-section-head">
          <div className="pd2-section-copy">
            <div className="pd2-no">02</div>
            <div>
              <h2>Bring Proof To Your Claims</h2>
              <p>Don't just list achievements—show evidence with attached media, links, and documents.</p>
            </div>
          </div>
          <a href="#pd2-features" className="pd2-small-cta">See Proof Gallery</a>
        </div>

        <div className="pd2-proof-grid">
          <div className="pd2-proof-card">
            <div className="pd2-proof-image">
              <span>📂</span>
              <Img src={IMG.caseStudy} alt="Case Studies" />
            </div>
            <h3>Project Case Studies</h3>
            <p>Attach rich visual portfolios, live demos, and project impact metrics directly.</p>
          </div>

          <div className="pd2-proof-card">
            <div className="pd2-proof-image">
              <span>🏆</span>
              <Img src={IMG.achievements} alt="Verified Achievements" />
            </div>
            <h3>Verified Achievements</h3>
            <p>Highlight team awards, leadership milestones, and verified certifications.</p>
          </div>

          <div className="pd2-proof-card">
            <div className="pd2-proof-image">
              <span>💬</span>
              <Img src={IMG.endorsements} alt="Social Proof" />
            </div>
            <h3>Peer Endorsements</h3>
            <p>Showcase direct testimonials from managers, clients, and team members.</p>
          </div>
        </div>
      </section>

      {/* Section 03: Features */}
      <section className="pd2-section pd2-evidence" id="pd2-features">
        <div className="pd2-section-copy">
          <div className="pd2-no">03</div>
          <div>
            <h2>Control Your Narrative with Context</h2>
            <p>Organize your work samples into structured evidence cards that tell a complete story.</p>
          </div>
        </div>

        <div className="pd2-evidence-content">
          <div className="pd2-evidence-card">
            <div className="pd2-icon">✦</div>
            <strong>Interactive Portfolio Cards</strong>
            <small>Rich Media & Live Links</small>
            <p>Embed designs, code repositories, dashboards, or presentations seamlessly.</p>
            <a href={SIGNUP_URL}>Explore Examples →</a>
          </div>

          <div className="pd2-inventory">
            <Img src={IMG.dashboard} alt="Dashboard Preview" />
            <div>
              <small>FEATURED PROJECT</small>
              <strong>FinTech Mobile App Redesign</strong>
              <p>Increased user conversion by 34% through intuitive design overhaul.</p>
              <a href={SIGNUP_URL}>View Case Study</a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: Testimonials */}
      <section className="pd2-section pd2-speak" id="pd2-testimonials">
        <div className="pd2-section-copy">
          <div className="pd2-no">04</div>
          <div>
            <h2>Validated by Industry Peers</h2>
            <p>Real feedback from colleagues and hiring managers who have reviewed PDP profiles.</p>
          </div>
        </div>

        <div className="pd2-testimonials">
          <article>
            <div className="pd2-person">
              <span>RK</span>
              <div>
                <strong>Rohan Kapoor</strong>
                <small>VP of Product</small>
              </div>
            </div>
            <p>"PDP profiles give me 10x more insight into a candidate than a standard PDF ever could."</p>
            <span className="pd2-type">Hiring Manager</span>
          </article>

          <article>
            <div className="pd2-person">
              <span>SM</span>
              <div>
                <strong>Sneha Mehta</strong>
                <small>Lead UX Researcher</small>
              </div>
            </div>
            <p>"Having my case studies, video intro, and recommendations in one place landed my dream job."</p>
            <span className="pd2-type">Senior Designer</span>
          </article>

          <article>
            <div className="pd2-person">
              <span>AR</span>
              <div>
                <strong>Amit Roy</strong>
                <small>Tech Recruiter</small>
              </div>
            </div>
            <p>"Verified project proof eliminates back-and-forth emails during early screening."</p>
            <span className="pd2-type">Talent Acquisition</span>
          </article>
        </div>
      </section>

      {/* Section 05: Timeline */}
      <section className="pd2-section pd2-story" id="pd2-story">
        <div className="pd2-section-copy">
          <div className="pd2-no">05</div>
          <div>
            <h2>Your Complete Career Story</h2>
            <p>Track your progression, milestones, and continuous learning timeline over time.</p>
          </div>
        </div>

        <div className="pd2-timeline">
          <div>
            <span>2021</span>
            <b>Junior UI/UX</b>
            <small>Started journey</small>
          </div>
          <div>
            <span>2023</span>
            <b>Product Designer</b>
            <small>Led mobile design</small>
          </div>
          <div className="current">
            <span>2025</span>
            <b>Senior Designer</b>
            <small>Leading core team</small>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pd2-bottom-cta">
        <div>
          <p>Ready to upgrade your professional presence?</p>
          <h2>Build Your Professional Profile Today</h2>
          <a href={SIGNUP_URL} className="pd2-btn primary">Create Profile Now</a>
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate("/"); }} className="pd2-btn outline">Return to Home</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="pd2-footer">
        <div className="pd2-footer-inner">
          <div className="pd2-brand" onClick={() => onNavigate("/")} style={{ cursor: "pointer" }}>
            <div className="pd2-mark"><span /></div>
            <div>
              <strong>PDP</strong>
              <small>Professional Digital Profile</small>
            </div>
          </div>

          <div className="pd2-footer-message">
            <strong>Empowering Professionals worldwide.</strong><br />
            Present your best self to recruiters and network partners.
          </div>

          <nav>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </nav>

          <div className="pd2-social">
            <span>in</span>
            <span>tw</span>
            <span>gh</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Main App ---------- */
function App() {
  const [currentPath, setCurrentPath] = useState("/");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState("all");
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef(null);
  const profilesSectionRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  const navigateTo = (path) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProfiles = selectedSector === "all"
    ? ALL_PROFILES
    : ALL_PROFILES.filter((p) => p.sector === selectedSector);

  const displayProfiles = filteredProfiles.length > 0 
    ? [...filteredProfiles, ...filteredProfiles] 
    : [];

  const handleSectorSelect = (sectorId) => {
    setSelectedSector(sectorId);
    if (profilesSectionRef.current) {
      profilesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".talent-card");
    if (!card) return;
    const step = card.offsetWidth + 14;
    const max = el.scrollWidth - el.clientWidth;

    if (dir > 0 && el.scrollLeft >= max - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isHovered || displayProfiles.length === 0 || currentPath !== "/") return;
    const timer = setInterval(() => {
      scrollCards(1);
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, selectedSector, displayProfiles.length, currentPath]);

  // Render sub-view if path matches /professionals
  if (currentPath === "/professionals") {
    return <ProfessionalsView onNavigate={navigateTo} />;
  }

  return (
    <div className="site-shell" id="home">
      <header className="topbar">
        <Logo onNavigate={navigateTo} />
        <nav id="primary-nav" className={menuOpen ? "nav open" : "nav"} aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a 
              key={l.href} 
              href={l.href} 
              onClick={(e) => {
                if (l.href === "/professionals") {
                  e.preventDefault();
                  navigateTo("/professionals");
                }
                closeMenu();
              }}
            >
              {l.label}
            </a>
          ))}
          <a className="nav-cta" href={SIGNUP_URL} onClick={closeMenu}>Create Your PDP</a>
        </nav>
        <button
          type="button"
          className="menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
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

            {/* Orbit Container wrapping floating screens */}
            <div className="orbit-container">
              <div className="orbit-track">
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
              </div>
            </div>

            {/* Center Phone */}
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
                <a href="/professionals" onClick={(e) => { e.preventDefault(); navigateTo("/professionals"); }} className="mini-btn">View Profile <Arrow /></a>
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
        <section className="sector-talent section-pad" id="sectors" style={{ paddingBottom: "0px" }}>
          <div className="section-intro">
            <div className="eyebrow">TALENT BY SECTOR</div>
            <h2>Find professionals <em>for your industry.</em></h2>
            <p>Select a sector below to explore professionals with real work proof in that field.</p>
          </div>
          
          <div 
            className="sector-grid" 
            style={{
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              gap: "12px",
              paddingBottom: "10px",
              marginBottom: "0px",
              whiteSpace: "nowrap",
              scrollbarWidth: "thin"
            }}
          >
            {SECTORS.map((sec) => {
              const active = selectedSector === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectorSelect(sec.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                    padding: "10px 18px",
                    borderRadius: "30px",
                    border: active ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.15)",
                    background: active ? "#1d4ed8" : "rgba(255,255,255,0.05)",
                    color: active ? "#ffffff" : "#d1d5db",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: active ? "600" : "400",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span>{sec.title}</span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>↗</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CAROUSEL */}
        <section className="profiles section-pad" id="profiles" ref={profilesSectionRef} style={{ paddingTop: "15px" }}>
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
              {displayProfiles.length > 0 ? (
                displayProfiles.map((p, idx) => (
                  <article 
                    className="talent-card" 
                    key={`${p.name}-${idx}`}
                    onClick={() => navigateTo("/professionals")}
                    style={{ cursor: "pointer" }}
                  >
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
                ))
              ) : (
                <div style={{ padding: "40px", color: "#9ca3af", textAlign: "center", width: "100%" }}>
                  No profiles available for this sector yet.
                </div>
              )}
            </div>
            <p className="fine-print">Showing preview profiles for selected sector.</p>
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
              <a className="learn" href="/professionals" onClick={(e) => { e.preventDefault(); navigateTo("/professionals"); }}>Learn More <Arrow /></a>
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
          <Logo onNavigate={navigateTo} />
          <div className="footer-message">Build your professional presence.<br /><strong>Showcase your work. Get discovered.</strong></div>
          <a className="btn primary" href={SIGNUP_URL}>Create Your PDP — Free <Arrow /></a>
        </div>
        <div className="footer-bottom">
          <nav aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <a 
                key={l.href} 
                href={l.href}
                onClick={(e) => {
                  if (l.href === "#professionals") {
                    e.preventDefault();
                    navigateTo("/professionals");
                  }
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "1rem" }}>{l.icon}</span>
                <span>{l.label}</span>
              </a>
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