// services/walletAutoService.js
import WalletController from '../controllers/walletController';
import AuthController from '../controllers/authController';

class WalletAutoService {
  constructor() {
    this.isInitialized = false;
    this.autoReconnectEnabled = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 1000; // 1 second
  }

  // Initialize auto-reconnect service
  init() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    console.log('Wallet Auto Service initialized');
  }

  // Auto-reconnect wallet on login
  async autoReconnectWallet() {
    if (!this.autoReconnectEnabled) return null;

    console.log('Attempting wallet auto-reconnect...');
    this.reconnectAttempts = 0;

    return await this.attemptWalletConnection();
  }

  // Attempt wallet connection with retry logic
  async attemptWalletConnection() {
    try {
      // Check if user is authenticated
      if (!AuthController.isAuthenticated()) {
        console.log('User not authenticated, skipping wallet reconnection');
        return null;
      }

      this.reconnectAttempts++;
      console.log(`Wallet reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      // Try to get existing wallet
      const result = await WalletController.refreshWalletData();
      
      if (result.success && result.wallet) {
        console.log('Wallet auto-reconnected successfully:', {
          address: WalletController.getFormattedAddress(result.wallet.address),
          balance: WalletController.formatAmount(result.balance)
        });
        
        this.reconnectAttempts = 0; // Reset attempts on success
        return {
          success: true,
          wallet: result.wallet,
          balance: result.balance
        };
      } else {
        console.log('No existing wallet found for user');
        return {
          success: false,
          error: 'No wallet found',
          hasWallet: false
        };
      }

    } catch (error) {
      console.error(`Wallet reconnection attempt ${this.reconnectAttempts} failed:`, error);

      // Retry if we haven't exceeded max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Retrying wallet connection in ${this.reconnectDelay}ms...`);
        
        await this.delay(this.reconnectDelay);
        return await this.attemptWalletConnection();
      } else {
        console.error('Max wallet reconnection attempts reached');
        this.reconnectAttempts = 0;
        return {
          success: false,
          error: 'Failed to reconnect wallet after multiple attempts',
          maxAttemptsReached: true
        };
      }
    }
  }

  // Clean up wallet data on logout
  async cleanupWalletData() {
    try {
      console.log('Cleaning up wallet data...');
      
      // Clear cached wallet data
      WalletController.clearWalletData();
      
      // Reset reconnection state
      this.reconnectAttempts = 0;
      
      console.log('Wallet data cleanup completed');
      return { success: true };
      
    } catch (error) {
      console.error('Error during wallet cleanup:', error);
      return { success: false, error: error.message };
    }
  }

  // Check wallet connection status
  async checkWalletStatus() {
    try {
      if (!AuthController.isAuthenticated()) {
        return { connected: false, reason: 'User not authenticated' };
      }

      const cachedWallet = WalletController.getCachedWallet();
      if (!cachedWallet) {
        return { connected: false, reason: 'No cached wallet data' };
      }

      // Verify wallet still exists on server
      const result = await WalletController.getBalance();
      if (result.success) {
        return { 
          connected: true, 
          wallet: cachedWallet,
          balance: result.balance
        };
      } else {
        return { connected: false, reason: 'Server wallet verification failed' };
      }

    } catch (error) {
      console.error('Error checking wallet status:', error);
      return { connected: false, reason: 'Network error' };
    }
  }

  // Enable/disable auto-reconnect
  setAutoReconnectEnabled(enabled) {
    this.autoReconnectEnabled = enabled;
    console.log(`Wallet auto-reconnect ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get auto-reconnect status
  getAutoReconnectStatus() {
    return {
      enabled: this.autoReconnectEnabled,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      initialized: this.isInitialized
    };
  }

  // Set max reconnection attempts
  setMaxReconnectAttempts(attempts) {
    this.maxReconnectAttempts = Math.max(1, attempts);
    console.log(`Max wallet reconnection attempts set to ${this.maxReconnectAttempts}`);
  }

  // Set reconnection delay
  setReconnectDelay(delay) {
    this.reconnectDelay = Math.max(500, delay);
    console.log(`Wallet reconnection delay set to ${this.reconnectDelay}ms`);
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Force reconnect (manual trigger)
  async forceReconnect() {
    console.log('Force wallet reconnection triggered');
    this.reconnectAttempts = 0;
    return await this.autoReconnectWallet();
  }

  // Reset service state
  reset() {
    this.reconnectAttempts = 0;
    this.autoReconnectEnabled = true;
    console.log('Wallet auto service reset');
  }
}

// Export singleton instance
export default new WalletAutoService();