import EventModel from '../models/eventModel';

class EventController {
  constructor() {
    this.model = new EventModel();
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
}

const eventController = new EventController();
export default eventController;
