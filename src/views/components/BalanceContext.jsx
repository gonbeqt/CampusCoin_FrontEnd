import { createContext, useContext, useState, useEffect } from "react";
import AuthModel from "../../models/authModel";

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const authModel = new AuthModel();
      const res = await authModel.profile();
      if (res.success) {
        setBalance(res.data.balance ?? 0);
      }
    };
    fetchProfile();
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);