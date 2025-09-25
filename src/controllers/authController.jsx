//Handles business logic and coordinates between Model and View
import AuthModel from '../models/authModel'

class AuthController {
  constructor() {
    this.model = AuthModel
    this.observers = []
  }

  // Observer pattern for state management
  subscribe(observer) {
    this.observers.push(observer)
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer)
  }

  notify(data) {
    this.observers.forEach(observer => observer(data))
  }

  // Register user
  async register(userData) {
    try {
      // Validate input
      const validationError = this.validateRegistrationData(userData)
      if (validationError) {
        return {
          success: false,
          error: validationError
        }
      }

      // Call model
      const result = await this.model.register(userData)
      
      // Notify observers
      this.notify({
        type: 'REGISTER_ATTEMPT',
        success: result.success,
        error: result.error
      })
      
      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: 'An unexpected error occurred'
      }
      
      this.notify({
        type: 'REGISTER_ATTEMPT',
        success: false,
        error: errorResult.error
      })

      return errorResult
    }
  }

  // Login user
  async login(credentials) {
    try {
      // Validate input
      const validationError = this.validateLoginData(credentials)
      if (validationError) {
        return {
          success: false,
          error: validationError
        }
      }

      // Call model
      const result = await this.model.login(credentials)
      
      if (result.success) {
        // Save token
        if (result.data.token) {
          this.model.saveToken(result.data.token)
        }

        let userData = result.data.user

        // If user data is not in login response, fetch it separately
        if (!userData && result.data.token) {
          const profileResult = await this.model.getUserProfile()
          if (profileResult.success) {
            userData = profileResult.data
          }
        }

        // Save user data
        if (userData) {
          this.model.saveUserData(userData)
        }

        // Notify observers
        this.notify({
          type: 'LOGIN_SUCCESS',
          user: userData,
          token: result.data.token
        })

        return {
          success: true,
          user: userData,
          token: result.data.token
        }
      } else {
        this.notify({
          type: 'LOGIN_FAILURE',
          error: result.error
        })
        
        return result
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: 'An unexpected error occurred'
      }
      
      this.notify({
        type: 'LOGIN_FAILURE',
        error: errorResult.error
      })

      return errorResult
    }
  }

  // Verify email
  async verifyEmail(email, code) {
    try {
      // Validate input
      if (!email || !code) {
        return {
          success: false,
          error: 'Email and verification code are required'
        }
      }

      if (code.length !== 6 || !/^\d+$/.test(code)) {
        return {
          success: false,
          error: 'Verification code must be 6 digits'
        }
      }

      // Call model
      const result = await this.model.verifyEmail({ email, code })
      
      // Notify observers
      this.notify({
        type: 'EMAIL_VERIFICATION',
        success: result.success,
        error: result.error
      })

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: 'An unexpected error occurred'
      }
      
      this.notify({
        type: 'EMAIL_VERIFICATION',
        success: false,
        error: errorResult.error
      })

      return errorResult
    }
  }

  // Resend verification code
  async resendVerificationCode(email) {
    try {
      // Validate input
      if (!email) {
        return {
          success: false,
          error: 'Email is required'
        }
      }

      // Call model
      const result = await this.model.resendVerificationCode(email)
      
      // Notify observers
      this.notify({
        type: 'RESEND_CODE',
        success: result.success,
        error: result.error
      })

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: 'An unexpected error occurred'
      }
      
      this.notify({
        type: 'RESEND_CODE',
        success: false,
        error: errorResult.error
      })

      return errorResult
    }
  }

  // Logout user
  logout() {
    try {
      // Clear stored data
      this.model.removeToken()
      this.model.removeUserData()

      // Notify observers
      this.notify({
        type: 'LOGOUT'
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'Logout failed'
      }
    }
  }

  // Get current user
  getCurrentUser() {
    return this.model.getUserData()
  }

  // Get current token
  getCurrentToken() {
    return this.model.getToken()
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.model.getToken()
    const user = this.model.getUserData()
    return !!(token && user)
  }

  // Get user role for routing
  getUserRole() {
    const user = this.model.getUserData()
    return user ? user.role : null
  }

  // Validation methods
  validateRegistrationData(data) {
    const { first_name, last_name, email, password, role } = data

    if (!first_name || first_name.trim().length < 2) {
      return 'First name must be at least 2 characters'
    }

    if (!last_name || last_name.trim().length < 2) {
      return 'Last name must be at least 2 characters'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return 'Password must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
    }
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters'
    }

    if (!role || !['student', 'admin', 'seller'].includes(role)) {
      return 'Please select a valid role'
    }

    return null
  }

  validateLoginData(data) {
    const { email, password } = data

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }

    if (!password) {
      return 'Password is required'
    }

    return null
  }

  // Route determination based on role
  getRouteForRole(role) {
    const routes = {
      admin: '/admin',
      seller: '/seller',
      student: '/student'
    }
    return routes[role] || '/student'
  }
}

export default new AuthController()