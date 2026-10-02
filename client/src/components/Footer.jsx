import React from 'react';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">CivicFix</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">AI Powered</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Transforming urban governance through AI classification, spatial duplicate detection, transparent status tracking, and citizen resolution verification.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">Home Page</Link></li>
              <li><Link to="/report" className="hover:text-sky-400 transition-colors">Report Civic Issue</Link></li>
              <li><Link to="/map" className="hover:text-sky-400 transition-colors">Interactive Civic Map</Link></li>
              <li><Link to="/public-dashboard" className="hover:text-sky-400 transition-colors">Public Civic Transparency</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-3">User Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-sky-400 transition-colors">Citizen Portal</Link></li>
              <li><Link to="/login" className="hover:text-sky-400 transition-colors">Authority Operations</Link></li>
              <li><Link to="/login" className="hover:text-sky-400 transition-colors">Municipal Admin Suite</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-3">System Status</h4>
            <div className="glass-card p-3 space-y-2 bg-slate-800/50 border-slate-700">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                API Engine Online
              </div>
              <p className="text-[11px] text-slate-400">AI Service Latency: &lt;140ms</p>
              <p className="text-[11px] text-slate-400">Spatial Proximity: 500m Haversine Radius</p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicFix Platform. Production-grade civic technology architecture.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with <Sparkles className="w-3.5 h-3.5 text-sky-400 inline" /> React, Node.js &amp; MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}
