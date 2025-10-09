import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CalendarIcon, MapPinIcon, CoinsIcon, ClockIcon } from 'lucide-react'
import { useBalance } from "./BalanceContext";


// Merged: supports both admin and student view
const EventCard = ({ event, admin }) => {
  const { balance } = useBalance()
  const eventDate = new Date(event.date);
  const navigate = useNavigate();
  const eventId = event._id || event.id;

  // If admin prop is true, make card clickable and remove buttons
  const handleCardClick = () => {
    if (admin) {
      navigate(`/admin/attendance/${eventId}`);
    }
  };

  // Status color logic
  let statusColor = 'bg-blue-100 text-blue-800';
  let statusText = 'Upcoming';
  if (event.status === 'completed') {
    statusColor = 'bg-green-100 text-green-800';
    statusText = 'Completed';
  } else if (event.status === 'ongoing') {
    statusColor = 'bg-yellow-100 text-yellow-800';
    statusText = 'Ongoing';
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-${admin ? 'pointer' : 'default'} relative`}
      onClick={admin ? handleCardClick : undefined}
    >
      {/* Finalized/Not Finalized Banner: only show for admin */}
      {admin && (
        <div className="absolute top-0 left-0 w-full flex justify-center z-10">
          {event.finalized ? (
            <div className="bg-green-400 text-green-900 font-bold text-xs px-3 py-1 rounded-b shadow-md">Finalized</div>
          ) : (
            <div className="bg-yellow-400 text-yellow-900 font-bold text-xs px-3 py-1 rounded-b shadow-md">Not Finalized</div>
          )}
        </div>
      )}
      <div className="flex justify-between mt-4">
        {/* Left column */}
        <div>
          <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
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
          {event.organizedBy && (
            <span className="text-xs italic text-gray-500 mt-1 block">
              Organized by: {event.organizedBy}
            </span>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end">
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusColor} mb-2`}>
            {statusText}
          </span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-2">
            {event.category}
          </span>
          {/* Reward moved here */}
          <div className="flex items-center text-blue-600 mt-auto">
            <CoinsIcon size={16} className="mr-1" />
            <span>{event.reward} CampusCoin reward</span>
          </div>
        </div>
      </div>

      {/* Student view: show View details button, admin: no button */}
      {!admin && (
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/student/event/${eventId}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View details
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventCard;
