import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  Star, 
  Trash2, 
  MoreVertical,
  Calendar,
  Clock,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../views/components/NotificationContext';
import NotificationBreadcrumb from './NotificationBreadcrumb';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAsImportant,
    deleteNotification,
    markAllAsRead,
    getFilteredNotifications,
    searchNotifications,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationDate,
    refreshNotifications
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Categories and priorities
  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'payment', label: 'Payment' },
    { key: 'event', label: 'Event' },
    { key: 'order', label: 'Order' },
    { key: 'system', label: 'System' },
    { key: 'social', label: 'Social' },
    { key: 'security', label: 'Security' },
    { key: 'achievement', label: 'Achievement' }
  ];

  const priorities = [
    { key: 'all', label: 'All Priorities' },
    { key: 'urgent', label: 'Urgent', color: 'text-red-600' },
    { key: 'high', label: 'High', color: 'text-orange-600' },
    { key: 'medium', label: 'Medium', color: 'text-blue-600' },
    { key: 'low', label: 'Low', color: 'text-gray-600' }
  ];

  // Load notifications on component mount and filter changes
  useEffect(() => {
    loadNotifications();
  }, [selectedFilter, selectedCategory, selectedPriority, sortBy, page]);

  // Search notifications when query changes
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        loadNotifications();
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const loadNotifications = async () => {
    try {
      const filters = {
        read: selectedFilter === 'unread' ? false : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        sort: sortBy,
        page,
        limit: 20
      };

      const result = await getFilteredNotifications(filters);
      
      if (page === 1) {
        setDisplayedNotifications(result.notifications || []);
      } else {
        setDisplayedNotifications(prev => [...prev, ...(result.notifications || [])]);
      }
      
      setHasMore(result.hasMore || false);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const performSearch = async (query) => {
    try {
      const result = await searchNotifications(query);
      setDisplayedNotifications(result.notifications || []);
      setHasMore(false);
    } catch (error) {
      console.error('Error searching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
   
  };

  const handleMarkAsImportant = async (e, notificationId, isImportant) => {
    e.stopPropagation();
    await markAsImportant(notificationId, !isImportant);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === displayedNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(displayedNotifications.map(n => n._id)));
    }
  };

  const handleBulkAction = async (action) => {
    const selectedIds = Array.from(selectedNotifications);
    
    switch (action) {
      case 'markRead':
        for (const id of selectedIds) {
          await markAsRead(id);
        }
        break;
      case 'markImportant':
        for (const id of selectedIds) {
          await markAsImportant(id, true);
        }
        break;
      case 'delete':
        for (const id of selectedIds) {
          await deleteNotification(id);
        }
        break;
    }
    
    setSelectedNotifications(new Set());
    loadNotifications();
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Bell className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Notifications</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refreshNotifications}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationBreadcrumb />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Bell className="h-7 w-7" />
                <span>Notification Center</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">Manage your notifications and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshNotifications}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => navigate('/notifications/preferences')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Notification settings"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorities.map(priority => (
                <option key={priority.key} value={priority.key}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort and Bulk Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>

              {selectedNotifications.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.size} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('markRead')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => handleBulkAction('markImportant')}
                    className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                  >
                    Mark Important
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading && page === 1 ? (
            <div className="p-8 text-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              Loading notifications...
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search criteria' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="p-4 border-b border-gray-200">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.size === displayedNotifications.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                      notification.read ? 'opacity-75' : 'font-medium'
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />

                      {/* Notification icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Notification content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              {getPriorityIcon(notification.priority)}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span className="capitalize">{notification.category}</span>
                              <span>•</span>
                              <span>{formatNotificationDate(notification.createdAt)}</span>
                              {notification.actionUrl && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">{notification.actionText || 'View Details'}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => handleMarkAsImportant(e, notification._id, notification.isImportant)}
                              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                notification.isImportant ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                              title={notification.isImportant ? 'Remove from important' : 'Mark as important'}
                            >
                              <Star className={`h-4 w-4 ${notification.isImportant ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
