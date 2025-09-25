// authController.jsx
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
      const success = result.success !== undefined ? result.success : result.status === true;

      if (success) {
        const token = result.data?.token || result.token;
        let userData = result.data?.user || result.user;

        if (token) {
          this.model.saveToken(token);
        } else {
          return { success: false, error: 'No token received from server' };
        }

        if (!userData) {
          const profileResult = await this.fetchUserProfile();
          if (profileResult.success) {
            userData = profileResult.user || profileResult.data;
            if (userData) {
              this.model.saveUserData(userData); // This now works with AuthModel
            }
          } else {
            return { success: false, error: profileResult.error || 'Failed to fetch user profile' };
          }
        } else {
          this.model.saveUserData(userData);
        }

        return { success: true, user: userData, token };
      } else {
        return { success: false, error: result.error || result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
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
      console.error('Error fetching profile:', error);
      return { success: false, error: 'An unexpected error occurred during profile fetch' };
    }
  }

  async register(userData) {
    try {
      const result = await this.model.register(userData);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration.' };
    }
  }

  async verifyEmail(email, code) {
    try {
      const result = await this.model.verifyEmail({ email, code });
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'An unexpected error occurred during email verification.' };
    }
  }

  async resendVerificationCode(email) {
    try {
      const result = await this.model.resendVerificationCode(email);
      return result;
    } catch (error) {
      console.error('Resend verification code error:', error);
      return { success: false, error: 'An unexpected error occurred while resending verification code.' };
    }
  }
  async logout() {
  try {
    const result = this.model.logout()
    return result
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "Logout failed" }
  }
}

  validateLoginData(data) {
    const { email, password } = data;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (!password) {
      return 'Password is required';
    }
    return null;
  }

  getCurrentUser() {
    return this.model.getUserData();
  }

  isAuthenticated() {
    const token = this.model.getToken();
    const user = this.model.getUserData();
    return !!(token && user);
  }

  getUserRole() {
    const user = this.model.getUserData();
    return user ? user.role : null;
  }

  getRouteForRole(role) {
    const routes = {
      admin: '/admin',
      seller: '/seller',
      student: '/student',
    };
    return routes[role] || '/student';
  }
}

export default new AuthController();