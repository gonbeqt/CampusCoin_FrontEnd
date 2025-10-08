// models/authModel.js - 
const API_URL = 'http://localhost:5000/api/auth';

class AuthModel {
  // Register with document upload support
  async register(userData) {
    try {
      let response;
      
      // Check if userData is FormData (contains files) or regular object
      if (userData instanceof FormData) {
        response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          body: userData,
        });
      } else {
        // For regular JSON data (backwards compatibility)
        response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      }
      
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result.data || null,
      };
    } catch (error) {
      console.error('Registration network error:', error);
      return { success: false, error: 'Network error occurred during registration' };
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      
      let result = {};
      try {
        result = await response.json();
      } catch (jsonErr) {
        result = {};
      }
      
      const finalResult = {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result,
        token: result.token,
        user: result.user,
        requireVerification: !!result.requiresVerification,
        accountStatus: result.accountStatus,
        ...result
      };
      
      return finalResult;
    } catch (error) {
      return { success: false, error: 'Network error occurred during login' };
    }
  }

  async verifyEmail({ email, code }) {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result
      };
    } catch (error) {
      console.error('Email verification network error:', error);
      return { success: false, error: 'Network error occurred during email verification' };
    }
  }

  async resendVerificationCode(email) {
    try {
      const response = await fetch(`${API_URL}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Resend verification network error:', error);
      return { success: false, error: 'Network error occurred while resending verification code' };
    }
  }

  async profile() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: response.ok ? result : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Profile fetch network error:', error);
      return { success: false, error: 'Network error occurred while fetching profile' };
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      if (!token) {
        // Still return success if no token (user already logged out)
        return { success: true, message: 'Already logged out' };
      }
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Logout network error:', error);
      // Still return success on network error for logout
      return { success: true, error: 'Network error, but local logout completed' };
    }
  }

  // Password reset methods
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Password reset request network error:', error);
      return { success: false, error: 'Network error occurred during password reset request' };
    }
  }

  async verifyResetCode(email, code) {
    try {
      const response = await fetch(`${API_URL}/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Reset code verification network error:', error);
      return { success: false, error: 'Network error occurred during reset code verification' };
    }
  }

  async resetForgotPassword(email, code, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_URL}/reset-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword,
          confirmPassword
        }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Password reset network error:', error);
      return { success: false, error: 'Network error occurred during password reset' };
    }
  }

  async resetPassword(currentPassword, newPassword, confirmNewPassword) {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword
        }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('Password reset network error:', error);
      return { success: false, error: 'Network error occurred during password reset' };
    }
  }

  // Super admin creation
  async createSuperAdmin(adminData) {
    try {
      const response = await fetch(`${API_URL}/create-super-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result.superAdmin || null,
      };
    } catch (error) {
      console.error('Super admin creation network error:', error);
      return { success: false, error: 'Network error occurred during super admin creation' };
    }
  }

  async fetchBalanceStats() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      const response = await fetch(`${API_URL}/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      return {
        success: response.ok,
        data: response.ok ? result : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      console.error('[AuthModel] Balance stats fetch network error:', error);
      return { success: false, error: 'Network error occurred while fetching balance stats' };
    }
  }

  // Token management
  saveToken(token) {
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }

  // User data management
  saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  getUserData() {
    const userData = localStorage.getItem('userData');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  removeUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('balanceStats'); 
    localStorage.removeItem('adminRole');
    localStorage.removeItem('admin_device_id');
    localStorage.removeItem('notificationUpdate');
    localStorage.removeItem('transactionHistory');
    localStorage.removeItem('walletData');
  }

  // Clear all auth data
  clearAuthData() {
    this.removeToken();
    this.removeUserData();

  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }

  // Get user role
  getUserRole() {
    const userData = this.getUserData();
    return userData ? userData.role : null;
  }

  // Check account status
  getAccountStatus() {
    const userData = this.getUserData();
    return userData ? userData.accountStatus : null;
  }

  // Check if account is approved
  isAccountApproved() {
    const userData = this.getUserData();
    if (!userData) return false;
    
    // Super admin doesn't need approval
    if (userData.role === 'superadmin') return true;
    
    return userData.accountStatus === 'approved';
  }
}

export default AuthModel;