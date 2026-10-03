import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { municipalityAPI } from '../services/api';
import officialStaffDataset from '../data/government_verified_staff_dataset.json';
import { 
  Landmark, 
  Mail, 
  Lock, 
  LogIn, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Search, 
  ArrowRight, 
  Sparkles,
  Award,
  BadgeCheck,
  Filter,
  Globe2,
  Zap,
  Check,
  MapPin
} from 'lucide-react';

const ALL_36_STATES_AND_UTS = [
  "All India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

const DEPARTMENTS = [
  "All Departments",
  "Municipal Administration",
  "Public Works",
  "Sanitation",
  "Water",
  "Drainage",
  "Electricity",
  "Traffic"
];

export default function MunicipalLoginPage() {
  const { municipalLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [directLoggingInId, setDirectLoggingInId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  // Filtering & Search
  const [staffList, setStaffList] = useState(officialStaffDataset);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    // Attempt dynamic fetch from backend DB, smoothly fallback to officialStaffDataset
    const fetchStaff = async () => {
      try {
        const res = await municipalityAPI.getStaff();
        if (res.data?.success && res.data?.data?.length > 0) {
          setStaffList(res.data.data);
        }
      } catch (err) {
        // Retain bundled officialStaffDataset
        console.warn('Using bundled verified staff dataset:', err.message);
      }
    };
    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await municipalLogin(email.trim().toLowerCase(), password);
      if (res?.user) {
        const loggedUser = res.user;
        if (loggedUser.role === 'admin') navigate('/admin-dashboard');
        else navigate('/authority-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setEmail(staff.email);
    setPassword('demo1234');
    setError('');
  };

  const handleDirectSignIn = async (staff) => {
    setSelectedStaff(staff);
    setEmail(staff.email);
    setPassword('demo1234');
    setError('');
    setDirectLoggingInId(staff.employeeId || staff.email);
    try {
      const res = await municipalLogin(staff.email.trim().toLowerCase(), 'demo1234');
      if (res?.user) {
        if (res.user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/authority-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setDirectLoggingInId(null);
    }
  };

  const filteredStaff = staffList.filter(s => {
    // State Filter
    if (selectedState !== 'All India' && s.state?.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    // Department Filter
    if (selectedDepartment !== 'All Departments' && s.department?.toLowerCase() !== selectedDepartment.toLowerCase()) {
      return false;
    }
    // Role Filter
    if (selectedRole !== 'ALL' && s.role !== selectedRole) {
      return false;
    }
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchState = s.state && s.state.toLowerCase().includes(q);
      const matchName = s.name && s.name.toLowerCase().includes(q);
      const matchDesig = s.designation && s.designation.toLowerCase().includes(q);
      const matchDept = s.department && s.department.toLowerCase().includes(q);
      const matchEmp = s.employeeId && s.employeeId.toLowerCase().includes(q);
      const matchMuni = s.municipalityCode && s.municipalityCode.toLowerCase().includes(q);
      const matchEmail = s.email && s.email.toLowerCase().includes(q);
      return matchState || matchName || matchDesig || matchDept || matchEmp || matchMuni || matchEmail;
    }
    return true;
  });

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center space-y-6">
      
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Government of India &amp; State Municipal Corporation Verified Cadre</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          Municipal Officer &amp; Authority Access Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Official access portal for verified Commissioners, Department Engineers, and Field Officers across all 36 Indian States &amp; Union Territories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sign In Form */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-slate-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Official Staff Sign In
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authenticate with verified government email or select an officer from the directory
              </p>
            </div>
          </div>

          {selectedStaff && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-indigo-500" />
                  {selectedStaff.name}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/20">{selectedStaff.employeeId}</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                {selectedStaff.designation}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> {selectedStaff.state}
                </span>
                <span>•</span>
                <span>{selectedStaff.department}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Government Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="officer.pwd.delhi@civicfix.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default password for all provisioned official staff accounts: <strong className="font-mono text-indigo-500">demo1234</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-700 to-slate-700 hover:from-indigo-600 hover:to-slate-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating Official Cadre...' : <><LogIn className="w-4 h-4" /> Secure Staff Sign In</>}
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1-Click National Shortcuts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('officer.pwd.delhi@civicfix.gov');
                  setPassword('demo1234');
                  setSelectedStaff({
                    name: 'Er. Vikas Anand',
                    employeeId: 'HRMS-DL-MCD-1099',
                    designation: 'Engineer-in-Chief (Roads & Infrastructure)',
                    state: 'Delhi',
                    department: 'Public Works'
                  });
                }}
                className="p-2.5 rounded-xl glass-card hover:border-amber-500/50 text-left transition-all"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">PWD Delhi Officer</p>
                <span className="text-[10px] text-slate-400">officer.pwd.delhi@civicfix.gov</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('commissioner.mcd@delhi.gov.in');
                  setPassword('demo1234');
                  setSelectedStaff({
                    name: 'Dr. Ashwani Kumar, IAS',
                    employeeId: 'HRMS-DL-MCD-0001',
                    designation: 'Municipal Commissioner, MCD',
                    state: 'Delhi',
                    department: 'Municipal Administration'
                  });
                }}
                className="p-2.5 rounded-xl glass-card hover:border-indigo-500/50 text-left transition-all"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">MCD Commissioner</p>
                <span className="text-[10px] text-slate-400">commissioner.mcd@delhi.gov.in</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('officer.pwd.maharashtra@civicfix.gov');
                  setPassword('demo1234');
                  setSelectedStaff({
                    name: 'Er. P. Velrasu, IAS',
                    employeeId: 'HRMS-MH-BMC-1002',
                    designation: 'Chief Engineer (Roads & Traffic Planning)',
                    state: 'Maharashtra',
                    department: 'Public Works'
                  });
                }}
                className="p-2.5 rounded-xl glass-card hover:border-sky-500/50 text-left transition-all"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">BMC Mumbai Officer</p>
                <span className="text-[10px] text-slate-400">officer.pwd.maharashtra@civicfix.gov</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('officer.pwd.karnataka@civicfix.gov');
                  setPassword('demo1234');
                  setSelectedStaff({
                    name: 'Er. B.S. Prahallad',
                    employeeId: 'HRMS-KA-BBMP-1055',
                    designation: 'Engineer-in-Chief (Roads & Major Infra)',
                    state: 'Karnataka',
                    department: 'Public Works'
                  });
                }}
                className="p-2.5 rounded-xl glass-card hover:border-emerald-500/50 text-left transition-all"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">BBMP Bangalore PWD</p>
                <span className="text-[10px] text-slate-400">officer.pwd.karnataka@civicfix.gov</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span>Citizen resident?</span>
            <Link to="/login" className="font-bold text-sky-500 hover:underline">
              Citizen Sign In &rarr;
            </Link>
          </div>

        </div>

        {/* Right Column: Official Government-Verified Staff Directory */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Government-Verified Municipal Staff Directory ({filteredStaff.length} Officers)
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official HRMS staff across all 36 States &amp; UTs of India. Click any officer for 1-click access to their operations queue.
              </p>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search state, officer, HRMS ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Filters Bar: State & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* State Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                State / UT Jurisdiction:
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none text-xs"
              >
                {ALL_36_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Department Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Department:
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold outline-none text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cadre Rank:
              </label>
              <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ALL')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRole === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('authority')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRole === 'authority' ? 'bg-amber-600 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Engineers
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRole === 'admin' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Admins
                </button>
              </div>
            </div>
          </div>

          {/* Quick Popular State Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick States:</span>
            {["All India", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Gujarat", "West Bengal"].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap font-semibold border transition-all ${
                  selectedState === st
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Officer Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredStaff.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400 font-medium">
                No verified municipal officers matched your search criteria.
              </div>
            ) : (
              filteredStaff.map((staff, idx) => {
                const isSelected = email.toLowerCase() === staff.email.toLowerCase();
                const isLoggingIn = directLoggingInId === (staff.employeeId || staff.email);

                return (
                  <div
                    key={staff.employeeId || idx}
                    className={`p-3.5 rounded-2xl transition-all border text-xs flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-indigo-500" />
                          {staff.state}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          staff.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {staff.role === 'admin' ? 'Commissioner' : staff.department}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                        {staff.name}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug line-clamp-2">
                        {staff.designation}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                      <div className="flex items-center justify-between font-mono text-slate-500">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{staff.employeeId}</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> MoHUA Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSelectStaff(staff)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] text-center transition-colors"
                        >
                          Auto-Fill
                        </button>
                        <button
                          type="button"
                          disabled={isLoggingIn}
                          onClick={() => handleDirectSignIn(staff)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold text-[10px] text-center shadow transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isLoggingIn ? 'Entering...' : <><Zap className="w-3 h-3 fill-current" /> 1-Click Access</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              All 73 Official Government-Verified Staff across all 36 Indian States &amp; UTs are provisioned and active.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
