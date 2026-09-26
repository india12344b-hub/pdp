import React, { useMemo, useState } from "react";
import { PROFILE_DATA, getRoleProfile } from "./pdpProfileData";
import { IMAGES } from "./pdpMedia";

function Icon({ children }) { return <span className="pdp3-icon" aria-hidden="true">{children}</span>; }
function Arrow() { return <span aria-hidden="true">→</span>; }
function Img({ src, alt = "" }) { return <img src={src} alt={alt} loading="lazy" decoding="async" />; }

function SectionHead({ icon, title, subtitle, action }) {
  return <div className="pdp3-section-head"><div className="pdp3-section-title"><Icon>{icon}</Icon><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{action && <a href={`#${action.target}`}>{action.label} <Arrow /></a>}</div>;
}

export default function Page3() {
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [personalOpen, setPersonalOpen] = useState(false);

  const profile = PROFILE_DATA;
  const jobProfile = useMemo(() => getRoleProfile(profile), [profile.roleProfileId]);
  const experience = profile.experience || [];
  const projects = profile.projects || [];
  const workEvidence = profile.workEvidence || [];
  const achievements = profile.achievements || [];
  const credentials = profile.credentials || [];
  const recommendations = profile.recommendations || [];
  const timeline = profile.timeline || [];
  const personal = profile.personal || [];

  const selectedCompany = selectedExperience === null ? null : experience[selectedExperience].company;
  const companyProjects = selectedCompany ? projects.filter(p => p.company === selectedCompany) : projects;
  const companyEvidence = selectedCompany ? workEvidence.filter(item => item.company === selectedCompany) : workEvidence;
  const featuredTitle = selectedCompany ? `${jobProfile.focusLabel} at ${selectedCompany}` : jobProfile.focusLabel;
  const featuredSubtitle = selectedCompany
    ? "Projects and proof connected to this specific role and company."
    : `A ${jobProfile.category.toLowerCase()} profile, shaped around the work and evidence available.`;

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
            <Img src={IMAGES.hero} alt="{profile.name}" />
            <div className="pdp3-video-overlay"><button className="pdp3-play" aria-label="Play career introduction">▶</button><div><strong>Career Introduction</strong><span>0:38 · Watch my story</span></div></div>
            <div className="pdp3-video-badge">REAL PERSON · REAL STORY</div>
          </div>
          <div className="pdp3-hero-info">
            <div className="pdp3-status"><span /> Available for opportunities</div>
            <h1>{profile.name} <b>✓</b></h1>
            <h3>{profile.role}</h3>
            <div className="pdp3-meta"><span>⌖ {profile.location}</span><span>◷ {profile.stats.experience} Years Experience</span><span>↗ {profile.pdpUrl}</span></div>
            <p className="pdp3-lead">{profile.introduction}</p>
            <div className="pdp3-actions"><button className="pdp3-primary">✉ Contact Me</button><button className="pdp3-whatsapp">◉ WhatsApp</button><button className="pdp3-ghost">↓ Resume</button></div>
            <div className="pdp3-socials"><span>in</span><span>◎</span><span>Be</span><span>↗</span></div>
          </div>
          <aside className="pdp3-quick">
            <h3><Icon>◉</Icon> Quick Info</h3>
            <div className="pdp3-info-row"><span>Experience</span><b>8+ Years</b></div><div className="pdp3-info-row"><span>Location</span><b>{profile.location}</b></div><div className="pdp3-info-row"><span>Email</span><b>{profile.email}</b></div><div className="pdp3-info-row"><span>Phone</span><b>{profile.phone}</b></div>
            <div className="pdp3-divider" /><strong className="pdp3-label">Skills</strong><div className="pdp3-chips">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
          </aside>
        </section>

        <section className="pdp3-card-section pdp3-snapshot" id="snapshot">
          <SectionHead icon="✦" title="Career Snapshot" subtitle={`A quick view of ${jobProfile.title.toLowerCase()} experience before you explore the details.`} />
          <div className="pdp3-snapshot-top">
            <div><span className="pdp3-snapshot-eyebrow">ROLE PROFILE</span><h3>{jobProfile.title}</h3><p>{jobProfile.totalYears}+ years total experience · {jobProfile.category}</p></div>
            <div className="pdp3-snapshot-total"><b>{jobProfile.totalYears}+</b><span>Years total experience</span></div>
          </div>
          <div className="pdp3-snapshot-grid">{jobProfile.snapshot.map(item => <article key={item.label}><div><strong>{item.value}</strong><span>{item.label}</span></div><p>{item.detail}</p></article>)}</div>
          <div className="pdp3-snapshot-note"><span>↳</span><p>These figures are derived from the candidate's structured experience, skills and project history. Click a company below to see where the experience comes from.</p></div>
        </section>

        <section className="pdp3-card-section" id="about">
          <SectionHead icon="♙" title="About Me" subtitle="The person behind the professional profile." />
          <div className="pdp3-about-grid"><div><h3>My Professional Story</h3><p>{profile.about}</p><button className="pdp3-link-btn">View Full Story <Arrow /></button></div><div className="pdp3-stats"><div><b>{profile.stats.experience}</b><span>Years Experience</span></div><div><b>{profile.stats.projects}</b><span>Projects Completed</span></div><div><b>{profile.stats.awards}</b><span>Awards & Recognition</span></div><div><small>Currently</small><strong>{profile.role} @ XYZ Technologies</strong></div><div><small>Specialization</small><strong>{profile.stats.specialization}</strong></div></div><Img src={IMAGES.about} alt="Working professionally" /></div>
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
          <SectionHead icon="▤" title={jobProfile.sections.proof} subtitle="Videos, photos, presentations and more — real proof behind the profile." action={{ target: "proof", label: "View All Media" }} />
          <div className="pdp3-media-grid">{companyEvidence.map(item => <article className="pdp3-media-card" key={item.title}><div className="pdp3-media-img"><Img src={item.image} alt={item.title} /><span className="pdp3-media-play">{item.type === "video" ? "▶" : "▦"}</span></div><div><h3>{item.title}</h3><span>{item.meta} · {item.company}</span></div></article>)}</div>
          {!companyEvidence.length && <div className="pdp3-empty-state compact-empty"><strong>No media uploaded for this company yet.</strong><p>We'll keep the recruiter view useful with structured work information rather than empty media placeholders.</p></div>}
          <div className="pdp3-media-note"><span>Free PDP media guidance</span><b>Profile video up to 45 sec · Work videos up to 20 sec · 20 images</b></div>
        </section>

        <section className="pdp3-three-grid">
          <div className="pdp3-card-section compact"><SectionHead icon="🏆" title="Achievements" subtitle="Recognition for my work and impact." /><ul>{achievements.map(x => <li key={x}><Icon>★</Icon><span>{x}</span><b>›</b></li>)}</ul></div>
          <div className="pdp3-card-section compact"><SectionHead icon="▣" title="Credentials" subtitle="Certifications and formal education." /><ul>{credentials.map(x => <li key={x}><Icon>✓</Icon><span>{x}</span><b>›</b></li>)}</ul></div>
          <div className="pdp3-card-section compact"><SectionHead icon="♧" title="People I Worked With" subtitle="Recommendations from colleagues and managers." /><div className="pdp3-recommendation"><div className="pdp3-reco-head"><Img src={IMAGES.selfie1} alt="{recommendations[0]?.name || "Recommendation"}" /><div><strong>Rohit Mehta</strong><span>{recommendations[0]?.role || "Professional connection"}</span></div></div><p>“{recommendations[0]?.text || "Recommendations will appear here when added."}”</p><div className="pdp3-stars">★★★★★</div></div></div>
        </section>

        <section className="pdp3-card-section pdp3-timeline-section" id="journey"><SectionHead icon="◉" title="Career Journey" subtitle="Key milestones in my professional journey." /><div className="pdp3-timeline">{timeline.map(([year,title,desc]) => <div key={year} className="pdp3-milestone"><span className="pdp3-dot" /><strong>{year}</strong><b>{title}</b><small>{desc}</small></div>)}</div></section>

        <section className="pdp3-personal" id="know-me">
          <div className="pdp3-personal-intro"><div className="pdp3-eyebrow">BEYOND THE RESUME</div><h2>Know Me <em>Beyond Work.</em></h2><p>A professional is more than a resume. Here I can share the people, passions and experiences that shape who I am — only what I'm comfortable sharing.</p><button className="pdp3-primary" onClick={() => setPersonalOpen(!personalOpen)}>{personalOpen ? "Hide Personal Life" : "Explore My Personal Side"} <Arrow /></button></div>
          {personalOpen && <div className="pdp3-personal-grid">{personal.map(item => <article key={item.title}><Img src={item.image} alt={item.title} /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>}
          {!personalOpen && <div className="pdp3-personal-teasers">{personal.map(item => <div key={item.title}><Img src={item.image} alt="" /><span>{item.title}</span></div>)}</div>}
        </section>

        <section className="pdp3-bottom-grid" id="contact">
          <div className="pdp3-card-section"><SectionHead icon="⌁" title="One Link. My Professional Story." subtitle="Share my PDP anywhere — resume, LinkedIn, email, WhatsApp or QR code." /><div className="pdp3-url"><span>↗</span><strong>{profile.pdpUrl}</strong><button>⧉</button></div></div>
          <div className="pdp3-card-section"><SectionHead icon="✦" title="Let's Connect" subtitle="Feel free to reach out — I'm open to new opportunities, collaborations and exciting projects." /><div className="pdp3-contact-actions"><button>☎ Call</button><button>◉ WhatsApp</button><button>✉ Email</button><button>in LinkedIn</button></div><div className="pdp3-privacy">🔒 Contact details are shared only according to the candidate's visibility settings.</div></div>
        </section>

        <footer className="pdp3-footer"><button className="pdp3-brand" onClick={goHome}><span className="pdp3-mark"><span /></span><span><strong>PDP</strong><small>Professional Digital Profile</small></span></button><div><strong>Build your professional presence.</strong><br /><span>Showcase your work. Get discovered.</span></div><nav><a href="/" onClick={(e)=>{e.preventDefault();goHome();}}>Home</a><a href="/professionals">For Professionals</a><a href="#contact">Contact</a></nav></footer>
      </main>
    </div>
  );
}
