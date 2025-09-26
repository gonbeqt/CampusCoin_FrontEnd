import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart2Icon,
  CalendarIcon,
  ChevronDownIcon,
  CoinsIcon,
  DownloadIcon,
  PieChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  SearchIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// import your transaction controller/service
import WalletController from '../../../controllers/walletController'

// Mock data (KEEP stats/charts)
const salesStats = {
  totalSales: 4850,
  salesCount: 156,
  averageOrder: 31,
  conversionRate: 68,
  comparedToLastMonth: 12.5,
}
const monthlySalesData = [
  { name: 'Jan', sales: 1200 },
  { name: 'Feb', sales: 1900 },
  { name: 'Mar', sales: 2100 },
  { name: 'Apr', sales: 1500 },
  { name: 'May', sales: 1800 },
  { name: 'Jun', sales: 2400 },
  { name: 'Jul', sales: 2200 },
  { name: 'Aug', sales: 3100 },
  { name: 'Sep', sales: 2900 },
  { name: 'Oct', sales: 3300 },
  { name: 'Nov', sales: 3500 },
  { name: 'Dec', sales: 4850 },
]
const categorySalesData = [
  { name: 'Clothing', value: 2500 },
  { name: 'Stationery', value: 1200 },
  { name: 'Electronics', value: 800 },
  { name: 'Accessories', value: 350 },
]
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1']

const Sales = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Transaction states
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch transactions
  const fetchTransactions = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WalletController.getTransactionHistory(page, limit)
      if (result.success) {
        setTransactions(result.transactions)
        setPagination(result.pagination)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(pagination.page, pagination.limit)
  }, [pagination.page])

  // Filtering
  const filteredTransactions = transactions.filter((transaction) => {
  const matchesSearch =
    (transaction.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()))

  const matchesStatus =
    statusFilter === 'All' ||
    transaction.status?.toLowerCase() === statusFilter.toLowerCase()

  return matchesSearch && matchesStatus
})
  // Handle pagination
  const handlePrevious = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
    }
  }
  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-gray-600">
          Track your store's performance and sales analytics
        </p>
      </div>

      {/* 🔹 Keep ALL your existing stats, charts, and UI */}
      {/* ... (Stats cards + Charts code remains the same as your snippet) ... */}

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <SearchIcon 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDownIcon 
                  size={16} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.fromAddress}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.student}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center">
                        <CoinsIcon size={14} className="mr-1 text-blue-600" />
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page <span className="font-medium">{pagination.page}</span> of{" "}
            <span className="font-medium">{pagination.totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevious}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={handleNext}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-blue-500 bg-blue-500 rounded-md text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales
