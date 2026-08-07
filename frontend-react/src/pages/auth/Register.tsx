import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/logo-icon.png';
import { PasswordStrength, isPasswordStrong } from '../../components/common/PasswordStrength';

export const Register = () => {
  const [form, setForm] = useState({ username:'', email:'', first_name:'', last_name:'', password:'', password2:'', nationality:'' });
  const [loading, setLoading] = useState(false);
  const { setAuth, setUser } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    if (!isPasswordStrong(form.password)) { toast.error('Password does not meet the requirements below'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      setAuth(data.user, data.tokens.access, data.tokens.refresh);
      const { data: user } = await authAPI.getProfile();
      setUser(user);
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err: any) {
      const d = err.response?.data;
      const msg = typeof d === 'object' ? Object.values(d).flat().join(', ') : 'Registration failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-in" style={{maxWidth:500}}>
        <div className="auth-logo">
          <img src={logo} alt="ScholarBridge" className="auth-logo-img" style={{width:44,height:44}} />
          <h1 style={{fontSize:'1.6rem'}}>Create Account</h1>
          <p>Join ScholarBridge today</p>
        </div>
        <div className="auth-box">
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group"><label className="label">First Name *</label><input className="input" value={form.first_name} onChange={set('first_name')} required /></div>
              <div className="form-group"><label className="label">Last Name *</label><input className="input" value={form.last_name} onChange={set('last_name')} required /></div>
            </div>
            <div className="form-group"><label className="label">Username *</label><input className="input" value={form.username} onChange={set('username')} required /></div>
            <div className="form-group"><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="form-group"><label className="label">Nationality</label><input className="input" value={form.nationality} onChange={set('nationality')} placeholder="e.g. Nigerian, Filipino, Indian..." /></div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Password *</label><input className="input" type="password" value={form.password} onChange={set('password')} required /></div>
              <div className="form-group"><label className="label">Confirm *</label><input className="input" type="password" value={form.password2} onChange={set('password2')} required /></div>
            </div>
            <PasswordStrength password={form.password} />
            <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:8}}>
              {loading ? '⏳ Creating...' : '✨ Create Account'}
            </button>
          </form>
          <p className="auth-divider">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
