import React, { useMemo, useState } from "react";
import { PROFILE_DATA, getRoleProfile, buildShortlistTools } from "./pdpProfileData";
import pdpLogo from "./pdp-logo.jpg";

const DEMO_CANDIDATES = [
  {
    ...PROFILE_DATA.profile,
    id: "ananya-demo",
    name: PROFILE_DATA.profile.name,
    role: PROFILE_DATA.profile.role,
    location: PROFILE_DATA.profile.location,
    industry: "Design / Product",
    stats: { ...PROFILE_DATA.profile.stats, experience: PROFILE_DATA.profile.stats?.experience || 8 },
    experienceAreas: buildShortlistTools(PROFILE_DATA.profile, getRoleProfile(PROFILE_DATA.profile), PROFILE_DATA.experience || []),
    proof: ["Career video", "Projects", "Work evidence"],
  },
  {
    id: "rahul-demo",
    name: "Rahul Mehta",
    role: "Business Development Manager",
    location: "Mumbai, India",
    industry: "FMCG",
    stats: { experience: 9 },
    experienceAreas: ["FMCG", "Distributor Management", "BTL / Trade Activation", "Product Launch", "New Market Development", "Channel Development", "Key Accounts", "GTM"],
    proof: ["Career video", "Market photos", "Launch evidence"],
  },
  {
    id: "priya-demo",
    name: "Priya Nair",
    role: "Brand & Growth Manager",
    location: "Bengaluru, India",
    industry: "Consumer Brands",
    stats: { experience: 7 },
    experienceAreas: ["Brand Development", "GTM", "Product Launch", "Market Expansion", "Campaign Leadership"],
    proof: ["Campaigns", "Case studies", "Achievements"],
  },
  {
    id: "vikram-demo",
    name: "Vikram Shah",
    role: "Product Designer",
    location: "Pune, India",
    industry: "Technology",
    stats: { experience: 6 },
    experienceAreas: ["Product Design", "UX / Research", "Design Systems", "Prototyping", "Cross-functional Leadership"],
    proof: ["Case studies", "Prototypes", "Work videos"],
  },
];

const ALIASES = {
  "distributor management": ["distributor", "distribution", "channel"],
  "btl / trade activation": ["btl", "trade activation", "activation"],
  "product launch": ["product launch", "launch", "new product"],
  "new market development": ["new market", "market expansion", "territory"],
  "channel development": ["channel", "distribution", "distributor"],
  "key accounts": ["key account", "strategic account", "enterprise"],
  "ux / research": ["ux", "research", "usability", "discovery"],
  "cross-functional leadership": ["cross-functional", "leadership", "team"],
};

function normalizeRequirement(text) {
  const q = text.toLowerCase();
  const all = [...new Set(DEMO_CANDIDATES.flatMap(c => c.experienceAreas))];
  return all.filter(label => {
    const terms = ALIASES[label.toLowerCase()] || [label.toLowerCase()];
    return terms.some(term => q.includes(term));
  });
}

export default function RecruiterPage() {
  const [requirement, setRequirement] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);

  const suggestedFilters = useMemo(() => normalizeRequirement(requirement), [requirement]);
  const filters = activeFilters.length ? activeFilters : suggestedFilters;

  const candidates = useMemo(() => {
    const q = requirement.trim().toLowerCase();
    return DEMO_CANDIDATES.map(candidate => {
      const matched = filters.length
        ? candidate.experienceAreas.filter(area => filters.some(f => f.toLowerCase() === area.toLowerCase()))
        : [];
      const textMatch = q && [candidate.role, candidate.industry, ...candidate.experienceAreas].join(" ").toLowerCase().includes(q);
      return { ...candidate, matched, textMatch };
    }).filter(candidate => !filters.length || candidate.matched.length || candidate.textMatch)
      .sort((a, b) => b.matched.length - a.matched.length);
  }, [requirement, filters]);

  const toggleFilter = (filter) => setActiveFilters(current => current.includes(filter) ? current.filter(x => x !== filter) : [...current, filter]);
  const toggleShortlist = (id) => setShortlisted(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);

  return (
    <div className="recruiter-page">
      <header className="recruiter-topbar">
        <a className="recruiter-brand" href="/"><img className="pdp-real-logo" src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
        <nav><a href="/">Home</a><a href="/professionals">Professionals</a><a className="active" href="/recruiters">Discover Talent</a><a href="#shortlist">Shortlist</a></nav>
        <a className="recruiter-back" href="/">← PDP Home</a>
      </header>

      <main className="recruiter-shell" id="discover">
        <section className="recruiter-hero">
          <div className="recruiter-eyebrow">PDP FOR RECRUITERS</div>
          <h1>Find the right experience.<br /><em>Then see the proof.</em></h1>
          <p>Describe the professional you need. PDP turns the requirement into relevant experience areas and surfaces profiles you can inspect before contacting.</p>

          <div className="requirement-box">
            <label htmlFor="job-requirement">JOB REQUIREMENT</label>
            <textarea id="job-requirement" value={requirement} onChange={e => setRequirement(e.target.value)} placeholder="Paste a job description or describe what you are looking for…\nExample: FMCG business development professional with distributor management, product launch and new market development experience." />
            <div className="requirement-actions"><span>Discovery is currently deterministic — no AI/API required.</span><button onClick={() => { setRequirement("FMCG Business Development professional with distributor management, product launch and new market development experience."); setActiveFilters([]); }}>Try FMCG Example →</button></div>
          </div>

          {(suggestedFilters.length > 0 || activeFilters.length > 0) && <section className="requirement-results">
            <div className="section-kicker">RELEVANT EXPERIENCE</div>
            <h2>What matters in this requirement</h2>
            <p>These filters become the bridge between the job requirement and candidate evidence.</p>
            <div className="filter-row">{suggestedFilters.map(filter => <button key={filter} className={filters.includes(filter) ? "selected" : ""} onClick={() => toggleFilter(filter)}>{filter}<span>{filters.includes(filter) ? "✓" : "+"}</span></button>)}</div>
          </section>}
        </section>

        <section className="candidate-section" id="shortlist">
          <div className="candidate-head"><div><div className="section-kicker">DISCOVER TALENT</div><h2>{filters.length ? "Professionals with relevant experience" : "Explore sample PDP professionals"}</h2></div><span>{candidates.length} profiles</span></div>
          <div className="candidate-grid">
            {candidates.map(candidate => <article className="candidate-card" key={candidate.id}>
              <div className="candidate-card-top"><div className="candidate-avatar">{(candidate.name || "PDP").trim().split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0,2)}</div><div><h3>{candidate.name}</h3><p>{candidate.role}</p></div><span className="evidence-badge">● Proof</span></div>
              <div className="candidate-meta"><span>⌖ {candidate.location}</span><span>◷ {candidate.stats.experience}+ yrs</span><span>{candidate.industry}</span></div>
              <div className="match-label">MATCHED EXPERIENCE</div>
              <div className="candidate-tags">{(candidate.matched.length ? candidate.matched : candidate.experienceAreas.slice(0,4)).map(tag => <span key={tag}>{tag}</span>)}</div>
              <div className="proof-row">{candidate.proof.map(item => <span key={item}>✓ {item}</span>)}</div>
              <div className="candidate-actions"><a className="view-pdp" href="/pdp/ananya">View PDP →</a><button className={shortlisted.includes(candidate.id) ? "shortlisted" : ""} onClick={() => toggleShortlist(candidate.id)}>{shortlisted.includes(candidate.id) ? "✓ Shortlisted" : "+ Add to Shortlist"}</button></div>
            </article>)}
          </div>
          {candidates.length === 0 && <div className="empty-state">No sample profile matches this requirement yet. Try broader experience terms.</div>}
          <p className="demo-note">Demo discovery data only. Candidate claims, experience and proof will come from real PDP profiles after authentication and backend connection.</p>
        </section>

        <section className="recruiter-flow" id="how"><div><div className="section-kicker">THE PDP RECRUITER FLOW</div><h2>Requirement → Experience → Proof → Contact</h2></div><div className="flow-cards"><div><b>01</b><strong>Describe the need</strong><span>Paste a JD or define the role.</span></div><div><b>02</b><strong>Find relevant experience</strong><span>Use role and industry evidence.</span></div><div><b>03</b><strong>Open the PDP</strong><span>Review projects, videos and work proof.</span></div><div><b>04</b><strong>Shortlist & connect</strong><span>Save or contact the professional.</span></div></div></section>
      </main>
    </div>
  );
}
