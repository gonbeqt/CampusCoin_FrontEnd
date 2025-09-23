import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CoinsIcon,
  ArrowLeftIcon,
} from 'lucide-react'
// Mock event data
const eventData = {
  id: '1',
  title: 'Blockchain Technology Workshop',
  description:
    'Join us for an interactive workshop on blockchain technology fundamentals. Learn about distributed ledgers, smart contracts, and the future of decentralized applications. This workshop is designed for beginners and will provide hands-on experience with blockchain concepts.',
  date: '2023-10-15T14:00:00',
  endTime: '2023-10-15T16:00:00',
  location: 'Engineering Building, Room 302',
  reward: 50,
  category: 'Workshop',
  organizer: 'Computer Science Department',
  capacity: 50,
  registered: 37,
  speakers: [
    {
      name: 'Dr. Jane Smith',
      title: 'Associate Professor of Computer Science',
    },
    {
      name: 'Alex Johnson',
      title: 'Blockchain Developer at TechCorp',
    },
  ],
}
const EventDetails = () => {
  const { id } = useParams()
  const event = eventData // In a real app, fetch the event by id
  const eventDate = new Date(event.date)
  const endTime = new Date(event.endTime)
  const isPast = endTime < new Date()
  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-4">
        <Link
          to="/student"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex flex-wrap items-center mt-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white mr-2">
              {event.category}
            </span>
            <span className="flex items-center text-sm">
              <CoinsIcon size={14} className="mr-1" />
              {event.reward} CampusCoin reward
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-700 mb-6">{event.description}</p>
              <h2 className="text-xl font-semibold mb-4">Speakers</h2>
              <div className="space-y-3 mb-6">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {speaker.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{speaker.name}</p>
                      <p className="text-sm text-gray-600">{speaker.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Event Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CalendarIcon
                      size={18}
                      className="text-gray-500 mr-2 mt-0.5"
                    />
                    <div>
                      <p className="text-gray-800">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon
                      size={18}
                      className="text-gray-500 mr-2 mt-0.5"
                    />
                    <div>
                      <p className="text-gray-800">
                        {eventDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {endTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon
                      size={18}
                      className="text-gray-500 mr-2 mt-0.5"
                    />
                    <div>
                      <p className="text-gray-800">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <UsersIcon
                      size={18}
                      className="text-gray-500 mr-2 mt-0.5"
                    />
                    <div>
                      <p className="text-gray-800">
                        {event.registered} / {event.capacity} registered
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Organized By</h3>
                <p className="text-gray-800">{event.organizer}</p>
              </div>
              {!isPast ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  Register for Event
                </button>
              ) : (
                <div className="text-center p-2 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500">This event has ended</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EventDetails