import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  CoinsIcon, 
  MailIcon, 
  Upload, 
  FileText, 
  Image, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info
} from 'lucide-react'
import AuthController from '../../controllers/authController'

const Register = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    role: 'student',
    course: '',
    // Admin fields
    credentialType: '',
    // Seller fields
    businessName: '',
    businessType: '',
    businessAddress: ''
  })

  const [documents, setDocuments] = useState({
    studentId: null,
    birCertificate: null,
    businessPermit: null,
    teachingCredential: null
  })

  const [viewState, setViewState] = useState({
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false
  })

  const [message, setMessage] = useState(null)
  const [showVerification, setShowVerification] = useState(location.state?.showVerification || false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

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
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null)
    }
  }

  const handleFileUpload = (e, documentType) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setMessage({ 
          type: 'error', 
          text: 'Please upload only JPEG, PNG, or PDF files' 
        })
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ 
          type: 'error', 
          text: 'File size must be less than 10MB' 
        })
        return
      }

      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }))
      
      // Clear any previous error message
      if (message?.type === 'error') {
        setMessage(null)
      }
    }
  }

  const togglePasswordVisibility = (field) => {
    setViewState(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return false
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return false
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (!formData.course) {
        setMessage({ type: 'error', text: 'Please select a course' })
        return false
      }
      if (!documents.studentId) {
        setMessage({ type: 'error', text: 'Please upload your Student ID image' })
        return false
      }
    }

    if (formData.role === 'seller') {
      if (!formData.businessName || !formData.businessType || !formData.businessAddress) {
        setMessage({ type: 'error', text: 'Please fill in all business information' })
        return false
      }
      if (!documents.birCertificate) {
        setMessage({ type: 'error', text: 'Please upload your BIR Certificate' })
        return false
      }
      if (!documents.businessPermit) {
        setMessage({ type: 'error', text: 'Please upload your Business Permit' })
        return false
      }
    }

    if (formData.role === 'admin') {
      if (!formData.credentialType) {
        setMessage({ type: 'error', text: 'Please select your teaching credential type' })
        return false
      }
      if (!documents.teachingCredential) {
        setMessage({ type: 'error', text: 'Please upload your teaching credential' })
        return false
      }
    }

    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setViewState(prev => ({ ...prev, isLoading: true }))
    setMessage(null)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== 'confirmPassword') {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formDataToSend.append(key, documents[key])
        }
      })

      const result = await AuthController.register(formDataToSend)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Registration successful!' })
        setShowVerification(true)
      } else {
        setMessage({ type: 'error', text: result.error || 'Registration failed.' })
      }
    } catch (err) {
      console.error('Registration error:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred during registration.' })
    } finally {
      setViewState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setMessage(null)

    try {
      const result = await AuthController.verifyEmail(formData.email, verificationCode)

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email verified successfully!' })
        setTimeout(() => {
          navigate('/login')
        }, 2000)
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

  const getDocumentRequirements = () => {
    switch (formData.role) {
      case 'student':
        return {
          title: 'Required Document',
          items: [
            { label: 'Student ID', description: 'Clear image of your official student ID (front or back)', required: true }
          ]
        }
      case 'seller':
        return {
          title: 'Required Documents',
          items: [
            { label: 'BIR Certificate', description: 'Official BIR certificate for your business', required: true },
            { label: 'Business Permit', description: 'Valid business permit from local government', required: true }
          ]
        }
      case 'admin':
        return {
          title: 'Required Document',
          items: [
            { label: 'Teaching Credential', description: 'TCP (Teacher Certificate Program) or LPT (Licensed Professional Teacher)', required: true }
          ]
        }
      default:
        return null
    }
  }

  const requirements = getDocumentRequirements()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
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

        {/* Message Display */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

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
                    <p className="mt-2">After verification, your account will be pending admin approval.</p>
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
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
                      Middle Name
                    </label>
                    <input
                      id="middle_name"
                      name="middle_name"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                      Suffix
                    </label>
                    <input
                      id="suffix"
                      name="suffix"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Jr., Sr., III"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={viewState.isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="password"
                        name="password"
                        type={viewState.showPassword ? "text" : "password"}
                        required
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={viewState.isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('showPassword')}
                        disabled={viewState.isLoading}
                      >
                        {viewState.showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={viewState.showConfirmPassword ? "text" : "password"}
                        required
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={viewState.isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('showConfirmPassword')}
                        disabled={viewState.isLoading}
                      >
                        {viewState.showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Type */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['student', 'seller', 'admin'].map((role) => (
                  <div key={role} className="relative">
                    <button
                      type="button"
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        formData.role === role
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, role }))}
                      disabled={viewState.isLoading}
                    >
                      <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                        {role}
                      </div>
                      <div className="text-xs text-gray-500">
                        {role === 'student' && 'Access events and earn rewards'}
                        {role === 'seller' && 'Sell products to students'}
                        {role === 'admin' && 'Manage events and system'}
                      </div>
                    </button>
                    {formData.role === role && (
                      <div className="absolute -top-2 -right-2">
                        <CheckCircle className="h-5 w-5 text-blue-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Role-specific Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {formData.role === 'student' && 'Academic Information'}
                {formData.role === 'seller' && 'Business Information'}
                {formData.role === 'admin' && 'Teaching Credentials'}
              </h3>

              {formData.role === 'student' && (
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                    Course *
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={viewState.isLoading}
                  >
                    <option value="">Select a course</option>
                    <option value="BSIT">BSIT - Bachelor of Science in Information Technology</option>
                    <option value="CAHS">CAHS - College of Allied Health Sciences</option>
                    <option value="CMA">CMA - College of Management and Accountancy</option>
                    <option value="CRIM">CRIM - Criminology</option>
                    <option value="CEA">CEA - College of Engineering and Architecture</option>
                  </select>
                </div>
              )}

              {formData.role === 'seller' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                      Business Type *
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={viewState.isLoading}
                    >
                      <option value="">Select business type</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Clothing & Apparel">Clothing & Apparel</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Services">Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                      Business Address *
                    </label>
                    <textarea
                      id="businessAddress"
                      name="businessAddress"
                      rows="3"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'admin' && (
                <div>
                  <label htmlFor="credentialType" className="block text-sm font-medium text-gray-700">
                    Teaching Credential Type *
                  </label>
                  <select
                    id="credentialType"
                    name="credentialType"
                    value={formData.credentialType}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={viewState.isLoading}
                  >
                    <option value="">Select credential type</option>
                    <option value="TCP">TCP - Teacher Certificate Program</option>
                    <option value="LPT">LPT - Licensed Professional Teacher</option>
                  </select>
                </div>
              )}
            </div>

            {/* Document Upload */}
            {requirements && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{requirements.title}</h3>
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="ml-3 text-sm text-blue-700">
                      <p className="font-medium">Upload Requirements:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Accepted formats: JPEG, PNG, PDF</li>
                        <li>Maximum file size: 10MB</li>
                        <li>Ensure documents are clear and readable</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {requirements.items.map((item, index) => {
                    const documentKey = formData.role === 'student' ? 'studentId' 
                      : formData.role === 'seller' ? (index === 0 ? 'birCertificate' : 'businessPermit')
                      : 'teachingCredential'
                    
                    return (
                      <div key={documentKey}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {item.label} {item.required && '*'}
                        </label>
                        <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                        
                        <div className="flex items-center space-x-4">
                          <label className={`flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                            documents[documentKey] ? 'bg-green-50 border-green-300' : ''
                          }`}>
                            <Upload className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">
                              {documents[documentKey] ? 'Change File' : 'Choose File'}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileUpload(e, documentKey)}
                              disabled={viewState.isLoading}
                            />
                          </label>
                          
                          {documents[documentKey] && (
                            <div className="flex items-center text-sm text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>{documents[documentKey].name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Account Approval Process
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>After registration and email verification:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Your documents will be reviewed by administrators</li>
                      <li>You'll receive an email notification about approval status</li>
                      <li>Approved accounts can access all CampusCoin features</li>
                      <li>Processing time: 1-3 business days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={viewState.isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {viewState.isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
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