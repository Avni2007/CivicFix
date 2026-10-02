import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const priorityConfig = {
  CRITICAL: { label: 'CRITICAL', color: 'bg-rose-500/10 text-rose-500 border-rose-500/30', icon: ShieldAlert },
  HIGH: { label: 'HIGH', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: AlertTriangle },
  MEDIUM: { label: 'MEDIUM', color: 'bg-sky-500/10 text-sky-500 border-sky-500/30', icon: AlertCircle },
  LOW: { label: 'LOW', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: Info }
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { label: priority, color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: Info };
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${config.color}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
}
