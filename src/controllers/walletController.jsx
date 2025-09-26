// controllers/walletController.js
import WalletModel from '../models/walletModel';

class WalletController {
  constructor() {
    this.model = new WalletModel();
  }

  async createWallet(privateKey) {
    try {
      const validationError = this.validatePrivateKey(privateKey);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Format private key
      const formattedPrivateKey = this.formatPrivateKey(privateKey);

      const result = await this.model.createWallet({ 
        privateKey: formattedPrivateKey 
      });

      if (result.success) {
        // Cache wallet data locally
        if (result.data) {
          this.model.saveWalletData(result.data);
        }
        return { 
          success: true, 
          message: result.message,
          wallet: result.data 
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to create wallet' 
        };
      }
    } catch (error) {
      console.error('Create wallet error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getBalance() {
    try {
      const result = await this.model.getBalance();
      
      if (result.success) {
        // Update cached wallet data with new balance
        const cachedWallet = this.model.getWalletData();
        if (cachedWallet) {
          cachedWallet.balance = result.data.balance;
          this.model.saveWalletData(cachedWallet);
        }
        
        return { 
          success: true, 
          balance: result.data.balance,
          address: result.data.address,
          balanceWei: result.data.balanceWei,
          network: result.data.network,
          lastUpdated: result.data.lastUpdated
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to fetch balance' 
        };
      }
    } catch (error) {
      console.error('Get balance error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async sendEth(toAddress, amount,orderId) {
    try {
      const validationError = this.validateSendTransaction(toAddress, amount);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const result = await this.model.sendEth({
        toAddress: toAddress.trim(),
        amount: amount.toString(),
        orderId: orderId
      });

      if (result.success) {
        // Update cached balance if new balance is provided
        if (result.newBalance) {
          const cachedWallet = this.model.getWalletData();
          if (cachedWallet) {
            cachedWallet.balance = result.newBalance;
            this.model.saveWalletData(cachedWallet);
          }
        }

        // Clear cached transaction history to force refresh
        this.model.removeTransactionHistory();

        return { 
          success: true, 
          message: result.message,
          transaction: result.data,
          newBalance: result.newBalance
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Transaction failed' 
        };
      }
    } catch (error) {
      console.error('Send ETH error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getTransactionHistory(page = 1, limit = 10) {
    try {
      const result = await this.model.getTransactionHistory(page, limit);
      
      if (result.success) {
        // Cache transaction data if it's the first page
        if (page === 1) {
          this.model.saveTransactionHistory(result.data);
        }
        
        return { 
          success: true, 
          address: result.data.address,
          transactions: result.data.transactions,
          pagination: result.data.pagination
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to fetch transaction history' 
        };
      }
    } catch (error) {
      console.error('Get transaction history error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getWallet() {
    try {
      const result = await this.model.getWallet();
      
      if (result.success) {
        // Update cached wallet data
        if (result.data) {
          this.model.saveWalletData(result.data);
        }
        return { 
          success: true, 
          wallet: result.data 
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to fetch wallet' 
        };
      }
    } catch (error) {
      console.error('Get wallet error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async refreshWalletData() {
    try {
      const walletResult = await this.getWallet();
      if (walletResult.success) {
        const balanceResult = await this.getBalance();
        return {
          success: true,
          wallet: walletResult.wallet,
          balance: balanceResult.success ? balanceResult.balance : '0',
          address: balanceResult.success ? balanceResult.address : null
        };
      }
      return walletResult;
    } catch (error) {
      console.error('Refresh wallet data error:', error);
      return { success: false, error: 'Failed to refresh wallet data' };
    }
  }

  // Auto-reconnect specific methods
  async autoReconnectWallet() {
    try {
      console.log('Starting wallet auto-reconnection...');
      
      // First try to get existing wallet from server
      const walletResult = await this.getWallet();
      
      if (walletResult.success && walletResult.wallet) {
        // Get fresh balance
        const balanceResult = await this.getBalance();
        
        console.log('Wallet auto-reconnected successfully');
        return {
          success: true,
          wallet: walletResult.wallet,
          balance: balanceResult.success ? balanceResult.balance : walletResult.wallet.balance || '0',
          message: 'Wallet reconnected successfully'
        };
      } else {
        console.log('No wallet found for auto-reconnection');
        return {
          success: false,
          error: 'No wallet found for this user',
          hasWallet: false
        };
      }
    } catch (error) {
      console.error('Auto-reconnect wallet error:', error);
      return { 
        success: false, 
        error: 'Failed to auto-reconnect wallet',
        networkError: true
      };
    }
  }

  // Check if user has a wallet (from cache or server)
  async hasWalletOnServer() {
    try {
      const result = await this.model.getWallet();
      return result.success && result.data;
    } catch (error) {
      console.error('Check wallet on server error:', error);
      return false;
    }
  }

  // Validation methods
  validatePrivateKey(privateKey) {
    if (!privateKey) {
      return 'Private key is required';
    }

    if (typeof privateKey !== 'string') {
      return 'Private key must be a string';
    }

    // Remove 0x prefix for length validation
    const keyWithoutPrefix = privateKey.startsWith('0x') 
      ? privateKey.slice(2) 
      : privateKey;

    if (keyWithoutPrefix.length !== 64) {
      return 'Invalid private key format. Must be 64 characters long, with or without 0x prefix';
    }

    // Check if it's a valid hex string
    if (!/^[0-9a-fA-F]+$/.test(keyWithoutPrefix)) {
      return 'Private key must contain only hexadecimal characters';
    }

    return null;
  }

  validateSendTransaction(toAddress, amount) {
    if (!toAddress) {
      return 'Recipient address is required';
    }

    if (!amount) {
      return 'Amount is required';
    }

    if (typeof toAddress !== 'string') {
      return 'Recipient address must be a string';
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return 'Amount must be a positive number';
    }

    // Basic Ethereum address validation
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(toAddress.trim())) {
      return 'Invalid Ethereum address format';
    }

    return null;
  }

  formatPrivateKey(privateKey) {
    // Ensure private key has 0x prefix
    if (!privateKey.startsWith('0x')) {
      return '0x' + privateKey;
    }
    return privateKey;
  }

  // Utility methods
  getCachedWallet() {
    return this.model.getWalletData();
  }

  getCachedTransactions() {
    return this.model.getTransactionHistory();
  }

  hasWallet() {
    const cachedWallet = this.getCachedWallet();
    return !!(cachedWallet && cachedWallet.address);
  }

  clearWalletData() {
    console.log('Clearing wallet data from controller...');
    this.model.removeWalletData();
    this.model.removeTransactionHistory();
  }

  // Get formatted wallet address for display
  getFormattedAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Format amount for display
  formatAmount(amount, decimals = 4) {
    if (!amount) return '0';
    return parseFloat(amount).toFixed(decimals);
  }

  // Format transaction type for display
  getTransactionTypeDisplay(type) {
    const types = {
      'send': 'Sent',
      'receive': 'Received',
      'pending': 'Pending'
    };
    return types[type] || type;
  }

  // Get transaction status color
  getTransactionStatusColor(status) {
    const colors = {
      'confirmed': 'text-green-600',
      'pending': 'text-yellow-600',
      'failed': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }
}

export default new WalletController();

