import React from 'react'

// Simple reusable skeleton loader. Use rows for lists/tables or grid for cards.
export default function Skeleton({ rows = 4, cols = 1, variant = 'list', className = '' }) {
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-4 shadow-sm">
            <div className="h-36 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  // default list/table rows
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center justify-between bg-white rounded-md p-4 shadow-sm">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="ml-4 w-24">
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
