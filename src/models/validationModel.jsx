// models/validationModel.js
const API_URL = 'http://localhost:5000/api/validation'; 

class ValidationModel {
  async getPendingValidations(token) {
    try {
      const response = await fetch(`${API_URL}/pending`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while fetching pending validations.' };
    }
  }

  async getValidationDetails(userId, token) {
    try {
      const response = await fetch(`${API_URL}/details/${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while fetching validation details.' };
    }
  }

  async approveUser(userId, token) {
    try {
      const response = await fetch(`${API_URL}/approve/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while approving user.' };
    }
  }

  async rejectUser(userId, reason, token) {
    try {
      const response = await fetch(`${API_URL}/reject/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while rejecting user.' };
    }
  }

  async suspendUser(userId, reason, token) {
    try {
      const response = await fetch(`${API_URL}/suspend/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while suspending user.' };
    }
  }

  async reactivateUser(userId, token) {
    try {
      const response = await fetch(`${API_URL}/reactivate/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while reactivating user.' };
    }
  }

  async getDocument(documentId, token) {
    try {
      const response = await fetch(`${API_URL}/document/${documentId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        return { success: false, error: err.message || 'Failed to fetch document' };
      }

      // Return as blob (PDF/Image)
      const blob = await response.blob();
      return { success: true, blob };
    } catch (error) {
      return { success: false, error: 'Network error while fetching document.' };
    }
  }

  async getValidationStats(token) {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while fetching stats.' };
    }
  }

  async getAllUsersForSuperAdmin({ page = 1, limit = 10, role, status, token }) {
    try {
      const params = new URLSearchParams({ page, limit });
      if (role) params.append('role', role);
      if (status) params.append('status', status);

      const response = await fetch(`${API_URL}/users?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      return { success: response.ok, ...result };
    } catch (error) {
      return { success: false, error: 'Network error while fetching users.' };
    }
  }
}

export default ValidationModel;
