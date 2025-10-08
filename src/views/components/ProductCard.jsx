import React from 'react'
import { Edit2Icon, TrashIcon, CoinsIcon } from 'lucide-react'

// Helper to format category display
const formatCategory = (cat) => {
  if (!cat) return ''
  return String(cat).split(/[-_ ]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ')
}
const ProductCard = ({
  product,
  onDelete,
  onEdit,
  isSellerView = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={`http://localhost:5000/api/products/image/${product.image}`}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <div className="flex items-center gap-1 flex-wrap justify-end flex-shrink-0">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {formatCategory(product.category)}
            </span>
            {(() => {
              const stock = product.stockQuantity ?? product.stock ?? 0
              if (stock === 0) {
                return (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Out of Stock</span>
                )
              }
              if (stock <= 2) {
                return (
                  <>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 animate-pulse">Low Stock</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-red-800 shadow-sm">Stock: {stock}</span>
                  </>
                )
              }
              if (stock === 3) {
                return (
                  <>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium Stock</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-yellow-800 shadow-sm">Stock: {stock}</span>
                  </>
                )
              }
              return (
                <>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">High Stock</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white text-green-800 shadow-sm">Stock: {stock}</span>
                </>
              )
            })()}
          </div>
        </div>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-blue-600 font-medium">
            <CoinsIcon size={16} className="mr-1" />
            <span>{product.price}</span>
          </div>
          {isSellerView ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(product)}   
                className="p-1 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200"
              >
                <Edit2Icon size={16} />
              </button>
              <button
                onClick={() => onDelete(product._id)}   
                
                className="p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {/* Stock info is shown in the header badges */}
            </div>
          )}
        </div>
        
      </div>
      
    </div>
    
  )
}
export default ProductCard