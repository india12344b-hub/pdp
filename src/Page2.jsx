import React from 'react';
import './page2.css';

export default function Page2() {
  return (
    <div className="pd2-page">
      {/* Top Navigation Bar */}
      <header className="pd2-topbar">
        <div className="pd2-brand">
          <div className="pd2-mark">
            <span />
          </div>
          <div>
            <strong>PDP</strong>
            <small>FOR PROFESSIONALS</small>
          </div>
        </div>

        <nav>
          <a href="#how-it-works" className="active">How It Works</a>
          <a href="#features">Features</a>
          <a href="#proof">Proof & Credibility</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#career-story">Career Story</a>
        </nav>

        <a href="#get-started" className="pd2-header-cta">
          Get Started
        </a>

        <button className="pd2-menu" aria-label="Toggle Menu">
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Hero Section */}
      <section className="pd2-hero">
        <div className="pd2-hero-copy">
          <a href="/students" className="pd2-back">
            <span>&larr;</span> Looking for Student Profiles?
          </a>
          <h1>
            Stand Out to Employers with a <em>Living Profile</em>
          </h1>
          <p>
            Transform your static resume into an interactive, proof-backed digital portfolio designed for modern professionals and recruiters.
          </p>
          <div className="pd2-actions">
            <a href="#create" className="pd2-btn primary">Create Your PDP</a>
            <a href="#demo" className="pd2-btn outline">View Live Demo</a>
          </div>
          <div className="pd2-trust">
            <span><b>✓</b> Verified Credentials</span>
            <span><b>✓</b> Recruiter Ready</span>
          </div>
        </div>

        <div className="pd2-hero-art">
          <div className="pd2-hero-glow" />
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
            alt="Professional Hero"
            className="pd2-hero-person"
          />

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

          {/* Profile Card Overlay */}
          <div className="pd2-profile-card">
            <div className="pd2-avatar">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Ananya Sharma"
              />
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

      {/* Section 01: Resume Transformation */}
      <section className="pd2-section pd2-two-col" id="how-it-works">
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
          <div className="pd2-arrow">&rarr;</div>
          <div className="pd2-mini-profile">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Ananya"
            />
            <strong>Ananya Sharma <small>•</small></strong>
            <em>Product Designer</em>
            <div className="pd2-list">
              <span><i></i> Experience ────────</span>
              <span><i></i> Skills ────────</span>
              <span><i></i> Projects ────────</span>
              <span><i></i> Education ────────</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: Proof Grid */}
      <section className="pd2-section pd2-proof-section" id="proof">
        <div className="pd2-section-head">
          <div className="pd2-section-copy">
            <div className="pd2-no">02</div>
            <div>
              <h2>Bring Proof To Your Claims</h2>
              <p>Don't just list achievements—show evidence with attached media, links, and documents.</p>
            </div>
          </div>
          <a href="#proof-demo" className="pd2-small-cta">See Proof Gallery</a>
        </div>

        <div className="pd2-proof-grid">
          <div className="pd2-proof-card">
            <div className="pd2-proof-image">
              <span>📂</span>
              <img
                src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
                alt="Case Studies"
              />
            </div>
            <h3>Project Case Studies</h3>
            <p>Attach rich visual portfolios, live demos, and project impact metrics directly.</p>
          </div>

          <div className="pd2-proof-card">
            <div className="pd2-proof-image">
              <span>🏆</span>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
                alt="Verified Achievements"
              />
            </div>
            <h3>Verified Achievements</h3>
            <p>Highlight team awards, leadership milestones, and verified certifications.</p>
          </div>

          <div className="pd2-proof-card">
            <div className="pd2-proof-image">
              <span>💬</span>
              <img
                src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80"
                alt="Social Proof"
              />
            </div>
            <h3>Peer & Leadership Endorsements</h3>
            <p>Showcase direct testimonials from managers, clients, and team members.</p>
          </div>
        </div>
      </section>

      {/* Section 03: Evidence */}
      <section className="pd2-section pd2-evidence" id="features">
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
            <a href="#explore">Explore Examples &rarr;</a>
          </div>

          <div className="pd2-inventory">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
              alt="Dashboard Preview"
            />
            <div>
              <small>FEATURED PROJECT</small>
              <strong>FinTech Mobile App Redesign</strong>
              <p>Increased user conversion by 34% through intuitive design overhaul.</p>
              <a href="#case-study">View Case Study</a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: Testimonials */}
      <section className="pd2-section pd2-speak" id="testimonials">
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

      {/* Section 05: Career Timeline */}
      <section className="pd2-section pd2-story" id="career-story">
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
      <section className="pd2-bottom-cta" id="get-started">
        <div>
          <p>Ready to upgrade your professional presence?</p>
          <h2>Build Your Professional Profile Today</h2>
          <a href="#signup" className="pd2-btn primary">Create Profile Now</a>
          <a href="#learn-more" className="pd2-btn outline">Learn More</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="pd2-footer">
        <div className="pd2-footer-inner">
          <div className="pd2-brand">
            <div className="pd2-mark">
              <span />
            </div>
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