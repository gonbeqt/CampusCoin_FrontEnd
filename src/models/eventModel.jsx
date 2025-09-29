
class EventModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/events';
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

  async getEventById(eventId) {
    try {
      const response = await fetch(`${this.baseURL}/${eventId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.getEventById error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
  
  async joinEvent(eventId, token) {
    try {
      const response = await fetch(`${this.baseURL}/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.joinEvent error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async claimReward(eventId, token) {
    try {
      const response = await fetch(`${this.baseURL}/${eventId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error('EventModel.claimReward error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async getJoinedCompletedEventsCount(token) {
    try {
      const response = await fetch(`${this.baseURL}/events/joined/completed/count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        error: response.ok ? null : data.error || data.message,
      };
    } catch (error) {
      console.error("EventModel.getJoinedCompletedEventsCount error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  }
}

export default EventModel;
