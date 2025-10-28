import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  MailIcon, 
  Upload, 
  FileText, 
  Image, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import AuthController from '../../controllers/authController'

import WebLogo from '../../assets/images/Web logo.png'

const Register = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const passwordRef = useRef(null) 

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
    student_id: ['', '', '', '', '', '', '', '', '', '', '', ''], // 12 digits for XX-XXXX-XXXXXX
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

    // Prevent numbers in name fields
    const nameFieldsNoNumbers = ['first_name', 'last_name', 'middle_name', 'suffix']
    let newValue = value
    if (nameFieldsNoNumbers.includes(name)) {
      // Strip any numeric characters (typing or paste)
      newValue = String(value).replace(/[0-9]/g, '')
    }

    // Prevent spaces in password fields
    if (name === 'password' || name === 'confirmPassword') {
      newValue = String(newValue).replace(/\s+/g, '')
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null)
    }
  }

  // Prevent space characters from being typed into password fields
  const handlePasswordKeyDown = (e) => {
    if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
      e.preventDefault()
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
      const idStr = formData.student_id.join('');
      if (!idStr || !/^[0-9]{12}$/.test(idStr)) {
        setMessage({ type: 'error', text: 'Please enter a valid 12-digit Student ID number' })
        return false;
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
          // For student_id, send as 'XX-XXXX-XXXXXX' if role is student
          if (key === 'student_id' && formData.role === 'student') {
            const arr = formData.student_id;
            const id = `${arr.slice(0,2).join('')}-${arr.slice(2,6).join('')}-${arr.slice(6,12).join('')}`;
            formDataToSend.append('student_id', id);
          } else {
            formDataToSend.append(key, formData[key])
          }
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
        setMessage({ type: 'success', text: result.message || 'Registration successful! Please verify your email.' })
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
      const start = Date.now()
      const result = await AuthController.verifyEmail(formData.email, verificationCode)

      const elapsed = Date.now() - start
      if (elapsed < 2000) {
        await new Promise((resolve) => setTimeout(resolve, 2000 - elapsed))
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email verified successfully! Redirecting to login...' })
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

  const getMessageDisplay = (type) => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          textColor: 'text-rose-800',
          title: 'Registration Error'
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-800',
          title: 'Success'
        }
      default:
        return {}
    }
  }

  // Adjusted button disabled logic to be purely functional, not cosmetic
  const isRegisterButtonDisabled = viewState.isLoading || (formData.role === 'student' && (!formData.course || formData.student_id.join('').length !== 12 || !documents.studentId)) ||
  (formData.role === 'seller' && (!formData.businessName || !formData.businessType || !formData.businessAddress || !documents.birCertificate || !documents.businessPermit)) ||
  (formData.role === 'admin' && (!formData.credentialType || !documents.teachingCredential)) ||
  !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword || (formData.password !== formData.confirmPassword);
  
  return (
    <div className="relative bg-gray-50 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 opacity-70" aria-hidden>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(134,239,172,0.25),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.25),_transparent_50%)]" />
      </div>
      <div className="w-full max-w-2xl space-y-10">
        
        {/* Header (aligned with Login's custom logo and title style) */}
        <div>
          <div className="flex justify-center">
            <img
              src={WebLogo}
              alt="CampusCoin Logo"
              className="h-20 w-20 rounded-[2.5rem] shadow-lg shadow-emerald-200/60 object-cover"
            />
          </div>
          <h2 className="mt-6 text-center text-4xl font-semibold text-[#59B44D]">
            CampusCoin
          </h2>
          <p className="mt-3 text-center text-sm font-medium uppercase tracking-[0.4em] text-[#203214]">
            {showVerification ? 'Verify Your Email' : 'Create Your Account'}
          </p>
          <p className="mt-3 text-center text-sm text-[#72A754]">
            {showVerification
              ? 'Enter the verification code sent to your email'
              : 'University Attendance & Events Reward System'
            }
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`cc-card rounded-md p-4 ${getMessageDisplay(message.type).bgColor} ${getMessageDisplay(message.type).borderColor} border`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {getMessageDisplay(message.type).icon}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${getMessageDisplay(message.type).textColor}`}>
                  {getMessageDisplay(message.type).title}
                </h3>
                <div className={`mt-2 text-sm ${getMessageDisplay(message.type).textColor}`}>
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVerification ? (
          // ================= Verification Form (Theme Aligned) =================
          <div className="cc-card space-y-6 p-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MailIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-emerald-800">Check your email!</h3>
                  <div className="mt-2 text-sm text-emerald-700">
                    <p>We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>
                    <p className="mt-2">After verification, your account will be pending admin approval.</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label htmlFor="verification-code" className="mb-1 block text-sm font-semibold text-emerald-800">
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  name="verificationCode"
                  type="text"
                  maxLength="6"
                  required
                  className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-center tracking-widest"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  disabled={isVerifying}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="group relative flex w-full justify-center rounded-xl border border-transparent bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-300/50 transition hover:bg-emerald-700 hover:shadow-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifying ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-emerald-800">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                  >
                    {isResending ? 'Resending...' : 'Resend'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : (
          // ================= Registration Form (Theme Aligned) =================
          <form className="cc-card mt-8 space-y-6 p-8" onSubmit={handleRegister}>
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="mb-1 block text-sm font-semibold text-emerald-800">
                      First Name *
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="mb-1 block text-sm font-semibold text-emerald-800">
                      Last Name *
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                </div>
                
                {/* Middle Name and Suffix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="middle_name" className="mb-1 block text-sm font-semibold text-emerald-800">
                      Middle Name
                    </label>
                    <input
                      id="middle_name"
                      name="middle_name"
                      type="text"
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="suffix" className="mb-1 block text-sm font-semibold text-emerald-800">
                      Suffix
                    </label>
                    <input
                      id="suffix"
                      name="suffix"
                      type="text"
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <div className="space-y-4 pt-4 border-t border-dashed border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">Account Credentials</h3>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-semibold text-emerald-800">
                    Email address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Enter university email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={viewState.isLoading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-semibold text-emerald-800">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={viewState.showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 pr-10 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyDown={handlePasswordKeyDown}
                      ref={passwordRef}
                      disabled={viewState.isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-300 transition hover:text-emerald-500"
                      onClick={() => togglePasswordVisibility('showPassword')}
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold text-emerald-800">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={viewState.showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 pr-10 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onKeyDown={handlePasswordKeyDown}
                      disabled={viewState.isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-300 transition hover:text-emerald-500"
                      onClick={() => togglePasswordVisibility('showConfirmPassword')}
                      disabled={viewState.isLoading}
                    >
                      {viewState.showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-2 text-xs text-rose-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4 pt-4 border-t border-dashed border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">I am registering as:</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Student Role */}
                <label 
                  className={`group relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${
                    formData.role === 'student' ? 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/70' : 'border-emerald-200 bg-white/90 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleInputChange}
                    disabled={viewState.isLoading}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-emerald-900">Student</span>
                      <span className="mt-1 flex items-center text-xs text-emerald-600">Earn coins for attendance &amp; events</span>
                    </span>
                  </span>
                  <CheckCircle className={`h-5 w-5 ${formData.role === 'student' ? 'text-emerald-600' : 'text-emerald-200'}`} />
                </label>
                
                {/* Seller Role */}
                <label 
                  className={`group relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${
                    formData.role === 'seller' ? 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/70' : 'border-emerald-200 bg-white/90 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={handleInputChange}
                    disabled={viewState.isLoading}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-emerald-900">Seller</span>
                      <span className="mt-1 flex items-center text-xs text-emerald-600">Exchange coins for goods &amp; services</span>
                    </span>
                  </span>
                  <CheckCircle className={`h-5 w-5 ${formData.role === 'seller' ? 'text-emerald-600' : 'text-emerald-200'}`} />
                </label>
                
                {/* Admin Role */}
                <label 
                  className={`group relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${
                    formData.role === 'admin' ? 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/70' : 'border-emerald-200 bg-white/90 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleInputChange}
                    disabled={viewState.isLoading}
                    className="sr-only"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-emerald-900">Admin</span>
                      <span className="mt-1 flex items-center text-xs text-emerald-600">Manage attendance &amp; events</span>
                    </span>
                  </span>
                  <CheckCircle className={`h-5 w-5 ${formData.role === 'admin' ? 'text-emerald-600' : 'text-emerald-200'}`} />
                </label>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {formData.role === 'student' && (
              <div className="space-y-4 pt-4 border-t border-dashed border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">Student Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Dropdown (Assuming a static list for this example) */}
                  <div>
                    <label htmlFor="course" className="mb-1 block text-sm font-semibold text-emerald-800">
                      Course *
                    </label>
                    <select
                      id="course"
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="" disabled>Select your course</option>
                      <option value="BSCS">BS Computer Science</option>
                      <option value="BSIT">BS Information Technology</option>
                      <option value="BSBA">BS Business Administration</option>
                      <option value="BSED">BS Education</option>
                      <option value="BSA">BS Accountancy</option>
                    </select>
                  </div>
                  
                  {/* Student ID */}
                  <div>
                    <label htmlFor="student_id" className="mb-1 block text-sm font-semibold text-emerald-800">
                      Student ID (Format: XX-XXXX-XXXXXX) *
                    </label>
                    <div className="flex space-x-1">
                      {/* XX */}
                      <input
                        type="text"
                        maxLength="2"
                        pattern="\d*"
                        inputMode="numeric"
                        className="w-1/6 text-center rounded-xl border border-emerald-200 bg-white/90 px-2 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        value={formData.student_id[0] + formData.student_id[1]}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                          const newId = [...formData.student_id];
                          for (let i = 0; i < 2; i++) newId[i] = value[i] || '';
                          setFormData(prev => ({ ...prev, student_id: newId }));
                        }}
                        disabled={viewState.isLoading}
                      />
                      <span className="flex items-center text-emerald-800">-</span>
                      {/* XXXX */}
                      <input
                        type="text"
                        maxLength="4"
                        pattern="\d*"
                        inputMode="numeric"
                        className="w-2/6 text-center rounded-xl border border-emerald-200 bg-white/90 px-2 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        value={formData.student_id.slice(2, 6).join('')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                          const newId = [...formData.student_id];
                          for (let i = 0; i < 4; i++) newId[i + 2] = value[i] || '';
                          setFormData(prev => ({ ...prev, student_id: newId }));
                        }}
                        disabled={viewState.isLoading}
                      />
                      <span className="flex items-center text-emerald-800">-</span>
                      {/* XXXXXX */}
                      <input
                        type="text"
                        maxLength="6"
                        pattern="\d*"
                        inputMode="numeric"
                        className="w-3/6 text-center rounded-xl border border-emerald-200 bg-white/90 px-2 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        value={formData.student_id.slice(6, 12).join('')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                          const newId = [...formData.student_id];
                          for (let i = 0; i < 6; i++) newId[i + 6] = value[i] || '';
                          setFormData(prev => ({ ...prev, student_id: newId }));
                        }}
                        disabled={viewState.isLoading}
                      />
                    </div>
                    {formData.student_id.join('').length > 0 && formData.student_id.join('').length !== 12 && (
                       <p className="mt-2 text-xs text-rose-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Student ID must be 12 digits.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'seller' && (
              <div className="space-y-4 pt-4 border-t border-dashed border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">Seller/Business Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="mb-1 block text-sm font-semibold text-emerald-800">
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={viewState.isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="businessType" className="mb-1 block text-sm font-semibold text-emerald-800">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        required
                        value={formData.businessType}
                        onChange={handleInputChange}
                        disabled={viewState.isLoading}
                        className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        <option value="" disabled>Select type</option>
                        <option value="Food/Beverage">Food/Beverage</option>
                        <option value="Merchandise">Merchandise</option>
                        <option value="Service">Service</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="businessAddress" className="mb-1 block text-sm font-semibold text-emerald-800">
                        Business Address *
                      </label>
                      <input
                        id="businessAddress"
                        name="businessAddress"
                        type="text"
                        required
                        className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        disabled={viewState.isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {formData.role === 'admin' && (
              <div className="space-y-4 pt-4 border-t border-dashed border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">Admin Details</h3>
                <div>
                  <label htmlFor="credentialType" className="mb-1 block text-sm font-semibold text-emerald-800">
                    Teaching Credential Type *
                  </label>
                  <select
                    id="credentialType"
                    name="credentialType"
                    required
                    value={formData.credentialType}
                    onChange={handleInputChange}
                    disabled={viewState.isLoading}
                    className="block w-full rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="" disabled>Select credential type</option>
                    <option value="LPT">Licensed Professional Teacher (LPT)</option>
                    <option value="TCP">Teacher Certificate Program (TCP)</option>
                    <option value="PRC_ID">PRC ID Holder</option>
                  </select>
                </div>
              </div>
            )}

            {/* Document Uploads */}
            {requirements && (
              <div className="space-y-4 pt-4 border-t border-dashed border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-900 border-b border-emerald-100 pb-2">{requirements.title}</h3>
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5 text-emerald-500 flex-shrink-0" />
                  Please upload clear, valid copies of the required documents. Accepted formats: JPG, PNG, PDF (Max 10MB).
                </p>

                <div className="space-y-3">
                  {requirements.items.map((item, index) => {
                    const documentKey = 
                      item.label === 'Student ID' ? 'studentId' :
                      item.label === 'BIR Certificate' ? 'birCertificate' :
                      item.label === 'Business Permit' ? 'businessPermit' :
                      item.label === 'Teaching Credential' ? 'teachingCredential' : null;

                    const file = documents[documentKey];
                    const isUploaded = !!file;

                    return (
                      <div key={index} className="flex flex-col">
                        <label className="mb-1 block text-sm font-semibold text-emerald-800">
                          {item.label} {item.required && '*'}
                        </label>
                        <div className="flex items-center space-x-3">
                          <label 
                            htmlFor={`file-upload-${documentKey}`}
                            className="cursor-pointer rounded-xl border border-emerald-300 bg-white/90 px-4 py-3 text-sm font-medium text-emerald-600 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 flex-grow flex items-center justify-center h-14"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            <span>{isUploaded ? 'Change File' : 'Upload File'}</span>
                            <input
                              id={`file-upload-${documentKey}`}
                              name={documentKey}
                              type="file"
                              accept=".jpg, .jpeg, .png, .pdf"
                              className="sr-only"
                              onChange={(e) => handleFileUpload(e, documentKey)}
                              disabled={viewState.isLoading}
                            />
                          </label>
                          <div className={`text-sm h-14 flex items-center px-4 rounded-xl border ${isUploaded ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                            {isUploaded ? (
                              <span className="flex items-center">
                                {file.type.includes('image') ? <Image className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                                {file.name}
                                <CheckCircle className="h-4 w-4 ml-3 text-emerald-500" />
                              </span>
                            ) : (
                              <span className="text-sm text-emerald-500 italic">No file selected</span>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-emerald-600/80 ml-1">{item.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className='pt-6 border-t border-dashed border-emerald-200'>
              <button
                type="submit"
                disabled={isRegisterButtonDisabled}
                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-emerald-300/50 transition hover:bg-emerald-700 hover:shadow-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {viewState.isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
            
            {/* Login Link*/}
            <div className="text-center mt-6">
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