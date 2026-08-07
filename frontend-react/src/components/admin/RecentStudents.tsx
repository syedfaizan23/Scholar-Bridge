import React from 'react';
import { Link } from 'react-router-dom';
import { fmtDate } from '../../utils/helpers';

interface StudentRow { id: number; first_name: string; last_name: string; email: string; created_at: string; is_active: boolean; }

export const RecentStudents = ({ students }: { students: StudentRow[] }) => {
  if (!students.length) {
    return <p className="notif-empty">No students have registered yet.</p>;
  }
  return (
    <div className="notif-list">
      {students.map(s => (
        <Link to="/admin/students" key={s.id} className="notif-item">
          <span className="notif-icon" style={{ background: '#2563eb18', color: '#2563eb' }}>
            {(s.first_name || s.email).slice(0, 1).toUpperCase()}
          </span>
          <p>
            <strong>{s.first_name} {s.last_name}</strong> joined · {fmtDate(s.created_at)}
            {!s.is_active && <span style={{ color: '#ef4444', fontWeight: 600 }}> — disabled</span>}
          </p>
        </Link>
      ))}
    </div>
  );
};
