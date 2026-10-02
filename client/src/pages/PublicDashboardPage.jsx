import React, { useState, useEffect } from 'react';
import { adminAPI, municipalityAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Globe2, 
  Search, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Landmark, 
  Award, 
  Filter 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PublicDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [municipalities, setMunicipalities] = useState([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);
  const [searchState, setSearchState] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'State' | 'Union Territory'

  useEffect(() => {
    adminAPI.getStatistics().then(res => {
      if (res.data.success) setStats(res.data);
    }).catch(console.error);

    municipalityAPI.getAll().then(res => {
      if (res.data.success) setMunicipalities(res.data.data || []);
    }).catch(err => {
      console.error('Failed to load municipalities:', err);
    }).finally(() => {
      setLoadingMunicipalities(false);
    });
  }, []);

  const filteredMunicipalities = municipalities.filter(m => {
    const matchesSearch = !searchState || 
      m.state.toLowerCase().includes(searchState.toLowerCase()) ||
      m.city.toLowerCase().includes(searchState.toLowerCase()) ||
      m.name.toLowerCase().includes(searchState.toLowerCase()) ||
      (m.lgdCode && m.lgdCode.toLowerCase().includes(searchState.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || 
      (typeFilter === 'State' && !m.type?.includes('Council') && m.state !== 'Delhi' && m.state !== 'Chandigarh' && m.state !== 'Puducherry' && m.state !== 'Ladakh' && m.state !== 'Jammu and Kashmir' && m.state !== 'Lakshadweep' && m.state !== 'Andaman and Nicobar Islands' && m.state !== 'Dadra and Nagar Haveli and Daman and Diu') ||
      (typeFilter === 'Union Territory' && (m.state === 'Delhi' || m.state === 'Chandigarh' || m.state === 'Puducherry' || m.state === 'Ladakh' || m.state === 'Jammu and Kashmir' || m.state === 'Lakshadweep' || m.state === 'Andaman and Nicobar Islands' || m.state === 'Dadra and Nagar Haveli and Daman and Diu'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Globe2 className="w-4 h-4 text-emerald-500" /> Pan-India Municipal Transparency Network
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Pan-India Civic Resolution &amp; Governance Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Open governance metrics and official municipal local body registries across all 28 States and 8 Union Territories of India.
        </p>
      </div>

      {/* Aggregate Impact Counters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="glass-card p-6 border-t-4 border-t-sky-500">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">{stats.stats.totalComplaints}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Pan-India Issues</p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-emerald-500">
            <p className="text-3xl sm:text-4xl font-black text-emerald-500">{stats.stats.resolvedCount}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Resolved</p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-amber-500">
            <p className="text-3xl sm:text-4xl font-black text-amber-500">{stats.stats.avgResolutionHours}h</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Resolution Time</p>
          </div>

          <div className="glass-card p-6 border-t-4 border-t-indigo-500">
            <p className="text-3xl sm:text-4xl font-black text-indigo-500">{stats.stats.resolutionRate}%</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Resolution Success Rate</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {stats?.charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-500" /> Pan-India Category Distribution
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
              <Building2 className="w-4 h-4 text-amber-500" /> Municipal Department Triage
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

      {/* PAN-INDIA ALL 36 STATES & UTs DIRECTORY */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Official Municipal Bodies of India (36 States &amp; UTs)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active local government corporations with MoHUA Local Government Directory (LGD) codes, official helplines, and verified staff cadres.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'ALL' ? 'bg-sky-600 text-white shadow' : 'text-slate-500'}`}
              >
                All (36)
              </button>
              <button
                onClick={() => setTypeFilter('State')}
                className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'State' ? 'bg-sky-600 text-white shadow' : 'text-slate-500'}`}
              >
                States (28)
              </button>
              <button
                onClick={() => setTypeFilter('Union Territory')}
                className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'Union Territory' ? 'bg-sky-600 text-white shadow' : 'text-slate-500'}`}
              >
                UTs (8)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search state, city, LGD..."
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Municipal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMunicipalities.map((m, idx) => (
            <div 
              key={idx}
              className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {m.state}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">
                    {m.code}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">
                  {m.name}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{m.city}, {m.district || m.state}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">LGD Code</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{m.lgdCode || 'Official'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">24/7 Helpline</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {m.helpline || '112'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                {m.portalUrl ? (
                  <a
                    href={m.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-sky-500 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Govt Cadre Active</span>
                )}

                <button
                  onClick={() => navigate('/report', { state: { stateName: m.state, city: m.city, code: m.code } })}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow text-[11px] transition-all hover:scale-105"
                >
                  Report in {m.city}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMunicipalities.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            No state municipal bodies found matching "{searchState}".
          </div>
        )}

      </div>

    </div>
  );
}
