import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../api/reviews';
import { Review, PaginatedResponse } from '../types';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import { Stars } from '../components/common/Stars';
import { fmtDate } from '../utils/helpers';
import reviewsImg from '../assets/reviews-students.png';
import './Landing.css';
import './ReviewsPage.css';

export const ReviewsPage = () => {
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewAPI.listPublic().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  const avg = data?.results.length
    ? (data.results.reduce((s, r) => s + r.rating, 0) / data.results.length).toFixed(1)
    : null;

  return (
    <div className="landing">
      <LandingNav />

      <header className="rv-hero">
        <div className="l-container rv-hero-grid">
          <div>
            <span className="l-eyebrow">What students are saying</span>
            <h1>Reviews from real applicants</h1>
            <p className="l-lead">
              Honest feedback from students who used ScholarBridge to find and apply for scholarships abroad.
            </p>
            {avg && (
              <div className="rv-avg">
                <Stars value={Math.round(Number(avg))} size={20} />
                <span>{avg} average from {data?.count} review{data?.count === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>
          <div className="rv-hero-photo">
            <div className="rv-hero-photo-glow" />
            <img src={reviewsImg} alt="Students who reviewed ScholarBridge" />
          </div>
        </div>
      </header>

      <section>
        <div className="l-container">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--l-ink-soft)' }}>Loading reviews...</p>
          ) : !data?.results.length ? (
            <div className="rv-empty">
              <span style={{ fontSize: 32 }}>⭐</span>
              <h3>No reviews yet</h3>
              <p>Be the first student to share your experience — submit a review from your dashboard.</p>
            </div>
          ) : (
            <div className="rv-grid">
              {data.results.map(r => (
                <div key={r.id} className="rv-card">
                  <Stars value={r.rating} size={16} />
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                  <div className="rv-meta">
                    <span>{r.student_name}{r.student_country ? ` · ${r.student_country}` : ''}</span>
                    <span>{fmtDate(r.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};
