import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import notificationController from '../../controllers/notificationController';
import socketService from '../../services/socketService';
import AuthModel from '../../models/authModel';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const isInitializedRef = useRef(false);
  const authModel = useRef(new AuthModel());

  // Get current user ID on mount
  useEffect(() => {
    const userData = authModel.current.getUserData();
    if (userData) {
      const userId = userData._id || userData.id;
      setCurrentUserId(userId);
      console.log('Current user ID:', userId);
    }
  }, []);

  // Load initial notification data - only once
  const loadInitialData = useCallback(async () => {
    // Prevent loading if no user is identified
    if (!currentUserId) {
      console.warn('No user ID found. Skipping notification load.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      console.log(`Fetching notifications for user ${currentUserId}...`);

      const [notificationsData, unreadCountData, statsData] = await Promise.allSettled([
        notificationController.getUserNotifications(1, 50),
        notificationController.getUnreadCount(),
        notificationController.getNotificationStats()
      ]);

      if (notificationsData.status === 'fulfilled') {
        const fetchedNotifications = notificationsData.value.notifications || [];
        console.log(`API returned ${fetchedNotifications.length} notifications total`);
        
        // DON'T filter - backend already filters by authenticated user
        setNotifications(fetchedNotifications);
        console.log(`Set ${fetchedNotifications.length} notifications for user ${currentUserId}`);
      } else {
        console.error('Failed to fetch notifications:', notificationsData.reason);
        setNotifications([]);
      }

      if (unreadCountData.status === 'fulfilled') {
        setUnreadCount(unreadCountData.value);
      } else {
        setUnreadCount(0);
      }

      // Set default preferences (API endpoint not available)
      setPreferences({ inApp: { enabled: true }, push: { enabled: false } });

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
  }, [currentUserId]);

  // Trigger notification load when currentUserId is set
  useEffect(() => {
    if (!currentUserId) return;
    
    console.log('User ID changed to:', currentUserId, 'loading notifications...');
    loadInitialData();
  }, [currentUserId, loadInitialData]); // This will trigger whenever currentUserId changes

  // Refresh notifications (for socket updates)
  const refreshNotifications = useCallback(async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.allSettled([
        notificationController.getUserNotifications(1, 50),
        notificationController.getUnreadCount()
      ]);

      if (notificationsData.status === 'fulfilled') {
        const fetchedNotifications = notificationsData.value.notifications || [];
        console.log(`Refreshed: ${fetchedNotifications.length} notifications for user ${currentUserId}`);
        
        // DON'T filter - backend already filters by authenticated user
        setNotifications(fetchedNotifications);
      }

      if (unreadCountData.status === 'fulfilled') {
        setUnreadCount(unreadCountData.value);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [currentUserId]);

  // Initialize socket connection when user is identified
  useEffect(() => {
    // Wait for user to be identified
    if (!currentUserId) return;
    
    if (isInitializedRef.current) return; // Prevent re-initialization
    
    isInitializedRef.current = true;
    console.log('Initializing socket connection for user:', currentUserId);

    // Connect socket service
    socketService.connect();

    // Setup socket listeners
    const handleNewNotification = () => {
      console.log('New notification received via socket');
      refreshNotifications();
    };

    const handleNotificationUpdate = () => {
      console.log('Notification update received via socket');
      refreshNotifications();
    };

    socketService.on('new_notification', handleNewNotification);
    socketService.on('notification_updated', handleNotificationUpdate);

    // Setup window event listeners
    const handleNotificationRefresh = () => {
      refreshNotifications();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'notificationUpdate') {
        refreshNotifications();
      }
    };

    window.addEventListener('notificationRefresh', handleNotificationRefresh);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      socketService.off('new_notification', handleNewNotification);
      socketService.off('notification_updated', handleNotificationUpdate);
      window.removeEventListener('notificationRefresh', handleNotificationRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserId, refreshNotifications]);

  // Note: Push notifications setup removed as per requirements

  // Setup event listeners (kept for backward compatibility)
  const setupEventListeners = useCallback(() => {
    // This is now handled in the main useEffect above
  }, []);

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

  // Notification panel/modal controls
  const toggleNotificationsPanel = useCallback(() => {
    setIsNotificationsOpen(prev => !prev);
  }, []);

  const openNotificationsPanel = useCallback(() => {
    setIsNotificationsOpen(true);
  }, []);

  const closeNotificationsPanel = useCallback(() => {
    setIsNotificationsOpen(false);
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
  // Panel controls
  isNotificationsOpen,
  toggleNotificationsPanel,
  openNotificationsPanel,
  closeNotificationsPanel,
    
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
