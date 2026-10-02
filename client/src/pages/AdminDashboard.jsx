import React, { useState, useEffect } from 'react';
import { adminAPI, complaintAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Shield, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  Loader2, 
  TrendingUp, 
  Building2,
  Award
} from 'lucide-react';

const COLORS = ['#0284c7', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#64748b'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortDate, setSortDate] = useState('newest');

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter, deptFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes, usersRes] = await Promise.all([
        adminAPI.getStatistics(),
        complaintAPI.getAll({ status: statusFilter || undefined, department: deptFilter || undefined }),
        adminAPI.getUsers()
      ]);

      if (statsRes.data.success) setStatsData(statsRes.data);
      if (complaintsRes.data.success) setComplaints(complaintsRes.data.complaints || []);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints
    .filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = c.complaintId.toLowerCase().includes(q) || 
                      c.title.toLowerCase().includes(q) || 
                      c.location?.address?.toLowerCase().includes(q) ||
                      c.location?.city?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (categoryFilter && c.category !== categoryFilter) return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDate === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Shield className="w-3.5 h-3.5" /> Municipal Operations Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            System Analytics &amp; Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time municipal performance analytics, category distributions, and officer work assignment.
          </p>

          {user?.governmentIdVerified && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                Government-Verified Municipal Administrator
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
      </div>

      {/* OPERATIONAL METRIC CARDS */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          
          <div className="glass-card p-4 space-y-1 border-t-4 border-t-sky-500">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Issues</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{statsData.stats.totalComplaints}</p>
          </div>

          <div className="glass-card p-4 space-y-1 border-t-4 border-t-amber-500">
            <span className="text-[10px] font-bold uppercase text-slate-400">Open Queue</span>
            <p className="text-2xl font-black text-amber-500">{statsData.stats.openComplaints}</p>
          </div>

          <div className="glass-card p-4 space-y-1 border-t-4 border-t-cyan-500">
            <span className="text-[10px] font-bold uppercase text-slate-400">In Progress</span>
            <p className="text-2xl font-black text-cyan-500">{statsData.stats.inProgress}</p>
          </div>

          <div className="glass-card p-4 space-y-1 border-t-4 border-t-emerald-500">
            <span className="text-[10px] font-bold uppercase text-slate-400">Resolved</span>
            <p className="text-2xl font-black text-emerald-500">{statsData.stats.resolvedCount}</p>
          </div>

          <div className="glass-card p-4 space-y-1 border-t-4 border-t-rose-500">
            <span className="text-[10px] font-bold uppercase text-slate-400">High Priority</span>
            <p className="text-2xl font-black text-rose-500">{statsData.stats.highPriorityCount}</p>
          </div>

          <div className="glass-card p-4 space-y-1 border-t-4 border-t-indigo-500">
            <span className="text-[10px] font-bold uppercase text-slate-400">Resolution Rate</span>
            <p className="text-2xl font-black text-indigo-500">{statsData.stats.resolutionRate}%</p>
          </div>

        </div>
      )}

      {/* RECHARTS ANALYTICS CHARTS */}
      {statsData && statsData.charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Category Breakdown */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-500" /> Complaints by Category
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.charts.complaintsByCategory}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Breakdown Pie */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Status Distribution
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.charts.complaintsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {statsData.charts.complaintsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Department Workload */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" /> Workload by Department
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.charts.complaintsByDepartment} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 9 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* GLOBAL COMPLAINT MANAGEMENT MATRIX */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" /> Municipal Complaint Registry ({filteredComplaints.length})
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, title, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="REPORTED">REPORTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
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
              <option value="Other">Other</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
            >
              <option value="">All Depts</option>
              <option value="Public Works">Public Works</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Drainage">Drainage</option>
              <option value="Traffic">Traffic</option>
              <option value="Municipal Administration">Municipal Admin</option>
            </select>

            <select
              value={sortDate}
              onChange={(e) => setSortDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-sky-500 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Complaint ID</th>
                  <th className="p-3">Issue &amp; Location</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredComplaints.slice(0, 30).map(c => (
                  <tr key={c._id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{c.complaintId}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{c.title}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.location?.address}</p>
                    </td>
                    <td className="p-3 font-semibold">{c.category}</td>
                    <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="p-3 font-bold text-amber-500">{c.assignedDepartment}</td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/complaints/${c._id}`)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg shadow"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
