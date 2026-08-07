import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { applicationAPI } from '../../api/applications';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner';
import { StatCard } from '../../components/common/StatCard';
import { ActivityTimeline } from '../../components/student/ActivityTimeline';
import { NotificationsPanel, buildNotifications } from '../../components/student/NotificationsPanel';
import { DashboardStats, Application } from '../../types';

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authAPI.getDashboardStats(),
      applicationAPI.list({ page: 1 }),
    ]).then(([statsRes, appsRes]) => {
      setStats(statsRes.data);
      setRecent(appsRes.data.results.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const cards = [
    { label: 'Available Scholarships', value: stats?.total_scholarships,     icon: '🎓', color: '#2563eb', to: '/student/scholarships' },
    { label: 'Saved Scholarships',     value: stats?.saved_scholarships,     icon: '🔖', color: '#8b5cf6', to: '/student/saved' },
    { label: 'Total Applications',     value: stats?.total_applications,     icon: '📬', color: '#0891b2', to: '/student/applications' },
    { label: 'Approved',               value: stats?.approved_applications,  icon: '✅', color: '#10b981', to: '/student/applications' },
    { label: 'Pending Challan',        value: stats?.pending_applications,   icon: '⏳', color: '#f59e0b', to: '/student/applications' },
    { label: 'Rejected',               value: stats?.rejected_applications,  icon: '❌', color: '#ef4444', to: '/student/applications' },
  ];

  const notices = buildNotifications(recent);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome back, {user?.first_name || user?.username}! 👋</h1>
        <p>Here's your scholarship journey at a glance</p>
      </div>

      <div className="stat-grid">
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="dash-columns">
        {/* ── Main column: activity + quick actions ── */}
        <div className="dash-main">
          <div className="panel">
            <div className="panel-head">
              <h3>Recent activity</h3>
              <Link to="/student/applications" className="panel-link">View all →</Link>
            </div>
            <ActivityTimeline applications={recent} />
          </div>

          <div className="quick-actions">
            <Link to="/student/scholarships" className="qa-card">
              <span className="qa-icon">🔍</span>
              <div><strong>Browse scholarships</strong><span>Find your next match</span></div>
            </Link>
            <Link to="/student/saved" className="qa-card">
              <span className="qa-icon">🔖</span>
              <div><strong>View saved</strong><span>{stats?.saved_scholarships ?? 0} bookmarked</span></div>
            </Link>
            <Link to="/student/profile" className="qa-card">
              <span className="qa-icon">👤</span>
              <div><strong>Complete profile</strong><span>Keep your details current</span></div>
            </Link>
          </div>
        </div>

        {/* ── Side column: notifications + CTA ── */}
        <div className="dash-side">
          <div className="panel">
            <div className="panel-head"><h3>Notifications</h3></div>
            <NotificationsPanel notices={notices} />
          </div>

          <div className="dash-cta">
            <h3>🎓 Ready to find your scholarship?</h3>
            <p>Browse {stats?.total_scholarships || 0}+ scholarships across top universities worldwide.</p>
            <Link to="/student/scholarships">
              <button className="btn" style={{ background: 'white', color: '#1e3a8a', fontWeight: 700, width: '100%', justifyContent: 'center' }}>
                Browse Scholarships →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
