import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpInput from '../components/OtpInput';
import { Shield, Mail, Lock, User, UserPlus, Phone, CheckCircle, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

function maskEmail(email = '') {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [username, domain] = parts;
  if (username.length <= 1) return `*@${domain}`;
  const firstChar = username[0];
  return `${firstChar}***@${domain}`;
}

export default function RegisterPage() {
  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    locationName: 'Central City'
  });

  const [step, setStep] = useState('REGISTER'); // 'REGISTER' | 'OTP'
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Resend Countdown Timer (60s cooldown)
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
    setSuccessMessage('');

    // Validations
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-type your password confirmation.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        locationName: formData.locationName
      });

      if (res?.requiresVerification) {
        setRegisteredEmail(res.email || formData.email.trim().toLowerCase());
        setInfoMessage(res.message || 'Verification OTP sent to your registered email.');
        if (res?.devOtp) {
          setOtp(res.devOtp);
        }
        setResendCooldown(60);
        setStep('OTP');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(registeredEmail || formData.email.trim().toLowerCase(), otp.trim());
      if (res?.success) {
        setSuccessMessage('Email verified successfully. Your account is now active.');
        setTimeout(() => {
          navigate('/login', {
            state: {
              successMessage: 'Email verified successfully. Your account is now active. Please sign in.',
              email: registeredEmail || formData.email
            }
          });
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please check your email or request a new code.');
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
      const targetEmail = registeredEmail || formData.email.trim().toLowerCase();
      const res = await resendOTP(targetEmail);
      setInfoMessage(res?.message || 'A fresh 6-digit OTP has been sent to your email.');
      if (res?.devOtp) {
        setOtp(res.devOtp);
      } else {
        setOtp('');
      }
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {step === 'OTP' ? 'Verify Email Address' : 'Create CivicFix Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'OTP' 
              ? `OTP sent to ${maskEmail(registeredEmail || formData.email)}`
              : 'Join your local civic issue resolution network'}
          </p>
        </div>

        {/* Feedback Banners */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {infoMessage && !successMessage && (
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

        {step === 'REGISTER' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Avni Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account & Sending OTP...' : <><UserPlus className="w-4 h-4" /> Register & Send OTP</>}
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
                disabled={loading || Boolean(successMessage)}
                autoFocus={true}
              />

              <p className="text-[11px] text-center text-slate-400">
                Code expires in 10 minutes. Check your spam/junk folder if not received.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || Boolean(successMessage)}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : <><CheckCircle className="w-4 h-4" /> Verify Email & Activate</>}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resending || Boolean(successMessage)}
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
                  setStep('REGISTER');
                  setOtp('');
                  setError('');
                  setInfoMessage('');
                }}
                disabled={loading || Boolean(successMessage)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Form
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>
            Already registered?{' '}
            <Link to="/login" className="font-bold text-sky-500 hover:underline">
              Sign in instead
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
