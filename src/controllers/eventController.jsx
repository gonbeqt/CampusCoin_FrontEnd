import EventModel from '../models/eventModel';
import AuthModel from '../models/authModel';

class EventController {
  constructor() {
    this.model = new EventModel();
    this.auth = new AuthModel();
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
    };
  } catch (error) {
    console.error('EventController.claimReward error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
}

const eventController = new EventController();
export default eventController;
