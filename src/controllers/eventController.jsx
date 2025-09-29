import EventModel from '../models/eventModel';

class EventController {
  constructor() {
    this.model = new EventModel();
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

      return {
        success: true,
        events: result.data || [],
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
        return { success: false, error: result.error || 'Failed to fetch event' };
      }
      return {
        success: true,
        event: result.data,
      };
    } catch (error) {
      console.error('EventController.getEventById error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

const eventController = new EventController();
export default eventController;
