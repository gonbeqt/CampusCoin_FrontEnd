import EventModel from '../models/eventModel';
import AuthModel from '../models/authModel';

class EventController {
  constructor() {
    this.model = new EventModel();
    this.auth = new AuthModel();
  }

  async finalizeEvent(eventId, finalizedBy) {
    try {
      const result = await this.model.finalizeEvent(eventId, finalizedBy);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to finalize event' };
      }
      return { success: true, data: result.data };
    } catch (error) {
      console.error('EventController.finalizeEvent error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async markStudentAttendance(eventId, studentId, status) {
    try {
      const result = await this.model.markStudentAttendance(eventId, studentId, status);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to mark attendance' };
      }
      return { success: true, data: result.data };
    } catch (error) {
      console.error('EventController.markStudentAttendance error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async getAllEvents() {
    try {
      const result = await this.model.getAllEvents();
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to fetch events' };
      }
      // Backend returns { events: [...] }, unwrap to an array for consumers
      return {
        success: true,
        events: (result.data && Array.isArray(result.data.events)) ? result.data.events : [],
      };
    } catch (error) {
      console.error('EventController.getAllEvents error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async getEventById(eventId) {
    try {
      const result = await this.model.getEventById(eventId);
      if (!result.success) {
        // Use the more descriptive error message from feature/event
        return { success: false, error: result.error || 'Failed to fetch event details' };
      }
      return { success: true, event: result.data };
    } catch (error) {
      console.error('EventController.getEventById error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async joinEvent(eventId) {
    try {
      const token = this.auth.getToken();
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }
      const result = await this.model.joinEvent(eventId, token);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to join event' };
      }
      return {
        success: true,
        message: result.data.message || 'Successfully joined the event',
      };
    } catch (error) {
      console.error('EventController.joinEvent error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async claimReward(eventId) {
    try {
      const token = this.auth.getToken();
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }
      const result = await this.model.claimReward(eventId, token);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to claim reward' };
      }
      return {
        success: true,
        message: result.data.message || 'Reward claimed successfully',
        newBalance: result.data.newBalance,
        eventStatus: result.data.eventStatus,
      };
    } catch (error) {
      console.error('EventController.claimReward error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  async getJoinedCompletedEventsCount() {
    try {
      // Model handles token and endpoint; no params needed
      const result = await this.model.getJoinedCompletedEventsCount();
      if (!result.success) {
        return { success: false, error: result.error || "Failed to fetch attendance" };
      }
      return { success: true, count: result.data.count || 0 };
    } catch (error) {
      console.error("EventController.getJoinedCompletedEventsCount error:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }
}

const eventController = new EventController();
export default eventController;
