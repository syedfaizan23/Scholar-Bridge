import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: string;
  color: string;
  to: string;
}

export const StatCard = ({ label, value, icon, color, to }: StatCardProps) => (
  <Link to={to} className="stat-card">
    <div className="stat-card-icon" style={{ background: color + '18', color }}>{icon}</div>
    <div>
      <div className="stat-card-value">{value ?? 0}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  </Link>
);
