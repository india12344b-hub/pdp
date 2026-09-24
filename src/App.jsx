import React, { useState } from "react";

const IMG = {
  hero: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
  work1: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80",
  work2: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80",
  work3: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80",
  certificate: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=700&q=80",
  recruiter: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=85",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
};

const profiles = [
  { name: "Ananya R.", role: "Product Designer", meta: "12 projects · 3 work videos", img: IMG.hero },
  { name: "Karthik M.", role: "Full-Stack Engineer", meta: "6 career videos · 8 demos", img: IMG.work2 },
  { name: "Priya S.", role: "Brand Strategist", meta: "Campaign proof · Awards", img: IMG.work1 },
  { name: "Rahul T.", role: "Operations Lead", meta: "Site photos · Testimonials", img: IMG.work3 },
];

const proofCards = [
  { icon: "▶", title: "Career Video", text: "Candidate explains their professional journey in their own voice.", img: IMG.hero },
  { icon: "▸", title: "Work Videos", text: "Project demos, product walkthroughs, real processes.", img: IMG.work2 },
  { icon: "▦", title: "Work Photos", text: "Teams, events, client meetings, site work, awards — genuine moments.", img: IMG.work3 },
  { icon: "✓", title: "Credentials & Proof", text: "Projects, outcomes, certificates, testimonials from real people.", img: IMG.certificate },
];

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

function Arrow() { return <span aria-hidden="true">→</span>; }

function Play({ small = false }) {
  return <span className={small ? "play play-small" : "play"}>▶</span>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(0);

  const nextProfiles = () => setProfileIndex((i) => (i + 1) % profiles.length);
  const prevProfiles = () => setProfileIndex((i) => (i - 1 + profiles.length) % profiles.length);

  return (
    <div className="site-shell" id="home">
      <header className="topbar">
        <Logo />
        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#professionals" onClick={() => setMenuOpen(false)}>For Professionals</a>
          <a href="#recruiters" onClick={() => setMenuOpen(false)}>For Recruiters</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="nav-cta" href="#create" onClick={() => setMenuOpen(false)}>Create Your PDP</a>
        </nav>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          <span /><span /><span />
        </button>
      </header>

      <main>
        <section className="hero section-pad">
          <div className="hero-copy">
            <div className="eyebrow">YOUR WORK. YOUR JOURNEY. YOUR STORY.</div>
            <h1>Go Beyond Resume.<br /><em>Your Work. Your Impact.</em></h1>
            <p className="hero-text">
              The candidate-first platform where professionals prove their work through real videos,
              projects, photos and evidence — not just claims.
            </p>
            <div className="button-row">
              <a className="btn primary" href="#create">Create Your PDP — Free <Arrow /></a>
              <a className="btn ghost" href="#professionals">Explore Talent <Arrow /></a>
            </div>
            <div className="trust-row">
              <span><b>✓</b> No AI-generated showcases</span>
              <span><b>✓</b> Real proof only</span>
              <span><b>✓</b> Free for professionals</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="floating-shot shot-project">
              <img src={IMG.work1} alt="" />
              <span><Play small /> Project Demo</span>
            </div>
            <div className="floating-shot shot-team">
              <img src={IMG.work3} alt="" />
              <span>Team Collaboration</span>
            </div>
            <div className="floating-shot shot-photos">
              <img src={IMG.work2} alt="" />
              <span>Work Photos</span>
            </div>
            <div className="floating-shot shot-trip">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80" alt="" />
              <span>Business Trip</span>
            </div>

            <div className="phone-card">
              <div className="phone-notch" />
              <img src={IMG.hero} alt="PDP profile preview" />
              <div className="phone-overlay">
                <div className="profile-mini">
                  <span className="mini-logo">◆</span>
                  <div><b>Ananya Sharma</b><small>Product Designer</small></div>
                  <span className="qr">▦</span>
                </div>
                <p>Designing products that help people live.</p>
                <a href="#profiles" className="mini-btn">View Profile <Arrow /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="proof section-pad" id="professionals">
          <div className="section-intro">
            <div className="eyebrow">WHAT MAKES PDP DIFFERENT</div>
            <h2>Proof of Work,<br /><em>not claims.</em></h2>
            <p>A resume can say what someone has done. PDP gives them a place to show evidence of what they have actually done.</p>
            <a className="text-link" href="#how">See How It Works <Arrow /></a>
          </div>
          <div className="proof-grid">
            {proofCards.map((card) => (
              <article className="proof-card" key={card.title}>
                <div className="card-image"><img src={card.img} alt="" /><span className="card-icon">{card.icon}</span></div>
                <div className="card-body"><h3>{card.title}</h3><p>{card.text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="sector-talent section-pad" id="sectors">
          <div className="section-intro">
            <div className="eyebrow">TALENT BY SECTOR</div>
            <h2>Find professionals <em>for your industry.</em></h2>
            <p>Explore PDP profiles by sector and discover people with real work, projects, photos and proof behind their experience.</p>
          </div>
          <div className="sector-grid">
            {[
              ["Technology & IT", "Software, product, data, AI & engineering"],
              ["Design & Creative", "UI/UX, graphic, content & visual design"],
              ["Business & Finance", "Sales, marketing, finance & operations"],
              ["Education", "Teachers, trainers, mentors & academic experts"],
              ["Healthcare", "Doctors, specialists & healthcare professionals"],
              ["More Sectors", "Explore professionals across industries"]
            ].map(([title, desc]) => (
              <a className="sector-card" href="#profiles" key={title}>
                <span className="sector-dot">↗</span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </a>
            ))}
          </div>
        </section>

        <section className="profiles section-pad" id="profiles">
          <div className="section-intro">
            <div className="eyebrow">PEOPLE ON PDP</div>
            <h2>A living exhibition<br /><em>of professionals.</em></h2>
            <p>Not a job board. A showcase of real people and the work behind their claims.</p>
            <a className="text-link" href="#create">Explore Profiles <Arrow /></a>
          </div>
          <div className="profile-showcase">
            <div className="profile-controls">
              <button onClick={prevProfiles} aria-label="Previous profile">←</button>
              <button onClick={nextProfiles} aria-label="Next profile">→</button>
            </div>
            <div className="profile-track" style={{ transform: `translateX(-${profileIndex * 25}%)` }}>
              {[...profiles, ...profiles].map((p, i) => (
                <article className={`talent-card ${i === profileIndex ? "active" : ""}`} key={p.name}>
                  <div className="talent-image"><img src={p.img} alt="" /><span className="talent-arrow">↗</span></div>
                  <div className="talent-info"><h3>{p.name}</h3><strong>{p.role}</strong><p>{p.meta}</p></div>
                </article>
              ))}
            </div>
            <div className="dots">{profiles.map((_, i) => <span className={i === profileIndex ? "dot active" : "dot"} key={i} />)}</div>
          </div>
        </section>

        <section className="how section-pad" id="how">
          <div className="section-intro how-title">
            <div className="eyebrow">HOW PDP WORKS</div>
            <h2>Simple. Powerful.<br /><em>Evidence-first.</em></h2>
          </div>
          <div className="how-content">
            <div className="device-wrap">
              <div className="mini-phone">
                <div className="phone-notch" />
                <img src={IMG.hero} alt="" />
                <div className="mini-phone-content"><Play /><b>Ananya Sharma</b><small>Product Designer</small></div>
              </div>
              <div className="scribble">Real people.<br />Real work.<br />Real impact.</div>
            </div>
            <div className="flows">
              <FlowRow color="blue" title="For Professionals" items={[
                ["01", "Create", "Build your professional identity"],
                ["02", "Showcase", "Add videos, photos, projects, proof"],
                ["03", "Share", "One link across resume, LinkedIn, WhatsApp"],
                ["04", "Get Discovered", "Recruiters see the real you"],
              ]}/>
              <a className="learn" href="#create">Learn More <Arrow /></a>
              <FlowRow color="purple" title="For Companies" items={[
                ["01", "Post / Search", "Upload job or explore talent"],
                ["02", "Discover", "See relevant professionals"],
                ["03", "Review Proof", "Watch work, not just claims"],
                ["04", "Connect", "Shortlist & reach out"],
              ]}/>
              <a className="learn" href="#recruiters">Learn More <Arrow /></a>
            </div>
          </div>
        </section>

        <section className="recruiter-banner section-pad" id="recruiters">
          <div className="recruiter-copy">
            <div className="eyebrow">FOR RECRUITERS</div>
            <h2>See the person. See the work. See the evidence.</h2>
            <div className="recruiter-points">
              <div><b>▣</b><span><strong>Evidence over claims</strong><small>Watch career videos, project demos and real work made before the interview.</small></span></div>
              <div><b>◉</b><span><strong>Authenticity layer</strong><small>AI-generated content is prohibited. Real-self-first is built into the platform.</small></span></div>
              <div><b>⌁</b><span><strong>Discovery that matters</strong><small>Find relevant talent and see the proof behind their experience.</small></span></div>
            </div>
            <a className="btn ghost" href="#how">Learn More <Arrow /></a>
          </div>
          <div className="recruiter-image">
            <img src={IMG.recruiter} alt="Recruiter viewing a professional profile" />
            <span>Real work.<br />Real talent.</span>
          </div>
        </section>

        <section className="market section-pad" id="about">
          <div className="market-copy">
            <div className="eyebrow">WHAT THE MARKET IS LOOKING FOR</div>
            <h2>Your resume tells your story.<br /><em>Your PDP shows it.</em></h2>
            <p>Free for professionals. Built for proof.</p>
            <a className="btn primary" href="#create">Create Your PDP — Free <Arrow /></a>
          </div>
          <div className="market-visual">
            <img src={IMG.mountain} alt="" />
            <div className="interest-panel">
              <h3>Top Industry Interest</h3>
              <div className="bar"><span>● Technology</span><b>31%</b><i style={{width:"78%"}} /></div>
              <div className="bar"><span>● Finance</span><b>18%</b><i style={{width:"45%"}} /></div>
              <div className="bar"><span>● Engineering</span><b>16%</b><i style={{width:"40%"}} /></div>
              <div className="bar"><span>● Healthcare</span><b>12%</b><i style={{width:"30%"}} /></div>
              <small>Live figures calculated from permitted current openings. Methodology shown publicly.</small>
            </div>
          </div>
        </section>

        <section className="final-cta section-pad" id="create">
          <div>
            <h2>Build your professional presence.</h2>
            <p>Showcase your work. Get discovered.</p>
          </div>
          <a className="btn primary" href="#home">Create Your PDP — Free <Arrow /></a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <Logo />
          <div className="footer-message">Build your professional presence.<br /><strong>Showcase your work. Get discovered.</strong></div>
          <a className="btn primary" href="#create">Create Your PDP — Free <Arrow /></a>
        </div>
        <div className="footer-bottom">
          <nav>
            <a href="#home">⌂<span>Home</span></a>
            <a href="#professionals">♙<span>For Professionals</span></a>
            <a href="#recruiters">▣<span>For Recruiters</span></a>
            <a href="#how">⌁<span>How It Works</span></a>
            <a href="#about">▤<span>About</span></a>
          </nav>
          <div className="socials"><a href="#linkedin">in</a><a href="#x">𝕏</a><a href="#youtube">▶</a></div>
        </div>
      </footer>
    </div>
  );
}

function FlowRow({ color, title, items }) {
  return (
    <div className={`flow-group ${color}`}>
      <h3><span>♙</span>{title}</h3>
      <div className="flow-row">
        {items.map(([num, name, desc], i) => (
          <React.Fragment key={num}>
            <div className="flow-step"><b>{num}</b><strong>{name}</strong><small>{desc}</small></div>
            {i < items.length - 1 && <span className="flow-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default App;