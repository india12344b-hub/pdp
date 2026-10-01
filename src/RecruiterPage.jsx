import React, { useEffect, useMemo, useState } from "react";
import { getDraft } from "./pdpDraft";
import { getMedia, getIntro } from "./pdpStorage";
import { getRoleProfile, buildShortlistTools } from "./pdpProfileData";
import pdpLogo from "./pdp-logo.png";
import PdpPal from "./PdpPal";

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

function requirementFilters(text, areas) {
  const q = text.toLowerCase();
  return areas.filter(label => (ALIASES[label.toLowerCase()] || [label.toLowerCase()]).some(term => q.includes(term)));
}

export default function RecruiterPage() {
  const [draft, setDraft] = useState(getDraft());
  const [proof, setProof] = useState([]);
  const [hasIntro, setHasIntro] = useState(false);
  const [requirement, setRequirement] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    Promise.all([getMedia(), getIntro()]).then(([media, intro]) => { setProof(media || []); setHasIntro(!!intro); }).catch(() => {});
  }, []);

  const profile = useMemo(() => ({ ...draft }), [draft]);
  const roleProfile = useMemo(() => getRoleProfile(profile), [profile.role, profile.skills?.join(","), profile.about]);
  const areas = useMemo(() => buildShortlistTools(profile, roleProfile, profile.experience || []), [profile, roleProfile]);
  const suggestedFilters = useMemo(() => requirementFilters(requirement, areas), [requirement, areas]);
  const filters = searchSubmitted ? (activeFilters.length ? activeFilters : suggestedFilters) : [];
  const haystack = [profile.name, profile.role, profile.location, profile.about, ...(profile.skills || []), ...(profile.experience || []).flatMap(x => [x.company, x.role, x.desc, x.highlight, ...(x.tags || [])])].filter(Boolean).join(" ").toLowerCase();
  const matched = filters.filter(f => (ALIASES[f.toLowerCase()] || [f.toLowerCase()]).some(t => haystack.includes(t)));
  const profileReady = Boolean(profile.name && profile.role);

  const toggleFilter = filter => { setSearchSubmitted(true); setActiveFilters(current => current.includes(filter) ? current.filter(x => x !== filter) : [...current, filter]); };
  const runSearch = () => {
    if (!requirement.trim()) return;
    setActiveFilters(suggestedFilters);
    setSearchSubmitted(true);
    window.requestAnimationFrame(() => document.getElementById("requirement-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const applySearch = (text) => {
    setRequirement(text);
    setActiveFilters(requirementFilters(text, areas));
    setSearchSubmitted(true);
  };
  const palProfiles = profileReady ? [{
    name: profile.name,
    role: profile.role,
    location: profile.location,
    experience: profile.stats?.experience,
    proofCount: proof.length + (hasIntro ? 1 : 0),
    haystack,
    url: "/pdp/me",
  }] : [];

  return <div className="recruiter-page">
    <header className="recruiter-topbar">
      <a className="recruiter-brand" href="/"><img className="pdp-real-logo" src={pdpLogo} alt="PDP — Professional Digital Profile" /></a>
      <nav><a href="/">Home</a><a href="/professionals">Professionals</a><a className="active" href="/recruiters">Discover Talent</a><a href="#shortlist">Shortlist</a></nav>
      <a className="recruiter-back" href="/">← PDP Home</a>
    </header>

    <main className="recruiter-shell" id="discover">
      <section className="recruiter-hero">
        <div className="recruiter-eyebrow">PDP FOR RECRUITERS</div>
        <h1>Find relevant experience.<br /><em>Then see the proof.</em></h1>
        <p>Describe the professional you need. PDP turns the requirement into relevant experience areas and surfaces live PDP profiles.</p>
        <div className="requirement-box">
          <label htmlFor="job-requirement">JOB REQUIREMENT</label>
          <textarea id="job-requirement" value={requirement} onChange={e => { setRequirement(e.target.value); setSearchSubmitted(false); setActiveFilters([]); }} placeholder="Paste a job description or describe what you are looking for…" />
          <div className="requirement-actions"><span>Live profile data only — no fabricated candidates.</span><div className="requirement-action-group">{areas.length > 0 && <button type="button" onClick={() => { setRequirement(areas.slice(0, 4).join(", ")); setSearchSubmitted(false); setActiveFilters([]); }}>Use profile experience →</button>}<button type="button" className="requirement-search-btn" onClick={runSearch} disabled={!requirement.trim()}>Search <span aria-hidden="true">→</span></button></div></div>
        </div>
        {searchSubmitted && (suggestedFilters.length > 0 || activeFilters.length > 0) && <section className="requirement-results" id="requirement-results"><div className="section-kicker">RELEVANT EXPERIENCE</div><h2>What matters in this requirement</h2><p>These filters connect the requirement to documented candidate experience.</p><div className="filter-row">{suggestedFilters.map(filter => <button key={filter} className={filters.includes(filter) ? "selected" : ""} onClick={() => toggleFilter(filter)}>{filter}<span>{filters.includes(filter) ? "✓" : "+"}</span></button>)}</div></section>}
      </section>

      <section className="candidate-section" id="shortlist">
        <div className="candidate-head"><div><div className="section-kicker">DISCOVER TALENT</div><h2>{profileReady ? "Live PDP profile" : "No live candidate profile yet"}</h2></div><span>{profileReady ? "1 live profile" : "0 profiles"}</span></div>
        {profileReady ? <article className="candidate-card">
          <div className="candidate-card-top"><div className="candidate-avatar">{(profile.name || "PDP").trim().split(/\s+/).filter(Boolean).map(x => x[0]).join("").slice(0,2).toUpperCase()}</div><div><h3>{profile.name}</h3><p>{profile.role}</p></div><span className="evidence-badge">● {proof.length + (hasIntro ? 1 : 0)} proof items</span></div>
          <div className="candidate-meta"><span>⌖ {profile.location || "Location not added"}</span><span>◷ {profile.stats?.experience || "Experience not added"}</span><span>{roleProfile.category}</span></div>
          <div className="match-label">MATCHED EXPERIENCE</div>
          <div className="candidate-tags">{(matched.length ? matched : areas.slice(0, 6)).map(tag => <span key={tag}>{tag}</span>)}</div>
          <div className="proof-row">{hasIntro && <span>✓ Career introduction</span>}{proof.filter(x => x.type === "image").length > 0 && <span>✓ {proof.filter(x => x.type === "image").length} photos</span>}{proof.filter(x => x.type === "video").length > 0 && <span>✓ {proof.filter(x => x.type === "video").length} videos</span>}</div>
          <div className="candidate-actions"><a className="view-pdp" href="/pdp/me">View PDP →</a><button className={shortlisted ? "shortlisted" : ""} onClick={() => setShortlisted(x => !x)}>{shortlisted ? "✓ Shortlisted" : "+ Add to Shortlist"}</button></div>
        </article> : <div className="empty-state">No candidate profile has been created yet. Start with <a href="/upload-resume">Upload Resume</a> and build the real PDP.</div>}
      </section>

      <section className="recruiter-flow" id="how"><div><div className="section-kicker">THE PDP RECRUITER FLOW</div><h2>Requirement → Experience → Proof → Contact</h2></div><div className="flow-cards"><div><b>01</b><strong>Describe the need</strong><span>Paste a JD or define the role.</span></div><div><b>02</b><strong>Find relevant experience</strong><span>Use documented role and industry evidence.</span></div><div><b>03</b><strong>Open the PDP</strong><span>Review real projects, videos and photos.</span></div><div><b>04</b><strong>Shortlist & connect</strong><span>Save or contact the professional.</span></div></div></section>
    </main>
    <PdpPal profiles={palProfiles} onSearch={applySearch} onShortlist={() => setShortlisted(true)} />
  </div>;
}
