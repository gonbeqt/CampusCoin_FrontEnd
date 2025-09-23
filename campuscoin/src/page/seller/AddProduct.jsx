import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, ImageIcon, CoinsIcon } from 'lucide-react'
const AddProduct = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    stock: 1,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const categories = [
    'Clothing',
    'Stationery',
    'Electronics',
    'Accessories',
    'Books',
    'Other',
  ]
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim())
      newErrors.description = 'Description is required'
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log('Product added:', formData)
      setIsSubmitting(false)
      navigate('/seller/products')
    }, 1000)
  }
  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-4">
        <button
          onClick={() => navigate('/seller/products')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon size={16} className="mr-1" />
          <span>Back to Products</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="mt-2 text-blue-100">
            Create a new product for your store
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter product description"
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (CampusCoin)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CoinsIcon size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity*
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter stock quantity"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL*
                </label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className={`w-full border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
                {errors.imageUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter a valid URL for the product image
                </p>
              </div>
              {formData.imageUrl && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <div className="mt-1 border rounded-md overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      className="max-h-full object-contain"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/300?text=Image+Error'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default AddProduct