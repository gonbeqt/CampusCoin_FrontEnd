class UserModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/users';
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseURL}/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch user data' };
    }
  }
}

export default UserModel;
