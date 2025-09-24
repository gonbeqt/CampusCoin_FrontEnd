import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  PackageIcon,
  TrashIcon,
  Edit2Icon,
} from 'lucide-react'
import ProductCard from '../../../views/components/ProductCard'
// Mock products data
const productsData = [
  {
    id: '1',
    name: 'University Hoodie',
    description:
      'Comfortable university branded hoodie in navy blue with embroidered logo',
    price: 120,
    imageUrl:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: 'Clothing',
    stock: 25,
  },
  {
    id: '2',
    name: 'Campus Notebook',
    description: 'Hardcover spiral notebook with university logo, 100 pages',
    price: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: 'Stationery',
    stock: 50,
  },
  {
    id: '3',
    name: 'Water Bottle',
    description:
      'Insulated stainless steel water bottle with university logo, 750ml',
    price: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: 'Accessories',
    stock: 35,
  },
  {
    id: '4',
    name: 'University T-Shirt',
    description:
      'Cotton t-shirt with printed university logo in various colors',
    price: 30,
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: 'Clothing',
    stock: 40,
  },
  {
    id: '5',
    name: 'Wireless Earbuds',
    description: 'Bluetooth earbuds with charging case, university branded',
    price: 80,
    imageUrl:
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: 'Electronics',
    stock: 15,
  },
  {
    id: '6',
    name: 'Laptop Sleeve',
    description:
      'Padded laptop sleeve with university logo, fits 13-15 inch laptops',
    price: 35,
    imageUrl:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: 'Accessories',
    stock: 20,
  },
]
const ProductManagement = () => {
  const [products, setProducts] = useState(productsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const categories = [
    'All',
    ...Array.from(new Set(products.map((product) => product.category))),
  ]
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'All' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  const handleDeleteClick = (id) => {
    setProductToDelete(id)
    setDeleteModalOpen(true)
  }
  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter((product) => product.id !== productToDelete))
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }
  return (
    <div className="pt-16 md:ml-64">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Product Management
          </h1>
          <p className="text-gray-600">Manage your store inventory</p>
        </div>
        <Link
          to="/seller/products/add"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon size={16} className="mr-2" />
          Add Product
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 rounded-full text-sm ${categoryFilter === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteClick}
              isSellerView={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <PackageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No products found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter !== 'All'
              ? 'Try adjusting your search or filter'
              : 'Get started by adding your first product'}
          </p>
          <Link
            to="/seller/products/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon size={16} className="mr-2" />
            Add Product
          </Link>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot
                be undone.
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
        </div>
      )}
    </div>
  )
}
export default ProductManagement