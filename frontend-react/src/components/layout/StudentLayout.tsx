import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const nav = [
  { to:'/student/dashboard',    icon:'🏠', label:'Dashboard' },
  { to:'/student/scholarships', icon:'🎓', label:'Scholarships' },
  { to:'/student/saved',        icon:'🔖', label:'Saved' },
  { to:'/student/applications', icon:'📬', label:'Applications' },
  { to:'/student/reviews',      icon:'⭐', label:'My Review' },
  { to:'/student/profile',      icon:'👤', label:'My Profile' },
];

export const StudentLayout = () => {
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
