import React, { useEffect, useState } from 'react'
import { CoinsIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { useBalance } from "./BalanceContext";
import authController from "../../controllers/authController";

const WalletCard = () => {
  const { balance } = useBalance()
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    lastWeek: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await authController.fetchBalanceStats();
      if (res.success && res.data) {
        setStats({
          today: res.data.today || 0,
          thisWeek: res.data.thisWeek || 0,
          lastWeek: res.data.lastWeek || 0,
        });
      } else {
        console.error("Failed to fetch balance stats:", res.error);
      }
    };
    fetchStats();
  }, []);

  const StatBadge = ({ label, value }) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const color = isPositive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-700";
    const sign = isPositive ? "+" : "";

    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${color}`}
      >
        <Icon size={12} />
        <span className="font-medium">{`${sign}${value}`}</span>
        <span className="text-[11px] opacity-80">{label}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold text-gray-700">Your Wallet</h2>

        {/* badge row with good spacing */}
        <div className="flex flex-wrap gap-2">
          <StatBadge label="today" value={stats.today} />
          <StatBadge label="this week" value={stats.thisWeek} />
          <StatBadge label="last week" value={stats.lastWeek} />
        </div>
      </div>

      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-full">
          <CoinsIcon size={24} className="text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900">{balance}</p>
          <p className="text-sm text-gray-500">CampusCoin</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
