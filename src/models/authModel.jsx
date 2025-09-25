// models/authModel.js
const API_URL = 'http://localhost:5000/api/auth';

class AuthModel {
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result.data || null,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result.token ? { token: result.token } : null,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
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
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
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
      return { success: false, error: 'Network error' };
    }
  }

  async profile() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
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
      return { success: false, error: 'Network error' };
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
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
      return { success: false, error: 'Network error' };
    }
  }

  saveToken(token) {
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }

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
}

export default AuthModel;