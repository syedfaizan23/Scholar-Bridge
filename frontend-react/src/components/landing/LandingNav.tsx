import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-icon.png';

export const LandingNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const goSection = (id: string) => {
    setOpen(false);
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/#${id}`);
    }
  };

  const goHome = () => {
    setOpen(false);
    onHome ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/');
  };

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav className="l-nav">
      <div className="l-nav-inner">
        <div className="l-brand" onClick={goHome}>
          <img src={logo} alt="ScholarBridge" className="l-brand-logo" />
          <span className="l-brand-name">ScholarBridge</span>
        </div>
        <div className="l-nav-links">
          <button onClick={goHome}>Home</button>
          <button onClick={() => goSection('features')}>Features</button>
          <button onClick={() => go('/blog')}>Blog</button>
          <button onClick={() => goSection('about')}>About</button>
          <button onClick={() => go('/reviews')}>Reviews</button>
          <button onClick={() => go('/contact')}>Contact</button>
        </div>
        <div className="l-nav-cta">
          <button className="l-btn l-btn-ghost" onClick={() => go('/login')}>Log in</button>
          <button className="l-btn l-btn-primary" onClick={() => go('/register')}>Register</button>
        </div>
        <button className={`l-nav-burger${open ? ' l-nav-burger-open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      <div className={`l-nav-mobile${open ? ' l-nav-mobile-open' : ''}`}>
        <button onClick={goHome}>Home</button>
        <button onClick={() => goSection('features')}>Features</button>
        <button onClick={() => go('/blog')}>Blog</button>
        <button onClick={() => goSection('about')}>About</button>
        <button onClick={() => go('/reviews')}>Reviews</button>
        <button onClick={() => go('/contact')}>Contact</button>
        <div className="l-nav-mobile-cta">
          <button className="l-btn l-btn-ghost" onClick={() => go('/login')}>Log in</button>
          <button className="l-btn l-btn-primary" onClick={() => go('/register')}>Register</button>
        </div>
      </div>
    </nav>
  );
};
