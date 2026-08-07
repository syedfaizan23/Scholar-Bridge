import React from 'react';
import { Link } from 'react-router-dom';
import { Application } from '../../types';
import { fmtDate } from '../../utils/helpers';

const TIMELINE_CFG: Record<string, { icon: string; color: string; verb: string }> = {
  pending:      { icon: '🧾', color: '#f59e0b', verb: 'submitted a challan for' },
  challan_paid: { icon: '👀', color: '#0891b2', verb: 'is awaiting review for' },
  approved:     { icon: '✅', color: '#10b981', verb: 'was approved for' },
  rejected:     { icon: '❌', color: '#ef4444', verb: 'was rejected for' },
  cancelled:    { icon: '🚫', color: '#94a3b8', verb: 'cancelled their application for' },
  expired:      { icon: '⛔', color: '#ef4444', verb: 'let the challan expire for' },
};

export const AdminActivityTimeline = ({ applications }: { applications: Application[] }) => {
  if (!applications.length) {
    return (
      <div className="timeline-empty">
        <span style={{ fontSize: 28 }}>📭</span>
        <p>No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {applications.map(app => {
        const cfg = TIMELINE_CFG[app.status] || TIMELINE_CFG.pending;
        const title = app.scholarship_title || app.scholarship?.title || 'a scholarship';
        const university = app.scholarship_university || app.scholarship?.university_name || '';
        return (
          <Link to="/admin/applications" key={app.id} className="timeline-item">
            <span className="timeline-dot" style={{ background: cfg.color + '20', color: cfg.color }}>{cfg.icon}</span>
            <div className="timeline-body">
              <p><strong>{app.student_name || 'A student'}</strong> {cfg.verb} <strong>{title}</strong></p>
              <span className="timeline-meta">{university}{university ? ' · ' : ''}{fmtDate(app.updated_at)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
