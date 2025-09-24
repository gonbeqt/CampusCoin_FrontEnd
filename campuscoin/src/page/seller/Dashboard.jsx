import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PackageIcon,
  TrendingUpIcon,
  UsersIcon,
  CoinsIcon,
  BarChart2Icon,
  PlusCircleIcon,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import WalletConnect from '../../components/WalletConnect'
// Mock data
const stats = {
  totalProducts: 24,
  activeProducts: 18,
  totalSales: 156,
  totalRevenue: 4500,
  topSellingProduct: 'University Hoodie',
}
const recentSales = [
  {
    id: '1',
    product: 'University Hoodie',
    student: 'Emma Thompson',
    date: '2023-10-15T14:05:23',
    amount: 120,
  },
  {
    id: '2',
    product: 'Campus Notebook',
    student: 'Michael Johnson',
    date: '2023-10-14T10:15:45',
    amount: 25,
  },
  {
    id: '3',
    product: 'Water Bottle',
    student: 'Sophia Williams',
    date: '2023-10-13T09:30:12',
    amount: 15,
  },
]
const SellerDashboard = () => {
  const { user } = useUser()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
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
            Welcome, {user?.name}. Here's an overview of your store.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
              <TrendingUpIcon size={16} className="mr-1" />{' '}
              {stats.activeProducts} active
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold mt-1">{stats.totalSales}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CoinsIcon className="w-5 h-5 mr-1 text-yellow-500" />{' '}
                {stats.totalRevenue}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CoinsIcon size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Recent Sales
              </h2>
              <Link
                to="/seller/sales"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all sales
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Student
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.product}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {sale.student}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(sale.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 flex items-center">
                          <CoinsIcon size={14} className="mr-1" />
                          {sale.amount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Quick Actions
              </h2>
            </div>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Store Information
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Store ID</p>
                <p className="font-medium">{user?.storeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SellerDashboard