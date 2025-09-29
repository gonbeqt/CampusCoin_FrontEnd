import AuthModel from './authModel';

class EventModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/events';
  }

  // Finalize event
  async finalizeEvent(eventId, finalizedBy) {
    try {
      const authModel = new AuthModel();
      const token = authModel.getToken();
      const response = await fetch(`${this.baseURL}/${eventId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ finalizedBy }),
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.finalizeEvent error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Mark student attendance
  async markStudentAttendance(eventId, studentId, status) {
    try {
      const authModel = new AuthModel();
      const token = authModel.getToken();
      const response = await fetch(`${this.baseURL}/${eventId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ studentId, status }),
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.markStudentAttendance error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }


  // Get all events
  async getAllEvents() {
    try {
      const response = await fetch(`${this.baseURL}/all-events`, {
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
      console.error('EventModel.getAllEvents error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Get event by ID
  async getEventById(eventId) {
    try {
      const response = await fetch(`${this.baseURL}/${eventId}`, {
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
      console.error('EventModel.getEventById error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
}

export default EventModel;
