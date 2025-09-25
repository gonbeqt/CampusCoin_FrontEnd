const API_URL = 'http://localhost:5000/api/wallet';

class WalletModel {
  async createWallet(walletData) {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(walletData),
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result.wallet || null,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getBalance() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_URL}/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        data: response.ok ? result : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async sendEth(transactionData) {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message,
        error: response.ok ? null : result.error || result.message,
        data: result.transaction || null,
        newBalance: result.newBalance || null,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getTransactionHistory(page = 1, limit = 10) {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_URL}/transactions?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        data: response.ok ? result : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getWallet() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${API_URL}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        data: response.ok ? result.wallet : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Helper methods for token management
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Local storage methods for wallet data caching
  saveWalletData(walletData) {
    localStorage.setItem('walletData', JSON.stringify(walletData));
  }

  getWalletData() {
    const walletData = localStorage.getItem('walletData');
    return walletData ? JSON.parse(walletData) : null;
  }

  removeWalletData() {
    localStorage.removeItem('walletData');
  }

  // Transaction data caching
  saveTransactionHistory(transactions) {
    localStorage.setItem('transactionHistory', JSON.stringify(transactions));
  }

  getLocalStorageTransactionHistory() {
    const transactions = localStorage.getItem('transactionHistory');
    return transactions ? JSON.parse(transactions) : null;
  }

  removeTransactionHistory() {
    localStorage.removeItem('transactionHistory');
  }
}

export default WalletModel;