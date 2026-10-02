import React from 'react';

const statusConfig = {
  REPORTED: { label: 'Reported', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  VERIFIED: { label: 'Verified', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  ASSIGNED: { label: 'Assigned', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 animate-pulse' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  CLOSED: { label: 'Closed & Verified', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  REOPENED: { label: 'Reopened', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
}
