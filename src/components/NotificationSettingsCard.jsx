import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  Eye, 
  ChevronRight, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNotifications } from '../views/components/NotificationContext';

const NotificationSettingsCard = ({ className = "" }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    preferences, 
    isLoading,
    markAllAsRead 
  } = useNotifications();

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAllRead(true);
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const getNotificationTypeCount = (type) => {
    return notifications.filter(n => n.type === type && !n.read).length;
  };

  const recentNotificationTypes = [
    { type: 'eth_received', label: 'Payments', icon: '💰', color: 'text-green-600' },
    { type: 'new_event', label: 'Events', icon: '🎉', color: 'text-blue-600' },
    { type: 'new_order', label: 'Orders', icon: '🛒', color: 'text-purple-600' },
    { type: 'admin_announcement', label: 'Announcements', icon: '📢', color: 'text-orange-600' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="h-6 w-6 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isMarkingAllRead ? 'Marking...' : 'Mark All Read'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {unreadCount > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="grid grid-cols-2 gap-3">
            {recentNotificationTypes.map(({ type, label, icon, color }) => {
              const count = getNotificationTypeCount(type);
              return count > 0 ? (
                <div key={type} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                    <p className="text-xs text-gray-500">{count} unread</p>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View All Notifications</p>
                <p className="text-xs text-gray-500">Browse and manage all notifications</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </button>

          <button
            onClick={() => navigate('/notifications/preferences')}
            className="w-full flex items-center justify-between p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Notification Settings</p>
                <p className="text-xs text-gray-500">Customize your notification preferences</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>

      {/* Settings Preview */}
      {preferences && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <h5 className="text-xs font-medium text-gray-900">Current Settings</h5>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">In-app notifications:</span>
                <span className={`font-medium ${preferences.inApp?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                  {preferences.inApp?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Frequency:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {preferences.frequency?.type || 'instant'}
                </span>
              </div>
              {preferences.quietHours?.enabled && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Quiet hours:</span>
                  <span className="font-medium text-gray-900">
                    {preferences.quietHours.startTime} - {preferences.quietHours.endTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsCard;
