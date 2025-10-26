import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KeyIcon, CoinsIcon } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [used, setUsed] = useState(false);

  useEffect(() => {
    let didRun = false;
    if (status !== 'pending') return; // Only run once
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('Invalid or missing token.');
      return;
    }
    if (!didRun) {
      didRun = true;
      fetch(`http://localhost:5000/api/auth/activate-reset-password?token=${token}`)
        .then(async res => {
          const data = await res.json();
          if (res.ok) {
            setStatus('success');
          } else {
            setStatus('error');
            // Detect if the error is due to link being used
            if (data.message && data.message.toLowerCase().includes('invalid or expired')) {
              setUsed(true);
            }
            setError(data.message || 'Unknown error');
          }
        })
        .catch(() => {
          setStatus('error');
          setError('Server error.');
        });
    }
  }, [searchParams, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <CoinsIcon className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          CampusCoin - University Attendance & Events Reward System
        </p>
        {status === 'success' && (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <KeyIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Password reset complete</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Password reset complete. Your password is now set to the one sent via email.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {status === 'error' && used && (
          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <KeyIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Reset link has been used</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Reset link has been used. Try logging in with the new password. If it fails, please try another reset request or contact support.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {status === 'error' && !used && (
          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <KeyIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
