import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpInput from '../components/OtpInput';
import { Shield, Mail, Lock, LogIn, CheckCircle, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

function maskEmail(email = '') {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [username, domain] = parts;
  if (username.length <= 1) return `*@${domain}`;
  const firstChar = username[0];
  return `${firstChar}***@${domain}`;
}

export default function LoginPage() {
  const { login, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);

  // OTP Verification view state
  const [showOtpView, setShowOtpView] = useState(false);
  const [otp, setOtp] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res?.requiresVerification) {
        setUnverifiedEmail(res.email || email.trim().toLowerCase());
        setInfoMessage(res.message || 'Your email is not verified. A new OTP has been sent to your email.');
        if (res.devOtp) {
          setOtp(res.devOtp);
        }
        setResendCooldown(60);
        setShowOtpView(true);
      } else if (res?.user) {
        const loggedUser = res.user;
        if (loggedUser.role === 'admin') navigate('/admin-dashboard');
        else if (loggedUser.role === 'authority') navigate('/authority-dashboard');
        else navigate('/citizen-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(unverifiedEmail, otp.trim());
      if (res.success) {
        setSuccessMessage('Email verified successfully! Please sign in with your password.');
        setShowOtpView(false);
        setPassword('');
        setOtp('');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setInfoMessage('');
    setResending(true);
    try {
      const res = await resendOTP(unverifiedEmail);
      setInfoMessage(res.message || 'A new OTP has been sent to your email address.');
      setOtp('');
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {showOtpView ? 'Verify Your Email' : 'Welcome Back to CivicFix'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {showOtpView 
              ? `OTP sent to ${maskEmail(unverifiedEmail)}` 
              : 'Citizen Portal & Municipal Issue Resolution Network'}
          </p>
        </div>

        {/* Feedback Banners */}
        {successMessage && !showOtpView && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!showOtpView ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-sky-500 hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : <><LogIn className="w-4 h-4" /> Sign In</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            <div className="space-y-3">
              <label className="block font-bold text-center text-slate-700 dark:text-slate-300">
                Enter 6-Digit Verification Code
              </label>
              
              <OtpInput
                value={otp}
                onChange={setOtp}
                onComplete={() => {}}
                disabled={loading}
                autoFocus={true}
              />

              <p className="text-[11px] text-center text-slate-400">
                Please enter the 6-digit OTP code sent to your registered email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : <><CheckCircle className="w-4 h-4" /> Verify Email & Activate</>}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resending}
                className="text-sky-500 hover:underline font-bold flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpView(false);
                  setOtp('');
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-sky-500 hover:underline">
              Create account
            </Link>
          </div>
          <div>
            Municipal staff account?{' '}
            <Link to="/municipal-login" className="font-bold text-sky-500 hover:underline">
              Staff sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
