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
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await productController.getUserOrders(currentPage, itemsPerPage);
      if (res.success) {
        const orders = (res.orders || []).map(o => ({
          _id: o._id,
          status: o.status, // 'pending', 'paid', 'cancelled'
          productId: o.productId,
          totalPrice: o.totalPrice,
          quantity: o.quantity,
          createdAt: o.createdAt,
          hash: '-',
        }));
        setTransactionsData(orders);
        if (typeof res.totalPages === 'number') setTotalPages(res.totalPages)
        if (typeof res.hasNext === 'boolean') setHasNext(res.hasNext)
        if (typeof res.hasPrev === 'boolean') setHasPrev(res.hasPrev)
      }
    };
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  // Filter transactions by status
  const safeTransactions = Array.isArray(transactionsData) ? transactionsData : [];
  const filteredTransactions = safeTransactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  });

  // Server-side pagination: list is already current page
  const currentTransactions = filteredTransactions;

  const handlePrev = () => setCurrentPage(prev => (hasPrev && prev > 1 ? prev - 1 : prev));
  const handleNext = () => setCurrentPage(prev => (hasNext && prev < totalPages ? prev + 1 : prev));

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
    <div className="pt-20 md:ml-64 min-h-screen px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Transaction History</h1>
        <p className="mt-1 text-sm text-gray-600">Review your CampusCoin orders and their current status.</p>
      </div>

      <div className="mb-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        {/* Filter Buttons */}
        <div className="flex items-center border-b border-emerald-100 px-4 py-4">
          <FilterIcon size={16} className="mr-2 text-emerald-600" />
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          <div className="ml-3 space-x-2">
            {['all','pending','paid','cancelled'].map(f => (
              <button
                key={f}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-emerald-100 hover:bg-emerald-50'}`}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
              >
                {f === 'all' ? 'All Orders' : `${f.charAt(0).toUpperCase() + f.slice(1)} Orders`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-hidden">
          <table className="min-w-full table-fixed divide-y divide-emerald-50">
            <thead className="bg-emerald-50/70">
              <tr>
                <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Product</th>
                <th className="w-1/5 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Quantity</th>
                <th className="w-1/5 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Total Price</th>
                <th className="w-1/5 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 bg-white">
              {currentTransactions.map(transaction => {
                const classes = getStatusClasses(transaction.status);
                return (
                  <tr key={transaction._id}>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center">
                        <div className={`mr-2 rounded-full p-1 ${classes.bg}`}>
                          {getStatusIcon(transaction.status, classes.text)}
                        </div>
                        <span className={`text-sm font-semibold ${classes.text}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm text-gray-900">
                      {transaction.productId?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-4 text-center text-sm font-semibold text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
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
                        <CoinsIcon size={16} className="text-emerald-600" />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm text-gray-500">
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

        {/* Pagination Controls (server-side) */}
        {(hasPrev || hasNext || totalPages > 1) && (
          <div className="flex items-center justify-end space-x-2 border-t border-emerald-100 px-4 py-4">
            <button
              onClick={handlePrev}
              disabled={!hasPrev || currentPage === 1}
              className={`rounded px-3 py-1 text-sm font-medium text-gray-700 transition ${
                !hasPrev || currentPage === 1
                  ? 'cursor-default bg-gray-100 opacity-50'
                  : 'bg-white hover:bg-emerald-100'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={!hasNext || currentPage === totalPages}
              className={`rounded px-3 py-1 text-sm font-medium text-gray-700 transition ${
                !hasNext || currentPage === totalPages
                  ? 'bg-gray-100 cursor-default opacity-50'
                  : 'bg-white hover:bg-emerald-100'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {filteredTransactions.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-gray-500">No transactions found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory;
