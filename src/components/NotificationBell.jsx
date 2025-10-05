import React, { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, X, Check, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../views/components/NotificationContext';
import socketService from '../services/socketService';

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsImportant,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationDate,
    showLocalNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, important
  const modalRef = useRef(null);

  // Socket.IO connection setup
  useEffect(() => {
    // Connect to socket service
    socketService.connect();

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log('New notification received via socket:', notification);
      // The notification context will handle updating the state
      // Don't create duplicate notifications - just refresh the list
      refreshNotifications();
    };

    // Listen for notification updates
    const handleNotificationUpdate = (data) => {
      console.log('Notification updated via socket:', data);
      // Refresh notifications from context
      refreshNotifications();
    };

    socketService.on('new_notification', handleNewNotification);
    socketService.on('notification_updated', handleNotificationUpdate);

    return () => {
      socketService.off('new_notification', handleNewNotification);
      socketService.off('notification_updated', handleNotificationUpdate);
    };
  }, [showLocalNotification, refreshNotifications]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    // Debug: Log notification structure to understand the data
    console.log('Processing notification:', notification);
    console.log('Notification title type:', typeof notification.title);
    console.log('Notification title value:', notification.title);
    
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'important':
        return notification.isImportant;
      default:
        return true;
    }
  });

  // Sort notifications by priority and date
  const sortedNotifications = filteredNotifications.sort((a, b) => {
    // First sort by unread status
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    
    // Then by importance
    if (a.isImportant !== b.isImportant) {
      return a.isImportant ? -1 : 1;
    }
    
    // Finally by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleNotificationClick = (notification) => {
    const notificationId = notification._id || notification.id;
    if (!notification.read) {
      // Use socket service for real-time updates
      socketService.markNotificationAsRead(notificationId);
      // Also update local state
      markAsRead(notificationId);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAsImportant = async (e, notificationId, isImportant) => {
    e.stopPropagation();
    // Use socket service for real-time updates
    socketService.markNotificationAsImportant(notificationId, !isImportant);
    // Also update local state
    await markAsImportant(notificationId, !isImportant);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    // Use socket service for real-time updates
    socketService.deleteNotification(notificationId);
    // Also update local state
    await deleteNotification(notificationId);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Helper function to safely render notification properties
  const safeRenderProperty = (value, fallback = '') => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object' && value !== null) {
      // If it's an object, try to extract a meaningful string
      if (value.title) return safeRenderProperty(value.title, fallback);
      if (value.message) return safeRenderProperty(value.message, fallback);
      if (value.name) return safeRenderProperty(value.name, fallback);
      return JSON.stringify(value);
    }
    return fallback;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        disabled={isLoading}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-6 w-6 text-blue-600" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex space-x-1">
                {[
                  { key: 'all', label: 'All', count: notifications.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'important', label: 'Important', count: notifications.filter(n => n.isImportant).length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      filter === tab.key
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm">Loading notifications...</p>
                </div>
              ) : sortedNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No notifications found</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div>
                  {sortedNotifications.map((notification, index) => (
                    <div
                      key={notification._id || `notification-${index}`}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-3 ${
                        notification.isImportant ? 'bg-gray-50 border-l-yellow-400' : 'border-l-transparent'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Notification icon */}
                        <div className="flex-shrink-0 text-2xl">
                          {getNotificationIcon(safeRenderProperty(notification.type, 'info'))}
                        </div>

                        {/* Notification content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {safeRenderProperty(notification.title, 'No title')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatNotificationDate(notification.createdAt || notification.timestamp || new Date().toISOString())}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">
                                  {safeRenderProperty(notification.category, 'general')}
                                </span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={(e) => handleMarkAsImportant(e, notification._id || notification.id, notification.isImportant)}
                                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                  notification.isImportant ? 'text-yellow-500' : 'text-gray-400'
                                }`}
                                title={notification.isImportant ? 'Remove from important' : 'Mark as important'}
                              >
                                <Star className={`h-3 w-3 ${notification.isImportant ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteNotification(e, notification._id || notification.id)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {unreadCount > 0 && (
              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={markAllAsRead}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors font-medium"
                >
                  <Check className="h-4 w-4" />
                  <span>Mark All as Read</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationBell;