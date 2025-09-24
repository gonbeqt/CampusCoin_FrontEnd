import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  UsersIcon,
  CoinsIcon,
  TrendingUpIcon,
  BarChartIcon,
  PieChartIcon,
} from 'lucide-react'
import { useUser } from '../../../context/UserContext'
import WalletConnect from '../../../views/components/WalletConnect'
// Mock data
const stats = {
  totalEvents: 24,
  activeEvents: 8,
  totalStudents: 450,
  activeStudents: 325,
  totalCoinsIssued: 12500,
  totalCoinsRedeemed: 8750,
}
const recentEvents = [
  {
    id: '1',
    title: 'Blockchain Technology Workshop',
    date: '2023-10-15T14:00:00',
    attendees: 45,
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'AI Research Seminar',
    date: '2023-10-10T10:00:00',
    attendees: 32,
    status: 'completed',
  },
  {
    id: '3',
    title: 'Database Systems Lecture',
    date: '2023-10-08T09:30:00',
    attendees: 65,
    status: 'completed',
  },
]
const AdminDashboard = () => {
  const { user } = useUser()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const handleWalletConnect = (balance) => {
    setIsWalletConnected(true)
    setWalletBalance(balance)
  }
  return (
    <div className="pt-16 md:ml-64">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {user?.name}. Here's an overview of the CampusCoin system.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <WalletConnect 
            onConnect={handleWalletConnect}
            isConnected={isWalletConnected}
            walletBalance={walletBalance}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Events</p>
              <p className="text-2xl font-bold mt-1">{stats.totalEvents}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" /> {stats.activeEvents}{' '}
              active
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Students</p>
              <p className="text-2xl font-bold mt-1">{stats.totalStudents}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" />{' '}
              {stats.activeStudents} active
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">CampusCoin Economy</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalCoinsIssued}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CoinsIcon size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600 font-medium">
              {stats.totalCoinsRedeemed} redeemed
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Recent Events
              </h2>
              <Link
                to="/admin/events"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Manage events
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event
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
                      Attendees
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.attendees}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Attendance Overview
              </h2>
              <button className="text-blue-600 hover:text-blue-800">
                <BarChartIcon size={18} />
              </button>
            </div>
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <PieChartIcon
                  size={64}
                  className="mx-auto text-blue-400 mb-2"
                />
                <p className="text-gray-500 text-sm">
                  Attendance analytics visualization would be displayed here
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-2">
              <Link
                to="/admin/events"
                className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Create new event
              </Link>
              <Link
                to="/admin/attendance"
                className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                Verify attendance
              </Link>
              <Link
                to="/admin/rewards"
                className="block w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
              >
                Manage rewards
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminDashboard