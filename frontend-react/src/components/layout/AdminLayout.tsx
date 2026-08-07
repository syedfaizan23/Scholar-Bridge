import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const nav = [
  { to:'/admin/dashboard',     icon:'🏠', label:'Dashboard' },
  { to:'/admin/scholarships',  icon:'🎓', label:'Scholarships' },
  { to:'/admin/applications',  icon:'📬', label:'Applications' },
  { to:'/admin/students',      icon:'👥', label:'Students' },
  { to:'/admin/inquiries',     icon:'✉️', label:'Inquiries' },
  { to:'/admin/reviews',       icon:'⭐', label:'Reviews' },
];

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <div className="app-body">
        <Sidebar items={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="main"><Outlet /></main>
      </div>
    </div>
  );
};
