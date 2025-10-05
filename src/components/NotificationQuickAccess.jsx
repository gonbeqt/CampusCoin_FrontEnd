import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Eye, ChevronRight } from 'lucide-react';
import { useNotifications } from '../views/components/NotificationContext';

const NotificationQuickAccess = ({ className = "" }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative">
          <Bell className="h-5 w-5 text-blue-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          <p className="text-xs text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => navigate('/notifications')}
          className="w-full flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span>View All Notifications</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </button>

        <button
          onClick={() => navigate('/notifications/preferences')}
          className="w-full flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <span>Notification Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default NotificationQuickAccess;
