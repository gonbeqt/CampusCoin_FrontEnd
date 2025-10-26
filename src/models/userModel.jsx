
class UserModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/users';
  }

  async fetchUsers(page = 1, limit = 10, search = '', course = '') {
    try {
      const url = new URL(this.baseURL);
      url.searchParams.set('page', page);
      url.searchParams.set('limit', limit);
      url.searchParams.set('role', 'student');
      if (search && search.trim() !== '') {
        url.searchParams.set('search', search.trim());
      }
      if (course && course.trim() !== '') {
        url.searchParams.set('course', course.trim());
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      let users, totalPages, totalUsers;
      if (Array.isArray(data)) {
        totalUsers = data.length;
        totalPages = Math.max(1, Math.ceil(totalUsers / limit));
        const start = (page - 1) * limit;
        const end = start + limit;
        users = data.slice(start, end);
      } else {
        users = data.users || [];
        totalUsers = typeof data.total === 'number' ? data.total : (typeof data.totalUsers === 'number' ? data.totalUsers : users.length);
        totalPages = Math.max(1, Math.ceil(totalUsers / limit));
      }
      return {
        success: true,
        users,
        totalPages,
        totalUsers
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async addUser(payload) {
    try {
      const res = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to add student' };
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async editUser(id, payload) {
    try {
      const res = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to update student' };
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async deleteUser(id) {
    try {
      const res = await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || data.error || 'Failed to delete user' };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export default UserModel;
