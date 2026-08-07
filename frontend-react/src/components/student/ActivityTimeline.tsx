import React from 'react';
import { Link } from 'react-router-dom';
import { Application } from '../../types';
import { fmtDate } from '../../utils/helpers';

const TIMELINE_CFG: Record<string, { icon: string; color: string; verb: string }> = {
  pending:      { icon: '🧾', color: '#f59e0b', verb: 'Challan generated for' },
  challan_paid: { icon: '👀', color: '#0891b2', verb: 'Submitted for review:' },
  approved:     { icon: '✅', color: '#10b981', verb: 'Approved:' },
  rejected:     { icon: '❌', color: '#ef4444', verb: 'Not selected for' },
  cancelled:    { icon: '🚫', color: '#94a3b8', verb: 'Cancelled:' },
  expired:      { icon: '⛔', color: '#ef4444', verb: 'Challan expired for' },
};

export const ActivityTimeline = ({ applications }: { applications: Application[] }) => {
  if (!applications.length) {
    return (
      <div className="timeline-empty">
        <span style={{ fontSize: 28 }}>📭</span>
        <p>No activity yet — apply to a scholarship to see it show up here.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {applications.map(app => {
        const cfg = TIMELINE_CFG[app.status] || TIMELINE_CFG.pending;
        return (
          <Link to={`/student/scholarships/${app.scholarship?.id}`} key={app.id} className="timeline-item">
            <span className="timeline-dot" style={{ background: cfg.color + '20', color: cfg.color }}>{cfg.icon}</span>
            <div className="timeline-body">
              <p><strong>{cfg.verb}</strong> {app.scholarship?.title}</p>
              <span className="timeline-meta">{app.scholarship?.university_name} · {fmtDate(app.updated_at)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
