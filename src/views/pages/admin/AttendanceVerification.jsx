
import React, { useEffect, useState } from 'react';
import Skeleton from '../../components/Skeleton';
import eventController from '../../../controllers/eventController';
import EventCard from '../../components/EventCard';

const AttendanceVerification = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search input and trigger state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Only update search when button is clicked or Enter is pressed
  const handleSearch = () => {
    setSearch(searchInput);
  };
  const [statusFilter, setStatusFilter] = useState('all'); // all | upcoming | completed | cancelled
  const [finalizedFilter, setFinalizedFilter] = useState('all'); // all | finalized | not_finalized
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (new to old) | 'asc' (old to new)
  // Server-side pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      // Pass filters/search/sort to eventModel for global backend filtering
      eventController.model.search = search;
      eventController.model.statusFilter = statusFilter;
      eventController.model.finalizedFilter = finalizedFilter;
      eventController.model.categoryFilter = categoryFilter;
      // Map sortOrder to backend expected value
      eventController.model.sortOrder = sortOrder === 'asc' ? 'oldest' : sortOrder === 'desc' ? 'newest' : '';
      const start = Date.now();
      const res = await eventController.getAllEvents(page, limit);
      const elapsed = Date.now() - start;
      const minDelay = 400;
      if (isMounted) {
        if (res.success) {
          setEvents(Array.isArray(res.events) ? res.events : []);
          setTotalEvents(res.totalEvents ?? 0);
          if (typeof res.totalPages === 'number') setTotalPages(res.totalPages);
          if (typeof res.hasNext === 'boolean') setHasNext(res.hasNext);
          if (typeof res.hasPrev === 'boolean') setHasPrev(res.hasPrev);
        } else {
          setEvents([]);
        }
        // Always show loading for at least minDelay ms
        if (elapsed < minDelay) {
          setTimeout(() => { if (isMounted) setLoading(false); }, minDelay - elapsed);
        } else {
          setLoading(false);
        }
      }
    };
    fetchEvents();
    return () => { isMounted = false; };
  }, [page, limit, search, statusFilter, finalizedFilter, categoryFilter, sortOrder]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, finalizedFilter, categoryFilter, sortOrder]);

  // Static list of all possible categories (customize as needed)
  const allCategories = ["Meeting", "Workshop", "Lecture"];

  return (
    <div className="pt-16 md:ml-64 min-h-screen ">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Verification</h1>
        <p className="text-gray-600 mb-2">Select an event to verify student attendance</p>
        {/* Search bar row */}
        <div className="flex w-full md:w-1/2 items-center gap-2 mb-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Search events... (title, category, organizer, location)"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none"
            onClick={handleSearch}
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </button>
        </div>
        {/* Filters row */}
        <div className="flex flex-wrap gap-2 mt-1">
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={finalizedFilter}
            onChange={e => setFinalizedFilter(e.target.value)}
            title="Finalization"
          >
            <option value="all">All Finalization</option>
            <option value="finalized">Finalized</option>
            <option value="not_finalized">Not Finalized</option>
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            title="Category"
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
        <div className="p-4">
          <Skeleton variant="grid" rows={6} cols={3} />
        </div>
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
        {/* Pagination footer */}
        <div className="mt-8 flex items-center justify-between bg-white border border-emerald-100 rounded-lg px-4 py-3 shadow-sm">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{page}</span>
            {totalPages > 1 && (
              <>
                <span> of </span>
                <span className="font-medium">{totalPages}</span>
              </>
            )}
            {totalEvents > 0 && (
              <>
                <span className="ml-2 text-gray-400">·</span>
                <span className="ml-2">Total: {totalEvents}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1.5 rounded-md text-sm border ${hasPrev && page > 1 ? 'bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
              onClick={() => hasPrev && page > 1 && setPage((p) => p - 1)}
              disabled={!hasPrev || page <= 1}
            >
              Prev
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm border ${hasNext ? 'bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
              onClick={() => hasNext && setPage((p) => p + 1)}
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        </div>
     
    </div>  
  );
};

export default AttendanceVerification;