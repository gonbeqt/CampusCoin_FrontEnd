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

  let statusColor = 'bg-emerald-100/90 text-emerald-800';
  let statusText = 'Upcoming';
  if (event.status === 'completed') {
    statusColor = 'bg-emerald-200/90 text-emerald-900';
    statusText = 'Completed';
  } else if (event.status === 'ongoing') {
    statusColor = 'bg-lime-100/90 text-lime-800';
    statusText = 'Ongoing';
  }

  const finalStateClass = event.finalized
    ? 'bg-emerald-200/90 text-emerald-900'
    : 'bg-amber-200/90 text-amber-900';
  const finalStateText = event.finalized ? 'Finalized' : 'Not Finalized';

  return (
    <div
      className={`cc-card relative cursor-${admin ? 'pointer' : 'default'} overflow-hidden p-6`}
      onClick={admin ? handleCardClick : undefined}
    >
      {admin && (
        <div className="absolute inset-x-6 top-4 flex justify-end">
          <span className={`cc-pill ${finalStateClass}`}>{finalStateText}</span>
        </div>
      )}

      <div className="flex flex-col gap-6 pt-2 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            {event.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-emerald-900 md:text-2xl">
            {event.title}
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-emerald-700">
            <span className="flex items-center gap-2">
              <CalendarIcon size={18} />
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon size={18} />
              {eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="flex items-center gap-2">
              <MapPinIcon size={18} />
              {event.location}
            </span>
          </div>
          {event.organizedBy && (
            <span className="mt-3 inline-block text-xs font-medium uppercase tracking-wider text-emerald-400">
              Organized by {event.organizedBy}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className={`cc-pill ${statusColor}`}>{statusText}</span>
          <div className="flex items-center gap-2 rounded-full bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CoinsIcon size={18} />
            <span>{event.reward} CampusCoin</span>
          </div>
        </div>
      </div>

      {!admin && (
        <div className="mt-6 flex items-center justify-between border-t border-emerald-100 pt-4">
          <Link
            to={`/student/event/${eventId}`}
            className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            View details
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventCard;
