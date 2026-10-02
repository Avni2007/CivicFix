import React from 'react';
import { AlertTriangle, MapPin, ExternalLink, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function DuplicateAlertModal({ isOpen, duplicates = [], onClose, onProceed }) {
  const navigate = useNavigate();

  if (!isOpen || !duplicates || duplicates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-amber-500/30 space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Possible Duplicate Detected
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                AI found {duplicates.length} similar report(s) within 500 meters
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Joining or tracking an existing report speeds up municipal action and avoids duplicate department dispatches.
        </p>

        {/* Similar Complaints List */}
        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
          {duplicates.map(item => (
            <div 
              key={item.id} 
              className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{item.complaintId}</span>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> {item.distanceMeters}m away</span>
                  <span>•</span>
                  <span>Match: {item.similarityScore}%</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/complaints/${item.id}`);
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow flex items-center gap-1 shrink-0"
              >
                View <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Review Details
          </button>
          <button
            onClick={onProceed}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-xl shadow flex items-center justify-center gap-1.5"
          >
            Submit New Report Anyway <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
