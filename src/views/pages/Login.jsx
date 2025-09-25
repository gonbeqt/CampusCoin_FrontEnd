import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CoinsIcon } from 'lucide-react'
import AuthController from '../../controllers/authController'

const Login = () => {
  // View state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [viewState, setViewState] = useState({
    isLoading: false,
    error: '',
    rememberMe: false
  })

  const navigate = useNavigate()

  // Subscribe to controller updates
  useEffect(() => {
    const handleAuthUpdate = (data) => {
      switch (data.type) {
        case 'LOGIN_SUCCESS':
          setViewState(prev => ({ ...prev, isLoading: false, error: '' }))
          // Navigate based on user role
          const role = data.user?.role
          const route = AuthController.getRouteForRole(role)
          navigate(route)
          break
        
        case 'LOGIN_FAILURE':
          setViewState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: data.error 
          }))
          break
        
        default:
          break
      }
    }

    AuthController.subscribe(handleAuthUpdate)

    return () => {
      AuthController.unsubscribe(handleAuthUpdate)
    }
  }, [navigate])

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
    }
  }

  // Handle checkbox change
  const handleRememberMeChange = (e) => {
    setViewState(prev => ({
      ...prev,
      rememberMe: e.target.checked
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setViewState(prev => ({ ...prev, isLoading: true, error: '' }))

    // Call controller
    const result = await AuthController.login(formData)
    
    if (!result.success) {
      setViewState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error 
      }))
    }
    // Success case is handled by the observer
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

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                disabled={viewState.isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={viewState.isLoading}
              />
            </div>
          </div>

          {/* Error Display */}
          {viewState.error && (
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
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={viewState.isLoading || !isFormValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {viewState.isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">New to CampusCoin?</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-blue-500 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create an account
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login