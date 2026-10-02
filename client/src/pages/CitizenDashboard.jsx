import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintAPI, draftAPI, notificationAPI, authAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  FileText, 
  Sparkles, 
  PlusCircle, 
  ArrowRight,
  Loader2,
  Bookmark,
  Trash2,
  Play,
  User,
  Bell,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Phone,
  MapPin,
  Mail
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [myComplaints, setMyComplaints] = useState([]);
  const [myDrafts, setMyDrafts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    locationName: user?.locationName || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    fetchMyComplaints();
    fetchMyDrafts();
    fetchNotifications();
  }, [filterCategory]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        locationName: user.locationName || ''
      });
    }
  }, [user]);

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getAll({ myComplaints: 'true', category: filterCategory || undefined });
      if (res.data.success) {
        setMyComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDrafts = async () => {
    try {
      const res = await draftAPI.getDrafts();
      if (res.data.success) {
        setMyDrafts(res.data.data || []);
      }
    } catch (err) {
      const local = localStorage.getItem('civicfix_draft');
      if (local) {
        try {
          setMyDrafts([JSON.parse(local)]);
        } catch (e) {}
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleDeleteDraft = async (id) => {
    try {
      await draftAPI.deleteDraft(id);
      setMyDrafts(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      localStorage.removeItem('civicfix_draft');
      setMyDrafts([]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage('');
    try {
      const res = await authAPI.updateProfile(profileForm);
      if (res.data.success) {
        setUser(res.data.user);
        setProfileMessage('Profile updated successfully!');
        setTimeout(() => setProfileMessage(''), 3000);
      }
    } catch (err) {
      setProfileMessage('Failed to update profile: ' + err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 4 Required Dashboard Statistics (Requirement 11)
  const totalCount = myComplaints.length;
  const pendingCount = myComplaints.filter(c => c.status === 'REPORTED' || c.status === 'VERIFIED').length;
  const inProgressCount = myComplaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = myComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Citizen Impact Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Good day, {user?.name || 'Citizen'} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track your submitted civic issues, monitor officer dispatch, and verify resolution quality.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowNotifModal(true)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-2xl shadow transition-all flex items-center gap-1.5 text-xs font-bold relative"
            title="View Notifications"
          >
            <Bell className="w-4 h-4 text-sky-500" />
            <span>Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2"></span>
            )}
          </button>

          <button
            onClick={() => setShowProfileModal(true)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-2xl shadow transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Edit Profile"
          >
            <User className="w-4 h-4 text-sky-500" />
            <span>Profile</span>
          </button>

          <Link
            to="/report"
            className="px-6 py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-sky-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Report Issue
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl border border-rose-500/20 transition-all text-xs font-bold flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 4 REQUIRED DASHBOARD STATISTICS CARDS (Requirement 11) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-2 border-l-4 border-l-sky-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Complaints</span>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalCount}</p>
          <p className="text-[10px] text-slate-500">All reports submitted by you</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
          <p className="text-3xl font-black text-amber-500">{pendingCount}</p>
          <p className="text-[10px] text-slate-500">Awaiting department triage</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-l-4 border-l-indigo-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
          <p className="text-3xl font-black text-indigo-500">{inProgressCount}</p>
          <p className="text-[10px] text-slate-500">Assigned &amp; field work active</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</span>
          <p className="text-3xl font-black text-emerald-500">{resolvedCount}</p>
          <p className="text-[10px] text-slate-500">Successfully closed &amp; verified</p>
        </div>
      </div>

      {/* CONTINUE DRAFT SECTION IF ANY */}
      {myDrafts.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border-l-4 border-l-amber-500 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500" /> Continue Saved Draft ({myDrafts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myDrafts.map(d => (
              <div key={d._id || 'local'} className="glass-card p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {d.category || 'Draft'}
                  </span>
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                    {d.title || 'Untitled Complaint Draft'}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{d.description || 'No description entered yet'}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('/report', { state: { draft: d } })}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Resume
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(d._id)}
                    className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY COMPLAINTS TABLE / CARDS */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" /> My Reported Complaints ({myComplaints.length})
          </h2>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
          >
            <option value="">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Water">Water</option>
            <option value="Drainage">Drainage</option>
            <option value="Traffic">Traffic</option>
            <option value="Road">Road</option>
            <option value="Public Property">Public Property</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-sky-500 animate-spin mx-auto" />
          </div>
        ) : myComplaints.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-500 font-medium">You haven't submitted any complaints yet.</p>
            <Link to="/report" className="inline-block px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl shadow">
              Report Issue Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myComplaints.map(c => (
              <div 
                key={c._id} 
                onClick={() => navigate(`/complaints/${c._id}`)}
                className="glass-card p-5 cursor-pointer hover:border-sky-500/50 transition-all hover:scale-[1.01] flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {c.complaintId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reported {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-500">
                  <span>Track Complaint Details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" /> Citizen Profile
              </h2>
              <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileMessage && (
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 text-xs font-bold text-center">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registered Email (Verified)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Neighborhood / City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profileForm.locationName}
                    onChange={(e) => setProfileForm({ ...profileForm, locationName: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow"
                >
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-500" /> Notifications ({notifications.length})
              </h2>
              <button onClick={() => setShowNotifModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="glass-card p-3.5 space-y-1 border-l-4 border-l-sky-500">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
