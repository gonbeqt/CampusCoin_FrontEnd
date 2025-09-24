import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart2Icon,
  CalendarIcon,
  ChevronDownIcon,
  CoinsIcon,
  DownloadIcon,
  FilterIcon,
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
import { useUser } from '../../context/UserContext'
// Mock data for sales overview
const salesStats = {
  totalSales: 4850,
  salesCount: 156,
  averageOrder: 31,
  conversionRate: 68,
  comparedToLastMonth: 12.5,
}
// Mock data for sales by month chart
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
// Mock data for sales by category
const categorySalesData = [
  { name: 'Clothing', value: 2500 },
  { name: 'Stationery', value: 1200 },
  { name: 'Electronics', value: 800 },
  { name: 'Accessories', value: 350 },
]
// Mock data for sales transactions
const salesTransactions = [
  {
    id: 'TX12345',
    product: 'University Hoodie',
    student: 'Emma Thompson',
    date: '2023-12-15T14:05:23',
    amount: 120,
    status: 'completed',
  },
  {
    id: 'TX12346',
    product: 'Campus Notebook',
    student: 'Michael Johnson',
    date: '2023-12-14T10:15:45',
    amount: 25,
    status: 'completed',
  },
  {
    id: 'TX12347',
    product: 'Water Bottle',
    student: 'Sophia Williams',
    date: '2023-12-13T09:30:12',
    amount: 15,
    status: 'completed',
  },
  {
    id: 'TX12348',
    product: 'Wireless Earbuds',
    student: 'James Brown',
    date: '2023-12-12T16:42:18',
    amount: 80,
    status: 'completed',
  },
  {
    id: 'TX12349',
    product: 'University T-Shirt',
    student: 'Olivia Davis',
    date: '2023-12-11T11:23:45',
    amount: 30,
    status: 'completed',
  },
  {
    id: 'TX12350',
    product: 'Laptop Sleeve',
    student: 'Ethan Wilson',
    date: '2023-12-10T13:55:20',
    amount: 35,
    status: 'completed',
  },
  {
    id: 'TX12351',
    product: 'University Hoodie',
    student: 'Ava Miller',
    date: '2023-12-09T15:10:33',
    amount: 120,
    status: 'completed',
  },
  {
    id: 'TX12352',
    product: 'Campus Notebook',
    student: 'Noah Taylor',
    date: '2023-12-08T09:05:17',
    amount: 25,
    status: 'completed',
  },
]
// Colors for pie chart
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1']
const Sales = () => {
  const { user } = useUser()
  const [dateFilter, setDateFilter] = useState('This Month')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  // Filter transactions based on search term and status
  const filteredTransactions = salesTransactions.filter((transaction) => {
    const matchesSearch = 
      transaction.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = 
      statusFilter === 'All' || 
      transaction.status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })
  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-gray-600">
          Track your store's performance and sales analytics
        </p>
      </div>
      {/* Date range filter */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CalendarIcon size={16} />
              <span>{dateFilter}</span>
              <ChevronDownIcon size={16} />
            </button>
          </div>
        </div>
        <div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
            <DownloadIcon size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CoinsIcon className="w-5 h-5 mr-1 text-yellow-500" />
                {salesStats.totalSales}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CoinsIcon size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" />
              {salesStats.comparedToLastMonth}% vs last month
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{salesStats.salesCount}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart2Icon size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" />
              8.2% vs last month
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Average Order</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CoinsIcon className="w-5 h-5 mr-1 text-yellow-500" />
                {salesStats.averageOrder}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSignIcon size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium flex items-center">
              <TrendingDownIcon size={16} className="mr-1" />
              3.1% vs last month
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold mt-1">{salesStats.conversionRate}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChartIcon size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" />
              5.3% vs last month
            </span>
          </div>
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Monthly Sales Trend</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">This Year</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">Last Year</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySalesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} coins`, 'Sales']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="sales" fill="#3B82F6" name="Sales (CampusCoins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Sales by Category</h2>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} coins`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {categorySalesData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="text-xs text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            <div className="flex flex-wrap items-center gap-3">
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.product}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.student}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
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
                        {transaction.amount}
                      </div>
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
                    No transactions found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredTransactions.length}</span> of{" "}
            <span className="font-medium">{salesTransactions.length}</span> transactions
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-4 py-2 border border-blue-500 bg-blue-500 rounded-md text-sm text-white hover:bg-blue-600">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Sales