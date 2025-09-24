import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  SearchIcon,
  FilterIcon,
  ClockIcon,
  MapPinIcon,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
// Mock data for events
const allEvents = [
  {
    id: '1',
    title: 'Blockchain Technology Workshop',
    date: '2023-10-15T14:00:00',
    location: 'Engineering Building, Room 302',
    reward: 50,
    category: 'Workshop',
    description: 'Learn the fundamentals of blockchain technology and its applications.',
  },
  {
    id: '2',
    title: 'AI Research Seminar',
    date: '2023-10-17T10:00:00',
    location: 'Science Hall, Auditorium',
    reward: 30,
    category: 'Seminar',
    description: 'Exploring the latest advancements in artificial intelligence research.',
  },
  {
    id: '3',
    title: 'Career Fair 2023',
    date: '2023-10-20T09:00:00',
    location: 'Student Center, Main Hall',
    reward: 40,
    category: 'Career',
    description: 'Connect with potential employers and explore career opportunities.',
  },
  {
    id: '4',
    title: 'Cybersecurity Workshop',
    date: '2023-10-22T13:00:00',
    location: 'Computer Science Building, Lab 104',
    reward: 45,
    category: 'Workshop',
    description: 'Hands-on workshop about modern cybersecurity practices and tools.',
  },
  {
    id: '5',
    title: 'Entrepreneurship Talk',
    date: '2023-10-25T15:30:00',
    location: 'Business School, Room 201',
    reward: 35,
    category: 'Talk',
    description: 'Learn from successful entrepreneurs about starting your own business.',
  },
  {
    id: '6',
    title: 'Mobile App Development Bootcamp',
    date: '2023-10-28T09:00:00',
    location: 'Engineering Building, Room 105',
    reward: 60,
    category: 'Workshop',
    description: 'Intensive bootcamp on developing mobile applications.',
  },
  {
    id: '7',
    title: 'Environmental Sustainability Forum',
    date: '2023-11-02T14:00:00',
    location: 'Science Hall, Room 302',
    reward: 30,
    category: 'Forum',
    description: 'Discussing environmental challenges and sustainable solutions.',
  },
  {
    id: '8',
    title: 'Data Science Hackathon',
    date: '2023-11-05T10:00:00',
    location: 'Computer Science Building, Main Hall',
    reward: 70,
    category: 'Hackathon',
    description: 'Compete in teams to solve real-world problems using data science.',
  }
]
const Events = () => {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [joinedEvents, setJoinedEvents] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(null)
  // Get unique categories from events
  const categories = ['All', ...new Set(allEvents.map(event => event.category))]
  // Filter events based on search term and category
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  // Handle joining an event
  const handleJoinEvent = (eventId, eventTitle) => {
    if (!joinedEvents.includes(eventId)) {
      setJoinedEvents([...joinedEvents, eventId])
      setShowSuccessMessage(`You've successfully joined "${eventTitle}". You'll earn ${allEvents.find(e => e.id === eventId)?.reward} CampusCoins upon attendance.`)
      // Hide the success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(null)
      }, 5000)
    }
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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
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
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-500">
                    <ClockIcon size={16} className="mr-1" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPinIcon size={16} className="mr-1" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-blue-600">
                  <CalendarIcon size={16} className="mr-1" />
                  <span>{event.reward} CampusCoin reward</span>
                </div>
                <div className="mt-5 flex justify-between items-center">
                  <Link
                    to={`/student/event/${event.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View details
                  </Link>
                  {joinedEvents.includes(event.id) ? (
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded">
                      Registered
                    </span>
                  ) : (
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                      onClick={() => handleJoinEvent(event.id, event.title)}
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