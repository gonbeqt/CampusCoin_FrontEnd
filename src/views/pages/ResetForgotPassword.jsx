import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ResetForgotPassword = () => {
  // Prevent back navigation to login from this page
  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  // Get email from location state or context (assume location.state.email for now)
  const email = location.state?.email || '';
  const [missingEmail, setMissingEmail] = useState(false);
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const code = codeDigits.join('');
    if (!email) {
      setMissingEmail(true);
      setError('Email is missing. Please start the reset flow from the Forgot Password page.');
      setIsLoading(false);
      return;
    }
    if (code.length !== 6 || !newPassword || !confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    if (newPassword.indexOf(' ') !== -1 || confirmPassword.indexOf(' ') !== -1) {
      setError('Password cannot contain spaces');
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, confirmPassword })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
          window.history.pushState(null, '', window.location.href);
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-gray-50 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 opacity-70" aria-hidden>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(134,239,172,0.25),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.25),_transparent_50%)]" />
      </div>
      <div className="w-full max-w-lg space-y-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-semibold text-emerald-900">Reset Your Password</h2>
          <p className="mt-3 text-center text-sm font-medium uppercase tracking-[0.4em] text-emerald-500">Security · Recovery</p>
          <p className="mt-3 text-center text-sm text-emerald-700/80">
            Enter the code sent to <strong className="text-emerald-900">{email}</strong> and enter a new password.
          </p>
        </div>
        {missingEmail ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-600">
            Email missing<br />
            <span className="text-xs font-normal">Please start the reset flow from the Forgot Password page so we know which account to reset.</span>
          </div>
        ) : success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-700">
            Password reset successful!<br />
            <span className="text-xs font-normal">Redirecting to login...</span>
          </div>
        ) : (
          <form className="cc-card mt-10 space-y-6 p-8" onSubmit={handleReset}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-emerald-800 mb-2 text-center">Verification Code</label>
              <div className="flex justify-center gap-2">
                {codeDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-2xl rounded-xl border border-emerald-200 bg-white/90 shadow-sm focus:outline-none focus:ring-emerald-200 focus:border-emerald-500 text-emerald-900 placeholder:text-emerald-400"
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 1) return;
                      const newDigits = [...codeDigits];
                      newDigits[idx] = val;
                      setCodeDigits(newDigits);
                      if (val && idx < 5) {
                        document.getElementById(`code-digit-${idx+1}`)?.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !codeDigits[idx] && idx > 0) {
                        document.getElementById(`code-digit-${idx-1}`)?.focus();
                      }
                    }}
                    id={`code-digit-${idx}`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 pr-10 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-300 transition hover:text-emerald-500"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 pr-10 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-300 transition hover:text-emerald-500"
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-sm font-medium text-rose-600">{error}</div>}
            <button type="submit" disabled={isLoading || codeDigits.some(d => !d)} className="group relative flex w-full justify-center rounded-xl border border-transparent bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-300/50 transition hover:bg-emerald-700 hover:shadow-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetForgotPassword;
