import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { municipalityAPI } from '../services/api';
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
  BadgeCheck
} from 'lucide-react';

const FEATURED_OFFICIAL_STAFF = [
  {
    state: "Delhi",
    municipality: "Municipal Corporation of Delhi (MCD)",
    name: "Dr. Ashwani Kumar, IAS",
    email: "commissioner.mcd@delhi.gov.in",
    role: "admin",
    designation: "Commissioner, Municipal Corporation of Delhi",
    employeeId: "HRMS-DL-MCD-0001",
    department: "Municipal Administration",
    authority: "Ministry of Home Affairs / Govt. of NCT of Delhi"
  },
  {
    state: "Delhi",
    municipality: "Municipal Corporation of Delhi (MCD)",
    name: "Er. Vikas Anand",
    email: "officer.pwd.delhi@civicfix.gov",
    role: "authority",
    designation: "Engineer-in-Chief (Roads, Flyovers & Potholes)",
    employeeId: "HRMS-DL-MCD-1099",
    department: "Public Works",
    authority: "Municipal Corporation of Delhi Engineering Cadre"
  },
  {
    state: "Maharashtra",
    municipality: "Brihanmumbai Municipal Corporation (BMC)",
    name: "Dr. Bhushan Gagrani, IAS",
    email: "commissioner.bmc@mcgm.gov.in",
    role: "admin",
    designation: "Municipal Commissioner & Administrator, BMC",
    employeeId: "HRMS-MH-BMC-0001",
    department: "Municipal Administration",
    authority: "Urban Development Department, Govt. of Maharashtra"
  },
  {
    state: "Maharashtra",
    municipality: "Brihanmumbai Municipal Corporation (BMC)",
    name: "Er. P. Velrasu, IAS",
    email: "officer.pwd.maharashtra@civicfix.gov",
    role: "authority",
    designation: "Chief Engineer (Roads & Traffic Planning)",
    employeeId: "HRMS-MH-BMC-1002",
    department: "Public Works",
    authority: "Brihanmumbai Municipal Corporation Civil Engineering Cadre"
  },
  {
    state: "Karnataka",
    municipality: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    name: "Shri Tushar Giri Nath, IAS",
    email: "commissioner.bbmp@karnataka.gov.in",
    role: "admin",
    designation: "Chief Commissioner, Bruhat Bengaluru Mahanagara Palike",
    employeeId: "HRMS-KA-BBMP-0001",
    department: "Municipal Administration",
    authority: "Urban Development Department, Govt. of Karnataka"
  },
  {
    state: "Karnataka",
    municipality: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    name: "Er. B.S. Prahallad",
    email: "officer.pwd.karnataka@civicfix.gov",
    role: "authority",
    designation: "Engineer-in-Chief (Roads & Major Infrastructure)",
    employeeId: "HRMS-KA-BBMP-1055",
    department: "Public Works",
    authority: "Karnataka Public Works & BBMP Engineering Cadre"
  },
  {
    state: "Telangana",
    municipality: "Greater Hyderabad Municipal Corporation (GHMC)",
    name: "Shri Ronald Rose, IAS",
    email: "commissioner.ghmc@telangana.gov.in",
    role: "admin",
    designation: "Commissioner, Greater Hyderabad Municipal Corporation",
    employeeId: "HRMS-TG-GHMC-0001",
    department: "Municipal Administration",
    authority: "MA&UD Department, Govt. of Telangana"
  },
  {
    state: "Tamil Nadu",
    municipality: "Greater Chennai Corporation (GCC)",
    name: "Dr. J. Radhakrishnan, IAS",
    email: "commissioner.gcc@tn.gov.in",
    role: "admin",
    designation: "Commissioner, Greater Chennai Corporation",
    employeeId: "HRMS-TN-GCC-0001",
    department: "Municipal Administration",
    authority: "Municipal Administration & Water Supply, Govt. of Tamil Nadu"
  },
  {
    state: "West Bengal",
    municipality: "Kolkata Municipal Corporation (KMC)",
    name: "Shri Binod Kumar, IAS",
    email: "commissioner.kmc@wb.gov.in",
    role: "admin",
    designation: "Municipal Commissioner, Kolkata Municipal Corporation",
    employeeId: "HRMS-WB-KMC-0001",
    department: "Municipal Administration",
    authority: "Urban Development & Municipal Affairs, Govt. of West Bengal"
  }
];

export default function MunicipalLoginPage() {
  const { municipalLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchState, setSearchState] = useState('');

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

  const filteredStaff = FEATURED_OFFICIAL_STAFF.filter(s => {
    if (!searchState) return true;
    const query = searchState.toLowerCase();
    return s.state.toLowerCase().includes(query) ||
           s.name.toLowerCase().includes(query) ||
           s.designation.toLowerCase().includes(query) ||
           s.department.toLowerCase().includes(query) ||
           s.employeeId.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Government-Verified Municipal HRMS Cadre</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Municipal Authority &amp; Officer Sign In
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official access portal for verified Commissioners, Department In-Charges, and Public Works Officers
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
                Staff Authentication
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enter your official government email or select from the verified directory
              </p>
            </div>
          </div>

          {selectedStaff && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-indigo-500" />
                  {selectedStaff.name}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/20">{selectedStaff.employeeId}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {selectedStaff.designation}
              </p>
              <p className="text-[10px] text-slate-500">
                {selectedStaff.authority}
              </p>
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
                Official Staff Email
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
              1-Click Demo Shortcuts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('authority@civicfix.demo');
                  setPassword('demo1234');
                  setSelectedStaff({
                    name: 'Er. Vikas Anand',
                    employeeId: 'HRMS-DEMO-PWD-01',
                    designation: 'Engineer-in-Chief (Roads & Infrastructure)',
                    authority: 'MCD Engineering Cadre'
                  });
                }}
                className="p-2 rounded-xl glass-card hover:border-amber-500/50 text-left"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">PWD Delhi Officer</p>
                <span className="text-[10px] text-slate-400">authority@civicfix.demo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('admin@civicfix.demo');
                  setPassword('demo1234');
                  setSelectedStaff({
                    name: 'Dr. Ashwani Kumar, IAS',
                    employeeId: 'HRMS-DEMO-ADM-01',
                    designation: 'Municipal Commissioner, MCD',
                    authority: 'Govt. of NCT of Delhi'
                  });
                }}
                className="p-2 rounded-xl glass-card hover:border-indigo-500/50 text-left"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">MCD Commissioner</p>
                <span className="text-[10px] text-slate-400">admin@civicfix.demo</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Not staff?{' '}
            <Link to="/login" className="font-bold text-sky-500 hover:underline">
              Citizen sign in
            </Link>
          </div>

        </div>

        {/* Right Column: Official Government-Verified Staff Directory */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Official Government-Verified Staff Directory
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any official officer to auto-populate credentials and test their operations queue
              </p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search state, officer, HRMS..."
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredStaff.map((staff, idx) => {
              const isSelected = email.toLowerCase() === staff.email.toLowerCase();
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectStaff(staff)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border text-xs flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
                      {staff.designation}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                    <div className="flex items-center justify-between font-mono text-slate-500">
                      <span>{staff.employeeId}</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <p className="text-slate-400 truncate">{staff.authority}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              All 73 Official Government-Verified Staff across 36 Indian States are provisioned in MongoDB.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
