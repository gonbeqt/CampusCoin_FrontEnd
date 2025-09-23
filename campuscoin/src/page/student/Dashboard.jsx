import React from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  CoinsIcon,
  TrendingUpIcon,
  ClockIcon,
  MapPinIcon,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import EventCard from '../../components/EventCard'
import WalletCard from '../../components/WalletCard'
import RecentTransactionsCard from '../../components/RecentTransactionsCard'
// Mock data
const upcomingEvents = [
  {
    id: '1',
    title: 'Blockchain Technology Workshop',
    date: '2023-10-15T14:00:00',
    location: 'Engineering Building, Room 302',
    reward: 50,
    category: 'Workshop',
  },
  {
    id: '2',
    title: 'AI Research Seminar',
    date: '2023-10-17T10:00:00',
    location: 'Science Hall, Auditorium',
    reward: 30,
    category: 'Seminar',
  },
  {
    id: '3',
    title: 'Career Fair 2023',
    date: '2023-10-20T09:00:00',
    location: 'Student Center, Main Hall',
    reward: 40,
    category: 'Career',
  },
]
const recentTransactions = [
  {
    id: '1',
    type: 'earned',
    amount: 50,
    event: 'Database Systems Lecture',
    date: '2023-10-10T09:30:00',
  },
  {
    id: '2',
    type: 'redeemed',
    amount: 25,
    reward: 'Canteen Meal Voucher',
    date: '2023-10-09T12:45:00',
  },
  {
    id: '3',
    type: 'earned',
    amount: 35,
    event: 'Student Council Meeting',
    date: '2023-10-08T15:00:00',
  },
]
const StudentDashboard = () => {
  const { user } = useUser()
  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your CampusCoin account
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <WalletCard balance={user?.balance || 0} />
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center text-blue-600 mb-2">
                <CalendarIcon size={18} className="mr-2" />
                <span className="font-medium">Events</span>
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-500">Attended</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center text-green-600 mb-2">
                <TrendingUpIcon size={18} className="mr-2" />
                <span className="font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-500">Days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Next Event</h2>
          </div>
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800">
                {upcomingEvents[0].title}
              </h3>
              <div className="flex items-center text-gray-500 mt-2">
                <ClockIcon size={16} className="mr-1" />
                <span className="text-sm">
                  {new Date(upcomingEvents[0].date).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPinIcon size={16} className="mr-1" />
                <span className="text-sm">{upcomingEvents[0].location}</span>
              </div>
              <div className="mt-3 flex items-center text-blue-600">
                <CoinsIcon size={16} className="mr-1" />
                <span>{upcomingEvents[0].reward} CampusCoin reward</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Upcoming Events
              </h2>
              <Link
                to="/student/events"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Recent Transactions
              </h2>
              <Link
                to="/student/transactions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <RecentTransactionsCard transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default StudentDashboard