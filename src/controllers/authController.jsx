// controllers/authController
import AuthModel from '../models/authModel';

class AuthController {
  constructor() {
    this.model = new AuthModel();
  }

  async login(credentials) {
    try {
      const validationError = this.validateLoginData(credentials);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const result = await this.model.login(credentials);

      if (result.success) {
        const token = result.token;
        let userData = result.user;

        if (token) {
          this.model.saveToken(token);
        } else {
          return { success: false, error: 'No token received from server' };
        }

        if (!userData) {
          const profileResult = await this.fetchUserProfile();
          if (profileResult.success) {
            userData = profileResult.user || profileResult.data;
          } else {
            return { success: false, error: profileResult.error || 'Failed to fetch user profile' };
          }
        }

        if (userData) {
          this.model.saveUserData(userData);
        }

        return { success: true, user: userData, token };
      } else {
        // Handle different error types
        const errorResponse = {
          success: false,
          error: result.error || result.message || 'Login failed'
        };

        // Include additional data for UI handling
        if (result.accountStatus) {
          errorResponse.data = {
            accountStatus: result.accountStatus,
            requiresVerification: result.requireVerification
          };
        }

        if (result.requireVerification) {
          errorResponse.data = {
            ...errorResponse.data,
            requiresVerification: true
          };
        }

        return errorResponse;
      }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  }

  async fetchUserProfile() {
    try {
      const result = await this.model.profile();
      if (result.success) {
        this.model.saveUserData(result.data);
        return { success: true, user: result.data };
      } else {
        return { success: false, error: result.error || 'Failed to fetch profile' };
      }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during profile fetch' };
    }
  }

  async register(userData) {
    try {
      const result = await this.model.register(userData);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during registration.' };
    }
  }

  async verifyEmail(email, code) {
    try {
      const result = await this.model.verifyEmail({ email, code });
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during email verification.' };
    }
  }

  async resendVerificationCode(email) {
    try {
      const result = await this.model.resendVerificationCode(email);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred while resending verification code.' };
    }
  }

  async logout() {
    try {
      // Call backend logout
      const result = await this.model.logout();
      result.success = true; 
      // Clear local data regardless of backend response
      this.model.clearAuthData();
      this.model.clearBalanceStats(); // Clear balance stats on logout
      
      
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Still clear local data on error
      this.model.clearAuthData();
      
      return { success: true, message: 'Logged out (with errors)' };
    }
  }

  // Password reset methods
  async requestPasswordReset(email) {
    try {
      const result = await this.model.requestPasswordReset(email);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during password reset request.' };
    }
  }

  async verifyResetCode(email, code) {
    try {
      const result = await this.model.verifyResetCode(email, code);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during reset code verification.' };
    }
  }

  async resetForgotPassword(email, code, newPassword, confirmPassword) {
    try {
      const result = await this.model.resetForgotPassword(email, code, newPassword, confirmPassword);
      return result;
    } catch (error) {
      console.error('[AuthController] Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred during password reset.' };
    }
  }

  async resetPassword(currentPassword, newPassword, confirmNewPassword) {
    try {
      const result = await this.model.resetPassword(currentPassword, newPassword, confirmNewPassword);
      
      // If password reset is successful, logout user
      if (result.success) {
        this.model.clearAuthData();
      }
      
      return result;
    } catch (error) {
      console.error('[AuthController] Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred during password reset.' };
    }
  }

  // Super admin creation
  async createSuperAdmin(adminData) {
    try {
      const result = await this.model.createSuperAdmin(adminData);
      return result;
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred during super admin creation.' };
    }
  }

  // Validation methods
  validateLoginData(data) {
    const { email, password } = data;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 3) {
      return 'Password must be at least 3 characters long';
    }
    return null;
  }

  validateRegistrationData(data) {
    const { first_name, last_name, email, password, role } = data;
    
    if (!first_name || !first_name.trim()) {
      return 'First name is required';
    }
    if (!last_name || !last_name.trim()) {
      return 'Last name is required';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!role || !['student', 'seller', 'admin'].includes(role)) {
      return 'Please select a valid account type';
    }
    
    // Role-specific validation
    if (role === 'student' && !data.course) {
      return 'Course is required for students';
    }
    
    if (role === 'seller') {
      if (!data.businessName || !data.businessType || !data.businessAddress) {
        return 'Business information is required for sellers';
      }
    }
    
    if (role === 'admin' && !data.credentialType) {
      return 'Teaching credential type is required for admins';
    }
    
    return null;
  }

  // User state methods
  getCurrentUser() {
    return this.model.getUserData();
  }

  isAuthenticated() {
    return this.model.isAuthenticated();
  }

  getUserRole() {
    return this.model.getUserRole();
  }

  getAccountStatus() {
    return this.model.getAccountStatus();
  }

  isAccountApproved() {
    return this.model.isAccountApproved();
  }

  // Check if user has specific role
  hasRole(requiredRole) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  }

  // Check if user is super admin
  isSuperAdmin() {
    return this.getUserRole() === 'superadmin';
  }

  // Route determination based on role and account status
  getRouteForRole(role) {
    const routes = {
      superadmin: '/superadmin',
      admin: '/admin',
      seller: '/seller',
      student: '/student',
    };
    return routes[role] || '/student/dashboard';
  }

  // Get appropriate dashboard route for current user
  getDashboardRoute() {
    const user = this.getCurrentUser();
    if (!user) return '/login';
    
    // Check if account needs approval (except super admin)
    if (user.role !== 'superadmin' && !this.isAccountApproved()) {
      return '/account-pending';
    }
    
    return this.getRouteForRole(user.role);
  }

  // Account status helpers
  getAccountStatusInfo() {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return {
      status: user.accountStatus,
      role: user.role,
      isApproved: this.isAccountApproved(),
      isPending: user.accountStatus === 'pending',
      isRejected: user.accountStatus === 'rejected',
      isSuspended: user.accountStatus === 'suspended'
    };
  }

  // Check if user can access protected routes
  canAccessProtectedRoutes() {
    if (!this.isAuthenticated()) return false;
    
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Super admin can always access
    if (user.role === 'superadmin') return true;
    
    // Other roles need approved status
    return this.isAccountApproved();
  }

  // Get user's full name
  getUserFullName() {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    let fullName = user.first_name;
    if (user.middle_name) {
      fullName += ` ${user.middle_name}`;
    }
    fullName += ` ${user.last_name}`;
    if (user.suffix) {
      fullName += ` ${user.suffix}`;
    }
    
    return fullName;
  }

    async fetchBalanceStats() {
    try {
      const result = await this.model.fetchBalanceStats();
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error || 'Failed to fetch balance stats' };
      }
    } catch (error) {
      console.error('[AuthController] Balance stats fetch error:', error);
      return { success: false, error: 'An unexpected error occurred while fetching balance stats.' };
    }
  }
}

export default new AuthController();