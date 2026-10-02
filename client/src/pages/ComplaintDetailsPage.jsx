import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import ResolutionModal from '../components/ResolutionModal';
import VerificationModal from '../components/VerificationModal';
import { 
  MapPin, 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Send, 
  Camera, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  // Modals
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getById(id);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setHistory(res.data.history || []);
        setComments(res.data.comments || []);
        setFeedback(res.data.feedback || null);
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await complaintAPI.addComment(complaint._id, { message: newComment });
      if (res.data.success) {
        setComments(prev => [...prev, res.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-bold">Loading complaint data &amp; timeline audit history...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <p className="text-base font-bold text-rose-500">Complaint record not found</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  const isReporter = user && (user.id === complaint.reportedBy?._id || user.id === complaint.reportedBy);
  const isAuthorityOrAdmin = user && (user.role === 'authority' || user.role === 'admin');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* HEADER CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-base">{complaint.complaintId}</span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">{complaint.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-500 inline" /> {complaint.location?.address}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isAuthorityOrAdmin && (
              <button
                onClick={() => setShowResolutionModal(true)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Update Status &amp; Proof
              </button>
            )}

            {isReporter && complaint.status === 'RESOLVED' && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify Resolution Now
              </button>
            )}
          </div>
        </div>

        {/* CITIZEN VERIFICATION PROMPT BANNER */}
        {complaint.status === 'RESOLVED' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-sky-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Officer Marked This Issue As RESOLVED
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Was the civic issue fixed to your satisfaction? Your confirmation closes the ticket.
                </p>
              </div>
            </div>

            {isReporter && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow shrink-0"
              >
                Verify &amp; Rate Fix
              </button>
            )}
          </div>
        )}

        {/* GRID: DETAILS + TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: PHOTOS & DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Issue Photos &amp; Proof Comparison</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Reported Photo */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Reported Photo:</span>
                  <img
                    src={complaint.images?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
                    alt="Reported Issue"
                    className="w-full h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow"
                  />
                </div>

                {/* Proof of Work Photo */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Officer Proof-of-Work:</span>
                  {complaint.proofOfWorkImages && complaint.proofOfWorkImages.length > 0 ? (
                    <img
                      src={complaint.proofOfWorkImages[0]}
                      alt="Resolution Proof"
                      className="w-full h-48 object-cover rounded-2xl border-2 border-emerald-500/40 shadow"
                    />
                  ) : (
                    <div className="w-full h-48 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                      <Camera className="w-6 h-6 mb-1 opacity-50" />
                      Pending officer proof upload
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="glass-card p-5 space-y-2">
              <h4 className="font-bold text-xs uppercase text-slate-400">Description</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* AI Executive Summary Box */}
            {complaint.aiAnalysis?.summary && (
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                <h4 className="font-bold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Analysis &amp; Routing Record
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {complaint.aiAnalysis.summary}
                </p>
              </div>
            )}

            {/* DISCUSSION COMMENTS SECTION */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-500" /> Issue Activity Thread ({comments.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No comments yet. Start the conversation below.</p>
                ) : (
                  comments.map(c => (
                    <div key={c._id} className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {c.user?.name || 'User'}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 capitalize">{c.user?.role}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              {user && (
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add comment or status query..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: METADATA & AUDIT TIMELINE */}
          <div className="space-y-6">
            
            {/* Metadata Card */}
            <div className="glass-card p-5 space-y-3 text-xs">
              <h3 className="font-extrabold text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                Assignment Details
              </h3>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Department</span>
                  <p className="font-bold text-sky-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" /> {complaint.assignedDepartment}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Officer</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {complaint.assignedOfficer?.name || 'Unassigned / Queue'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Reporting Citizen</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {complaint.reportedBy?.name || 'Citizen User'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Reported Date</span>
                  <p className="font-mono text-slate-500 mt-0.5">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-extrabold text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                Visual History Timeline
              </h3>
              <Timeline history={history} currentStatus={complaint.status} />
            </div>

          </div>

        </div>

      </div>

      {/* Resolution & Verification Modals */}
      <ResolutionModal
        isOpen={showResolutionModal}
        complaint={complaint}
        onClose={() => setShowResolutionModal(false)}
        onSuccess={fetchComplaintDetails}
      />

      <VerificationModal
        isOpen={showVerifyModal}
        complaint={complaint}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={fetchComplaintDetails}
      />

    </div>
  );
}
