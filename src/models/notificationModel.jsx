import { useState, useEffect } from 'react';

class NotificationModel {
  constructor() {
    this.notifications = [];
    this.preferences = null;
    this.pushSubscription = null;
    this.listeners = [];
    this.baseURL = 'http://localhost:5000/api/notifications';
  }

  // Notification CRUD operations
  async getUserNotifications(page = 1, limit = 20) {
        const token = localStorage.getItem('authToken')

    try {
        const url = `${this.baseURL}?page=${page}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.notifications = data.notifications || [];
        this.notifyListeners();
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      // Fallback: If backend is not available, use empty array
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        this.notifications = [];
        this.notifyListeners();
        return { notifications: [], pagination: { totalNotifications: 0 }, unreadCount: 0 };
      }
      
      throw error;
    }
  }

  async getNotificationsWithFilters(filters = {}) {
        const token = localStorage.getItem('authToken')

    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}/filtered?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch filtered notifications');
      }
    } catch (error) {
      throw error;
    }
  }

  async searchNotifications(query) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to search notifications');
      }
    } catch (error) {
      throw error;
    }
  }

  async getNotificationStats() {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch notification stats');
      }
    } catch (error) {
      throw error;
    }
  }

  async getImportantNotifications() {
    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/important`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch important notifications');
      }
    } catch (error) {
      throw error;
    }
  }

  async getNotificationsByCategory(category) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch notifications by category');
      }
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount() {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data.unreadCount;
      } else {
        throw new Error(data.message || 'Failed to fetch unread count');
      }
    } catch (error) {
      throw error;
    }
  }

  // Notification actions
  async markNotificationAsRead(notificationId) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          this.notifyListeners();
        }
        return data;
      } else {
        throw new Error(data.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsImportant(notificationId, isImportant) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/${notificationId}/important`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isImportant })
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.isImportant = isImportant;
          this.notifyListeners();
        }
        return data;
      } else {
        throw new Error(data.message || 'Failed to mark notification as important');
      }
    } catch (error) {
      throw error;
    }
  }

  async markAllNotificationsAsRead() {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        this.notifications.forEach(notification => {
          notification.read = true;
          notification.readAt = new Date().toISOString();
        });
        this.notifyListeners();
        return data;
      } else {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(notificationId) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        this.notifications = this.notifications.filter(n => n._id !== notificationId);
        this.notifyListeners();
        return data;
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      throw error;
    }
  }

  // Notification preferences
  async getNotificationPreferences() {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        this.preferences = data.preferences;
        this.notifyListeners();
        return data.preferences;
      } else {
        throw new Error(data.message || 'Failed to fetch notification preferences');
      }
    } catch (error) {
      throw error;
    }
  }

  async updateNotificationPreferences(preferences) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });
      const data = await response.json();
      
      if (response.ok) {
        this.preferences = data.preferences;
        this.notifyListeners();
        return data.preferences;
      } else {
        throw new Error(data.message || 'Failed to update notification preferences');
      }
    } catch (error) {
      throw error;
    }
  }

  async updateNotificationTypePreference(type, channel, enabled) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/preferences/type`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, channel, enabled })
      });
      const data = await response.json();
      
      if (response.ok) {
        this.preferences = data.preferences;
        this.notifyListeners();
        return data.preferences;
      } else {
        throw new Error(data.message || 'Failed to update notification type preference');
      }
    } catch (error) {
      throw error;
    }
  }

  async updateFrequencyPreferences(frequency) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/preferences/frequency`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ frequency })
      });
      const data = await response.json();
      
      if (response.ok) {
        this.preferences = data.preferences;
        this.notifyListeners();
        return data.preferences;
      } else {
        throw new Error(data.message || 'Failed to update frequency preferences');
      }
    } catch (error) {
      throw error;
    }
  }

  async updateQuietHours(quietHours) {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/preferences/quiet-hours`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quietHours })
      });
      const data = await response.json();
      
      if (response.ok) {
        this.preferences = data.preferences;
        this.notifyListeners();
        return data.preferences;
      } else {
        throw new Error(data.message || 'Failed to update quiet hours');
      }
    } catch (error) {
      throw error;
    }
  }

  async resetNotificationPreferences() {
        const token = localStorage.getItem('authToken')

    try {
      const response = await fetch(`${this.baseURL}/preferences/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        this.preferences = data.preferences;
        this.notifyListeners();
        return data.preferences;
      } else {
        throw new Error(data.message || 'Failed to reset notification preferences');
      }
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      throw error;
    }
  }

  // Note: Web-push functionality removed as per requirements
  // Only in-app notifications are supported

  // Utility methods
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener({
      notifications: this.notifications,
      preferences: this.preferences,
      pushSubscription: this.pushSubscription
    }));
  }

  // Create notification helper
  createNotification(type, title, message, data = {}) {
    return {
      type,
      title,
      message,
      data,
      read: false,
      category: this.getCategoryFromType(type),
      priority: this.getPriorityFromType(type),
      isImportant: false,
      createdAt: new Date().toISOString()
    };
  }

  getCategoryFromType(type) {
    const categoryMap = {
      'eth_received': 'payment',
      'new_event': 'event',
      'new_order': 'order',
      'order_status': 'order',
      'order_refund': 'order',
      'event_reminder': 'event',
      'wallet_low_balance': 'system',
      'event_registration_full': 'event',
      'product_restocked': 'order',
      'admin_announcement': 'system',
      'friend_request': 'social',
      'achievement_unlocked': 'achievement',
      'security_alert': 'security',
      'maintenance_scheduled': 'system'
    };
    return categoryMap[type] || 'system';
  }

  getPriorityFromType(type) {
    const priorityMap = {
      'eth_received': 'high',
      'security_alert': 'urgent',
      'wallet_low_balance': 'high',
      'order_refund': 'high',
      'admin_announcement': 'medium',
      'new_event': 'medium',
      'event_reminder': 'low',
      'product_restocked': 'low',
      'friend_request': 'low',
      'achievement_unlocked': 'medium',
      'maintenance_scheduled': 'medium'
    };
    return priorityMap[type] || 'medium';
  }
}

export default new NotificationModel();
