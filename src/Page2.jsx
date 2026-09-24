import React from "react";

const I = {
  hero: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=88",
  resume: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=82",
  work: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=82",
  project: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=82",
  team: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=82",
  certificate: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=900&q=82",
  presentation: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=82",
  inventory: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=82",
  recruiter: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1100&q=82",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=88",
};

const Arrow = () => <span aria-hidden="true">→</span>;
const Icon = ({ children }) => <span className="pd2-icon">{children}</span>;

function Logo() {
  return (
    <a className="pd2-brand" href="/" aria-label="PDP home">
      <span className="pd2-mark"><span /></span>
      <span><strong>PDP</strong><small>Professional Digital Profile</small></span>
    </a>
  );
}

function Header() {
  return (
    <header className="pd2-topbar">
      <Logo />
      <nav>
        <a href="/">Home</a>
        <a className="active" href="/professionals">For Professionals</a>
        <a href="/#recruiters">For Recruiters</a>
        <a href="/#how">View Demo PDP</a>
        <a href="/#how">How It Works</a>
      </nav>
      <a className="pd2-header-cta" href="#create">Create Your PDP <Arrow /></a>
      <button className="pd2-menu" aria-label="Menu"><span/><span/><span/></button>
    </header>
  );
}

const proofCards = [
  ["Career Video", "Explain your journey, expertise and achievements in your own voice.", I.hero, "▶"],
  ["Project Videos", "Demos, presentations, product walkthroughs, processes.", I.project, "▶"],
  ["Work Photos", "Projects, site visits, client meetings, teams, events, business trips.", I.team, "▣"],
  ["Projects & Outcomes", "What you worked on → what you did → what changed.", I.work, "◉"],
  ["Credentials & Awards", "Certificates, awards and professional achievements.", I.certificate, "✪"],
  ["Presentations & Documents", "Show the work behind your experience.", I.presentation, "▤"],
];

const testimonials = [
  ["Rohit Mehta", "Product Manager", "Ananya is a results-driven professional with great leadership skills.", "Manager"],
  ["Sneha Verma", "Team Member", "A fantastic team player and always brings fresh ideas.", "Colleague"],
  ["Vikram Saini", "Client", "Delivered exceptional work and exceeded expectations.", "Client"],
];

function Page2() {
  return (
    <div className="pd2-page">
      <Header />

      <main>
        <section className="pd2-hero">
          <div className="pd2-hero-copy">
            <a className="pd2-back" href="/"><span>←</span> For Professionals</a>
            <h1>Your Resume Tells<br/>Your Story.<br/><em>Your PDP Shows It.</em></h1>
            <p>Build a professional profile that goes beyond a PDF. Showcase your real work, achievements and experience — with proof.</p>
            <div className="pd2-actions">
              <a className="pd2-btn primary" href="#create">Create Your PDP — Free <Arrow/></a>
              <a className="pd2-btn outline" href="#demo">View Demo PDP <Arrow/></a>
            </div>
            <div className="pd2-trust">
              <span><b>✓</b>No AI-generated showcases</span>
              <span><b>✓</b>Real proof only</span>
              <span><b>✓</b>Free for professionals</span>
            </div>
          </div>
          <div className="pd2-hero-art">
            <div className="pd2-hero-glow"/>
            <div className="pd2-float career"><img src={I.hero}/><span>Career Video</span><i>◉</i></div>
            <div className="pd2-float photos"><img src={I.work}/><span>Work Photos</span><i>◉</i></div>
            <div className="pd2-float projects"><img src={I.project}/><span>Projects</span><i>◉</i></div>
            <div className="pd2-float cert"><div className="pd2-cert-art">▤</div><span>Certifications</span><i>◉</i></div>
            <div className="pd2-float achievement"><div className="pd2-mini-chart">↗</div><span>Achievements</span><i>◉</i></div>
            <div className="pd2-float recommendation"><div className="pd2-people">♧</div><span>Recommendations</span><i>◉</i></div>
            <img className="pd2-hero-person" src={I.hero} alt="Professional profile"/>
            <div className="pd2-profile-card">
              <div className="pd2-avatar"><img src={I.hero}/></div>
              <div><strong>Ananya Sharma <span>●</span></strong><small>Product Designer</small><p>Designing products that<br/>people love.</p><div className="pd2-tags"><i>UI/UX</i><i>Design</i><i>Product</i></div></div>
              <div className="pd2-qr">▦</div>
            </div>
          </div>
        </section>

        <section className="pd2-section pd2-two-col" id="demo">
          <SectionNo n="01" title={<>Turn Your Resume Into<br/>Your Professional Identity</>} text="Upload your existing resume. We structure your experience into a living professional profile." />
          <div className="pd2-resume-art">
            <div className="pd2-paper"><span>▤</span><b>Your Resume</b><small>(PDF)</small></div>
            <div className="pd2-arrow">→</div>
            <div className="pd2-mini-profile"><img src={I.hero}/><strong>Ananya Sharma <small>●</small></strong><em>Product Designer</em><div className="pd2-list">{["Experience","Skills","Projects","Education","Certifications","Achievements"].map(x=><span key={x}>◉ <b>{x}</b><i/></span>)}</div></div>
          </div>
          <div className="pd2-demo-link"><a href="#demo">See Demo PDP <Arrow/></a></div>
        </section>

        <section className="pd2-section pd2-proof-section">
          <div className="pd2-section-head"><SectionNo n="02" title="Show What You Actually Did" text="Your work deserves more than bullet points."/><a className="pd2-small-cta" href="#demo">View Demo PDP <Arrow/></a></div>
          <div className="pd2-proof-grid">
            {proofCards.map(([title,text,img,icon])=><article className="pd2-proof-card" key={title}><div className="pd2-proof-image"><img src={img}/><span>{icon}</span></div><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="pd2-section pd2-evidence">
          <SectionNo n="03" title={<>Make Your Experience<br/>Evidence-Rich</>} text="Go beyond generic claims. Show the real impact of your work."/>
          <div className="pd2-evidence-content">
            <div className="pd2-evidence-card"><Icon>♧</Icon><strong>Team Leadership</strong><small>15-member team&nbsp; | &nbsp;Project Orion&nbsp; | &nbsp;2.5 years</small><p><b>Evidence:</b> Project + Presentation + Recommendation</p><a href="#demo">See example <Arrow/></a></div>
            <div className="pd2-inventory"><img src={I.inventory}/><div><small>Project</small><strong>Smart Inventory System</strong><p>Reduced stockout by 28% and<br/>improved efficiency.</p><a href="#demo">View Evidence <Arrow/></a></div></div>
          </div>
        </section>

        <section className="pd2-section pd2-speak">
          <SectionNo n="04" title="Let People You Worked With Speak" text="Your professional reputation shouldn't depend only on what you say about yourself."/>
          <div className="pd2-testimonials">{testimonials.map(([name,role,quote,type])=><article key={name}><div className="pd2-person"><span>{name[0]}</span><div><strong>{name}</strong><small>{role}</small></div></div><p>“{quote}”</p><small className="pd2-type">{type}</small></article>)}</div>
        </section>

        <section className="pd2-section pd2-story">
          <SectionNo n="05" title="Build Your Professional Story" text="Show your journey, growth and achievements with a visual timeline."/>
          <div className="pd2-timeline">
            {[['Education','2015','♧'],['First Role','2016','⌁'],['Projects','2018','▤'],['Promotion','2020','↗'],['Leadership','2022','♧'],['Today','2025','◆']].map(([x,y,ico],i)=><div className={i===5?'current':''} key={x}><span>{ico}</span><b>{x}</b><small>{y}</small></div>)}
          </div>
        </section>

        <section className="pd2-section pd2-link-section">
          <SectionNo n="06" title={<>One Link. Your Entire<br/>Professional Story.</>} text="Share your PDP everywhere — resume, LinkedIn, email, WhatsApp, portfolio or QR code."/>
          <div className="pd2-link-art">
            <div className="pd2-link-hub"><b>↗</b></div>
            <span className="l resume">Resume <i>▤</i></span><span className="l linkedin"><i>in</i> LinkedIn</span><span className="l email"><i>✉</i> Email</span><span className="l whatsapp"><i>◉</i> WhatsApp</span><span className="l qr"><i>▦</i> QR Code</span><span className="l portfolio">Portfolio <i>▣</i></span>
          </div>
          <a className="pd2-share-link" href="#create">↗ &nbsp; pdp.com/ananya <span>▢</span></a>
        </section>

        <section className="pd2-section pd2-discover">
          <SectionNo n="07" title="Get Discovered" text="Don't just apply. Let your work be discovered. When companies search for relevant professionals, your content can help them understand your experience, skills, projects and proof."/>
          <div className="pd2-recruiter-card"><div><h3>Why Recruiters Choose PDP</h3><p>✓ See your real work and achievements</p><p>✓ Match skills, projects and experience</p><p>✓ View recommendations and credibility</p><p>✓ Make faster, confident hiring decisions</p></div><div className="pd2-recruiter-img"><img src={I.recruiter}/><em>Real work.<br/>Real people.</em></div></div>
          <a className="pd2-small-cta" href="#demo">View Demo PDP <Arrow/></a>
        </section>

        <section className="pd2-section pd2-control">
          <SectionNo n="08" title="Your PDP, Your Control" text="You decide what to showcase."/>
          <div className="pd2-controls">{[['Add / remove','evidence','⊕'],['Edit your','profile','✎'],['Control','visibility','◉'],['Update your','experience','↗'],['Respond to','recommendations','♧'],['Raise concerns','(if needed)','ⓘ']].map(([a,b,i])=><div key={a}><span>{i}</span><strong>{a}<br/>{b}</strong></div>)}</div>
        </section>

        <section className="pd2-bottom-cta" id="create">
          <div><p>Your career is more than a resume.</p><h2>Show the work behind it.</h2><div><a className="pd2-btn primary" href="#create">Create Your PDP — Free <Arrow/></a><a className="pd2-btn outline" href="#demo">View Demo PDP <Arrow/></a></div></div>
        </section>
      </main>

      <footer className="pd2-footer">
        <div className="pd2-footer-inner"><Logo/><div className="pd2-footer-message">Build your professional presence.<br/><strong>Showcase your work. Get discovered.</strong></div><nav><a href="/">Home</a><a href="/professionals">For Professionals</a><a href="/#recruiters">For Recruiters</a><a href="/#how">How It Works</a></nav><div className="pd2-social"><span>in</span><span>𝕏</span><span>▶</span></div></div>
      </footer>
    </div>
  );
}

function SectionNo({n,title,text}) {
  return <div className="pd2-section-copy"><div className="pd2-no">{n}</div><div><h2>{title}</h2>{text&&<p>{text}</p>}</div></div>;
}

export default Page2;
