import UserModel from '../models/userModel.jsx';

class UserController {
  constructor() {
    this.model = new UserModel();
  }

  async getUsers(page = 1, limit = 10, search = '', course = '') {
    const result = await this.model.fetchUsers(page, limit, search, course);
    if (!result.success) return { success: false, error: result.error };
    // Format users for frontend
    const users = result.users.map(u => ({
      id: u._id,
      name: [u.first_name, u.middle_name, u.last_name, u.suffix].filter(Boolean).join(' ') || u.fullname || '',
      email: u.email,
      presentToday: false,
      totalPresent: 0,
      totalAbsent: 0,
      ...u,
      courseShort: u.course ? u.course.split(' ')[0] : ''
    }));
    return {
      success: true,
      users,
      totalPages: result.totalPages,
      totalUsers: result.totalUsers
    };
  }

  async addUser(payload) {
    return await this.model.addUser(payload);
  }

  async editUser(id, payload) {
    return await this.model.editUser(id, payload);
  }

  async deleteUser(id) {
    return await this.model.deleteUser(id);
  }
}

const userController = new UserController();
export default userController;
