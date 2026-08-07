import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogPosts';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import './Landing.css';

export const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <LandingNav />

      <header className="cu-hero">
        <div className="l-container">
          <span className="l-eyebrow">Guides for students applying abroad</span>
          <h1>The ScholarBridge Blog</h1>
          <p className="l-lead">
            Practical, specific advice on documents, deadlines, tests and writing — the parts of applying
            abroad that rarely get explained clearly.
          </p>
        </div>
      </header>

      <section>
        <div className="l-container">
          <div className="l-blog-grid">
            {BLOG_POSTS.map(p => (
              <div key={p.slug} className="l-blog-card" onClick={() => navigate(`/blog/${p.slug}`)} role="link" tabIndex={0}>
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

      <LandingFooter />
    </div>
  );
};
