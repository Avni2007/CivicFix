import React, { useState } from 'react';
import { Camera, CheckCircle2, X, Loader2, Calendar } from 'lucide-react';
import { complaintAPI } from '../services/api';

export default function ResolutionModal({ isOpen, complaint, onClose, onSuccess }) {
  const [status, setStatus] = useState(complaint?.status || 'IN_PROGRESS');
  const [comment, setComment] = useState('');
  const [estDate, setEstDate] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Update Status & Comment
      await complaintAPI.updateStatus(complaint._id, {
        status,
        comment: comment || `Status updated to ${status}`,
        estimatedResolutionTime: estDate || undefined
      });

      // 2. Upload Proof of Work if provided
      if (file || proofImage) {
        const formData = new FormData();
        if (file) {
          formData.append('proofImages', file);
        } else if (proofImage) {
          formData.append('imageUrl', proofImage);
        }
        formData.append('comment', 'Proof of work photo uploaded by officer');
        await complaintAPI.uploadProof(complaint._id, formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to update complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-500" /> Officer Action &amp; Proof
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
            >
              <option value="IN_PROGRESS">IN_PROGRESS (Work Started)</option>
              <option value="RESOLVED">RESOLVED (Work Completed)</option>
              <option value="ASSIGNED">ASSIGNED (Pending Dispatch)</option>
              <option value="REJECTED">REJECTED (Invalid / Out of Jurisdiction)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Completion Date</label>
            <input
              type="date"
              value={estDate}
              onChange={(e) => setEstDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Proof of Work Photo (Optional / Recommended for RESOLVED)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-600 hover:file:bg-sky-500/20"
            />
            <div className="mt-1 text-[10px] text-slate-400">or enter image URL for quick testing:</div>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={proofImage}
              onChange={(e) => setProofImage(e.target.value)}
              className="w-full mt-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Officer Notes / Action Summary</label>
            <textarea
              rows={3}
              placeholder="Describe work completed or instructions..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Update'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
