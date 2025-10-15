import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import ProductController from '../../../controllers/productController';
import WalletController from '../../../controllers/walletController';

// ✅ Toast notification component
function Toast({ message, type, show }) {
  return (
    <div
      className={`fixed top-6 right-6 z-[9999] transition-transform duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-3 rounded shadow-lg min-w-[200px] text-center pointer-events-none`}
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}
    >
      {message}
    </div>
  );
}

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'cancelled'
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToAction, setOrderToAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // ✅ Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };


  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('authToken');
      const result = await ProductController.getAllOrders(token);
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      setError("Failed to fetch orders");
      showToast("Failed to fetch orders", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Handle paying a reward
  const handlePayClick = (order) => {
    setOrderToAction(order);
    setShowPayModal(true);
  };

  const confirmPayOrder = async () => {
    if (!orderToAction) return;
    try {
      const result = await WalletController.sendEth(
        orderToAction.walletAddress,
        orderToAction.price_eth,
        orderToAction._id || orderToAction.id
      );

      if (result.success) {
        showToast(`Payment successful! Tx: ${result.transaction?.hash || 'N/A'}`, 'success');
        setOrders((prev) =>
          prev.map((o) =>
            o._id === (orderToAction._id || orderToAction.id) ? { ...o, status: 'paid' } : o
          )
        );
      } else {
        showToast(result.error || 'Payment failed', 'error');
      }
    } catch (err) {
      showToast('Error sending payment: ' + err.message, 'error');
    } finally {
      setShowPayModal(false);
      setOrderToAction(null);
    }
  };

  // ✅ Handle cancel order modal
  const handleCancelClick = (order) => {
    setOrderToAction(order);
    setShowCancelModal(true);
  };

  // ✅ Confirm cancel order
  const confirmCancelOrder = async () => {
    if (!orderToAction) return;
    const token = localStorage.getItem('authToken');
    try {
      const result = await ProductController.cancelOrder(orderToAction._id || orderToAction.id, token);
      if (result.success) {
        showToast(result.message, 'success');
        setOrders((prev) =>
          prev.map((o) =>
            o._id === (orderToAction._id || orderToAction.id) ? { ...o, status: 'cancelled' } : o
          )
        );
      } else {
        showToast(result.error, 'error');
      }
    } catch (err) {
      showToast('Error cancelling order: ' + err.message, 'error');
    } finally {
      setShowCancelModal(false);
      setOrderToAction(null);
    }
  };

  // Filter orders
  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.buyerFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.rewardTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Pagination logic (must be after filteredOrders)
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="pt-16 md:ml-64 min-h-screen ">
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600">Manage student reward redemption orders</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        {/* Filters */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <FilterIcon size={16} className="text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">Status:</span>
              <div className="ml-3 space-x-2">
                {['all', 'pending', 'paid', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === status
                      ? status === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : status === 'paid'
                          ? 'bg-green-600 text-white'
                          : status === 'cancelled'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Student Name', 'Cost', 'Date', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order._id || order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id || order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.buyerFullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {order.price_eth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-900 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
                          onClick={() => handlePayClick(order)}
                          title="Mark as Paid"
                        >
                          <CheckCircleIcon size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                          onClick={() => handleCancelClick(order)}
                          title="Cancel Order"
                        >
                          <XCircleIcon size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            

          </table>
          {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
              <div className="flex justify-between items-center w-full p-4 border-t bg-gray-50">
                <div className="flex-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    Previous
                  </button>
                </div>

                <div className="flex-1 text-center">
                  <span className="text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="flex-1 text-right">
                  <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>Next</button>
                </div>
              </div>
            )}
        </div>

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* ✅ Pay Confirmation Modal */}
      {showPayModal && orderToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Payment</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-700 text-center">
                Mark order <strong>{orderToAction._id || orderToAction.id}</strong> as paid?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowPayModal(false);
                    setOrderToAction(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  onClick={confirmPayOrder}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Cancel Confirmation Modal */}
      {showCancelModal && orderToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Cancel Order</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-700 text-center">
                Are you sure you want to cancel order{' '}
                <strong>{orderToAction._id || orderToAction.id}</strong>?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowCancelModal(false);
                    setOrderToAction(null);
                  }}
                >
                  Back
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  onClick={confirmCancelOrder}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
