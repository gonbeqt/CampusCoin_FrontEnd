import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Info, Bell } from 'lucide-react';
import { useNotifications } from '../views/components/NotificationContext';

const NotificationToast = ({ notification, onClose, duration = 5000 }) => {
  const { getNotificationIcon, getNotificationColor, markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Start progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    // Auto close after duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleClose = async () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(notification._id);
    }, 300);
  };

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    handleClose();
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 shadow-red-100';
      case 'high':
        return 'bg-orange-50 border-orange-200 shadow-orange-100';
      case 'medium':
        return 'bg-blue-50 border-blue-200 shadow-blue-100';
      case 'low':
        return 'bg-gray-50 border-gray-200 shadow-gray-100';
      default:
        return 'bg-gray-50 border-gray-200 shadow-gray-100';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-80 max-w-sm transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`rounded-lg border shadow-lg cursor-pointer hover:shadow-xl transition-shadow ${getPriorityStyles(notification.priority)}`}
        onClick={handleClick}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Notification icon */}
            <div className="flex-shrink-0">
              <div className="text-2xl">
                {getNotificationIcon(notification.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>

                {/* Priority indicator */}
                <div className="flex-shrink-0 ml-2">
                  {getPriorityIcon(notification.priority)}
                </div>
              </div>

              {/* Category and time */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 capitalize">
                  {notification.category}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action button if available */}
          {notification.actionUrl && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1"
              >
                <span>{notification.actionText || 'View Details'}</span>
                <Check className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const NotificationToastContainer = () => {
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Show toast for new notifications
    const newNotifications = notifications.filter(n => !n.read && n.createdAt);
    const latestNotification = newNotifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    if (latestNotification && !toasts.find(t => t._id === latestNotification._id)) {
      setToasts(prev => [...prev, latestNotification]);
    }
  }, [notifications, toasts]);

  const handleCloseToast = (notificationId) => {
    setToasts(prev => prev.filter(t => t._id !== notificationId));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <NotificationToast
          key={toast._id}
          notification={toast}
          onClose={handleCloseToast}
          duration={toast.priority === 'urgent' ? 10000 : 5000}
        />
      ))}
    </div>
  );
};

export default NotificationToast;
