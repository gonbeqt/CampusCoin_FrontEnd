import React from 'react'
import { ArrowUpIcon, ArrowDownIcon, XIcon, CoinsIcon } from 'lucide-react'

const RecentTransactionsCard = ({ transactions }) => {
  const getStatusClasses = (status) => {
    if (status === 'pending')
      return { bg: 'bg-yellow-100', iconColor: 'text-yellow-600', sign: '-', amountColor: 'text-red-600' }
    if (status === 'paid')
      return { bg: 'bg-green-100', iconColor: 'text-green-600', sign: '-', amountColor: 'text-red-600' }
    if (status === 'cancelled')
      return { bg: 'bg-red-100', iconColor: 'text-red-600', sign: '+', amountColor: 'text-green-600' }
    return { bg: 'bg-gray-100', iconColor: 'text-gray-600', sign: '', amountColor: 'text-gray-600' }
  }

  const getStatusIcon = (status, textClass) => {
    if (status === 'paid') return <ArrowUpIcon size={14} className={textClass} />
    if (status === 'pending') return <ArrowDownIcon size={14} className={textClass} />
    if (status === 'cancelled') return <XIcon size={14} className={textClass} />
    return null
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const classes = getStatusClasses(transaction.status)

        return (
          <div
            key={transaction._id}
            className="flex items-center p-2 border-b border-gray-100"
          >
            {/* Status Icon */}
            <div className={`p-2 rounded-full ${classes.bg}`}>
              {getStatusIcon(transaction.status, classes.iconColor)}
            </div>

            {/* Product Name + Date */}
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {transaction.productId?.name || 'Unknown product'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Amount */}
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-semibold ${classes.amountColor}`}>
                {classes.sign}{transaction.totalPrice}
              </span>
              <CoinsIcon size={14} className="text-blue-600" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecentTransactionsCard
