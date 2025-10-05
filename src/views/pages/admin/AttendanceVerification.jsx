
import React, { useEffect, useState } from 'react';
import eventController from '../../../controllers/eventController';
import EventCard from '../../components/EventCard';

const AttendanceVerification = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState('all'); // all | upcoming | completed | cancelled
  const [finalizedFilter, setFinalizedFilter] = useState('all'); // all | finalized | not_finalized
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (new to old) | 'asc' (old to new)

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

  const categories = Array.from(new Set((events || []).map(e => e.category).filter(Boolean)));

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Verification</h1>
        <p className="text-gray-600 mb-2">Select an event to verify student attendance</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          <input
            type="text"
            className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search events... (title, category, organizer, location)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            title="Status"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={finalizedFilter}
            onChange={e => setFinalizedFilter(e.target.value)}
            title="Finalization"
          >
            <option value="all">All Finalization</option>
            <option value="finalized">Finalized</option>
            <option value="not_finalized">Not Finalized</option>
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            title="Category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            title="Sort order"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
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
            .filter(event => {
              if (statusFilter === 'all') return true;
              return (event.status || '').toLowerCase() === statusFilter;
            })
            .filter(event => {
              if (finalizedFilter === 'all') return true;
              const isFinalized = !!event.finalized;
              return finalizedFilter === 'finalized' ? isFinalized : !isFinalized;
            })
            .filter(event => {
              if (categoryFilter === 'all') return true;
              return event.category === categoryFilter;
            })
            .sort((a, b) => {
              // Sort by createdAt desc; fallback to event date desc; then by id
              const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : (a?.date ? new Date(a.date).getTime() : 0);
              const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : (b?.date ? new Date(b.date).getTime() : 0);
              if (aTime !== bTime) {
                return sortOrder === 'desc' ? (bTime - aTime) : (aTime - bTime);
              }
              const aId = String(a._id || a.id || '');
              const bId = String(b._id || b.id || '');
              return sortOrder === 'desc' ? bId.localeCompare(aId) : aId.localeCompare(bId);
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