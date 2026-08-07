import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getPostBySlug, BLOG_POSTS } from '../data/blogPosts';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import './Landing.css';
import './BlogPost.css';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = getPostBySlug(slug || '');

  if (!post) return <Navigate to="/blog" replace />;

  const related = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="landing">
      <LandingNav />

      <article className="bp-wrap">
        <div className="l-container bp-container">
          <button className="bp-back" onClick={() => navigate('/blog')}>← All articles</button>
          <span className="l-eyebrow">{post.tag}</span>
          <h1 className="bp-title">{post.title}</h1>
          <div className="bp-meta">
            <span>{fmtDate(post.date)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          <div className="bp-body">
            {post.body.map((para, i) =>
              para.startsWith('## ')
                ? <h2 key={i}>{para.slice(3)}</h2>
                : <p key={i}>{para}</p>
            )}
          </div>

          {related.length > 0 && (
            <div className="bp-related">
              <h3>Keep reading</h3>
              <div className="l-blog-grid">
                {related.map(p => (
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
          )}
        </div>
      </article>

      <LandingFooter />
    </div>
  );
};
