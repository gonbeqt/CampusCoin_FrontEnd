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
      ? "bg-emerald-100/90 text-emerald-800"
      : "bg-rose-100/90 text-rose-700";
    const sign = isPositive ? "+" : "";

    return (
      <span
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${color}`}
      >
        <Icon size={12} />
        <span className="font-medium">{`${sign}${value}`}</span>
        <span className="text-[11px] opacity-80">{label}</span>
      </span>
    );
  };

  return (
    <div className="cc-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500/80">Balance overview</p>
          <h2 className="text-xl font-semibold text-emerald-900">Your Wallet</h2>
        </div>

        {/* badge row with good spacing */}
        <div className="flex flex-wrap gap-2">
          <StatBadge label="today" value={stats.today} />
          <StatBadge label="this week" value={stats.thisWeek} />
          <StatBadge label="last week" value={stats.lastWeek} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <CoinsIcon size={28} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-500/80">Current Balance</p>
          <p className="text-4xl font-semibold text-emerald-900">{balance}</p>
          <p className="text-sm text-emerald-600">CampusCoin</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
