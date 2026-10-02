import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { 
  Shield, 
  MapPin, 
  PlusCircle, 
  BarChart3, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
                CivicFix
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">Smart Resolution Engine</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Home
          </Link>

          <Link
            to="/report"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/report') ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </Link>

          <Link
            to="/map"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/map') ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Civic Map
          </Link>

          <Link
            to="/public-dashboard"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/public-dashboard') ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Public Data
          </Link>

          {/* Role Based Dashboard Navigation */}
          {user && (
            <Link
              to={
                user.role === 'admin' ? '/admin-dashboard' :
                user.role === 'authority' ? '/authority-dashboard' : '/citizen-dashboard'
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.includes('dashboard') ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Section Tools & Profile */}
        <div className="flex items-center gap-2.5">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(prev => !prev)}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-500" /> Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-6 text-slate-500 dark:text-slate-400">No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id}
                          onClick={() => {
                            setShowNotifMenu(false);
                            if (n.complaint) navigate(`/complaints/${n.complaint._id || n.complaint}`);
                          }}
                          className={`p-3 rounded-xl cursor-pointer text-xs transition-colors ${
                            !n.read ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight">{user.name}</p>
                  <span className="text-[10px] text-sky-500 font-semibold capitalize">{user.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 z-50">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 mb-1">
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20 uppercase">
                      {user.role} {user.department !== 'None' ? `(${user.department})` : ''}
                    </span>
                  </div>

                  <Link
                    to={
                      user.role === 'admin' ? '/admin-dashboard' :
                      user.role === 'authority' ? '/authority-dashboard' : '/citizen-dashboard'
                    }
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-500" /> My Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200 hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
