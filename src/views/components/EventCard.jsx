import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react'
import logo from '../../assets/images/Web logo.png';
import { useBalance } from "./BalanceContext";

const EventCard = ({ event, admin }) => {
  const { balance } = useBalance()
  const eventDate = new Date(event.date);
  const navigate = useNavigate();
  const eventId = event._id || event.id;

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
      className={`cc-card cursor-${admin ? 'pointer' : 'default'} overflow-hidden p-6`}
      onClick={admin ? handleCardClick : undefined}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
              {event.category}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-emerald-900 md:text-2xl break-words">
              {event.title}
            </h3>
          </div>

          {/* Admin badges */}
          {admin && (
            <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
              <span className={`cc-pill ${statusColor}`}>{statusText}</span>
              <span className={`cc-pill ${finalStateClass}`}>{finalStateText}</span>
            </div>
          )}
        </div>

        {/* Date, Time, Location */}
        <div className="flex flex-col gap-2 text-sm text-emerald-700">
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
          <span className="inline-block text-xs font-medium uppercase tracking-wider text-emerald-400">
            Organized by {event.organizedBy}
          </span>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-6 flex items-center justify-between border-t border-emerald-100 pt-4">
        {!admin && (
          <Link
            to={`/student/event/${eventId}`}
            className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            View details
          </Link>
        )}

        {/* CampusCoin reward badge (bottom-right) */}
        <div className={`cc-pill bg-emerald-100/90 text-emerald-800 flex items-center gap-2 px-4 py-2 font-semibold`}>
          <img src={logo} alt="Web Logo" className="h-4 w-4" />
          <span>{event.reward} CampusCoin</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
