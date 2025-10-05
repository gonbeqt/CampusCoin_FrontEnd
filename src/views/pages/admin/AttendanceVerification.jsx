
import React, { useEffect, useState } from 'react';
import eventController from '../../../controllers/eventController';
import EventCard from '../../components/EventCard';

const AttendanceVerification = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventController.getAllEvents();
      if (res.success) {
        // Support both array and { events: [...] }
        if (Array.isArray(res.events)) {
          setEvents(res.events);
        } else if (res.events && Array.isArray(res.events.events)) {
          setEvents(res.events.events);
        } else {
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Verification</h1>
        <p className="text-gray-600 mb-2">Select an event to verify student attendance</p>
        <input
          type="text"
          className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events
            .filter(event => {
              const text = search.toLowerCase();
              return (
                event.title?.toLowerCase().includes(text) ||
                event.category?.toLowerCase().includes(text) ||
                event.organizedBy?.toLowerCase().includes(text) ||
                (event.location && event.location.toLowerCase().includes(text))
              );
            })
            .map(event => (
              <EventCard key={event._id || event.id} event={event} admin />
            ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceVerification;