import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import ComplaintMap from '../components/ComplaintMap';
import { MapPin, Filter, Search, Loader2, Landmark, Globe2, Compass } from 'lucide-react';

const INDIAN_STATES_COORDINATES = [
  { state: "All India (Pan-India)", lat: 22.9734, lng: 78.6569, zoom: 5 },
  { state: "Andhra Pradesh", city: "Visakhapatnam", lat: 17.6868, lng: 83.2185, zoom: 11 },
  { state: "Arunachal Pradesh", city: "Itanagar", lat: 27.0844, lng: 93.6053, zoom: 12 },
  { state: "Assam", city: "Guwahati", lat: 26.1445, lng: 91.7362, zoom: 11 },
  { state: "Bihar", city: "Patna", lat: 25.5941, lng: 85.1376, zoom: 11 },
  { state: "Chhattisgarh", city: "Raipur", lat: 21.2514, lng: 81.6296, zoom: 11 },
  { state: "Goa", city: "Panaji", lat: 15.4909, lng: 73.8278, zoom: 12 },
  { state: "Gujarat", city: "Ahmedabad", lat: 23.0225, lng: 72.5714, zoom: 11 },
  { state: "Haryana", city: "Gurugram", lat: 28.4595, lng: 77.0266, zoom: 11 },
  { state: "Himachal Pradesh", city: "Shimla", lat: 31.1048, lng: 77.1734, zoom: 12 },
  { state: "Jharkhand", city: "Ranchi", lat: 23.3441, lng: 85.3096, zoom: 11 },
  { state: "Karnataka", city: "Bengaluru", lat: 12.9716, lng: 77.5946, zoom: 11 },
  { state: "Kerala", city: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, zoom: 11 },
  { state: "Madhya Pradesh", city: "Bhopal", lat: 23.2599, lng: 77.4126, zoom: 11 },
  { state: "Maharashtra", city: "Mumbai", lat: 18.9256, lng: 72.8242, zoom: 11 },
  { state: "Manipur", city: "Imphal", lat: 24.8170, lng: 93.9368, zoom: 12 },
  { state: "Meghalaya", city: "Shillong", lat: 25.5788, lng: 91.8933, zoom: 12 },
  { state: "Mizoram", city: "Aizawl", lat: 23.7271, lng: 92.7176, zoom: 12 },
  { state: "Nagaland", city: "Kohima", lat: 25.6751, lng: 94.1086, zoom: 12 },
  { state: "Odisha", city: "Bhubaneswar", lat: 20.2961, lng: 85.8245, zoom: 11 },
  { state: "Punjab", city: "Ludhiana", lat: 30.9010, lng: 75.8573, zoom: 11 },
  { state: "Rajasthan", city: "Jaipur", lat: 26.9124, lng: 75.7873, zoom: 11 },
  { state: "Sikkim", city: "Gangtok", lat: 27.3389, lng: 88.6065, zoom: 12 },
  { state: "Tamil Nadu", city: "Chennai", lat: 13.0827, lng: 80.2707, zoom: 11 },
  { state: "Telangana", city: "Hyderabad", lat: 17.3850, lng: 78.4867, zoom: 11 },
  { state: "Tripura", city: "Agartala", lat: 23.8315, lng: 91.2868, zoom: 12 },
  { state: "Uttar Pradesh", city: "Lucknow", lat: 26.8467, lng: 80.9462, zoom: 11 },
  { state: "Uttarakhand", city: "Dehradun", lat: 30.3165, lng: 78.0322, zoom: 11 },
  { state: "West Bengal", city: "Kolkata", lat: 22.5726, lng: 88.3639, zoom: 11 },
  { state: "Andaman and Nicobar Islands", city: "Port Blair", lat: 11.6234, lng: 92.7265, zoom: 12 },
  { state: "Chandigarh", city: "Chandigarh", lat: 30.7333, lng: 76.7794, zoom: 12 },
  { state: "Dadra and Nagar Haveli and Daman and Diu", city: "Daman", lat: 20.3974, lng: 72.8328, zoom: 12 },
  { state: "Delhi", city: "New Delhi", lat: 28.6139, lng: 77.2090, zoom: 11 },
  { state: "Jammu and Kashmir", city: "Srinagar", lat: 34.0837, lng: 74.7973, zoom: 11 },
  { state: "Ladakh", city: "Leh", lat: 34.1526, lng: 77.5771, zoom: 12 },
  { state: "Lakshadweep", city: "Kavaratti", lat: 10.5669, lng: 72.6420, zoom: 12 },
  { state: "Puducherry", city: "Puducherry", lat: 11.9416, lng: 79.8083, zoom: 12 }
];

export default function MapDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All India (Pan-India)');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const currentStateObj = INDIAN_STATES_COORDINATES.find(s => s.state === selectedState) || INDIAN_STATES_COORDINATES[0];

  useEffect(() => {
    fetchComplaintsForMap();
  }, [selectedState, categoryFilter, priorityFilter, statusFilter]);

  const fetchComplaintsForMap = async () => {
    setLoading(true);
    try {
      const isPanIndia = selectedState.includes('All India');
      const res = await complaintAPI.getAll({
        state: isPanIndia ? undefined : selectedState,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        status: statusFilter || undefined,
        limit: 500
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
      <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20 mb-2">
              <Globe2 className="w-3.5 h-3.5" /> Pan-India Municipal Coverage — 36 States &amp; UTs
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-sky-500" /> Pan-India Interactive Civic Issue Map
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live spatial coordinates across 36 Indian States &amp; Union Territories ({complaints.length} issues mapped)
            </p>
          </div>

          {/* State / UT Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Compass className="w-4 h-4 text-sky-500" /> Jurisdiction:
            </span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold text-xs outline-none focus:ring-2 focus:ring-sky-500"
            >
              {INDIAN_STATES_COORDINATES.map((st, i) => (
                <option key={i} value={st.state} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
                  {st.state} {st.city ? `(${st.city})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400">Filters:</span>
            
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
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
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
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="REPORTED">REPORTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Active Focus: <strong className="text-sky-500">{selectedState}</strong> • Center: {currentStateObj.lat.toFixed(2)}°N, {currentStateObj.lng.toFixed(2)}°E
          </div>

        </div>

      </div>

      {/* Map Card Container */}
      {loading ? (
        <div className="h-[650px] glass-panel rounded-3xl flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Loading Pan-India spatial nodes for {selectedState}...</p>
        </div>
      ) : (
        <ComplaintMap 
          complaints={complaints} 
          height="650px" 
          center={[currentStateObj.lat, currentStateObj.lng]} 
          zoom={currentStateObj.zoom} 
        />
      )}

    </div>
  );
}
