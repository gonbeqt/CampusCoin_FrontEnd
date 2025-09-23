import React from 'react'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
const RecentTransactionsCard = ({
  transactions
}) => {
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center p-2 border-b border-gray-100"
        >
          <div
            className={`p-2 rounded-full ${transaction.type === 'earned' ? 'bg-green-100' : 'bg-orange-100'}`}
          >
            {transaction.type === 'earned' ? (
              <ArrowUpIcon size={16} className="text-green-600" />
            ) : (
              <ArrowDownIcon size={16} className="text-orange-600" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {transaction.type === 'earned'
                ? transaction.event
                : transaction.reward}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div
            className={`text-sm font-medium ${transaction.type === 'earned' ? 'text-green-600' : 'text-orange-600'}`}
          >
            {transaction.type === 'earned' ? '+' : '-'}
            {transaction.amount}
          </div>
        </div>
      ))}
    </div>
  )
}
export default RecentTransactionsCard