import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { applicationAPI } from '../../api/applications';
import { Spinner } from '../../components/ui/Spinner';
import { StatCard } from '../../components/common/StatCard';
import { AdminActivityTimeline } from '../../components/admin/AdminActivityTimeline';
import { RecentStudents } from '../../components/admin/RecentStudents';
import { AdminStats, Application } from '../../types';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiring, setExpiring] = useState(false);

  const loadAll = () => {
    Promise.all([
      authAPI.getAdminStats(),
      applicationAPI.list({ page: 1 }),
      authAPI.getStudents(1),
    ]).then(([statsRes, appsRes, studentsRes]) => {
      setStats(statsRes.data);
      setRecentApps(appsRes.data.results.slice(0, 5));
      setRecentStudents(studentsRes.data.results.slice(0, 5));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const handleExpireOverdue = async () => {
    if (!window.confirm('Mark all overdue pending challans as expired?')) return;
    setExpiring(true);
    try {
      const res = await applicationAPI.expireOverdue();
      toast.success(res.data?.detail || 'Overdue applications expired');
      loadAll();
    } catch {
      toast.error('Failed to expire overdue applications');
    } finally {
      setExpiring(false);
    }
  };

  if (loading) return <Spinner text="Loading dashboard..." />;

  const cards = [
    { label: 'Total Students',     value: stats?.total_students,       icon: '👥', color: '#2563eb', to: '/admin/students' },
    { label: 'Scholarships',       value: stats?.total_scholarships,   icon: '🎓', color: '#8b5cf6', to: '/admin/scholarships' },
    { label: 'Total Applications', value: stats?.total_applications,   icon: '📬', color: '#0891b2', to: '/admin/applications' },
    { label: 'Approved',           value: stats?.approved_applications, icon: '✅', color: '#10b981', to: '/admin/applications' },
    { label: 'Pending Challan',    value: stats?.pending_applications,  icon: '⏳', color: '#f59e0b', to: '/admin/applications' },
    { label: 'Rejected',           value: stats?.rejected_applications, icon: '❌', color: '#ef4444', to: '/admin/applications' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Platform overview and quick actions</p>
      </div>

      <div className="stat-grid">
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="dash-columns">
        {/* ── Main column: platform activity + students ── */}
        <div className="dash-main">
          <div className="panel">
            <div className="panel-head">
              <h3>Platform activity</h3>
              <Link to="/admin/applications" className="panel-link">View all →</Link>
            </div>
            <AdminActivityTimeline applications={recentApps} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Recently joined students</h3>
              <Link to="/admin/students" className="panel-link">View all →</Link>
            </div>
            <RecentStudents students={recentStudents} />
          </div>
        </div>

        {/* ── Side column: quick admin actions ── */}
        <div className="dash-side">
          <div className="panel">
            <div className="panel-head"><h3>Quick actions</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/admin/scholarships" className="qa-card">
                <span className="qa-icon">🎓</span>
                <div><strong>Manage scholarships</strong><span>Add or edit listings</span></div>
              </Link>
              <Link to="/admin/applications" className="qa-card">
                <span className="qa-icon">📬</span>
                <div><strong>Review applications</strong><span>{stats?.pending_applications ?? 0} awaiting challan</span></div>
              </Link>
              <Link to="/admin/students" className="qa-card">
                <span className="qa-icon">👥</span>
                <div><strong>Manage students</strong><span>{stats?.total_students ?? 0} registered</span></div>
              </Link>
              <button
                className="qa-card"
                style={{ border: '1.5px solid #fecaca', background: '#fef2f2', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={handleExpireOverdue}
                disabled={expiring}
              >
                <span className="qa-icon" style={{ background: '#ef444418' }}>⛔</span>
                <div><strong>{expiring ? 'Expiring…' : 'Expire overdue challans'}</strong><span>Sweep past-due pending applications</span></div>
              </button>
            </div>
          </div>

          <div className="dash-cta">
            <h3>🛡️ Platform health</h3>
            <p>{stats?.total_students || 0} students · {stats?.total_scholarships || 0} scholarships · {stats?.total_applications || 0} applications tracked.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
