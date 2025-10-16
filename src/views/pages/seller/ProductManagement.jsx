import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon, SearchIcon, FilterIcon, PackageIcon, X as XIcon,
} from 'lucide-react'
import ProductCard from '../../../views/components/ProductCard'
import ProductController from '../../../controllers/productController'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [limit] = useState(9)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

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
      const res = await ProductController.getProducts(token, page, limit)
      if (res.success) {
        setProducts(res.products)
        setTotalProducts(res.total ?? res.totalProducts ?? res.products.length ?? 0)
        if (typeof res.totalPages === 'number') setTotalPages(res.totalPages)
        if (typeof res.hasNext === 'boolean') setHasNext(res.hasNext)
        if (typeof res.hasPrev === 'boolean') setHasPrev(res.hasPrev)
      } else {
        console.error(res.error)
      }
    }
    fetchProducts()
  }, [token, page, limit])

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Reset to first page on search/filter change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, categoryFilter])

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
    <div className="pt-20 md:ml-64 min-h-screen px-4 pb-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Product Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your store inventory</p>
        </div>
        <Link to="/seller/products/add" className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <PlusIcon size={16} className="mr-2" /> Add Product
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-64">
            <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-md border border-emerald-100 py-2 pl-10 pr-4 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <FilterIcon size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <div className="ml-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${categoryFilter === c ? 'bg-emerald-600 text-white shadow-sm' : 'border border-emerald-100 bg-white text-gray-700 hover:bg-emerald-50'}`}
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

        </div>
      )}

      {/* Pagination (always visible) */}
      <div className="mt-8 flex items-center justify-between bg-white border border-emerald-100 rounded-lg px-4 py-3 shadow-sm">
        <div className="text-sm text-gray-600">
          Page <span className="font-medium">{page}</span>
          {totalPages > 1 && (
            <>
              <span> of </span>
              <span className="font-medium">{totalPages}</span>
            </>
          )}
          {totalProducts > 0 && (
            <>
              <span className="ml-2 text-gray-400">·</span>
              <span className="ml-2">Total: {totalProducts}</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${hasPrev && page > 1 ? 'bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
            onClick={() => hasPrev && page > 1 && setPage((p) => p - 1)}
            disabled={!hasPrev || page <= 1}
          >
            Prev
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${hasNext ? 'bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
            onClick={() => hasNext && setPage((p) => p + 1)}
            disabled={!hasNext}
          >
            Next
          </button>
        </div>
      </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
                <p className="text-sm text-gray-500">Update product details and click Save to apply changes.</p>
              </div>
              <button
                onClick={() => { setEditModalOpen(false); setProductToEdit(null); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-md"
                aria-label="Close edit modal"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: image preview */}
              <div className="md:col-span-1 flex items-center justify-center">
                <div className="w-full">
                  <div className="h-40 w-full bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
                    {productToEdit.image || productToEdit.images?.[0] ? (
                      <img
                        src={`http://localhost:5000/api/products/image/${productToEdit.image}`}
                        alt={productToEdit.name || 'Product image'}
                        className="object-contain h-full w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">To change the image, edit the product in the Add Product flow.</div>
                </div>
              </div>

              {/* Right: fields */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={productToEdit.name}
                      onChange={(e) => setProductToEdit({ ...productToEdit, name: e.target.value })}
                      placeholder="Product Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <input
                      type="text"
                      value={productToEdit.category}
                      onChange={(e) => setProductToEdit({ ...productToEdit, category: e.target.value })}
                      placeholder="Category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={productToEdit.price}
                      onChange={(e) => setProductToEdit({ ...productToEdit, price: e.target.value })}
                      placeholder="Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={productToEdit.stockQuantity}
                      onChange={(e) => setProductToEdit({ ...productToEdit, stockQuantity: e.target.value })}
                      placeholder="Quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={productToEdit.description}
                    onChange={(e) => setProductToEdit({ ...productToEdit, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => { setEditModalOpen(false); setProductToEdit(null); }}
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
