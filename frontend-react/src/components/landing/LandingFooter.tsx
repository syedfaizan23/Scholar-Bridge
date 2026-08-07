import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-icon.png';
import footerBg from '../../assets/footer-bg.jpg';

export const LandingFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';

  const goSection = (id: string) => {
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <footer className="l-footer" style={{ backgroundImage: `linear-gradient(rgba(11,18,32,.94), rgba(11,18,32,.94)), url(${footerBg})` }}>
      <div className="l-footer-grid">
        <div className="l-footer-brand">
          <div className="l-brand" style={{ marginBottom: 14 }}>
            <img src={logo} alt="ScholarBridge" className="l-brand-logo" />
            <span className="l-brand-name" style={{ color: '#fff' }}>ScholarBridge</span>
          </div>
          <p>Matching students to foreign scholarships, and handling the local paperwork that usually gets in the way.</p>
          <div className="l-social-row">
            <button className="l-social-icon" aria-label="Facebook">f</button>
            <button className="l-social-icon" aria-label="X (Twitter)">𝕏</button>
            <button className="l-social-icon" aria-label="LinkedIn">in</button>
            <button className="l-social-icon" aria-label="Instagram">IG</button>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><button onClick={() => onHome ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/')} className="l-footer-linkbtn">Home</button></li>
            <li><button onClick={() => goSection('features')} className="l-footer-linkbtn">Features</button></li>
            <li><button onClick={() => navigate('/blog')} className="l-footer-linkbtn">Blog</button></li>
            <li><button onClick={() => goSection('about')} className="l-footer-linkbtn">About</button></li>
            <li><button onClick={() => navigate('/reviews')} className="l-footer-linkbtn">Reviews</button></li>
            <li><button onClick={() => navigate('/contact')} className="l-footer-linkbtn">Contact Us</button></li>
          </ul>
        </div>
        <div>
          <h4>Contact Us</h4>
          <ul className="l-footer-contact">
            <li>📍 32-B, Gulberg III,<br/>Lahore, Punjab, Pakistan</li>
            <li>📞 <a href="tel:+923451234567">+92 345 123 4567</a></li>
            <li>✉️ <a href="mailto:contact@scholarbridge.com">contact@scholarbridge.com</a></li>
          </ul>
        </div>
        <div>
          <h4>Business Hours</h4>
          <ul>
            <li>Mon – Fri: 9:00 AM – 6:00 PM</li>
            <li>Saturday: 10:00 AM – 2:00 PM</li>
            <li>Sunday: Closed</li>
            <li style={{ color: '#6c7899', fontSize: 12 }}>(Pakistan Standard Time)</li>
          </ul>
        </div>
      </div>
      <div className="l-footer-bottom">
        <span>© {new Date().getFullYear()} ScholarBridge. All rights reserved.</span>
        <span>Built for students applying abroad.</span>
      </div>
    </footer>
  );
};
