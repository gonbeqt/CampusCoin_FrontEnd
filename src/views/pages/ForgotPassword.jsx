import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CoinsIcon, KeyIcon } from 'lucide-react'
const ForgotPassword = () => {
  const [resetEmail, setResetEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [error, setError] = useState('')
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      // Simulate password reset request
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (resetEmail) {
        setResetSuccess(true)
      } else {
        setError('Please enter your email address')
      }
    } catch (err) {
      setError('An error occurred while sending the reset link')
    } finally {
      setIsLoading(false)
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
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            CampusCoin - University Attendance & Events Reward System
          </p>
        </div>
        {resetSuccess ? (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <KeyIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Password reset email sent</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>We've sent a password reset link to {resetEmail}. Please check your email.</p>
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
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="rounded-md shadow-sm">
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
export default ForgotPassword