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
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          title: 'Account Pending Approval'
        }
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          title: 'Account Rejected'
        }
      case 'suspended':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          title: 'Account Suspended'
        }
      case 'verification_required':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          title: 'Email Verification Required'
        }
      default:
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          title: 'Error'
        }
    }
  }

  // Check if form is valid
  const isFormValid = formData.email && formData.password

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <CoinsIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CampusCoin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
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
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                        <Link to="/resubmit-documents" className="text-blue-600 hover:underline">
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={viewState.isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={viewState.showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={viewState.isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  disabled={viewState.isLoading}
                >
                  {viewState.showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {viewState.error && !accountStatusInfo && (
            <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={viewState.rememberMe}
                onChange={handleRememberMeChange}
                disabled={viewState.isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">New to CampusCoin?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-blue-500 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Create an account
              </Link>
            </div>
          </div>
        </form>

        {/* Account Status Help */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Account Status Guide</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-yellow-500" />
              <span><strong>Pending:</strong> Documents under review</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span><strong>Approved:</strong> Ready to use CampusCoin</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-3 w-3 text-red-500" />
              <span><strong>Rejected:</strong> Documents need correction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login