import React, { useEffect, useState } from 'react'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XIcon,
  FilterIcon,
  CoinsIcon
} from 'lucide-react'
import productController from '../../../controllers/productController';

const TransactionHistory = ({ user }) => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await productController.getUserOrders();
      if (res.success) {
        const orders = res.orders.map(o => ({
          _id: o._id,
          status: o.status, // 'pending', 'paid', 'cancelled'
          productId: o.productId,
          totalPrice: o.totalPrice,
          quantity: o.quantity,
          createdAt: o.createdAt,
          hash: '-',
        }));
        setTransactionsData(orders);
      }
    };
    fetchOrders();
  }, []);

  // Filter transactions by status
  const safeTransactions = Array.isArray(transactionsData) ? transactionsData : [];
  const filteredTransactions = safeTransactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Clamp currentPage if filtered data shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Tailwind classes based on status
  const getStatusClasses = (status) => {
    if (status === 'pending') return { bg: 'bg-yellow-100', text: 'text-yellow-600', sign: '-' };
    if (status === 'paid') return { bg: 'bg-green-100', text: 'text-green-600', sign: '-' };
    if (status === 'cancelled') return { bg: 'bg-red-100', text: 'text-red-600', sign: '+' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', sign: '' };
  }

  // Icon based on status
  const getStatusIcon = (status, textClass) => {
    if (status === 'paid') return <ArrowUpIcon size={14} className={textClass} />;
    if (status === 'pending') return <ArrowDownIcon size={14} className={textClass} />;
    if (status === 'cancelled') return <XIcon size={14} className={textClass} />;
    return null;
  };

  return (
    <div className="pt-16 md:ml-64">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-gray-600">View your CampusCoin transaction records</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        {/* Filter Buttons */}
        <div className="p-4 border-b flex items-center">
          <FilterIcon size={16} className="text-gray-500 mr-2" />
          <span className="text-gray-700 font-medium">Filter:</span>
          <div className="ml-3 space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setFilter('pending')}
            >
              Pending Orders
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setFilter('paid')}
            >
              Paid Orders
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${filter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled Orders
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-hidden">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Product Name</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5 text-center">Quantity</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5 text-center">Total Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map(transaction => {
                const classes = getStatusClasses(transaction.status);
                return (
                  <tr key={transaction._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-1 rounded-full mr-2 ${classes.bg}`}>
                          {getStatusIcon(transaction.status, classes.text)}
                        </div>
                        <span className={`text-sm font-medium ${classes.text}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-gray-900">
                      {transaction.productId?.name || '-'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-black">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span
                          className={`font-semibold ${
                            transaction.status === "paid" || transaction.status === "pending"
                              ? "text-red-600"
                              : transaction.status === "cancelled"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {transaction.status === "paid" || transaction.status === "pending"
                            ? `-${transaction.totalPrice}`
                            : transaction.status === "cancelled"
                            ? `+${transaction.totalPrice}`
                            : transaction.totalPrice}
                        </span>
                        <CoinsIcon size={16} className="text-blue-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
          <div className="text-sm text-gray-700">
            Showing {(filteredTransactions.length === 0) ? 0 : ( (currentPage - 1) * PAGE_SIZE + 1 )} to {Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">Page {currentPage} / {totalPages}</div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              Next
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No transactions found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory;
