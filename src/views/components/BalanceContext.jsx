// BalanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthModel from '../../models/authModel';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  // Function to fetch balance from backend
  const refreshBalance = async () => {
    try {
      const authModel = new AuthModel();
      const res = await authModel.profile();
      if (res.success) {
        setBalance(res.data.balance ?? 0);
      }
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  // Fetch balance once on mount
  useEffect(() => {
    refreshBalance();
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

// Custom hook
export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};
