import React, { useState } from "react";

const dimensions = [
  ["Organisation Fit", 28, 30, "How closely the candidate fits the organisation's operating environment."],
  ["Business Context", 22, 25, "Relevant market, customer, product and business-model exposure."],
  ["Culture & Work Environment", 18, 20, "Evidence of working effectively in a similar environment."],
  ["Role Requirements", 34, 40, "Direct alignment with the actual responsibilities of this role."],
  ["Capability Requirements", 16, 20, "Demonstrated capabilities required to perform the work."],
  ["Success Factors", 12, 15, "Signals connected to what success looks like in this organisation."],
  ["Career & Capability", 18, 20, "Depth, progression, relevance and consistency of the career story."],
  ["Evidence & Credibility", 9, 10, "Strength of available proof, references and corroborating information."],
  ["Transferability & Adaptability", 8, 10, "Ability to transfer relevant capability from adjacent contexts."],
];

const candidates = [
  ["Rohit Sharma", "Area Sales Manager", "FMCG", "5.8 yrs", "Gurgaon, Haryana", 92, "Strong distributor network, proven market expansion, relevant FMCG experience."],
  ["Pooja Nair", "Sales Manager", "FMCG", "6.2 yrs", "Pune, Maharashtra", 88, "Excellent leadership skills and strong product-launch experience."],
  ["Arjun Mehta", "Territory Sales Manager", "FMCG", "5.1 yrs", "Jaipur, Rajasthan", 85, "Good market exposure and solid distributor handling."],
  ["Neha Kapoor", "Sales Executive", "FMCG", "4.8 yrs", "Lucknow, Uttar Pradesh", 82, "Strong communication and good growth potential."],
  ["Amit Verma", "Area Sales Manager", "FMCG", "6.5 yrs", "Indore, Madhya Pradesh", 80, "Relevant experience with some modern-trade exposure."],
];

export default function Nexus9Page() {
  const [step, setStep] = useState(2);
  const [selected, setSelected] = useState(0);
  const [website, setWebsite] = useState("");

  return (
    <div className="n9-page">
      <header className="n9-nav">
        <a href="/recruiters" className="n9-logo">PDP <span>NEXUS-9</span></a>
        <div className="n9-nav-copy">Beyond Boolean</div>
        <nav><a href="/recruiters">For Recruiters</a><a className="active" href="/recruiters/nexus-9">NEXUS-9</a><a href="/recruiters/candidates">Candidate Selection</a></nav>
      </header>

      <main>
        <section className="n9-hero">
          <div>
            <div className="n9-kicker">PDP NEXUS-9 · BEYOND BOOLEAN</div>
            <h1>Don't just find a match.<br/><span>Find the right fit.</span></h1>
            <p>Tell PDP about the organisation, the role and the opening. NEXUS-9 builds the context, evaluates candidates across nine connected dimensions and explains why the strongest candidates deserve attention.</p>
          </div>
          <div className="n9-flow-hero">
            <div><b>Organisation</b><span>DNA</span></div><i>+</i><div><b>Role</b><span>DNA</span></div><i>+</i><div><b>Candidate</b><span>Intelligence</span></div><i>+</i><div><b>Evidence</b><span>Analysis</span></div><i>=</i><strong>Better<br/>Hiring</strong>
          </div>
        </section>

        <section className="n9-section n9-demo">
          <div className="n9-demo-head">
            <div><div className="n9-kicker">INTERACTIVE CONCEPT</div><h2>How a recruiter uses NEXUS-9</h2><p>The recruiter does not manage nine complicated filters. NEXUS-9 does the analysis; the recruiter controls only what matters.</p></div>
            <a href="/recruiters/candidates" className="n9-btn">Open Candidate Selection →</a>
          </div>
          <div className="n9-steps">
            {["Tell us about your Organisation & Role", "Set your Fit Priorities", "Get your Top Candidates"].map((x,i)=><button key={x} className={step===i?"active":""} onClick={()=>setStep(i)}><b>{i+1}</b><span>{x}</span></button>)}
          </div>

          {step === 0 && <div className="n9-setup">
            <div className="n9-card"><h3>Organisation</h3><label>COMPANY WEBSITE</label><input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yourcompany.com"/><small>We use the website as an important source for understanding the organisation, products, markets and operating context.</small><label>JOB REQUIREMENT</label><textarea placeholder="Paste or upload the JD / requirement..." defaultValue={'Area Sales Manager\nFMCG · Rajasthan · Distributor-led growth\n5+ years experience'} /></div>
            <div className="n9-dna"><span>WHAT NEXUS-9 BUILDS</span><h3>Organisation DNA + Role DNA</h3><p>Business model · products · customers · geography · growth context · role responsibilities · capability requirements · success factors.</p><div className="n9-mini-tags"><i>Business Context</i><i>Market</i><i>Role</i><i>Success Factors</i></div></div>
          </div>}

          {step === 1 && <div className="n9-priorities"><div className="n9-card"><h3>Fit Priorities</h3><p>Start with PDP's recommended weighting. Recruiters can adjust the importance of any dimension.</p>{dimensions.slice(0,6).map((d,i)=><div className="n9-priority" key={d[0]}><span>{d[0]}</span><b>{[30,25,20,40,20,15][i]}</b><input type="range" min="0" max={d[2]} defaultValue={d[1]}/></div>)}</div><div className="n9-card n9-side"><span>RECRUITER CONTROL</span><h3>Keep it simple</h3><p>You can increase the weight of what matters most. Everything else is handled by NEXUS-9.</p><div className="n9-example">Distributor Management <strong>40</strong><small>maximum possible points</small></div><div className="n9-example">Market Expansion <strong>30</strong><small>maximum possible points</small></div></div></div>}

          {step === 2 && <div className="n9-results">
            <div className="n9-result-list"><div className="n9-list-head"><div><span>126 CANDIDATES ANALYSED</span><h3>Top candidates</h3></div><select defaultValue="fit"><option value="fit">Sort by Overall Fit</option><option>Evidence Strength</option><option>Role Fit</option></select></div>{candidates.map((c,i)=><button key={c[0]} className={`n9-candidate ${selected===i?"selected":""}`} onClick={()=>setSelected(i)}><div className="n9-avatar">{c[0].split(" ").map(x=>x[0]).join("")}</div><div className="n9-c-info"><b>{c[0]} {i===0&&<em>Top Pick</em>}</b><span>{c[1]} · {c[2]} · {c[3]} · {c[4]}</span></div><div className="n9-score-mini"><strong>{c[5]}</strong><small>/100</small><div><i style={{width:`${c[5]}%`}}/></div></div><div className="n9-reason">{c[6]}</div></button>)}</div>
            <div className="n9-detail"><div className="n9-detail-top"><div><span>TOP CANDIDATE</span><h3>{candidates[selected][0]}</h3><p>{candidates[selected][1]} · {candidates[selected][2]} · {candidates[selected][4]}</p></div><strong>{candidates[selected][5]}<small>/100</small></strong></div><div className="n9-dims">{dimensions.map(d=><div key={d[0]} title={d[3]}><span>{d[0]}</span><b>{d[1]}/{d[2]}</b><i><em style={{width:`${(d[1]/d[2])*100}%`}}/></i></div>)}</div><div className="n9-why"><h4>Why this candidate?</h4><p>✓ Strong distributor network experience</p><p>✓ Proven new-market development</p><p>✓ Relevant FMCG product experience</p><p>✓ References and career evidence available</p><h4 className="warn">Potential concerns</h4><p>• Limited modern-trade exposure</p><p>• Has managed smaller teams than required</p></div><div className="n9-detail-actions"><button>Shortlist</button><button>Compare</button><button>View PDP</button></div></div>
          </div>}
        </section>

        <section className="n9-section n9-nine"><div className="n9-kicker">THE INTELLIGENCE BEHIND THE RESULT</div><h2>Nine dimensions. One complete picture.</h2><p>NEXUS-9 connects organisation understanding, role requirements, career capability, evidence and transferability instead of relying on keywords alone.</p><div className="n9-nine-grid">{dimensions.map((d,i)=><article key={d[0]}><b>{String(i+1).padStart(2,"0")}</b><h3>{d[0]}</h3><p>{d[3]}</p></article>)}</div></section>
      </main>
    </div>
  );
}
