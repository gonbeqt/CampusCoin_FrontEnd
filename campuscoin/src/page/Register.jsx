import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CoinsIcon, UserPlusIcon } from 'lucide-react'
import { useUser } from '../context/UserContext'
const Register = () => {
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerRole, setRegisterRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const navigate = useNavigate()
  const { login } = useUser()
  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (registerEmail && registerPassword && registerName) {
        setRegisterSuccess(true)
        // In a real app, you would register the user here
        // For demo purposes, we'll just show success message
      } else {
        setError('Please fill in all fields')
      }
    } catch (err) {
      setError('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }
  const handleLoginAfterRegister = async () => {
    setIsLoading(true)
    try {
      const success = await login(registerEmail, registerPassword)
      if (success) {
        // Redirect based on role
        if (registerRole === 'admin') {
          navigate('/admin')
        } else if (registerRole === 'seller') {
          navigate('/seller')
        } else {
          navigate('/student')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
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
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join CampusCoin - University Attendance & Events Reward System
          </p>
        </div>
        {registerSuccess ? (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <UserPlusIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Registration successful!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your account has been created successfully. You can now log in.</p>
                  </div>
                  <div className="mt-4 space-x-3">
                    <button
                      type="button"
                      onClick={handleLoginAfterRegister}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isLoading ? 'Logging in...' : 'Continue to Dashboard'}
                    </button>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Return to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm font-medium rounded-md ${
                      registerRole === 'student'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRegisterRole('student')}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm font-medium rounded-md ${
                      registerRole === 'seller'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRegisterRole('seller')}
                  >
                    Seller
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-sm font-medium rounded-md ${
                      registerRole === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRegisterRole('admin')}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? 'Creating account...' : 'Register'}
              </button>
            </div>
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
  )
}
export default Register