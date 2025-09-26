import React, { useState, useEffect } from 'react'
import { CoinsIcon, SearchIcon, PlusCircle, MinusCircle } from 'lucide-react'
import { useBalance } from "../../components/BalanceContext";
import productController from '../../../controllers/productController';

const categoryMapping = {
  'All': 'All',
  'Foods': 'FOOD',
  'Books': 'BOOKS',
  'Clothing': 'CLOTHING',
  'Stationery': 'STATIONERY'
}

const reverseCategoryMapping = {
  'FOOD': 'Foods',
  'BOOKS': 'Books',
  'CLOTHING': 'Clothing',
  'STATIONERY': 'Stationery'
}

const displayCategories = ['All', 'Foods', 'Books', 'Clothing', 'Stationery']

const formatCategory = (dbCategory) => {
  return reverseCategoryMapping[dbCategory] || dbCategory;
}

const RewardMarketplace = ({ user }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [redeemStates, setRedeemStates] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { balance } = useBalance()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await productController.getAllProducts();
        if (result.success) {
          // console.log('Product data example:', result.products[0]); // Debug log
          setProducts(result.products);
          // Initialize quantities and redeem states
          const initialQuantities = {}
          const initialRedeemStates = {}
          result.products.forEach(product => {
            initialQuantities[product._id] = product.stockQuantity > 0 ? 1 : 0
            initialRedeemStates[product._id] = false
          })
          setQuantities(initialQuantities)
          setRedeemStates(initialRedeemStates)
          setLoading(false)
        } else {
          setError(result.error)
          setLoading(false)
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])
  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(prev[productId] + delta, products.find(p => p._id === productId).stockQuantity))
    }))
  }

  const handleRedeem = (productId) => {
    setRedeemStates(prev => ({
      ...prev,
      [productId]: true
    }))
  }

  const handleConfirm = async (productId) => {
    try {
      // Debug log before creating order
      console.log('Attempting to create order:', {
        productId,
        quantity: quantities[productId],
        token: localStorage.getItem('authToken')
      });

      const orderResult = await productController.createOrder(productId, quantities[productId]);
      console.log('Order result:', orderResult); // Debug log order result

      if (orderResult.success) {
        // Refresh products after successful order
        const result = await productController.getAllProducts();
        if (result.success) {
          setProducts(result.products);
          setRedeemStates(prev => ({
            ...prev,
            [productId]: false
          }));
          // Show success message
          setError(null);
        }
      } else {
        console.error('Error creating order:', orderResult.error);
        // Show error message to user
        setError(orderResult.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  }

  const handleCancel = (productId) => {
    setRedeemStates(prev => ({
      ...prev,
      [productId]: false
    }))
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All' || product.category === categoryMapping[selectedCategory]
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // First sort by stock status (in stock items first)
      if ((a.stockQuantity === 0) !== (b.stockQuantity === 0)) {
        return a.stockQuantity === 0 ? 1 : -1
      }
      // Then sort by stock quantity (high to low for in-stock items)
      if (a.stockQuantity !== b.stockQuantity) {
        return b.stockQuantity - a.stockQuantity
      }
      // Finally sort by name for items with same stock status
      return a.name.localeCompare(b.name)
    })
  return (
    <div className="pt-16 md:ml-64">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reward Marketplace
          </h1>
          <p className="text-gray-600">
            Redeem your CampusCoin for exciting rewards
          </p>
        </div>
        <div className="bg-blue-100 px-4 py-2 rounded-lg flex items-center">
          <CoinsIcon size={20} className="text-blue-600 mr-2" />
          <span className="font-semibold text-blue-800">
            {balance} CampusCoin
          </span>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search rewards..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {displayCategories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow overflow-hidden w-full"
            >
              <div className="h-36 relative overflow-hidden group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative">
                <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white"></div>
                <div className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 flex-wrap justify-end flex-shrink-0">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {formatCategory(product.category)}
                      </span>
                      {product.stockQuantity <= 2 && product.stockQuantity > 0 && (
                        <>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 animate-pulse">
                            Low Stock
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-red-800 shadow-sm">
                            Stock: {product.stockQuantity}
                          </span>
                        </>
                      )}
                      {product.stockQuantity === 3 && (
                        <>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Medium Stock
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-yellow-800 shadow-sm">
                            Stock: {product.stockQuantity}
                          </span>
                        </>
                      )}
                      {product.stockQuantity >= 4 && (
                        <>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            High Stock
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-green-800 shadow-sm">
                            Stock: {product.stockQuantity}
                          </span>
                        </>
                      )}
                      {product.stockQuantity === 0 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 mb-3">
                    <p className="text-gray-600 text-sm line-clamp-2 flex-grow mr-4">{product.description}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleQuantityChange(product._id, -1)}
                        disabled={product.stockQuantity === 0}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transform transition-all duration-200 ${
                          product.stockQuantity === 0 
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 hover:scale-110 active:scale-95'
                        }`}
                      >
                        <MinusCircle size={18} />
                      </button>
                      <div className="w-7 h-7 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gray-50 rounded-lg opacity-75"></div>
                        <div className="relative h-7 w-7 flex items-center justify-center overflow-visible">
                          <div 
                            key={quantities[product._id]}
                            className={`font-semibold text-base ${
                              product.stockQuantity === 0 ? 'text-gray-400' : 'text-gray-700'
                            } animate-numberIn`}
                          >
                            {quantities[product._id]}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuantityChange(product._id, 1)}
                        disabled={product.stockQuantity === 0}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transform transition-all duration-200 ${
                          product.stockQuantity === 0 
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 hover:scale-110 active:scale-95'
                        }`}
                      >
                        <PlusCircle size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 font-medium">
                      <CoinsIcon size={16} className="mr-1" />
                      <span>{product.price * quantities[product._id]}</span>
                    </div>
                    <div className="relative w-32 h-8">
                      <div className="absolute inset-0">
                        <div className={`absolute inset-0 transform transition-all duration-300 ${!redeemStates[product._id] ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                          <button
                            className={`w-full h-full rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 active:scale-95 ${
                              balance >= product.price * quantities[product._id] && product.stockQuantity > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={balance < product.price * quantities[product._id] || product.stockQuantity === 0}
                            onClick={() => handleRedeem(product._id)}
                          >
                            Redeem
                          </button>
                        </div>
                        <div className={`absolute inset-0 transform transition-all duration-300 flex gap-1 ${redeemStates[product._id] ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                          <button
                            className="flex-1 h-full rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
                            onClick={() => handleConfirm(product._id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="flex-1 h-full rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
                            onClick={() => handleCancel(product._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No products found matching your criteria.
          </p>
        </div>
      )}
    </div>
  )
}

export default RewardMarketplace;