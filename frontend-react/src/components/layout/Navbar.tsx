import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';
import logo from '../../assets/logo-icon.png';

interface NavbarProps { onMenuClick?: () => void; }

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try { if (refreshToken) await authAPI.logout(refreshToken); } catch {}
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const goHome = () => navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard');

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {onMenuClick && (
          <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
            <span /><span /><span />
          </button>
        )}
        <div className="navbar-brand" onClick={goHome}>
          <img src={logo} alt="ScholarBridge" className="navbar-logo" />
          <span className="logo-text">Scholar<span>Bridge</span></span>
          {isAdmin && <span className="badge badge-admin" style={{marginLeft:6}}>ADMIN</span>}
        </div>
      </div>
      <div className="navbar-right">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="avatar" style={{background: isAdmin ? '#ef4444' : '#2563eb'}}>
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <span style={{fontSize:13.5,fontWeight:600,color:'#374151'}} className="navbar-username">
            {user?.first_name || user?.username}
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};
