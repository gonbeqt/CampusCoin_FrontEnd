import React from 'react'
import { Edit2Icon, TrashIcon, CoinsIcon } from 'lucide-react'
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
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {product.category}
          </span>
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
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          )}
        </div>
        
      </div>
      
    </div>
    
  )
}
export default ProductCard