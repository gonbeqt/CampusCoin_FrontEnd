
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
}

export default EventModel;
