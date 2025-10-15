import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CoinsIcon, AlertTriangle, Clock, XCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import AuthController from '../../controllers/authController'

import { useAuth } from '../components/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [viewState, setViewState] = useState({
    isLoading: false,
    error: '',
    rememberMe: false,
    showPassword: false
  })

  const [accountStatusInfo, setAccountStatusInfo] = useState(null)
  const navigate = useNavigate()

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (viewState.error) {
      setViewState(prev => ({ ...prev, error: '' }))
      setAccountStatusInfo(null)
    }
  }

  // Handle checkbox change
  const handleRememberMeChange = (e) => {
    setViewState(prev => ({
      ...prev,
      rememberMe: e.target.checked
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setViewState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (e && e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
      e.nativeEvent.stopImmediatePropagation()
    }

    setViewState(prev => ({ ...prev, isLoading: true, error: '' }))
    setAccountStatusInfo(null)

    try {
      const result = await AuthController.login(formData)
      console.log('[handleSubmit] login result:', result)

      if (result.success) {
        login(result.user)
        setViewState(prev => ({ ...prev, isLoading: false, error: '' }))
        const role = result.user?.role
        const route = AuthController.getRouteForRole(role)
        navigate(route)
      } else {
        // Handle different types of errors
        const errorData = result.data || {}

        if (errorData.accountStatus) {
          setAccountStatusInfo({
            status: errorData.accountStatus,
            message: result.error
          })
        } else if (errorData.requiresVerification) {
          setAccountStatusInfo({
            status: 'verification_required',
            message: result.error,
            email: formData.email
          })
        }

        setViewState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error
        }))
      }
    } catch (err) {
      console.error('Login error:', err)
      setViewState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }))
    }
  }

  // Get status icon and color based on account status
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          title: 'Account Pending Approval'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5 text-rose-500" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          textColor: 'text-rose-800',
          title: 'Account Rejected'
        }
      case 'suspended':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          textColor: 'text-rose-800',
          title: 'Account Suspended'
        }
      case 'verification_required':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-emerald-500" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-800',
          title: 'Email Verification Required'
        }
      default:
        return {
          icon: <XCircle className="h-5 w-5 text-rose-500" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          textColor: 'text-rose-800',
          title: 'Error'
        }
    }
  }

  // Check if form is valid
  const isFormValid = formData.email && formData.password

  return (
    <div className="relative bg-gray-50 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 opacity-70" aria-hidden>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(134,239,172,0.25),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.25),_transparent_50%)]" />
      </div>
      <div className="w-full max-w-lg space-y-10">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-200/70">
              <CoinsIcon className="h-10 w-10" />
            </span>
          </div>
          <h2 className="mt-6 text-center text-4xl font-semibold text-emerald-900">
            CampusCoin
          </h2>
          <p className="mt-3 text-center text-sm font-medium uppercase tracking-[0.4em] text-emerald-500">
            Attend · Engage · Earn
          </p>
          <p className="mt-3 text-center text-sm text-emerald-700/80">
            University Attendance & Events Reward System
          </p>
        </div>

        {/* Account Status Info */}
        {accountStatusInfo && (
          <div className={`rounded-md p-4 ${getStatusDisplay(accountStatusInfo.status).bgColor} ${getStatusDisplay(accountStatusInfo.status).borderColor} border`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {getStatusDisplay(accountStatusInfo.status).icon}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${getStatusDisplay(accountStatusInfo.status).textColor}`}>
                  {getStatusDisplay(accountStatusInfo.status).title}
                </h3>
                <div className={`mt-2 text-sm ${getStatusDisplay(accountStatusInfo.status).textColor}`}>
                  <p>{accountStatusInfo.message}</p>
                  {accountStatusInfo.status === 'pending' && (
                    <p className="mt-2">
                      <strong>What happens next?</strong><br />
                      Your account documents are being reviewed by our administrators.
                      You'll receive an email notification once your account is approved.
                    </p>
                  )}
                  {accountStatusInfo.status === 'verification_required' && (
                    <div className="mt-3">
                      <Link
                        to="/register"
                        state={{ email: accountStatusInfo.email, showVerification: true }}
                        className="inline-flex items-center rounded-lg border border-transparent bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
                      >
                        Verify Email Now
                      </Link>
                    </div>
                  )}
                  {accountStatusInfo.status === 'rejected' && (
                    <p className="mt-2">
                      <strong>What happens next?</strong><br />
                      Please check your email for more details and instructions on how to resubmit your documents.
                      <span className="block mt-2">
                        <Link to="/resubmit-documents" className="font-semibold text-emerald-600 hover:underline">
                          Resubmit documents now
                        </Link>
                      </span>
                    </p>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="cc-card mt-10 space-y-6 p-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-emerald-800">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={viewState.isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-emerald-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={viewState.showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 pr-10 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={viewState.isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-300 transition hover:text-emerald-500"
                  onClick={togglePasswordVisibility}
                  disabled={viewState.isLoading}
                >
                  {viewState.showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {viewState.error && !accountStatusInfo && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-sm font-medium text-rose-600">
              {viewState.error}
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-400"
                checked={viewState.rememberMe}
                onChange={handleRememberMeChange}
                disabled={viewState.isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-emerald-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={viewState.isLoading || !isFormValid}
              className="group relative flex w-full justify-center rounded-xl border border-transparent bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-300/50 transition hover:bg-emerald-700 hover:shadow-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {viewState.isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">New to CampusCoin?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/register"
                className="flex w-full justify-center rounded-xl border border-emerald-500 bg-white/90 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2"
              >
                Create an account
              </Link>
            </div>
          </div>
        </form>

        {/* Account Status Help */}
        <div className="cc-card mt-8 space-y-2 p-6">
          <h3 className="text-sm font-semibold text-emerald-900">Account Status Guide</h3>
          <p className="text-xs text-emerald-600/80">Understand where your enrollment stands at a glance.</p>
          <div className="space-y-2 text-xs text-emerald-600/80">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-amber-500" />
              <span><strong>Pending:</strong> Documents under review</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span><strong>Approved:</strong> Ready to use CampusCoin</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-3 w-3 text-rose-500" />
              <span><strong>Rejected:</strong> Documents need correction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login