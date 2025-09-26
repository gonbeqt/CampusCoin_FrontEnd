import React, { useState } from 'react';

const VerificationModal = ({ email, isOpen, onClose, onVerified, AuthController }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setMessage(null);
    try {
      const result = await AuthController.verifyEmail(email, verificationCode);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email verified successfully!' });
        setTimeout(() => {
          setMessage(null);
          onVerified();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Invalid verification code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred during verification' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setMessage(null);
    setIsResending(true);
    setResendCooldown(30); // 30 seconds cooldown
    try {
      const result = await AuthController.resendVerificationCode(email);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'New verification code sent!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to resend code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to resend verification code' });
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2 text-center">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Enter the verification code sent to <strong>{email}</strong></p>
        <form onSubmit={handleVerification} className="space-y-4">
          <input
            type="text"
            maxLength="6"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg tracking-widest"
            placeholder="000000"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
            disabled={isVerifying}
          />
          <button
            type="submit"
            disabled={isVerifying || verificationCode.length !== 6}
            className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || resendCooldown > 0}
            className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
          >
            {isResending ? 'Resending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
          </button>
        </div>
        {message && (
          <div className={`mt-3 text-center text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message.text}</div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
