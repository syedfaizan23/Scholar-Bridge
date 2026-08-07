import React from 'react';
import { Link } from 'react-router-dom';
import { Application } from '../../types';

interface Notice { id: number; icon: string; color: string; text: string; to: string; }

export const buildNotifications = (applications: Application[]): Notice[] => {
  const notices: Notice[] = [];

  applications.forEach(app => {
    if (app.status === 'pending' && app.is_challan_overdue) {
      notices.push({ id: app.id, icon: '⛔', color: '#ef4444', to: '/student/applications',
        text: `Challan for ${app.scholarship?.title} is overdue.` });
    } else if (app.status === 'pending' && app.challan_days_remaining <= 3) {
      notices.push({ id: app.id, icon: '⏰', color: '#f59e0b', to: '/student/applications',
        text: `Challan for ${app.scholarship?.title} is due in ${app.challan_days_remaining} day(s).` });
    } else if (app.status === 'approved') {
      notices.push({ id: app.id, icon: '🎉', color: '#10b981', to: '/student/applications',
        text: `You were approved for ${app.scholarship?.title}!` });
    }
  });

  return notices.slice(0, 4);
};

export const NotificationsPanel = ({ notices }: { notices: Notice[] }) => {
  if (!notices.length) {
    return <p className="notif-empty">You're all caught up — no pending alerts right now.</p>;
  }
  return (
    <div className="notif-list">
      {notices.map(n => (
        <Link to={n.to} key={n.id} className="notif-item">
          <span className="notif-icon" style={{ background: n.color + '18', color: n.color }}>{n.icon}</span>
          <p>{n.text}</p>
        </Link>
      ))}
    </div>
  );
};
