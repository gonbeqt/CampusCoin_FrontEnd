import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon, SearchIcon, FilterIcon, PackageIcon,
} from 'lucide-react'
import ProductCard from '../../../views/components/ProductCard'
import ProductController from '../../../controllers/productController'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)

  const token = localStorage.getItem('authToken')

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await ProductController.getProducts(token)
      if (res.success) {
        setProducts(res.products)
      } else {
        console.error(res.error)
      }
    }
    fetchProducts()
  }, [token])

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (_id) => {
    setProductToDelete(_id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('Authentication token not found. Please log in.')
      setDeleteModalOpen(false)
      setProductToDelete(null)
      return
    }
    if (productToDelete) {
      const res = await ProductController.deleteProduct(productToDelete, token)
      if (res.success) {
        setProducts(products.filter((p) => p._id !== productToDelete))
      } else {
        console.error(res.error)
      }
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleEditClick = (product) => {
    setProductToEdit(product)
    setEditModalOpen(true)
  }

  const confirmEdit = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('Authentication token not found. Please log in.')
      setEditModalOpen(false)
      setProductToEdit(null)
      return
    }
    if (productToEdit) {
      const res = await ProductController.editProduct(productToEdit._id, productToEdit, token)
      if (res.success) {
        setProducts(products.map((p) =>
          p._id === productToEdit._id ? productToEdit : p
        ))
      } else {
        console.error(res.error)
      }
      setEditModalOpen(false)
      setProductToEdit(null)
    }
  }

  return (
    <div className="pt-16 md:ml-64">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600">Manage your store inventory</p>
        </div>
        <Link
          to="/seller/products/add"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon size={16} className="mr-2" /> Add Product
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <FilterIcon size={16} className="text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Category:</span>
            <div className="ml-3 space-x-2 flex flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`px-3 py-1 rounded-full text-sm ${categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={handleDeleteClick}
              onEdit={handleEditClick}
              isSellerView={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <PackageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter !== 'All'
              ? 'Try adjusting your search or filter'
              : 'Get started by adding your first product'}
          </p>
          <Link
            to="/seller/products/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon size={16} className="mr-2" /> Add Product
          </Link>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Product</h3>

            <div className="space-y-3">
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
             Product Name:
              </span>
              <input
                type="text"
                value={productToEdit.name}
                onChange={(e) => setProductToEdit({ ...productToEdit, name: e.target.value })}
                placeholder="Product Name"
                className="w-full px-3 py-2 border rounded-md"
              />
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
             Description:
           
          </span>
              <textarea
                value={productToEdit.description}
                onChange={(e) => setProductToEdit({ ...productToEdit, description: e.target.value })}
                placeholder="Description"
                className="w-full px-3 py-2 border rounded-md"
              />
               <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
             Price:
              </span>
              <input
                type="number"
                value={productToEdit.price}
                onChange={(e) => setProductToEdit({ ...productToEdit, price: e.target.value })}
                placeholder="Price"
                className="w-full px-3 py-2 border rounded-md"
              />
               <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
             Category:
              </span>
              <input
                type="text"
                value={productToEdit.category}
                onChange={(e) => setProductToEdit({ ...productToEdit, category: e.target.value })}
                placeholder="Category"
                className="w-full px-3 py-2 border rounded-md"
              />
               <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
             Quantity:
              </span>
              <input
                type="number"
                value={productToEdit.stockQuantity}
                onChange={(e) => setProductToEdit({ ...productToEdit, stockQuantity: e.target.value })}
                placeholder="Quantity"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement
