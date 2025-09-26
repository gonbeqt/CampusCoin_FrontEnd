import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { CoinsIcon, MailIcon } from 'lucide-react'
import AuthController from '../../controllers/authController'

const Register = () => {

  const location = useLocation();
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: location.state?.email || '',
    password: '',
    role: 'student',
    course: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [showVerification, setShowVerification] = useState(location.state?.showVerification || false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const navigate = useNavigate()

  // If redirected from login, update email and showVerification on mount
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }))
    }
    if (location.state?.showVerification) {
      setShowVerification(true)
    }
  }, [location.state])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await AuthController.register(formData)
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Registration successful!' })
        setShowVerification(true)
      } else {
        setMessage({ type: 'error', text: result.error || 'Registration failed.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred during registration.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setMessage(null)

    try {
      // Always use the email in formData (which is set from location.state if redirected)
      const result = await AuthController.verifyEmail(formData.email, verificationCode)

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email verified successfully!' })
        setTimeout(() => {
          navigate('/login')
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Invalid verification code' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred during verification' })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setMessage(null)
    setIsResending(true)
    setMessage(null)

    try {
      const result = await AuthController.resendVerificationCode(formData.email)

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'New verification code sent!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to resend code' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to resend verification code' })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <CoinsIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showVerification ? 'Verify Your Email' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showVerification
              ? 'Enter the verification code sent to your email'
              : 'Join CampusCoin - University Attendance & Events Reward System'
            }
          </p>
        </div>

        {showVerification ? (
          // ================= Verification Form =================
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MailIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Check your email!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  name="verificationCode"
                  type="text"
                  maxLength="6"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-lg tracking-widest"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              {verificationError && (
                <div className="text-red-500 text-sm text-center">{verificationError}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    {isResending ? 'Resending...' : 'Resend'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : (
          // ================= Registration Form =================
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
                    Middle Name (Optional)
                  </label>
                  <input
                    id="middle_name"
                    name="middle_name"
                    type="text"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                    Suffix (Optional)
                  </label>
                  <input
                    id="suffix"
                    name="suffix"
                    type="text"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Jr., Sr., III"
                    value={formData.suffix}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm font-medium rounded-md ${formData.role === 'student'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm font-medium rounded-md ${formData.role === 'seller'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
                  >
                    Seller
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm font-medium rounded-md ${formData.role === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Course Selector */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a course</option>
                <option value="BSIT">BSIT</option>
                <option value="CAHS">CAHS</option>
                <option value="CMA">CMA</option>
                <option value="CRIM">CRIM</option>
                <option value="CEA">CEA</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>

            {message && message.type === 'error' && (
              <div className="text-red-500 text-sm text-center p-2 border border-red-300 bg-red-50 rounded-md">{message.text}</div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
