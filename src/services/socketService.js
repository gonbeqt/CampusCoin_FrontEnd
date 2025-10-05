// Socket.IO Service for handling real-time notifications
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.IO server
  connect() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found for socket connection');
      return;
    }

    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      autoConnect: true
    });

    this.setupEventListeners();
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to notification server');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification server:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('error', error);
    });

    // Notification events
    this.socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      this.emit('new_notification', notification);
    });

    this.socket.on('notification_updated', (data) => {
      console.log('Notification updated:', data);
      this.emit('notification_updated', data);
    });

    this.socket.on('notification_read', (data) => {
      console.log('Notification marked as read:', data);
      this.emit('notification_read', data);
    });

    this.socket.on('notification_important_updated', (data) => {
      console.log('Notification importance updated:', data);
      this.emit('notification_important_updated', data);
    });

    this.socket.on('notification_deleted', (data) => {
      console.log('Notification deleted:', data);
      this.emit('notification_deleted', data);
    });
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  // Socket actions
  markNotificationAsRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  markNotificationAsImportant(notificationId, isImportant) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_important', { notificationId, isImportant });
    }
  }

  deleteNotification(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete_notification', { notificationId });
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
