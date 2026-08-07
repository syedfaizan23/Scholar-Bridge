import React from 'react';
import { statusCfg } from '../../utils/helpers';
export const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusCfg[status] || { label: status, cls: 'badge-gray' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};
