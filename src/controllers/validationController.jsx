// controllers/validationController.js
import ValidationModel from '../models/validationModel';

class ValidationController {
  constructor() {
    this.model = new ValidationModel();
  }

  async getPendingValidations(token) {
    try {
      return await this.model.getPendingValidations(token);
    } catch (error) {
      console.error(' getPendingValidations error:', error);
      return { success: false, error: 'Unexpected error while fetching pending validations.' };
    }
  }

  async getValidationDetails(userId, token) {
    try {
      return await this.model.getValidationDetails(userId, token);
    } catch (error) {
      console.error(' getValidationDetails error:', error);
      return { success: false, error: 'Unexpected error while fetching validation details.' };
    }
  }

  async approveUser(userId, token) {
    try {
      return await this.model.approveUser(userId, token);
    } catch (error) {
      console.error('[ValidationController] approveUser error:', error);
      return { success: false, error: 'Unexpected error while approving user.' };
    }
  }

  async rejectUser(userId, reason, token) {
    try {
      return await this.model.rejectUser(userId, reason, token);
    } catch (error) {
      console.error('[ValidationController] rejectUser error:', error);
      return { success: false, error: 'Unexpected error while rejecting user.' };
    }
  }

  async suspendUser(userId, reason, token) {
    try {
      return await this.model.suspendUser(userId, reason, token);
    } catch (error) {
      console.error('[ValidationController] suspendUser error:', error);
      return { success: false, error: 'Unexpected error while suspending user.' };
    }
  }

  async reactivateUser(userId, token) {
    try {
      return await this.model.reactivateUser(userId, token);
    } catch (error) {
      console.error('[ValidationController] reactivateUser error:', error);
      return { success: false, error: 'Unexpected error while reactivating user.' };
    }
  }

  async getDocument(documentId, token) {
    try {
      return await this.model.getDocument(documentId, token);
    } catch (error) {
      console.error('[ValidationController] getDocument error:', error);
      return { success: false, error: 'Unexpected error while fetching document.' };
    }
  }

  async getValidationStats(token) {
    try {
      return await this.model.getValidationStats(token);
    } catch (error) {
      console.error('[ValidationController] getValidationStats error:', error);
      return { success: false, error: 'Unexpected error while fetching stats.' };
    }
  }

  async getAllUsersForSuperAdmin(params) {
    try {
      return await this.model.getAllUsersForSuperAdmin(params);
    } catch (error) {
      console.error(' getAllUsersForSuperAdmin error:', error);
      return { success: false, error: 'Unexpected error while fetching users.' };
    }
  }
  
}

export default new ValidationController();
