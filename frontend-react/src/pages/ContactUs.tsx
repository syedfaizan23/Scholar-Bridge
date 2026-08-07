import React, { useState } from 'react';
import { inquiryAPI } from '../api/inquiries';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingFooter } from '../components/landing/LandingFooter';
import './Landing.css';
import './ContactUs.css';

const initialForm = { name: '', email: '', phone: '', country: '', subject: '', message: '' };

export const ContactUs = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Required';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await inquiryAPI.submit(form);
      setSent(true);
      setForm(initialForm);
    } catch {
      setErrors({ form: "Something went wrong — please try again in a moment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing">
      <LandingNav />

      <header className="cu-hero">
        <div className="l-container">
          <span className="l-eyebrow">We'd love to hear from you</span>
          <h1>Get in touch</h1>
          <p className="l-lead">
            Questions about a scholarship, your application, or just want to say hi — send us a message
            and we'll get back to you.
          </p>
        </div>
      </header>

      <section>
        <div className="l-container cu-grid">
          <div className="cu-form-card l-reveal in">
            {sent ? (
              <div className="cu-success">
                <span className="cu-success-icon">✅</span>
                <h3>Message sent</h3>
                <p>Thanks for reaching out — we'll get back to you soon.</p>
                <button className="l-btn l-btn-primary" onClick={() => setSent(false)}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="cu-row">
                  <div className="cu-field">
                    <label>Name *</label>
                    <input value={form.name} onChange={set('name')} placeholder="Your full name" />
                    {errors.name && <span className="cu-err">{errors.name}</span>}
                  </div>
                  <div className="cu-field">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                    {errors.email && <span className="cu-err">{errors.email}</span>}
                  </div>
                </div>
                <div className="cu-row">
                  <div className="cu-field">
                    <label>Phone</label>
                    <input value={form.phone} onChange={set('phone')} placeholder="Include country code" />
                  </div>
                  <div className="cu-field">
                    <label>Country</label>
                    <input value={form.country} onChange={set('country')} placeholder="Where are you applying from?" />
                  </div>
                </div>
                <div className="cu-field">
                  <label>Subject *</label>
                  <input value={form.subject} onChange={set('subject')} placeholder="What's this about?" />
                  {errors.subject && <span className="cu-err">{errors.subject}</span>}
                </div>
                <div className="cu-field">
                  <label>Message *</label>
                  <textarea rows={5} value={form.message} onChange={set('message')} placeholder="Tell us a bit more..." />
                  {errors.message && <span className="cu-err">{errors.message}</span>}
                </div>
                {errors.form && <p className="cu-err" style={{ marginBottom: 12 }}>{errors.form}</p>}
                <button className="l-btn l-btn-primary l-btn-lg" type="submit" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="cu-info l-reveal in">
            <div className="cu-info-card">
              <span className="cu-info-icon">📍</span>
              <div><strong>Office</strong><p>32-B, Gulberg III, Lahore, Punjab, Pakistan</p></div>
            </div>
            <div className="cu-info-card">
              <span className="cu-info-icon">📞</span>
              <div><strong>Phone</strong><p><a href="tel:+923451234567">+92 345 123 4567</a></p></div>
            </div>
            <div className="cu-info-card">
              <span className="cu-info-icon">✉️</span>
              <div><strong>Email</strong><p><a href="mailto:contact@scholarbridge.com">contact@scholarbridge.com</a></p></div>
            </div>
            <div className="cu-info-card">
              <span className="cu-info-icon">🕐</span>
              <div><strong>Hours</strong><p>Mon–Fri 9am–6pm, Sat 10am–2pm (PKT)</p></div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};
