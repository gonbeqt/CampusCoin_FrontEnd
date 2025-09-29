import UserModel from '../models/userModel';

class UserController {
  constructor() {
    this.model = new UserModel();
  }

  async getUserById(userId) {
    try {
      const result = await this.model.getUserById(userId);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to fetch user' };
      }
      return {
        success: true,
        user: result.data,
      };
    } catch (error) {
      console.error('UserController.getUserById error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

const userController = new UserController();
export default userController;
