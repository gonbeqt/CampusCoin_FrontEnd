import React from 'react';
import ReactDOM from 'react-dom';
import NotificationQuickAccess from './NotificationQuickAccess';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '../views/components/NotificationContext';

const NotificationModal = () => {
  const { isNotificationsOpen, closeNotificationsPanel } = useNotifications();

  if (!isNotificationsOpen) return null;

  // portal to body - render the full NotificationCenter (admin-style)
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeNotificationsPanel}
      />

      <div className="relative w-full max-w-3xl h-[80vh] mt-12 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Notifications</h3>
            <button
              onClick={closeNotificationsPanel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close notifications"
            >
              ×
            </button>
          </div>

          <div className="p-4">
            {/* Render full notification center content */}
            <NotificationCenter />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationModal;
