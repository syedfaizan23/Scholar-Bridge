import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import { BLOG_POSTS } from '../data/blogPosts';
import heroImg from '../assets/hero-students.png';
import aboutImg from '../assets/about-student.png';
import ctaImg from '../assets/cta-student.png';
import './Landing.css';

const FEATURES = [
  { icon: '🎯', color: '#eff6ff', title: 'Smart matching', body: 'Filter by degree level, country, CGPA and IELTS score so you only see scholarships you can actually qualify for.' },
  { icon: '⏱️', color: '#fff7e6', title: 'One deadline tracker', body: 'Every scholarship you save shows its own countdown, so nothing slips past you across multiple applications.' },
  { icon: '🧭', color: '#f0fdf4', title: 'Guided application steps', body: 'A clear, step-by-step flow for every application — no guessing what a university actually needs from you.' },
  { icon: '📁', color: '#f5f3ff', title: 'One application vault', body: 'Transcripts, IELTS reports and personal statements live in one profile, ready to attach to your next application.' },
];

const STATS = [
  { value: '120+', label: 'Active scholarships listed' },
  { value: '10', label: 'Partner countries' },
  { value: '5k+', label: 'Students matched' },
  { value: '24hrs', label: 'Average review turnaround' },
];

const TESTIMONIALS = [
  { name: 'Ayesha Raza', role: "Master's applicant, Germany", quote: '"I stopped juggling five different spreadsheets — every deadline for every scholarship I saved was already sitting on one dashboard."' },
  { name: 'Hamza Tariq', role: "Bachelor's applicant, Netherlands", quote: '"The step-by-step application flow told me exactly what I still needed — no more guessing what a university actually wanted from me."' },
  { name: 'Sana Iqbal', role: 'PhD applicant, Sweden', quote: '"The matching filters saved me from applying to three scholarships I wasn\'t even eligible for. Found out in two minutes instead of two weeks."' },
];

const FAQS = [
  { q: 'Is ScholarBridge free to use?', a: 'Yes. Browsing, saving, matching and tracking scholarships is completely free. Any costs are set entirely by the scholarship or institution itself, and full details are shown once you start an application.' },
  { q: "How do I know if I'm actually eligible?", a: 'Every scholarship listing shows its own criteria, and your saved profile is checked against them automatically — so you\'ll see a clear eligibility result before you spend time applying.' },
  { q: 'Which countries are currently supported?', a: 'Scholarships are currently listed across Germany, the UK, the Netherlands, Sweden, Switzerland, Belgium, France, Denmark, Ireland and Norway, with more being added regularly.' },
  { q: 'Can I track more than one application at a time?', a: 'Yes — your dashboard shows every application you\'ve started, with its own status and next deadline, so you can run several in parallel without losing track.' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.l-reveal');
    if (!els?.length) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

export const Landing = () => {
  const navigate = useNavigate();
  const rootRef = useReveal();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, []);

  if (accessToken && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing" ref={rootRef}>
      <LandingNav />

      {/* ── Hero ── */}
      <header className="l-hero">
        <div className="l-container l-hero-grid">
          <div className="l-hero-text">
            <span className="l-eyebrow">Scholarship search for students applying abroad</span>
            <h1>Turn a deadline into an <em>acceptance letter</em>.</h1>
            <p className="l-lead">
              ScholarBridge matches you to foreign scholarships you actually qualify for, and keeps every
              deadline, document and application status in one place — so nothing slips through the cracks.
            </p>
            <div className="l-hero-cta">
              <button className="l-btn l-btn-primary l-btn-lg" onClick={() => navigate('/register')}>Start your application</button>
              <button className="l-btn l-btn-ghost l-btn-lg" onClick={() => scrollTo('features')}>See how it works</button>
            </div>
            <p className="l-hero-note">Browsing and matching are completely free.</p>
          </div>

          <div className="l-hero-photo">
            <div className="l-hero-photo-glow" />
            <img src={heroImg} alt="Students applying to scholarships together" />
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="l-stats-bar">
        <div className="l-stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="l-reveal">
              <div className="l-stat-num">{s.value}</div>
              <div className="l-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features">
        <div className="l-container">
          <div className="l-sec-head l-reveal">
            <span className="l-eyebrow">What you get</span>
            <h2>Everything between finding a scholarship and hitting submit.</h2>
          </div>
          <div className="l-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="l-feature-card l-reveal">
                <div className="l-feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="l-about-section">
        <div className="l-container l-about-grid-2col">
          <div className="l-reveal">
            <span className="l-eyebrow">About ScholarBridge</span>
            <h2 className="l-about-h2">Built to feel like a consultancy, not just a form.</h2>
            <p className="l-lead" style={{ marginBottom: 20 }}>
              Most students applying abroad end up paying a study-abroad consultant just to get someone to
              answer questions and check their documents. ScholarBridge does the matching and tracking
              automatically — and puts real people on the other end when you actually need them.
            </p>
            <div className="l-about-features">
              <div className="l-about-feature">
                <span>📞</span>
                <div><strong>Live call consultations</strong><p>Book a one-on-one call to talk through your shortlist, your profile, or a specific application.</p></div>
              </div>
              <div className="l-about-feature">
                <span>💬</span>
                <div><strong>Live chat support</strong><p>Quick questions about eligibility, deadlines or documents — answered by a real person, not a bot.</p></div>
              </div>
              <div className="l-about-feature">
                <span>📝</span>
                <div><strong>Document & essay review</strong><p>Have your personal statement or documents looked over before you submit, not after you get rejected.</p></div>
              </div>
            </div>
            <button className="l-btn l-btn-primary l-btn-lg" style={{ marginTop: 24 }} onClick={() => navigate('/contact')}>
              Talk to a consultant
            </button>
          </div>
          <div className="l-about-photo l-reveal">
            <div className="l-about-photo-glow" />
            <img src={aboutImg} alt="A ScholarBridge student consultant" />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="l-test-section">
        <div className="l-container">
          <div className="l-sec-head l-reveal">
            <span className="l-eyebrow">From students who've used it</span>
            <h2>Applying abroad, without the spreadsheet chaos.</h2>
          </div>
          <div className="l-test-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="l-test-card l-reveal">
                <p className="l-test-quote">{t.quote}</p>
                <div className="l-test-person">
                  <div className="l-test-avatar">{t.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className="l-test-name">{t.name}</div>
                    <div className="l-test-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog ── */}
      <section id="blog">
        <div className="l-container">
          <div className="l-sec-head l-reveal l-sec-head-row">
            <div>
              <span className="l-eyebrow">From the blog</span>
              <h2>Notes on applying, one step at a time.</h2>
            </div>
            <button className="l-btn l-btn-ghost" onClick={() => navigate('/blog')}>View all articles →</button>
          </div>
          <div className="l-blog-grid">
            {BLOG_POSTS.slice(0, 3).map(p => (
              <div key={p.slug} className="l-blog-card l-reveal" onClick={() => navigate(`/blog/${p.slug}`)} role="link" tabIndex={0}>
                <div className="l-blog-cover" style={{ background: '#eef1fb' }}>{p.icon}</div>
                <div className="l-blog-body">
                  <span className="l-blog-tag">{p.tag}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="l-blog-meta">{p.readTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <div className="l-container">
          <div className="l-sec-head l-reveal">
            <span className="l-eyebrow">Questions</span>
            <h2>Frequently asked</h2>
          </div>
          <div className="l-faq-list l-reveal">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`l-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="l-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {f.q}
                  <span className="l-faq-plus">+</span>
                </button>
                <div className="l-faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <div className="l-cta-band l-reveal">
        <div className="l-cta-content">
          <h2>Your next scholarship deadline doesn't have to sneak up on you.</h2>
          <p>Create a free account and start matching in under two minutes.</p>
          <div className="l-hero-cta">
            <button className="l-btn l-btn-gold l-btn-lg" onClick={() => navigate('/register')}>Create free account</button>
          </div>
        </div>
        <div className="l-cta-photo">
          <img src={ctaImg} alt="" />
        </div>
      </div>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
};
