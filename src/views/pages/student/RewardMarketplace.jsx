import React, { useState } from 'react'
import { CoinsIcon, SearchIcon } from 'lucide-react'
// Mock rewards data
const rewards = [
  {
    id: '1',
    title: 'Canteen Meal Voucher',
    description: 'Get a free meal at the university canteen',
    cost: 50,
    category: 'Food',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
    available: true,
  },
  {
    id: '2',
    title: 'Printing Credits (100 pages)',
    description: '100 pages of black & white printing at any campus printer',
    cost: 40,
    category: 'Academic',
    image:
      'https://images.unsplash.com/photo-1607703703674-df96af81dffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
    available: true,
  },
  {
    id: '3',
    title: 'Campus Concert Ticket',
    description: 'One ticket to the upcoming campus concert',
    cost: 150,
    category: 'Entertainment',
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
    available: true,
  },
  {
    id: '4',
    title: 'Coffee Shop Voucher',
    description: 'Free coffee at the campus coffee shop',
    cost: 30,
    category: 'Food',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
    available: true,
  },
  {
    id: '5',
    title: 'University Bookstore Discount',
    description: '20% off on your next purchase at the university bookstore',
    cost: 75,
    category: 'Academic',
    image:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
    available: true,
  },
  {
    id: '6',
    title: 'Gym Day Pass',
    description: 'One day pass for the university gym',
    cost: 35,
    category: 'Fitness',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
    available: true,
  },
]
const categories = ['All', 'Food', 'Academic', 'Entertainment', 'Fitness']
const RewardMarketplace = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || reward.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  return (
    <div className="pt-16 md:ml-64">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reward Marketplace
          </h1>
          <p className="text-gray-600">
            Redeem your CampusCoin for exciting rewards
          </p>
        </div>
        <div className="bg-blue-100 px-4 py-2 rounded-lg flex items-center">
          <CoinsIcon size={20} className="text-blue-600 mr-2" />
          <span className="font-semibold text-blue-800">
            {user?.balance || 0} CampusCoin
          </span>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search rewards..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="h-40 overflow-hidden">
              <img
                src={reward.image}
                alt={reward.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reward.title}
                </h3>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {reward.category}
                </span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">{reward.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-blue-600 font-medium">
                  <CoinsIcon size={16} className="mr-1" />
                  <span>{reward.cost}</span>
                </div>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${(user?.balance || 0) >= reward.cost ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  disabled={(user?.balance || 0) < reward.cost}
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredRewards.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No rewards found matching your criteria.
          </p>
        </div>
      )}
    </div>
  )
}
export default RewardMarketplace