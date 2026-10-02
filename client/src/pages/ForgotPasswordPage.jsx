import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpInput from '../components/OtpInput';
import { Shield, Mail, Lock, KeyRound, CheckCircle, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

function maskEmail(email = '') {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [username, domain] = parts;
  if (username.length <= 1) return `*@${domain}`;
  const firstChar = username[0];
  return `${firstChar}***@${domain}`;
}

export default function ForgotPasswordPage() {
  const { forgotPassword, verifyResetOTP, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP' | 'PASSWORD'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Step 1: Send Reset OTP to Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      setInfoMessage(res?.message || 'Password reset OTP sent to your email.');
      if (res?.devOtp) {
        setOtp(res.devOtp);
      }
      setResendCooldown(60);
      setStep('OTP');
    } catch (err) {
      setError(err.message || 'Failed to send password reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
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
      const res = await verifyResetOTP(email.trim().toLowerCase(), otp.trim());
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        setInfoMessage('OTP verified. Please set your new password.');
        setStep('PASSWORD');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setInfoMessage('');
    setResending(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      setInfoMessage(res?.message || 'A new reset OTP has been sent to your email.');
      setOtp('');
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type your password confirmation.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        password,
        confirmPassword
      });

      setSuccessMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: {
            successMessage: 'Password updated successfully! You can now log in with your new password.',
            email: email.trim().toLowerCase()
          }
        });
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please request a new OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {step === 'EMAIL' && 'Reset Password'}
            {step === 'OTP' && 'Verify Reset Code'}
            {step === 'PASSWORD' && 'Create New Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 'EMAIL' && 'Enter your registered email to receive a 6-digit reset code'}
            {step === 'OTP' && `Reset code sent to ${maskEmail(email)}`}
            {step === 'PASSWORD' && 'Enter and confirm your new secure password'}
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

        {/* Step 1: Email Input */}
        {step === 'EMAIL' && (
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            <div className="space-y-3">
              <label className="block font-bold text-center text-slate-700 dark:text-slate-300">
                Enter 6-Digit Reset Code
              </label>

              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
                autoFocus={true}
              />

              <p className="text-[11px] text-center text-slate-400">
                The reset code expires in 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code & Proceed'}
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
                  setStep('EMAIL');
                  setOtp('');
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
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

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(successMessage)}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Update Password & Sign In'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-sky-500 hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
