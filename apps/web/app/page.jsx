export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="brand">PDP ✓</div>
        <p className="eyebrow">PROFESSIONAL DIGITAL PROFILE</p>
        <h1>Your Performance Display Platform.</h1>
        <p>Where skills are visually verified.</p>
        <div className="actions">
          <button>Explore Talent</button>
          <button>Find Opportunities</button>
        </div>
      </section>

      <section className="showcase">
        <p className="eyebrow">FEATURED TALENT</p>
        <h2>People. Proof. Performance.</h2>
        <p>Discover professionals through their work, achievements, projects and authentic media.</p>
      </section>

      <section className="companies">
        <p className="eyebrow">FOR COMPANIES</p>
        <h2>Drop an opening. Discover the right people.</h2>
        <p>Paste or upload a job opening. PDP's local-first matching engine will identify relevant candidates and explain why they match.</p>
        <button>I'm Hiring</button>
      </section>
    </main>
  );
}
