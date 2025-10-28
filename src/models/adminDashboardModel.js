class AdminDashboardModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/admin-dashboard';
    this.eventsURL = 'http://localhost:5000/api/events/all-events';
  }

  async getAnalytics(token) {
    try {
      const response = await fetch(`${this.baseURL}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('AdminDashboardModel.getAnalytics error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async getRecentEvents(token) {
    try {
      const response = await fetch(this.eventsURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      return {
        success: response.ok,
        events: response.ok ? data.events || data : [],
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('AdminDashboardModel.getRecentEvents error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
}

export default AdminDashboardModel;
