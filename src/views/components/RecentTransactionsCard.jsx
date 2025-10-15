import React from 'react'
import { ArrowUpIcon, ArrowDownIcon, XIcon, CoinsIcon } from 'lucide-react'

const RecentTransactionsCard = ({ transactions }) => {
  const getStatusClasses = (status) => {
    if (status === 'pending')
      return { bg: 'bg-amber-100/80', iconColor: 'text-amber-600', sign: '-', amountColor: 'text-amber-700' }
    if (status === 'paid')
      return { bg: 'bg-emerald-100/80', iconColor: 'text-emerald-600', sign: '-', amountColor: 'text-emerald-700' }
    if (status === 'cancelled')
      return { bg: 'bg-rose-100/80', iconColor: 'text-rose-600', sign: '+', amountColor: 'text-rose-700' }
    return { bg: 'bg-emerald-50', iconColor: 'text-emerald-500', sign: '', amountColor: 'text-emerald-600' }
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
            className="flex items-center rounded-xl border border-emerald-100/60 bg-white/70 p-3 shadow-sm shadow-emerald-100/40 backdrop-blur-sm"
          >
            {/* Status Icon */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${classes.bg}`}>
              {getStatusIcon(transaction.status, classes.iconColor)}
            </div>

            {/* Product Name + Date */}
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-emerald-900">
                {transaction.productId?.name || 'Unknown product'}
              </p>
              <p className="text-xs font-medium text-emerald-500/80">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
              <span className={`text-sm font-semibold ${classes.amountColor}`}>
                {classes.sign}{transaction.totalPrice}
              </span>
              <CoinsIcon size={14} className="text-emerald-600" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecentTransactionsCard
