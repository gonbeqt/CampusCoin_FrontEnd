import React, { useState } from 'react'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  FilterIcon,
  DownloadIcon,
} from 'lucide-react'
// Mock transaction data
const transactionsData = [
  {
    id: '1',
    type: 'earned',
    amount: 50,
    event: 'Database Systems Lecture',
    date: '2023-10-10T09:30:00',
    hash: '0x8a7d3c5e9b1f4a2d8c6e5b3a7d9c8b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9',
  },
  {
    id: '2',
    type: 'redeemed',
    amount: 25,
    reward: 'Canteen Meal Voucher',
    date: '2023-10-09T12:45:00',
    hash: '0x7b6a5c4d3e2f1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v5w4x3y2z1a0b9c8d7e6',
  },
  {
    id: '3',
    type: 'earned',
    amount: 35,
    event: 'Student Council Meeting',
    date: '2023-10-08T15:00:00',
    hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2',
  },
  {
    id: '4',
    type: 'earned',
    amount: 40,
    event: 'AI Workshop',
    date: '2023-10-05T13:15:00',
    hash: '0x3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4',
  },
  {
    id: '5',
    type: 'redeemed',
    amount: 40,
    reward: 'Printing Credits',
    date: '2023-10-03T10:20:00',
    hash: '0x5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6',
  },
  {
    id: '6',
    type: 'earned',
    amount: 30,
    event: 'Computer Networks Lab',
    date: '2023-10-01T11:00:00',
    hash: '0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d9e8',
  },
]
const TransactionHistory = ({ user }) => {
  const [filter, setFilter] = useState('all') // 'all', 'earned', 'redeemed'
  const filteredTransactions = transactionsData.filter((transaction) => {
    if (filter === 'all') return true
    return transaction.type === filter
  })
  return (
    <div className="pt-16 md:ml-64">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Transaction History
          </h1>
          <p className="text-gray-600">
            View your CampusCoin transaction records
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <DownloadIcon size={16} className="mr-2" />
          Export
        </button>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FilterIcon size={16} className="text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">Filter:</span>
              <div className="ml-3 space-x-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'earned' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setFilter('earned')}
                >
                  Earned
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'redeemed' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setFilter('redeemed')}
                >
                  Redeemed
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Blockchain Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`p-1 rounded-full ${transaction.type === 'earned' ? 'bg-green-100' : 'bg-orange-100'} mr-2`}
                      >
                        {transaction.type === 'earned' ? (
                          <ArrowUpIcon size={14} className="text-green-600" />
                        ) : (
                          <ArrowDownIcon
                            size={14}
                            className="text-orange-600"
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${transaction.type === 'earned' ? 'text-green-600' : 'text-orange-600'}`}
                      >
                        {transaction.type === 'earned' ? 'Earned' : 'Redeemed'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.type === 'earned'
                        ? transaction.event
                        : transaction.reward}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${transaction.type === 'earned' ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      {transaction.type === 'earned' ? '+' : '-'}
                      {transaction.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {transaction.hash}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No transactions found matching your filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
export default TransactionHistory