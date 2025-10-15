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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/45"
        onClick={closeNotificationsPanel}
      />

      <div
        className="relative z-10 flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl sm:max-h-[80vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
      >
        <div className="flex items-center justify-between border-b border-emerald-100 px-6 py-4">
          <h3 id="notification-modal-title" className="text-lg font-semibold text-emerald-900">Notifications</h3>
          <button
            onClick={closeNotificationsPanel}
            className="rounded-full bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <NotificationCenter />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationModal;
