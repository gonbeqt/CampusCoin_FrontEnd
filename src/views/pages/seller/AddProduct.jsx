import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image, Coins, Check } from 'lucide-react'
import ProductController from '../../../controllers/productController'

const AddProduct = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null); // Declare useRef
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageFile: null, // Changed from imageUrl to imageFile
    imagePreview: null, // For displaying local image preview
    category: '',
    stock: 1,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const categories = [
'CLOTHING', 'FOOD', 'BOOKS', 'STATIONARY'
  ]

  // Cleanup image preview URL on component unmount or file change
  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview)
      }
    }
  }, [formData.imagePreview])

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      const file = files[0]
      if (file) {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' ? Number(value) : value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
    if (successMessage) setSuccessMessage('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    } else if (formData.price > 1000000) {
      newErrors.price = 'Price cannot exceed 1,000,000 CampusCoin'
    }

    // New validation for imageFile
    if (!formData.imageFile) {
      newErrors.imageFile = 'Product image is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (formData.stock < 1) {
      newErrors.stock = 'Stock must be at least 1'
    } else if (formData.stock > 10000) {
      newErrors.stock = 'Stock cannot exceed 10,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true)
    setErrors({}) 
    setSuccessMessage('')

    const token = localStorage.getItem('authToken')
    if (!token) {
      setErrors({ submit: 'Authentication token not found. Please log in.' })
      setIsSubmitting(false)
      return
    }

    const productFormData = new FormData()
    productFormData.append('name', formData.name)
    productFormData.append('description', formData.description)
    productFormData.append('price', formData.price)
    productFormData.append('category', formData.category)
    productFormData.append('stockQuantity', formData.stock) // Backend expects stockQuantity
    if (formData.imageFile) {
      productFormData.append('image', formData.imageFile) // Backend expects 'image' field for the file
    }

    try {
const result = await ProductController.addProduct(productFormData, token);

      if (result.success) {
        setSuccessMessage(result.message || 'Product added successfully!')
        setFormData({
          name: '',
          description: '',
          price: 0,
          imageFile: null,
          imagePreview: null,
          category: '',
          stock: 1,
        })

        setTimeout(() => {
          navigate('/seller/products')
        }, 2000)
      } else {
        setErrors({ submit: result.error || 'Failed to add product. Please try again.' })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20 md:ml-64 min-h-screen px-4 pb-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/seller/products')}
          className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-sm font-medium">Back to Products</span>
        </button>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        {/* Header */}
        <div className="px-6 py-6 border-b border-emerald-100 bg-emerald-50">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
          <p className="mt-1 text-sm text-gray-600">Create a new product for your store</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Success */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
              <Check size={20} className="text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <span className="text-red-800">{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full rounded-md px-3 py-2 transition-colors border ${errors.name ? 'border-red-500' : 'border-emerald-100'} focus:outline-none focus:ring-2 focus:ring-emerald-100`}
                  placeholder="Wireless Bluetooth Headphones"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                <p className="mt-1 text-sm text-gray-500">{formData.name.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className={`w-full rounded-md px-3 py-2 transition-colors border ${errors.description ? 'border-red-500' : 'border-emerald-100'} focus:outline-none focus:ring-2 focus:ring-emerald-100`}
                  placeholder="Describe your product in detail..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                <p className="mt-1 text-sm text-gray-500">{formData.description.length}/500 characters</p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (CampusCoin)*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Coins size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="1"
                    max="1000000"
                    step="1"
                    className={`w-full rounded-md pl-10 pr-3 py-2 transition-colors border ${errors.price ? 'border-red-500' : 'border-emerald-100'} focus:outline-none focus:ring-2 focus:ring-emerald-100`}
                    placeholder="0"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-emerald-100'} px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100`}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="1"
                  max="10000"
                  className={`w-full rounded-md px-3 py-2 transition-colors border ${errors.stock ? 'border-red-500' : 'border-emerald-100'} focus:outline-none focus:ring-2 focus:ring-emerald-100`}
                  placeholder="Enter stock quantity"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image*</label>
                <div className="relative flex-grow">
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden" // Hide the default file input
                    ref={fileInputRef}
                  />
                  
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className={`w-full rounded-md px-3 py-2 transition-colors border ${errors.imageFile ? 'border-red-500' : 'border-emerald-100'} bg-white text-gray-700 hover:bg-emerald-50 flex items-center justify-center`}
                >
                  <Image size={16} className="mr-2 text-emerald-600" />
                  {formData.imageFile ? formData.imageFile.name : 'Upload Image'}
                </button>
                {errors.imageFile && <p className="mt-1 text-sm text-red-500">{errors.imageFile}</p>}
                
              </div>

              {/* Image Preview */}
              {formData.imagePreview && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
                  <div className="mt-1 border rounded-md overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={formData.imagePreview}
                      alt="Product Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="px-6 py-2 rounded-md border border-emerald-100 text-sm font-medium text-gray-700 hover:bg-emerald-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct;
