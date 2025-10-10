
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
        // backend returns { events: [...] }
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.getAllEvents error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Get event by ID (merged: supports optional token)
  async getEventById(eventId, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${this.baseURL}/${eventId}`, {
        method: 'GET',
        headers,
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

  // Join event
  async joinEvent(eventId) {
    try {
      const authModel = new AuthModel();
      const token = authModel.getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${this.baseURL}/${eventId}/join`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.joinEvent error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Claim reward
  async claimReward(eventId) {
    try {
      const authModel = new AuthModel();
      const token = authModel.getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${this.baseURL}/${eventId}/claim`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.claimReward error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Get joined & completed events count
  async getJoinedCompletedEventsCount() {
    try {
      const authModel = new AuthModel();
      const token = authModel.getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Backend route: /events/joined/completed/count (protected)
      const response = await fetch(`${this.baseURL}/events/joined/completed/count`, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,

        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.getJoinedCompletedEventsCount error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
  async generateAttendanceQr(eventId, studentId) {
    try {
      const authModel = new AuthModel();
      const token = authModel.getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${this.baseURL}/${eventId}/attendance/${studentId}/qr`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.generateAttendanceQr error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

}

export default EventModel;
