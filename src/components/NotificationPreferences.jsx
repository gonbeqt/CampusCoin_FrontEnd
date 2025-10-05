import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Smartphone, 
  Clock, 
  Save, 
  RotateCcw, 
  TestTube,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useNotifications } from '../views/components/NotificationContext';
import NotificationBreadcrumb from './NotificationBreadcrumb';

const NotificationPreferences = () => {
  const {
    preferences,
    updatePreferences,
    resetNotificationPreferences,
    notificationTypes,
    channels,
    frequencies
  } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({ ...preferences });
    }
  }, [preferences]);

  const handlePreferenceChange = (path, value) => {
    setLocalPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      
      await updatePreferences(localPreferences);
      setMessage('Preferences saved successfully!');
      setMessageType('success');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save preferences. Please try again.');
      setMessageType('error');
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all notification preferences to default?')) {
      try {
        setIsLoading(true);
        setMessage('');
        
        const defaultPrefs = await resetNotificationPreferences();
        setLocalPreferences(defaultPrefs);
        setMessage('Preferences reset to default successfully!');
        setMessageType('success');
        
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to reset preferences. Please try again.');
        setMessageType('error');
        console.error('Error resetting preferences:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Note: Push notification methods removed as per requirements

  const getNotificationTypeLabel = (type) => {
    const labels = {
      'eth_received': 'ETH Received',
      'new_event': 'New Event',
      'new_order': 'New Order',
      'order_status': 'Order Status',
      'event_reminder': 'Event Reminder',
      'order_refund': 'Order Refund',
      'wallet_low_balance': 'Low Wallet Balance',
      'event_registration_full': 'Event Registration Full',
      'product_restocked': 'Product Restocked',
      'admin_announcement': 'Admin Announcement',
      'friend_request': 'Friend Request',
      'achievement_unlocked': 'Achievement Unlocked',
      'security_alert': 'Security Alert',
      'maintenance_scheduled': 'Maintenance Scheduled'
    };
    return labels[type] || type;
  };

  const getNotificationTypeIcon = (type) => {
    const icons = {
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
    return icons[type] || '🔔';
  };

  if (!localPreferences) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notification preferences...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="h-7 w-7" />
            <span>Notification Preferences</span>
          </h1>
          <p className="text-gray-600 mt-1">Customize how you receive notifications</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className={`p-4 rounded-md flex items-center space-x-2 ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'general', label: 'General', icon: Bell },
                { key: 'types', label: 'Notification Types', icon: Settings },
                { key: 'schedule', label: 'Schedule', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">In-App Notifications</h4>
                        <p className="text-sm text-gray-500">Show notifications within the app</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPreferences.inApp.enabled}
                          onChange={(e) => handlePreferenceChange('inApp.enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">In-App Notifications Only</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            This application uses in-app notifications only. Push notifications are not supported.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Frequency</h3>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'instant', label: 'Instant', description: 'Receive notifications immediately' },
                      { value: 'digest', label: 'Daily Digest', description: 'Receive a summary once per day' },
                      { value: 'weekly', label: 'Weekly Digest', description: 'Receive a summary once per week' }
                    ].map(({ value, label, description }) => (
                      <label key={value} className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="frequency"
                          value={value}
                          checked={localPreferences.frequency.type === value}
                          onChange={(e) => handlePreferenceChange('frequency.type', e.target.value)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{label}</div>
                          <div className="text-sm text-gray-500">{description}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {localPreferences.frequency.type === 'digest' && (
                    <div className="mt-4 ml-7">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digest Time
                      </label>
                      <input
                        type="time"
                        value={localPreferences.frequency.digestTime}
                        onChange={(e) => handlePreferenceChange('frequency.digestTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {localPreferences.frequency.type === 'weekly' && (
                    <div className="mt-4 ml-7">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weekly Day
                      </label>
                      <select
                        value={localPreferences.frequency.weeklyDay}
                        onChange={(e) => handlePreferenceChange('frequency.weeklyDay', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Enable Quiet Hours</h4>
                        <p className="text-sm text-gray-500">Pause notifications during specified hours</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPreferences.quietHours.enabled}
                          onChange={(e) => handlePreferenceChange('quietHours.enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {localPreferences.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={localPreferences.quietHours.startTime}
                            onChange={(e) => handlePreferenceChange('quietHours.startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={localPreferences.quietHours.endTime}
                            onChange={(e) => handlePreferenceChange('quietHours.endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notification Types Tab */}
            {activeTab === 'types' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">In-App Notification Types</h3>
                  <div className="space-y-4">
                    {Object.entries(localPreferences.inApp.types).map(([type, enabled]) => (
                      <div key={type} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getNotificationTypeIcon(type)}</span>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {getNotificationTypeLabel(type)}
                            </h4>
                            <p className="text-xs text-gray-500 capitalize">{type}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => handlePreferenceChange(`inApp.types.${type}`, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}


            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Schedule</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure when and how often you receive notifications
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Schedule Information</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your current notification frequency is set to <strong>{localPreferences.frequency.type}</strong>.
                          {localPreferences.frequency.type === 'digest' && ` You'll receive notifications at ${localPreferences.frequency.digestTime}.`}
                          {localPreferences.frequency.type === 'weekly' && ` You'll receive notifications every ${localPreferences.frequency.weeklyDay}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLocalPreferences({ ...preferences })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
