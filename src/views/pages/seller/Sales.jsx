import React, { useState, useEffect, useMemo } from 'react'
import YearSelector from '../../../views/components/yearSelector'
import {
  BarChart2Icon,
  ChevronDownIcon,
  CoinsIcon,
  DollarSignIcon,
  SearchIcon,
  TrendingUpIcon,
} from 'lucide-react'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'

import WalletController from '../../../controllers/walletController'
import ProductController from '../../../controllers/productController'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444', '#8B5CF6']

const Sales = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    salesCount: 0,
    avgOrder: 0,
    monthlySales: [],
    salesByCategory: {},
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState([])

  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getAuthToken = () => localStorage.getItem('authToken') || user?.token

  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const token = getAuthToken()
      const result = await ProductController.getDashboardStats(token)
      if (result?.success) {
        const statsData = result.stats || result
        const years = Object.keys(statsData.salesByCategory || {}).map(Number)
        setAvailableYears(years.sort((a, b) => a - b))
        setDashboardStats(statsData)
        if (years.length > 0) setCurrentYear(Math.max(...years))
      } else {
        setStatsError(result?.error || 'Failed to load stats')
      }
    } catch (err) {
      console.error(err)
      setStatsError('Failed to load dashboard statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchTransactions = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    try {
      const result = await WalletController.getTransactionHistory(page, limit)
      if (result?.success) {
        setTransactions(result.transactions || [])
        setPagination(result.pagination || { page: 1, limit, totalPages: 1 })
      } else {
        setError(result?.error || 'Failed to fetch transactions')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    fetchTransactions(pagination.page, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchTransactions(pagination.page, pagination.limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page])

  const months = useMemo(
    () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    []
  )

  const filteredMonthlySales = months.map((month) => {
    const found = dashboardStats.monthlySales?.find((item) => item.year === currentYear && item.month === month)
    return found || { year: currentYear, month, totalETH: 0, totalProducts: 0 }
  })

  const filteredTransactions = transactions.filter((transaction) => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !q ||
      (transaction.productName && transaction.productName.toLowerCase().includes(q)) ||
      (transaction.fromAddress && transaction.fromAddress.toLowerCase().includes(q)) ||
      (transaction.transactionHash && transaction.transactionHash.toLowerCase().includes(q))

    const matchesStatus = statusFilter === 'All' || (transaction.type && transaction.type.toLowerCase() === statusFilter.toLowerCase())

    return matchesSearch && matchesStatus
  })

  const handlePrevious = () => {
    if (pagination.page > 1) setPagination((p) => ({ ...p, page: p.page - 1 }))
  }
  const handleNext = () => {
    if (pagination.page < pagination.totalPages) setPagination((p) => ({ ...p, page: p.page + 1 }))
  }

  const getCategorySalesData = (year) => {
    if (!dashboardStats.salesByCategory || !dashboardStats.salesByCategory[year]) return []
    return Object.entries(dashboardStats.salesByCategory[year])
      .map(([category, data]) => ({ name: category, value: data.totalETH || 0, totalSold: data.totalSold || 0, bestSeller: data.bestSeller }))
      .filter((i) => i.value > 0)
  }

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-gray-600">Track your store's performance and sales analytics</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse" />
          ))}
        </div>
      ) : statsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-600">Error loading dashboard stats: {statsError}</p>
          <button onClick={fetchDashboardStats} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <h3 className="text-xl font-bold flex items-center">
                  <CoinsIcon size={20} className="mr-2 text-emerald-500" />
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

            <div className="flex items-center justify-end mb-2">
              <YearSelector availableYears={availableYears} currentYear={currentYear} setCurrentYear={setCurrentYear} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Monthly Sales (ETH & Products)</h2>
              {filteredMonthlySales.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredMonthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="totalETH" name="ETH Sales" stroke={COLORS[0]} strokeWidth={2} />
                      <Line type="monotone" dataKey="totalProducts" name="Products Sold" stroke={COLORS[1]} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">No monthly sales data available</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Sales by Category (ETH)</h2>
              {getCategorySalesData(currentYear).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={getCategorySalesData(currentYear)} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                      {getCategorySalesData(currentYear).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">No category sales data available</div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search transactions..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="relative">
                <select className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDownIcon size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{t.fromAddress?.substring(0, 10)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap">{t.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(t.updatedAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center"><CoinsIcon size={14} className="mr-1 text-blue-600" />{t.amount} ETH</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'receive' ? 'bg-green-100 text-green-800' : t.type === 'Cancelled' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {t.type ? t.type.charAt(0).toUpperCase() + t.type.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{t.transactionHash?.substring(0, 10)}...</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span></div>
          <div className="flex space-x-2">
            <button onClick={handlePrevious} disabled={pagination.page === 1} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={handleNext} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 border border-emerald-500 bg-emerald-500 rounded-md text-sm text-white hover:bg-emerald-600 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales