import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import ComplaintMap from '../components/ComplaintMap';
import { MapPin, Filter, Search, Loader2 } from 'lucide-react';

export default function MapDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchComplaintsForMap();
  }, [categoryFilter, priorityFilter, statusFilter]);

  const fetchComplaintsForMap = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getAll({
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        status: statusFilter || undefined,
        limit: 300
      });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-500" /> Interactive Civic Issue Map
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time spatial distribution, priority color codes, and density heatmaps ({complaints.length} issues mapped)
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
          >
            <option value="">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Water">Water</option>
            <option value="Drainage">Drainage</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">🔴 CRITICAL</option>
            <option value="HIGH">🟠 HIGH</option>
            <option value="MEDIUM">🟡 MEDIUM</option>
            <option value="LOW">🟢 LOW</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
          >
            <option value="">All Statuses</option>
            <option value="REPORTED">REPORTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Map Card Container */}
      {loading ? (
        <div className="h-[600px] glass-panel rounded-3xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : (
        <ComplaintMap complaints={complaints} height="650px" />
      )}

    </div>
  );
}
