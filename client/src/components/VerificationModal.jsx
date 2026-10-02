import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Star, X, Loader2 } from 'lucide-react';
import { complaintAPI } from '../services/api';

export default function VerificationModal({ isOpen, complaint, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleVerify = async (isResolved) => {
    setSubmitting(true);
    try {
      await complaintAPI.verifyResolution(complaint._id, {
        isResolved,
        rating,
        feedbackComment: comment || (isResolved ? 'Confirmed fixed by citizen.' : 'Citizen reported issue persists.')
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Verification error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel max-w-md w-full rounded-2xl p-6 shadow-2xl border border-sky-500/30 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Citizen Verification
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
          The assigned authority marked complaint <span className="text-sky-500 font-mono">{complaint.complaintId}</span> as RESOLVED.
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Was the problem in your area actually fixed to your satisfaction?
        </p>

        {/* Rating selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-xl border transition-colors ${
                  rating >= star ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                }`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback / Reopen Explanation</label>
          <textarea
            rows={3}
            placeholder="Provide feedback on resolution quality or describe why the issue persists..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Decision buttons */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleVerify(false)}
            className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /> No, Issue Remains</>}
          </button>
          
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleVerify(true)}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Yes, Fully Resolved</>}
          </button>
        </div>

      </div>
    </div>
  );
}
