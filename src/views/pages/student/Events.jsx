import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  SearchIcon,
  FilterIcon,
  ClockIcon,
  MapPinIcon,
  CoinsIcon
} from 'lucide-react'
import eventController from '../../../controllers/eventController'

const Events = ({ user }) => {
  const [allEvents, setAllEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [joinedEvents, setJoinedEvents] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventController.getAllEvents()
      if (res.success) {
        setAllEvents(res.events)
      } else {
        console.error('Error fetching events:', res.error)
      }
      setLoading(false)
    }
    fetchEvents()
  }, [])

  // Get unique categories from events
  const categories = ['All', ...new Set(allEvents.map(event => event.category))]

  // Filter events based on search term and category
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'All' || event.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Handle joining an event
  const handleJoinEvent = (eventId, eventTitle) => {
    if (!joinedEvents.includes(eventId)) {
      setJoinedEvents([...joinedEvents, eventId])
      const reward = allEvents.find(e => e._id === eventId)?.reward
      setShowSuccessMessage(
        `You've successfully joined "${eventTitle}". You'll earn ${reward} CampusCoins upon attendance.`
      )
      setTimeout(() => {
        setShowSuccessMessage(null)
      }, 5000)
    }
  }

  if (loading) {
    return (
      <div className="pt-16 md:ml-64 flex justify-center items-center h-64">
        <p className="text-gray-500">Loading events...</p>
      </div>
    )
  }

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
        <p className="text-gray-600">
          Discover events, join, and earn CampusCoins by attending
        </p>
      </div>

      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {showSuccessMessage}
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center">
            <FilterIcon size={18} className="text-gray-500 mr-2" />
            <span className="mr-2 text-gray-700">Category:</span>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {event.category}
                  </span>
                  <span className="flex items-center text-blue-600 font-medium">
                    <CalendarIcon size={16} className="mr-1" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-medium text-gray-900">{event.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{truncateText(event.description, 60)}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-500">
                    <ClockIcon size={16} className="mr-1" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPinIcon size={16} className="mr-1" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-blue-600">
                  <CoinsIcon size={16} className="mr-1" />
                  <span>{event.reward} CampusCoin reward</span>
                </div>

                <div className="mt-5 flex justify-between items-center">
                  <Link
                    to={`/student/event/${event._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View details
                  </Link>
                  {joinedEvents.includes(event._id) ? (
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded">
                      Registered
                    </span>
                  ) : (
                    <button
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                      onClick={() => handleJoinEvent(event._id, event.title)}
                    >
                      Join Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
            <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-2 text-gray-500">
              No events match your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Events
