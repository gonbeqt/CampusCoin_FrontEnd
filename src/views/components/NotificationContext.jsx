import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationController from '../../controllers/notificationController';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    setupEventListeners();
  }, []);

  // Load initial notification data - only once
  const loadInitialData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const [notificationsData, unreadCountData, preferencesData, statsData] = await Promise.allSettled([
        notificationController.getUserNotifications(1, 50),
        notificationController.getUnreadCount(),
        notificationController.getNotificationPreferences(),
        notificationController.getNotificationStats()
      ]);

      if (notificationsData.status === 'fulfilled') {
        setNotifications(notificationsData.value.notifications || []);
      } else {
        console.error('Notifications data failed:', notificationsData.reason);
        setNotifications([]);
      }

      if (unreadCountData.status === 'fulfilled') {
        setUnreadCount(unreadCountData.value);
      } else {
        setUnreadCount(0);
      }

      if (preferencesData.status === 'fulfilled') {
        setPreferences(preferencesData.value);
      } else {
        setPreferences({ inApp: { enabled: true }, push: { enabled: false } });
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        setStats({ total: 0, unread: 0, important: 0 });
      }
    } catch (error) {
      console.error('Error loading initial notification data:', error);
      setError(error.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Refresh notifications (for socket updates)
  const refreshNotifications = useCallback(async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.allSettled([
        notificationController.getUserNotifications(1, 50),
        notificationController.getUnreadCount()
      ]);

      if (notificationsData.status === 'fulfilled') {
        setNotifications(notificationsData.value.notifications || []);
      }

      if (unreadCountData.status === 'fulfilled') {
        setUnreadCount(unreadCountData.value);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, []);

  // Note: Push notifications setup removed as per requirements

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Listen for notification refresh events
    const handleNotificationRefresh = () => {
      refreshNotifications();
    };

    window.addEventListener('notificationRefresh', handleNotificationRefresh);

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'notificationUpdate') {
        refreshNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('notificationRefresh', handleNotificationRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationController.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Notify other tabs
      localStorage.setItem('notificationUpdate', Date.now().toString());
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError(error.message);
    }
  }, []);

  // Mark notification as important
  const markAsImportant = useCallback(async (notificationId, isImportant) => {
    try {
      await notificationController.markNotificationAsImportant(notificationId, isImportant);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isImportant }
            : notification
        )
      );
      
      // Notify other tabs
      localStorage.setItem('notificationUpdate', Date.now().toString());
    } catch (error) {
      console.error('Error marking notification as important:', error);
      setError(error.message);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationController.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      // Notify other tabs
      localStorage.setItem('notificationUpdate', Date.now().toString());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError(error.message);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationController.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Notify other tabs
      localStorage.setItem('notificationUpdate', Date.now().toString());
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error.message);
    }
  }, [notifications]);

  // Get filtered notifications
  const getFilteredNotifications = useCallback(async (filters) => {
    try {
      const result = await notificationController.getNotificationsWithFilters(filters);
      return result;
    } catch (error) {
      console.error('Error getting filtered notifications:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Search notifications
  const searchNotifications = useCallback(async (query) => {
    try {
      const result = await notificationController.searchNotifications(query);
      return result;
    } catch (error) {
      console.error('Error searching notifications:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const updatedPreferences = await notificationController.updateNotificationPreferences(newPreferences);
      setPreferences(updatedPreferences);
      
      // Notify other tabs
      localStorage.setItem('notificationUpdate', Date.now().toString());
      
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Note: Push notification methods removed as per requirements

  // Create a new notification (for testing)
  const createNotification = useCallback((type, title, message, data = {}) => {
    return notificationController.createNotification(type, title, message, data);
  }, []);

  // Get notification icon
  const getNotificationIcon = useCallback((type) => {
    return notificationController.getNotificationIcon(type);
  }, []);

  // Get notification color
  const getNotificationColor = useCallback((priority) => {
    return notificationController.getNotificationColor(priority);
  }, []);

  // Format notification date
  const formatNotificationDate = useCallback((dateString) => {
    return notificationController.formatNotificationDate(dateString);
  }, []);

  // Check if notification should be shown
  const shouldShowNotification = useCallback((notification) => {
    return notificationController.shouldShowNotification(notification, preferences);
  }, [preferences]);

  // Check if within quiet hours
  const isWithinQuietHours = useCallback(() => {
    if (!preferences || !preferences.quietHours) return false;
    return notificationController.isWithinQuietHours(preferences.quietHours);
  }, [preferences]);

  // Show local notification (in-app only)
  const showLocalNotification = useCallback((title, options = {}) => {
    if (isWithinQuietHours()) return false;
    
    // Create a simple in-app notification
    const notification = {
      _id: Date.now().toString(), // Use _id to match backend format
      id: Date.now().toString(), // Also include id for compatibility
      title: typeof title === 'string' ? title : (title?.title || 'New notification'),
      message: options.body || options.message || '',
      type: options.type || 'info',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(), // Include both for compatibility
      read: false,
      category: options.category || 'system',
      priority: options.priority || 'medium',
      isImportant: false
    };
    
    // Check if notification already exists to prevent duplicates
    setNotifications(prev => {
      const exists = prev.some(n => n._id === notification._id || n.id === notification.id);
      if (exists) {
        console.log('Notification already exists, skipping duplicate');
        return prev;
      }
      return [notification, ...prev];
    });
    
    setUnreadCount(prev => prev + 1);
    
    return true;
  }, [isWithinQuietHours]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    stats,
    
    // Actions
    refreshNotifications,
    markAsRead,
    markAsImportant,
    markAllAsRead,
    deleteNotification,
    getFilteredNotifications,
    searchNotifications,
    updatePreferences,
    createNotification,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    formatNotificationDate,
    shouldShowNotification,
    isWithinQuietHours,
    showLocalNotification,
    clearError,
    
    // Constants
    notificationTypes: notificationController.getNotificationTypes(),
    categories: notificationController.getCategories(),
    priorities: notificationController.getPriorities(),
    channels: notificationController.getChannels(),
    frequencies: notificationController.getFrequencies()
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
