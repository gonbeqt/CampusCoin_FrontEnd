import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarIcon, MapPinIcon, CoinsIcon, ClockIcon } from 'lucide-react'

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date)
  const isPast = eventDate < new Date()

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{event.title}</h3>
          <div className="flex items-center text-gray-500 mt-2">
            <CalendarIcon size={16} className="mr-1" />
            <span className="text-sm">
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center text-gray-500 mt-1">
            <ClockIcon size={16} className="mr-1" />
            <span className="text-sm">
              {eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center text-gray-500 mt-1">
            <MapPinIcon size={16} className="mr-1" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-2">
            {event.category}
          </span>
          <div className="flex items-center text-blue-600">
            <CoinsIcon size={16} className="mr-1" />
            <span>{event.reward}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/student/event/${event._id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View details
        </Link>
      </div>
    </div>
  )
}

export default EventCard
