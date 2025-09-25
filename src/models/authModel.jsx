// Handles data and API communication
class AuthModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/auth'
  }

  // Basic headers (no Bearer token)
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Register user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message || 'Registration successful'
        }
      } else {
        console.error('Backend error response for register:', data);
        return {
          success: false,
          data: null,
          error: data.message || 'Registration failed'
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        data: null,
        error: 'Network error. Please try again.'
      }
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: {
            token: data.token,
            message: data.message,
            user: this.extractUserFromToken(data.token) || null
          }
        }
      } else {
        console.error('Backend error response for login:', data);
        return {
          success: false,
          data: null,
          error: data.message || 'Login failed'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        data: null,
        error: 'Network error. Please try again.'
      }
    }
  }

  extractUserFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.id,
        role: payload.role,
      }
    } catch (error) {
      console.error('Token decode error:', error)
      return null
    }
  }

  // Verify email
  async verifyEmail(verificationData) {
    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(verificationData)
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message || 'Email verified successfully'
        }
      } else {
        console.error('Backend error response for verifyEmail:', data);
        return {
          success: false,
          data: null,
          error: data.message || 'Verification failed'
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      return {
        success: false,
        data: null,
        error: 'Network error. Please try again.'
      }
    }
  }

  // Resend verification code
  async resendVerificationCode(email) {
    try {
      const response = await fetch(`${this.baseURL}/resend`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message || 'Verification code sent'
        }
      } else {
        console.error('Backend error response for resendVerificationCode:', data);
        return {
          success: false,
          data: null,
          error: data.message || 'Failed to resend code'
        }
      }
    } catch (error) {
      console.error('Resend error:', error)
      return {
        success: false,
        data: null,
        error: 'Network error. Please try again.'
      }
    }
  }

  // Logout user
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: this.getHeaders(true) 
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Logout successful'
        };
      } else {
        console.error('Backend error response for logout:', data);
        return {
          success: false,
          error: data.message || 'Logout failed'
        };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // User data management (optional, still kept)
  saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  removeUserData() {
    localStorage.removeItem('userData');
  }

  saveToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }
}

export default new AuthModel();
