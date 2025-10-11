import notificationModel from '../models/notificationModel';

class NotificationController {
  constructor() {
    this.model = notificationModel;
  }

  // Notification CRUD operations
  async getUserNotifications(page = 1, limit = 20) {
    try {
      return await this.model.getUserNotifications(page, limit);
    } catch (error) {
      console.error('NotificationController: Error getting user notifications', error);
      throw error;
    }
  }

  async getNotificationsWithFilters(filters = {}) {
    try {
      return await this.model.getNotificationsWithFilters(filters);
    } catch (error) {
      console.error('NotificationController: Error getting filtered notifications', error);
      throw error;
    }
  }

  async searchNotifications(query) {
    try {
      return await this.model.searchNotifications(query);
    } catch (error) {
      console.error('NotificationController: Error searching notifications', error);
      throw error;
    }
  }

  async getNotificationStats() {
    try {
      return await this.model.getNotificationStats();
    } catch (error) {
      console.error('NotificationController: Error getting notification stats', error);
      throw error;
    }
  }

  async getImportantNotifications() {
    try {
      return await this.model.getImportantNotifications();
    } catch (error) {
      console.error('NotificationController: Error getting important notifications', error);
      throw error;
    }
  }

  async getNotificationsByCategory(category) {
    try {
      return await this.model.getNotificationsByCategory(category);
    } catch (error) {
      console.error('NotificationController: Error getting notifications by category', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      return await this.model.getUnreadCount();
    } catch (error) {
      console.error('NotificationController: Error getting unread count', error);
      throw error;
    }
  }

  // Notification actions
  async markNotificationAsRead(notificationId) {
    try {
      return await this.model.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('NotificationController: Error marking notification as read', error);
      throw error;
    }
  }

  async markNotificationAsImportant(notificationId, isImportant) {
    try {
      return await this.model.markNotificationAsImportant(notificationId, isImportant);
    } catch (error) {
      console.error('NotificationController: Error marking notification as important', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead() {
    try {
      return await this.model.markAllNotificationsAsRead();
    } catch (error) {
      console.error('NotificationController: Error marking all notifications as read', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      return await this.model.deleteNotification(notificationId);
    } catch (error) {
      console.error('NotificationController: Error deleting notification', error);
      throw error;
    }
  }
  

  

  // Helper methods for creating notifications
  createNotification(type, title, message, data = {}) {
    return this.model.createNotification(type, title, message, data);
  }

  // Order-specific notification methods with proper targeting
  async createOrderSuccessNotification(studentId, orderData) {
    const notification = {
      userId: studentId,
      type: 'order_status',
      title: 'Order Successful!',
      message: `You have successfully ordered ${orderData.quantity}x "${orderData.productName}" for ${orderData.total} coins`,
      data: {
        orderId: orderData.orderId,
        productId: orderData.productId,
        quantity: orderData.quantity,
        total: orderData.total
      },
      category: 'order',
      priority: 'medium',
      actionUrl: `/student/transactions`,
      actionText: 'View Order'
    };
    return await this.model.createNotification(notification);
  }

  async createNewOrderNotificationForAdmin(adminId, orderData, studentName) {
    const notification = {
      userId: adminId,
      type: 'new_order',
      title: 'New Order Received!',
      message: `${studentName} ordered ${orderData.quantity}x "${orderData.productName}" - Total: ${orderData.total} coins`,
      data: {
        orderId: orderData.orderId,
        studentId: orderData.studentId,
        studentName: studentName,
        productId: orderData.productId,
        productName: orderData.productName,
        quantity: orderData.quantity,
        total: orderData.total
      },
      category: 'order',
      priority: 'high',
      actionUrl: `/admin/orders`,
      actionText: 'View Order'
    };
    return await this.model.createNotification(notification);
  }

  async createNewOrderNotificationForSeller(sellerId, orderData, studentName) {
    const notification = {
      userId: sellerId,
      type: 'new_order',
      title: 'New Order Received!',
      message: `${studentName} ordered ${orderData.quantity}x "${orderData.productName}" - Total: ${orderData.total} coins`,
      data: {
        orderId: orderData.orderId,
        studentId: orderData.studentId,
        studentName: studentName,
        productId: orderData.productId,
        productName: orderData.productName,
        quantity: orderData.quantity,
        total: orderData.total
      },
      category: 'order',
      priority: 'high',
      actionUrl: `/seller/orders`,
      actionText: 'View Order'
    };
    return await this.model.createNotification(notification);
  }

  // Event-specific notification methods with proper targeting
  async createEventRegistrationSuccessNotification(studentId, eventData) {
    const notification = {
      userId: studentId,
      type: 'event_reminder',
      title: 'Event Registration Confirmed!',
      message: `You have successfully registered for "${eventData.eventName}" on ${eventData.eventDate}`,
      data: {
        eventId: eventData.eventId,
        eventName: eventData.eventName,
        eventDate: eventData.eventDate,
        registrationId: eventData.registrationId
      },
      category: 'event',
      priority: 'medium',
      actionUrl: `/student/events`,
      actionText: 'View Event'
    };
    return await this.model.createNotification(notification);
  }

  async createStudentJoinedEventNotification(adminId, eventData, studentName) {
    const notification = {
      userId: adminId,
      type: 'new_event',
      title: 'Student Joined Event!',
      message: `${studentName} joined "${eventData.eventName}"`,
      data: {
        eventId: eventData.eventId,
        eventName: eventData.eventName,
        studentId: eventData.studentId,
        studentName: studentName,
        registrationId: eventData.registrationId
      },
      category: 'event',
      priority: 'medium',
      actionUrl: `/admin/events`,
      actionText: 'View Event'
    };
    return await this.model.createNotification(notification);
  }

  // Notification type definitions
  getNotificationTypes() {
    return {
      ETH_RECEIVED: 'eth_received',
      NEW_EVENT: 'new_event',
      NEW_ORDER: 'new_order',
      ORDER_STATUS: 'order_status',
      EVENT_REMINDER: 'event_reminder',
      ORDER_REFUND: 'order_refund',
      WALLET_LOW_BALANCE: 'wallet_low_balance',
      EVENT_REGISTRATION_FULL: 'event_registration_full',
      PRODUCT_RESTOCKED: 'product_restocked',
      ADMIN_ANNOUNCEMENT: 'admin_announcement',
      FRIEND_REQUEST: 'friend_request',
      ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
      SECURITY_ALERT: 'security_alert',
      MAINTENANCE_SCHEDULED: 'maintenance_scheduled'
    };
  }

  // Category definitions
  getCategories() {
    return {
      PAYMENT: 'payment',
      EVENT: 'event',
      ORDER: 'order',
      SYSTEM: 'system',
      SOCIAL: 'social',
      SECURITY: 'security',
      ACHIEVEMENT: 'achievement'
    };
  }

  // Priority definitions
  getPriorities() {
    return {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent'
    };
  }

  // Channel definitions
  getChannels() {
    return {
      IN_APP: 'inApp',
      PUSH: 'push'
    };
  }

  // Frequency definitions
  getFrequencies() {
    return {
      INSTANT: 'instant',
      DIGEST: 'digest',
      WEEKLY: 'weekly'
    };
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    const iconMap = {
      'eth_received': '💰',
      'new_event': '🎉',
      'new_order': '🛒',
      'order_status': '📦',
      'event_reminder': '⏰',
      'order_refund': '💸',
      'wallet_low_balance': '⚠️',
      'event_registration_full': '🚫',
      'product_restocked': '📦',
      'admin_announcement': '📢',
      'friend_request': '👥',
      'achievement_unlocked': '🏆',
      'security_alert': '🔒',
      'maintenance_scheduled': '🔧'
    };
    return iconMap[type] || '🔔';
  }

  // Get notification color based on priority
  getNotificationColor(priority) {
    const colorMap = {
      'low': 'text-gray-600',
      'medium': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colorMap[priority] || 'text-blue-600';
  }

  // Format notification date
  formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  // Check if notification should be shown based on preferences
  shouldShowNotification(notification, preferences) {
    if (!preferences) return true;

    const channel = notification.pushSubscription ? 'push' : 'inApp';
    const channelPrefs = preferences[channel];

    if (!channelPrefs || !channelPrefs.enabled) return false;

    return channelPrefs.types && channelPrefs.types[notification.type] !== false;
  }

  // Check if current time is within quiet hours
  isWithinQuietHours(quietHours) {
    if (!quietHours || !quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime = this.parseTime(quietHours.startTime);
    const endTime = this.parseTime(quietHours.endTime);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

export default new NotificationController();
