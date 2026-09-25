import React, { useState } from "react";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=88",
  about: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=82",
  project1: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=82",
  project2: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=82",
  project3: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&q=82",
  work1: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=82",
  work2: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=82",
  work3: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=82",
  selfie1: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=82",
  selfie2: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=82",
  family: "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=900&q=82",
};

const experience = [
  { company: "XYZ Technologies", role: "Product Designer", years: "2021 — Present · 4 years", desc: "Enterprise SaaS products focused on improving user experience and product growth.", tags: ["Product", "UX", "Leadership"] },
  { company: "ABC Digital", role: "UI/UX Designer", years: "2018 — 2021 · 3 years", desc: "Designed user interfaces for web and mobile applications, working closely with product and engineering.", tags: ["UI/UX", "Research"] },
  { company: "Creative Labs", role: "Junior Designer", years: "2016 — 2018 · 2 years", desc: "Created visual designs and supported product design teams across projects and campaigns.", tags: ["Visual", "Brand"] },
  { company: "NextGen Solutions", role: "Design Intern", years: "2015 — 2016 · 1 year", desc: "Assisted in design research, wireframing and prototyping for digital products.", tags: ["Research", "Prototype"] },
];

const JOB_PROFILE = {
  category: "Product Design",
  title: "Product Designer",
  totalYears: 8,
  snapshot: [
    { label: "Product Design", value: "8 yrs", detail: "Across XYZ Technologies, ABC Digital and Creative Labs" },
    { label: "UX / Research", value: "7 yrs", detail: "User research, journeys, usability and product discovery" },
    { label: "Design Systems", value: "5 yrs", detail: "Scalable UI systems and component libraries" },
    { label: "Leadership", value: "4 yrs", detail: "Mentoring designers and leading cross-functional work" },
    { label: "Figma", value: "6 yrs", detail: "Advanced product design, prototyping and collaboration" },
  ],
  focusLabel: "Featured Work",
};

const projects = [
  { company: "XYZ Technologies", title: "Smart Inventory System", result: "Reduced stock errors by 28%", role: "Product Design", image: IMAGES.project1, evidence: ["Project walkthrough", "6 work photos"] },
  { company: "XYZ Technologies", title: "HealthTrack App", result: "Improved user engagement by 45%", role: "UX Design", image: IMAGES.project2, evidence: ["UX walkthrough", "4 work photos"] },
  { company: "ABC Digital", title: "eCommerce Platform", result: "Increased conversion rate by 32%", role: "Product Design", image: IMAGES.project3, evidence: ["Case study", "3 work photos"] },
];

const workEvidence = [
  { company: "XYZ Technologies", title: "Project Walkthrough", meta: "0:18", image: IMAGES.work1, type: "video" },
  { company: "XYZ Technologies", title: "Team Collaboration", meta: "12 photos", image: IMAGES.work2, type: "photos" },
  { company: "ABC Digital", title: "Design Presentation", meta: "5 photos", image: IMAGES.work3, type: "photos" },
];

const achievements = ["Best UX Award — Design Conference 2022", "Team Leadership — XYZ Technologies 2023", "Innovation Challenge Winner — Product Innovation 2021"];
const credentials = ["UX Design Certification — Google (Coursera) · 2021", "Bachelor of Design — NID · 2015", "Advanced Figma — Design System Course · 2020"];
const recommendations = [{ name: "Rohit Mehta", role: "Product Manager · XYZ Technologies", text: "Ananya is a dedicated and creative professional who consistently delivers high-quality work. She brings great energy and is a pleasure to work with." }];
const timeline = [
  ["2015", "Education", "NID"], ["2016", "First Role", "Junior Designer"], ["2018", "Senior Designer", "ABC Digital"], ["2021", "Product Designer", "XYZ Technologies"], ["2025", "Current Role", "Product Designer"]
];
const personal = [
  { title: "With Friends", text: "Weekend road trips, celebrations and the people who keep me grounded.", image: IMAGES.selfie2 },
  { title: "Family", text: "The people behind my values, resilience and perspective.", image: IMAGES.family },
  { title: "Outside Work", text: "Travel, photography, design inspiration and discovering new places.", image: IMAGES.selfie1 },
];

function Icon({ children }) { return <span className="pdp3-icon" aria-hidden="true">{children}</span>; }
function Arrow() { return <span aria-hidden="true">→</span>; }
function Img({ src, alt = "" }) { return <img src={src} alt={alt} loading="lazy" decoding="async" />; }

function SectionHead({ icon, title, subtitle, action }) {
  return <div className="pdp3-section-head"><div className="pdp3-section-title"><Icon>{icon}</Icon><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{action && <a href={`#${action.target}`}>{action.label} <Arrow /></a>}</div>;
}

export default function Page3() {
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [personalOpen, setPersonalOpen] = useState(false);

  const selectedCompany = selectedExperience === null ? null : experience[selectedExperience].company;
  const companyProjects = selectedCompany ? projects.filter(p => p.company === selectedCompany) : projects;
  const companyEvidence = selectedCompany ? workEvidence.filter(item => item.company === selectedCompany) : workEvidence;
  const featuredTitle = selectedCompany ? `${JOB_PROFILE.focusLabel} at ${selectedCompany}` : JOB_PROFILE.focusLabel;
  const featuredSubtitle = selectedCompany
    ? "Projects and proof connected to this specific role and company."
    : `A ${JOB_PROFILE.category.toLowerCase()} profile, shaped around the work and evidence available.`;

  const goHome = () => { window.location.href = "/"; };

  return (
    <div className="pdp3-page">
      <header className="pdp3-topbar">
        <button className="pdp3-brand" onClick={goHome} aria-label="Go to PDP home"><span className="pdp3-mark"><span /></span><span><strong>PDP</strong><small>Professional Digital Profile</small></span></button>
        <nav><a className="active" href="#overview">Overview</a><a href="#experience">Work</a><a href="#proof">Proof</a><a href="#know-me">Know Me</a><a href="#contact">Contact</a></nav>
        <div className="pdp3-nav-actions"><button className="pdp3-icon-btn" aria-label="Share profile">↗</button><button className="pdp3-outline-btn" onClick={() => window.print()}>Download Resume</button></div>
        <button className="pdp3-mobile-menu" aria-label="Open menu">☰</button>
      </header>

      <main className="pdp3-shell">
        <a className="pdp3-back" href="/" onClick={(e) => { e.preventDefault(); goHome(); }}>← Back to PDP</a>

        <section className="pdp3-hero" id="overview">
          <div className="pdp3-video-card">
            <Img src={IMAGES.hero} alt="Ananya Sharma" />
            <div className="pdp3-video-overlay"><button className="pdp3-play" aria-label="Play career introduction">▶</button><div><strong>Career Introduction</strong><span>0:38 · Watch my story</span></div></div>
            <div className="pdp3-video-badge">REAL PERSON · REAL STORY</div>
          </div>
          <div className="pdp3-hero-info">
            <div className="pdp3-status"><span /> Available for opportunities</div>
            <h1>Ananya Sharma <b>✓</b></h1>
            <h3>Product Designer</h3>
            <div className="pdp3-meta"><span>⌖ Bengaluru, India</span><span>◷ 8+ Years Experience</span><span>↗ pdp.com/ananyasharma</span></div>
            <p className="pdp3-lead">I'm a product designer with 8+ years of experience creating user-centered digital experiences. I love turning complex problems into simple, intuitive solutions that make a real impact.</p>
            <div className="pdp3-actions"><button className="pdp3-primary">✉ Contact Me</button><button className="pdp3-whatsapp">◉ WhatsApp</button><button className="pdp3-ghost">↓ Resume</button></div>
            <div className="pdp3-socials"><span>in</span><span>◎</span><span>Be</span><span>↗</span></div>
          </div>
          <aside className="pdp3-quick">
            <h3><Icon>◉</Icon> Quick Info</h3>
            <div className="pdp3-info-row"><span>Experience</span><b>8+ Years</b></div><div className="pdp3-info-row"><span>Location</span><b>Bengaluru, India</b></div><div className="pdp3-info-row"><span>Email</span><b>ananya@gmail.com</b></div><div className="pdp3-info-row"><span>Phone</span><b>+91 98765 43210</b></div>
            <div className="pdp3-divider" /><strong className="pdp3-label">Skills</strong><div className="pdp3-chips"><span>UI/UX Design</span><span>Product Design</span><span>Design Systems</span><span>Figma</span><span>User Research</span><span>Prototyping</span></div>
          </aside>
        </section>

        <section className="pdp3-card-section pdp3-snapshot" id="snapshot">
          <SectionHead icon="✦" title="Career Snapshot" subtitle={`A quick view of ${JOB_PROFILE.title.toLowerCase()} experience before you explore the details.`} />
          <div className="pdp3-snapshot-top">
            <div><span className="pdp3-snapshot-eyebrow">ROLE PROFILE</span><h3>{JOB_PROFILE.title}</h3><p>{JOB_PROFILE.totalYears}+ years total experience · {JOB_PROFILE.category}</p></div>
            <div className="pdp3-snapshot-total"><b>{JOB_PROFILE.totalYears}+</b><span>Years total experience</span></div>
          </div>
          <div className="pdp3-snapshot-grid">{JOB_PROFILE.snapshot.map(item => <article key={item.label}><div><strong>{item.value}</strong><span>{item.label}</span></div><p>{item.detail}</p></article>)}</div>
          <div className="pdp3-snapshot-note"><span>↳</span><p>These figures are derived from the candidate's structured experience, skills and project history. Click a company below to see where the experience comes from.</p></div>
        </section>

        <section className="pdp3-card-section" id="about">
          <SectionHead icon="♙" title="About Me" subtitle="The person behind the professional profile." />
          <div className="pdp3-about-grid"><div><h3>My Professional Story</h3><p>I'm a product designer who believes in the power of user empathy, clean design and continuous learning. Over the years, I've worked on products that solve real problems and create meaningful impact.</p><button className="pdp3-link-btn">View Full Story <Arrow /></button></div><div className="pdp3-stats"><div><b>8+</b><span>Years Experience</span></div><div><b>24</b><span>Projects Completed</span></div><div><b>12</b><span>Awards & Recognition</span></div><div><small>Currently</small><strong>Product Designer @ XYZ Technologies</strong></div><div><small>Specialization</small><strong>UX · Product · Design Systems</strong></div></div><Img src={IMAGES.about} alt="Working professionally" /></div>
        </section>

        <section className="pdp3-card-section" id="experience">
          <SectionHead icon="▣" title="Work Experience" subtitle="Professional journey and the roles I've played." action={{ target: "experience", label: "View All Experience" }} />
          <div className="pdp3-experience-grid">{experience.map((item, i) => <article className={`pdp3-exp-card ${selectedExperience === i ? "selected" : ""}`} key={item.company} onClick={() => setSelectedExperience(selectedExperience === i ? null : i)}><div className="pdp3-exp-top"><Icon>{i === 0 ? "✦" : "▣"}</Icon><div><h3>{item.company}</h3><span>{item.role}</span></div><b>›</b></div><small>{item.years}</small><p>{item.desc}</p><div className="pdp3-chips">{item.tags.map(t => <span key={t}>{t}</span>)}</div>{selectedExperience === i && <div className="pdp3-exp-detail"><strong>Evidence attached</strong><p>Projects, work photos, videos and recommendations connected to this role.</p></div>}</article>)}</div>
        </section>

        <section className="pdp3-card-section" id="projects">
          <SectionHead icon="⌁" title={featuredTitle} subtitle={featuredSubtitle} action={{ target: "projects", label: "View All Projects" }} />
          <div className="pdp3-filter-state">
            <span>{selectedCompany ? `Showing ${companyProjects.length} project${companyProjects.length === 1 ? "" : "s"} linked to ${selectedCompany}.` : "Showing the candidate's strongest work across their career."}</span>
            {selectedCompany && <button onClick={() => setSelectedExperience(null)}>Show All Work ×</button>}
          </div>
          {companyProjects.length ? <div className="pdp3-project-grid">{companyProjects.map(p => <article className="pdp3-project" key={p.title}><div className="pdp3-project-img"><Img src={p.image} alt={p.title} /><span className="pdp3-project-play">▶</span></div><div className="pdp3-project-body"><h3>{p.title} <Arrow /></h3><strong>{p.result}</strong><div className="pdp3-chips"><span>{p.role}</span><span>{p.company}</span></div><small className="pdp3-project-evidence">{p.evidence.join(" · ")}</small></div></article>)}</div> : <div className="pdp3-empty-state"><strong>No project media added for this company yet.</strong><p>The profile automatically falls back to the candidate's role, contributions and verified experience instead of showing an empty section.</p></div>}
        </section>

        <section className="pdp3-card-section" id="proof">
          <SectionHead icon="▤" title="Work Evidence" subtitle="Videos, photos, presentations and more — real proof behind the profile." action={{ target: "proof", label: "View All Media" }} />
          <div className="pdp3-media-grid">{companyEvidence.map(item => <article className="pdp3-media-card" key={item.title}><div className="pdp3-media-img"><Img src={item.image} alt={item.title} /><span className="pdp3-media-play">{item.type === "video" ? "▶" : "▦"}</span></div><div><h3>{item.title}</h3><span>{item.meta} · {item.company}</span></div></article>)}</div>
          {!companyEvidence.length && <div className="pdp3-empty-state compact-empty"><strong>No media uploaded for this company yet.</strong><p>We'll keep the recruiter view useful with structured work information rather than empty media placeholders.</p></div>}
          <div className="pdp3-media-note"><span>Free PDP media guidance</span><b>Profile video up to 45 sec · Work videos up to 20 sec · 20 images</b></div>
        </section>

        <section className="pdp3-three-grid">
          <div className="pdp3-card-section compact"><SectionHead icon="🏆" title="Achievements" subtitle="Recognition for my work and impact." /><ul>{achievements.map(x => <li key={x}><Icon>★</Icon><span>{x}</span><b>›</b></li>)}</ul></div>
          <div className="pdp3-card-section compact"><SectionHead icon="▣" title="Credentials" subtitle="Certifications and formal education." /><ul>{credentials.map(x => <li key={x}><Icon>✓</Icon><span>{x}</span><b>›</b></li>)}</ul></div>
          <div className="pdp3-card-section compact"><SectionHead icon="♧" title="People I Worked With" subtitle="Recommendations from colleagues and managers." /><div className="pdp3-recommendation"><div className="pdp3-reco-head"><Img src={IMAGES.selfie1} alt="Rohit Mehta" /><div><strong>Rohit Mehta</strong><span>Product Manager · XYZ Technologies</span></div></div><p>“{recommendations[0].text}”</p><div className="pdp3-stars">★★★★★</div></div></div>
        </section>

        <section className="pdp3-card-section pdp3-timeline-section" id="journey"><SectionHead icon="◉" title="Career Journey" subtitle="Key milestones in my professional journey." /><div className="pdp3-timeline">{timeline.map(([year,title,desc]) => <div key={year} className="pdp3-milestone"><span className="pdp3-dot" /><strong>{year}</strong><b>{title}</b><small>{desc}</small></div>)}</div></section>

        <section className="pdp3-personal" id="know-me">
          <div className="pdp3-personal-intro"><div className="pdp3-eyebrow">BEYOND THE RESUME</div><h2>Know Me <em>Beyond Work.</em></h2><p>A professional is more than a resume. Here I can share the people, passions and experiences that shape who I am — only what I'm comfortable sharing.</p><button className="pdp3-primary" onClick={() => setPersonalOpen(!personalOpen)}>{personalOpen ? "Hide Personal Life" : "Explore My Personal Side"} <Arrow /></button></div>
          {personalOpen && <div className="pdp3-personal-grid">{personal.map(item => <article key={item.title}><Img src={item.image} alt={item.title} /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>}
          {!personalOpen && <div className="pdp3-personal-teasers">{personal.map(item => <div key={item.title}><Img src={item.image} alt="" /><span>{item.title}</span></div>)}</div>}
        </section>

        <section className="pdp3-bottom-grid" id="contact">
          <div className="pdp3-card-section"><SectionHead icon="⌁" title="One Link. My Professional Story." subtitle="Share my PDP anywhere — resume, LinkedIn, email, WhatsApp or QR code." /><div className="pdp3-url"><span>↗</span><strong>pdp.com/ananyasharma</strong><button>⧉</button></div></div>
          <div className="pdp3-card-section"><SectionHead icon="✦" title="Let's Connect" subtitle="Feel free to reach out — I'm open to new opportunities, collaborations and exciting projects." /><div className="pdp3-contact-actions"><button>☎ Call</button><button>◉ WhatsApp</button><button>✉ Email</button><button>in LinkedIn</button></div><div className="pdp3-privacy">🔒 Contact details are shared only according to the candidate's visibility settings.</div></div>
        </section>

        <footer className="pdp3-footer"><button className="pdp3-brand" onClick={goHome}><span className="pdp3-mark"><span /></span><span><strong>PDP</strong><small>Professional Digital Profile</small></span></button><div><strong>Build your professional presence.</strong><br /><span>Showcase your work. Get discovered.</span></div><nav><a href="/" onClick={(e)=>{e.preventDefault();goHome();}}>Home</a><a href="/professionals">For Professionals</a><a href="#contact">Contact</a></nav></footer>
      </main>
    </div>
  );
}
