import AdminDashboardModel from '../models/adminDashboardModel';
import AuthModel from '../models/authModel';

class AdminDashboardController {
  constructor() {
    this.model = new AdminDashboardModel();
    this.auth = new AuthModel();
  }

  async getAnalytics() {
    try {
      const token = this.auth.getToken();
      const result = await this.model.getAnalytics(token);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to fetch analytics' };
      }
      return { success: true, data: result.data };
    } catch (error) {
      console.error('AdminDashboardController.getAnalytics error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async getRecentEvents() {
    try {
      const token = this.auth.getToken();
      const result = await this.model.getRecentEvents(token);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to fetch recent events' };
      }
      return { success: true, events: result.events };
    } catch (error) {
      console.error('AdminDashboardController.getRecentEvents error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

const adminDashboardController = new AdminDashboardController();
export default adminDashboardController;
