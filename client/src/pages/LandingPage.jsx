import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Zap, 
  Search,
  UserCheck,
  Building2,
  Lock,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalComplaints: 36,
    resolvedCount: 22,
    openComplaints: 14,
    resolutionRate: 61,
    avgResolutionHours: 18.5
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await adminAPI.getStatistics();
        if (res.data.success && res.data.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Using default stats fallback:', err);
      }
    };
    fetchPublicStats();
  }, []);

  const handleDemoLogin = async (email, role) => {
    try {
      const user = await login(email, 'demo1234');
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'authority') navigate('/authority-dashboard');
      else navigate('/citizen-dashboard');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-sky-500/30 text-xs font-bold text-sky-600 dark:text-sky-400 shadow-lg animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>AI-Driven Municipal Resolution Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight">
            Report. Track.{' '}
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
              Resolve.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            A smarter, transparent way to report local civic issues in your community. Powered by automated AI classification, spatial duplicate detection, and citizen verification loops.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/report"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-sky-500/25 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" /> Report an Issue Now
            </Link>

            <Link
              to="/map"
              className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5 text-sky-500" /> Explore Interactive Map
            </Link>
          </div>

          {/* Quick Demo Login Preset Bar */}
          <div className="pt-8 max-w-3xl mx-auto">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              Instant One-Click Demo Role Access:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleDemoLogin('citizen@civicfix.demo', 'citizen')}
                className="p-2.5 rounded-xl glass-card hover:border-sky-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-500">
                  <UserCheck className="w-4 h-4 text-sky-500" /> Citizen Portal
                </div>
                <span className="text-[10px] text-slate-400">citizen@civicfix.demo</span>
              </button>

              <button
                onClick={() => handleDemoLogin('authority@civicfix.demo', 'authority')}
                className="p-2.5 rounded-xl glass-card hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500">
                  <Building2 className="w-4 h-4 text-amber-500" /> Roads Officer
                </div>
                <span className="text-[10px] text-slate-400">authority@civicfix.demo</span>
              </button>

              <button
                onClick={() => handleDemoLogin('officer.sanitation@civicfix.demo', 'authority')}
                className="p-2.5 rounded-xl glass-card hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500">
                  <Building2 className="w-4 h-4 text-emerald-500" /> Sanitation Officer
                </div>
                <span className="text-[10px] text-slate-400">sanitation@civicfix.demo</span>
              </button>

              <button
                onClick={() => handleDemoLogin('admin@civicfix.demo', 'admin')}
                className="p-2.5 rounded-xl glass-card hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-500">
                  <Lock className="w-4 h-4 text-indigo-500" /> Admin Analytics
                </div>
                <span className="text-[10px] text-slate-400">admin@civicfix.demo</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* REAL IMPACT STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Live Civic Impact Metrics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time aggregate data queried directly from the municipal database</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20">
              <p className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400">{stats.totalComplaints}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Issues Reported</p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.resolvedCount}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Issues Resolved</p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">{stats.openComplaints}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Active Complaints</p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">{stats.resolutionRate}%</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">Resolution Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">End-to-End Resolution Workflow</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            From the moment a citizen snapped photo to municipal officer proof-of-work verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="glass-card p-5 relative space-y-3 border-t-4 border-t-sky-500">
            <span className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 font-extrabold text-sm flex items-center justify-center">1</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">1. Citizen Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Snap issue photo, add title &amp; description, pinpoint location on Leaflet map.</p>
          </div>

          <div className="glass-card p-5 relative space-y-3 border-t-4 border-t-cyan-500">
            <span className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 font-extrabold text-sm flex items-center justify-center">2</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">2. AI Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI predicts category, priority, detects duplicates within 500m &amp; routes department.</p>
          </div>

          <div className="glass-card p-5 relative space-y-3 border-t-4 border-t-amber-500">
            <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-sm flex items-center justify-center">3</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">3. Officer Assigned</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Responsible officer accepts task, updates status to IN_PROGRESS &amp; sets ETA.</p>
          </div>

          <div className="glass-card p-5 relative space-y-3 border-t-4 border-t-emerald-500">
            <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-sm flex items-center justify-center">4</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">4. Proof Uploaded</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Officer completes work, uploads proof-of-work photo, marks RESOLVED.</p>
          </div>

          <div className="glass-card p-5 relative space-y-3 border-t-4 border-t-indigo-500">
            <span className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 font-extrabold text-sm flex items-center justify-center">5</span>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">5. Citizen Verifies</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Citizen confirms "Was it fixed?" -&gt; CLOSED or REOPENED with rating feedback.</p>
          </div>

        </div>
      </section>

      {/* WHY CIVICFIX FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Engineered For Real-World Scale</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Built to resolve operational friction between citizens and municipal authorities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">AI Classification &amp; Priority</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated NLP engines score severity keywords and environmental risk to categorize complaints instantly into Public Works, Sanitation, Electricity, Water, or Traffic.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">500m Haversine Duplicate Check</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Prevents duplicate complaints by searching nearby active reports using mathematical spatial distance calculations and string similarity matching.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Citizen Verification Feedback Loop</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Officers cannot close complaints unilaterally. Citizens hold ultimate verification authority to confirm fix quality or reopen unsatisfactory work.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
