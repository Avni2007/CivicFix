import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintAPI, calendarAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ResolutionModal from '../components/ResolutionModal';
import { 
  Building2, 
  Wrench, 
  Loader2,
  Calendar,
  AlertOctagon,
  PlusCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'calendar'
  const [complaints, setComplaints] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Schedule task modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    complaintId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchAssignedComplaints();
    fetchCalendarTasks();
  }, [user, statusFilter]);

  const fetchAssignedComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getAll({
        department: user?.department !== 'None' ? user?.department : undefined,
        status: statusFilter || undefined
      });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load authority queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarTasks = async () => {
    try {
      const res = await calendarAPI.getTasks();
      if (res.data.success) {
        setCalendarTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch calendar tasks:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await calendarAPI.createTask(scheduleData);
      setShowScheduleModal(false);
      fetchCalendarTasks();
      alert('Task scheduled successfully!');
    } catch (err) {
      alert('Error scheduling task: ' + err.message);
    }
  };

  const highPriorityCount = complaints.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const assignedCount = complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'REPORTED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const overdueTasksCount = calendarTasks.filter(t => t.status === 'OVERDUE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Building2 className="w-3.5 h-3.5" /> Operations Queue — {user?.department || 'Public Works'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Officer {user?.name || 'Department Officer'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage field dispatches, schedule inspections &amp; deadlines, upload proof-of-work, and resolve issues.
          </p>

          {user?.governmentIdVerified && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Government-Verified Official Cadre
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                HRMS: {user.employeeId || 'HRMS-OFFICIAL'}
              </span>
              {user.designation && (
                <span className="text-[11px] text-slate-500 font-medium">
                  {user.designation}
                </span>
              )}
              {user.verificationAuthority && (
                <span className="text-[10px] text-slate-400 italic">
                  ({user.verificationAuthority})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
              activeTab === 'queue' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Dispatch Queue
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'calendar' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar &amp; Schedule
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 space-y-1 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Queue</span>
          <p className="text-2xl font-black text-amber-500">{assignedCount}</p>
        </div>

        <div className="glass-card p-4 space-y-1 border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High Priority</span>
          <p className="text-2xl font-black text-red-500">{highPriorityCount}</p>
        </div>

        <div className="glass-card p-4 space-y-1 border-l-4 border-l-cyan-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
          <p className="text-2xl font-black text-cyan-500">{inProgressCount}</p>
        </div>

        <div className="glass-card p-4 space-y-1 border-l-4 border-l-rose-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue Tasks</span>
          <p className="text-2xl font-black text-rose-500">{overdueTasksCount}</p>
        </div>

        <div className="glass-card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved Work</span>
          <p className="text-2xl font-black text-emerald-500">{resolvedCount}</p>
        </div>
      </div>

      {/* TAB 1: DISPATCH QUEUE TABLE */}
      {activeTab === 'queue' && (
        <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" /> Department Dispatch Queue ({complaints.length})
            </h2>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="REPORTED">REPORTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin mx-auto" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              No complaints currently in department queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Title &amp; Location</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {complaints.map(c => (
                    <tr key={c._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{c.complaintId}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{c.title}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.location?.address}</p>
                      </td>
                      <td className="p-3 font-semibold">{c.category}</td>
                      <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="p-3"><StatusBadge status={c.status} /></td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/complaints/${c._id}`)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg text-slate-800 dark:text-slate-100 font-bold text-[11px]"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg shadow"
                        >
                          Action / Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CALENDAR & TASK MANAGEMENT VIEW */}
      {activeTab === 'calendar' && (
        <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" /> Operational Calendar &amp; Inspection Schedule
              </h2>
              <p className="text-xs text-slate-500">Track deadlines, scheduled crew dispatches, and overdue resolution tasks.</p>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Schedule New Task
            </button>
          </div>

          {calendarTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              No calendar tasks currently scheduled. Click "Schedule New Task" to set deadlines.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarTasks.map(t => {
                const isOverdue = t.status === 'OVERDUE' || (t.status === 'UPCOMING' && new Date(t.deadline) < new Date());
                const isCompleted = t.status === 'COMPLETED';

                return (
                  <div
                    key={t._id}
                    className={`glass-card p-4 space-y-3 border-l-4 ${
                      isCompleted ? 'border-l-emerald-500' : (isOverdue ? 'border-l-rose-500' : 'border-l-amber-500')
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-500' : (isOverdue ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500')
                      }`}>
                        {isCompleted ? '🟢 COMPLETED' : (isOverdue ? '🔴 OVERDUE' : '🟡 UPCOMING')}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 font-semibold">
                        {t.complaintId?.complaintId || 'CIV-TASK'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.title}</h3>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" /> Deadline: {new Date(t.deadline).toLocaleDateString()}
                      </p>
                      {t.notes && <p className="text-[11px] italic text-slate-400">"{t.notes}"</p>}
                    </div>

                    {t.complaintId?._id && (
                      <button
                        onClick={() => navigate(`/complaints/${t.complaintId._id}`)}
                        className="w-full mt-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg text-sky-500 text-center"
                      >
                        View Associated Complaint →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE TASK MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Schedule Task / Resolution Deadline</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Complaint *</label>
                <select
                  required
                  value={scheduleData.complaintId}
                  onChange={(e) => setScheduleData({ ...scheduleData, complaintId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
                >
                  <option value="">Select from active queue...</option>
                  {complaints.map(c => (
                    <option key={c._id} value={c._id}>{c.complaintId} — {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field inspection & crew asphalt dispatch"
                  value={scheduleData.title}
                  onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Resolution Deadline *</label>
                  <input
                    type="date"
                    required
                    value={scheduleData.deadline}
                    onChange={(e) => setScheduleData({ ...scheduleData, deadline: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Dispatch Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter machinery or crew notes..."
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white font-bold rounded-xl shadow"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ResolutionModal
        isOpen={showModal}
        complaint={selectedComplaint}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchAssignedComplaints();
          fetchCalendarTasks();
        }}
      />

    </div>
  );
}
