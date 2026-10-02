import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BarChart3, ShieldCheck, Sparkles, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PublicDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStatistics().then(res => {
      if (res.data.success) setStats(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" /> Open Municipal Transparency Portal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Public Civic Impact Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Anonymized real-time civic data measuring municipal resolution speed, department efficiency, and citizen satisfaction.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
          <div className="glass-card p-6 border-t-4 border-t-sky-500">
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.stats.totalComplaints}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Reported Issues</p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-emerald-500">
            <p className="text-3xl font-black text-emerald-500">{stats.stats.resolvedCount}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Resolved</p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-amber-500">
            <p className="text-3xl font-black text-amber-500">{stats.stats.avgResolutionHours}h</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Resolution Time</p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-indigo-500">
            <p className="text-3xl font-black text-indigo-500">{stats.stats.resolutionRate}%</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Success Rate</p>
          </div>
        </div>
      )}

      {stats?.charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-500" /> Citywide Issue Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.complaintsByCategory}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" /> Department Volume
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.complaintsByDepartment}>
                  <XAxis dataKey="department" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
