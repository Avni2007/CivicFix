import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Wrench, AlertCircle, Camera, CheckCheck, RotateCcw } from 'lucide-react';

export default function Timeline({ history = [], currentStatus }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 text-xs text-slate-500 text-center">No timeline history recorded yet.</div>
    );
  }

  const getStepIcon = (action, status) => {
    if (action === 'REPORTED') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (action === 'PROOF_UPLOADED') return <Camera className="w-5 h-5 text-cyan-500" />;
    if (status === 'IN_PROGRESS') return <Wrench className="w-5 h-5 text-amber-500" />;
    if (status === 'RESOLVED') return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
    if (status === 'CLOSED') return <CheckCheck className="w-5 h-5 text-sky-500" />;
    if (status === 'REOPENED') return <RotateCcw className="w-5 h-5 text-rose-500" />;
    return <Clock className="w-5 h-5 text-sky-500" />;
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, eventIdx) => (
          <li key={event._id || eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== history.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center ring-8 ring-white dark:ring-slate-900">
                    {getStepIcon(event.action, event.status)}
                  </span>
                </div>
                <div className="flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {event.comment || `Status updated to ${event.status}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{event.changedByName}</span>
                      <span>•</span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border text-[10px]">{event.changedByRole}</span>
                    </div>

                    {/* Render proof of work photos inside timeline if present */}
                    {event.proofImages && event.proofImages.length > 0 && (
                      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                        {event.proofImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Resolution Proof"
                            className="w-20 h-20 object-cover rounded-xl border border-cyan-500/30 shadow"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[11px] whitespace-nowrap text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    <br />
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
