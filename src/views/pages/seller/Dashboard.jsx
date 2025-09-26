import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PackageIcon,
  TrendingUpIcon,
  UsersIcon,
  CoinsIcon,
  BarChart2Icon,
  PlusCircleIcon,
} from 'lucide-react'
import WalletConnect from '../../../views/components/WalletConnect'
import productController from '../../../controllers/productController'
import authController from '../../../controllers/authController'
import walletController from '../../../controllers/walletController'
const SellerDashboard = ({ user }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0, totalRevenue: 0 })
  const [sellerProfile, setSellerProfile] = useState(user)
  const [recentTransactions, setRecentTransactions] = useState([])

  useEffect(() => {
    const loadStats = async () => {
      const token = localStorage.getItem('authToken')
      const res = await productController.getDashboardStats(token)

      if (res.success) {
        setStats(res.stats)
      } else {
        console.error('Failed to fetch stats:', res.error)
      }
    }

    const loadProfile = async () => {
      const result = await authController.fetchUserProfile()
      if (result.success) {
        setSellerProfile(result.user)
      } else {
        console.error('Failed to fetch seller profile:', result.error)
      }
    }

    const loadTransactions = async () => {
      const token = localStorage.getItem('authToken')
      const res = await walletController.getTransactionHistory(token)

      if (res.success) {
        // only keep the latest 5
        setRecentTransactions(res.transactions.slice(0, 5))
      } else {
        console.error('Failed to fetch recent transactions:', res.error)
      }
    }

    loadStats()
    loadProfile()
    loadTransactions()
  }, [])

  const handleWalletConnect = (balance) => {
    setIsWalletConnected(true)
    setWalletBalance(balance)
  }

  return (
    <div className="pt-16 md:ml-64">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {sellerProfile?.name}. Here's an overview of your store.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <WalletConnect
            onConnect={handleWalletConnect}
            isConnected={isWalletConnected}
            walletBalance={walletBalance}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Products</p>
              <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <PackageIcon size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" />  active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CoinsIcon className="w-5 h-5 mr-1 text-yellow-500" /> {stats.totalRevenue}  ETH
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CoinsIcon size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
              <Link
                to="/seller/sales"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tx.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tx.updatedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {tx.amount}
                        </td>
                       
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No recent transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div>
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/seller/products/add"
                className="flex items-center w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                <PlusCircleIcon size={18} className="mr-2" />
                Add new product
              </Link>
              <Link
                to="/seller/products"
                className="flex items-center w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                <PackageIcon size={18} className="mr-2" />
                Manage inventory
              </Link>
              <Link
                to="/seller/sales"
                className="flex items-center w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
              >
                <BarChart2Icon size={18} className="mr-2" />
                View sales reports
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Store Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Seller Name</p>
                <p className="font-medium">{sellerProfile?.first_name} {sellerProfile?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Store ID</p>
                <p className="font-medium">{sellerProfile?._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{sellerProfile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </p>
              </div>
              <Link
                to="/seller/profile"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
