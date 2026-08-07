import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/logo-icon.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth, setUser } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      setAuth(data.user || {}, data.access, data.refresh);
      const { data: user } = await authAPI.getProfile();
      setUser(user);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid email or password';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <img src={logo} alt="ScholarBridge" className="auth-logo-img" />
          <h1>ScholarBridge</h1>
          <p>Find your dream scholarship abroad</p>
        </div>
        <div className="auth-box">
          <h2>Sign In to Your Account</h2>
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:8}}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>
          <p className="auth-divider">Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};
