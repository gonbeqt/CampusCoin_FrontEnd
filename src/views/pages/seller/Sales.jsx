import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import YearSelector from '../../../views/components/yearSelector';
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
  PackageIcon,
  ShoppingCartIcon,
  PercentIcon,
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
  Cell,
  LineChart,
  Line
} from 'recharts'
import { motion, AnimatePresence} from "framer-motion";
// Import your controllers
import WalletController from '../../../controllers/walletController'
import ProductController from '../../../controllers/productController'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444', '#8B5CF6']

const Sales = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    salesCount: 0,
    avgOrder: 0,
    conversion: 0,
    totalProducts: 0,
    totalStocks: 0,
    totalSalesProduct: 0,
    totalRevenue: 0,
    monthlySales: [],
    salesByCategory: {}
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState([])

  // Transaction states
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get auth token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || user?.token
  }

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const token = getAuthToken()
      const result = await ProductController.getDashboardStats(token)
      
      if (result.success) {
        const statsData = result.stats || result

        // Detect available years from monthly sales
        const years = Object.keys(statsData.salesByCategory || {}).map(Number);
        setAvailableYears(years.sort((a, b) => a - b))
        setDashboardStats(statsData)

        // Default to the latest available year if possible
        if (years.length > 0) {
          setCurrentYear(Math.max(...years))
        }

      } else {
        setStatsError(result.error)
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setStatsError('Failed to load dashboard statistics')
    } finally {
      setStatsLoading(false)
    }
  }

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
    fetchDashboardStats()
    fetchTransactions(pagination.page, pagination.limit)
  }, [])

  useEffect(() => {
    fetchTransactions(pagination.page, pagination.limit)
  }, [pagination.page])

  // Filtering
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      (transaction.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      transaction.type?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const filteredMonthlySales = months.map(month => {
    const found = dashboardStats.monthlySales?.find(
      item => item.year === currentYear && item.month === month
    )
    return found || { year: currentYear, month, totalETH: 0, totalProducts: 0 }
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

  const getCategorySalesData = (year) => {
    if (!dashboardStats.salesByCategory || !dashboardStats.salesByCategory[year]) return [];

    return Object.entries(dashboardStats.salesByCategory[year])
      .map(([category, data]) => ({
        name: category,
        value: data.totalETH || 0,
        totalSold: data.totalSold || 0,
        bestSeller: data.bestSeller || null,
      }))
      .filter(item => item.value > 0);
  };

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-gray-600">
          Track your store's performance and sales analytics
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : statsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-600">Error loading dashboard stats: {statsError}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <h3 className="text-xl font-bold flex items-center">
                  <CoinsIcon size={20} className="mr-2 text-blue-500" />
                  {dashboardStats.totalSales || 0} ETH
                </h3>
              </div>
              <DollarSignIcon className="text-green-500" size={28} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sales Count</p>
                <h3 className="text-xl font-bold">{dashboardStats.salesCount || 0}</h3>
              </div>
              <BarChart2Icon className="text-blue-500" size={28} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Order</p>
                <h3 className="text-xl font-bold flex items-center">
                  <CoinsIcon size={16} className="mr-1 text-yellow-500" />
                  {dashboardStats.avgOrder || 0} ETH
                </h3>
              </div>
              <TrendingUpIcon className="text-yellow-500" size={28} />
            </div>
            {/* Year Selector */}
            <div className="flex items-center justify-end mb-2">
              <YearSelector
                availableYears={availableYears}
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
            </div>
          </div>   
        
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-focus-outline">
            {/* Monthly Sales Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow"
              onMouseDown={(e) => e.preventDefault()}
              onFocus={(e) => e.target.blur()}
              >
              <h2 className="text-lg font-semibold mb-4">Monthly Sales (ETH & Products)</h2>
              {Array.isArray(filteredMonthlySales) && filteredMonthlySales.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredMonthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const eth = payload.find((p) => p.dataKey === 'totalETH')?.value ?? 0;
                            const products = payload.find((p) => p.dataKey === 'totalProducts')?.value ?? 0;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-semibold text-gray-800 mb-1">{label}</p>
                                <p className="text-blue-600 text-sm">
                                  💰 Total ETH: <span className="font-semibold">{eth.toFixed(6)}</span>
                                </p>
                                <p className="text-green-600 text-sm">
                                  📦 Products Sold: <span className="font-semibold">{products}</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalETH"
                        name="ETH Sales"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalProducts"
                        name="Products Sold"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No monthly sales data available
                </div>
              )}
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow"   
              onMouseDown={(e) => e.preventDefault()}
              onFocus={(e) => e.target.blur()}
              >
              <h2 className="text-lg font-semibold mb-4">Sales by Category (ETH)</h2>
              {getCategorySalesData(currentYear).length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategorySalesData(currentYear)}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value.toFixed(6)} ETH`}
                      >
                        {getCategorySalesData(currentYear).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>

                      {/* Detailed Tooltip */}
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const category = payload[0].name
                            const data = dashboardStats.salesByCategory?.[currentYear]?.[category]
                            if (!data) return null
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-semibold text-gray-800 mb-1">{category}</p>
                                <p className="text-blue-600 text-sm">
                                  💰 Total ETH: <span className="font-semibold">{data.totalETH.toFixed(6)}</span>
                                </p>
                                <p className="text-green-600 text-sm">
                                  📦 Total Sold: <span className="font-semibold">{data.totalSold}</span>
                                </p>
                                <p className="text-purple-600 text-sm">
                                  ⭐ Best Seller: <span className="font-semibold">{data.bestSeller?.name}</span> ({data.bestSeller?.sold})
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No category sales data available
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Transactions Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {transaction.fromAddress?.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{transaction.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(transaction.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center">
                        <CoinsIcon size={14} className="mr-1 text-blue-600" />
                        {transaction.amount} ETH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${transaction.type === 'receive' ? 'bg-green-100 text-green-800' : 
                            transaction.type === 'Cancelled' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {transaction.transactionHash?.substring(0, 10)}...
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