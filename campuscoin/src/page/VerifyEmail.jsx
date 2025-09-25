import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const VerifyEmail = ({ email: initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Email verified! You can now log in.');
        setTimeout(() => navigate('/page/Login'), 1500);
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Verification code resent! Check your email.');
        setResent(true);
      } else {
        setError(data.message || 'Could not resend code.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Email Verification</h2>
          <p className="mb-4 text-center text-gray-600">
            Please enter the 6-digit code sent to your email address.
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              placeholder="Verification Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              maxLength={6}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          <button
            className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
            onClick={handleResend}
            disabled={loading || resent}
          >
            {resent ? 'Code Resent!' : 'Resend Code'}
          </button>
          {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
          {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
