import React from 'react'
import { CoinsIcon, TrendingUpIcon } from 'lucide-react'
const WalletCard = ({ balance }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Your Wallet</h2>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
          <TrendingUpIcon size={12} className="mr-1" /> +75 this week
        </span>
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
      <div className="mt-4">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
          Redeem Rewards
        </button>
      </div>
    </div>
  )
}
export default WalletCard