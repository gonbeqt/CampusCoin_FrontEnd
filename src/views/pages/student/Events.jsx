import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  SearchIcon,
  ClockIcon,
  MapPinIcon,
  CoinsIcon
} from 'lucide-react'
import eventController from '../../../controllers/eventController'
import { useBalance } from "../../components/BalanceContext"; 
import AuthModel from '../../../models/authModel'
const authModel = new AuthModel();

const Events = ({ user }) => {
  const statusCategories = ['Upcoming', 'Ongoing', 'Registered', 'Claim Reward', 'Completed'];
  const [statusFilter, setStatusFilter] = useState('Upcoming');
  const [categoryFilter, setCategoryFilter] = useState('All');
  // Claim Reward tab filters
  const [sortOrder, setSortOrder] = useState('az'); // 'az' or 'za'
  const [claimStatus, setClaimStatus] = useState('all'); // 'all', 'claimed', 'unclaimed', 'unclaimable'
  const [rewardOrder, setRewardOrder] = useState('none'); // 'none', 'asc', 'desc'
  const [dateOrder, setDateOrder] = useState('none'); // 'none', 'recent', 'oldest'
  const { balance, setBalance, refreshBalance } = useBalance();
  const [allEvents, setAllEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [joinedEvents, setJoinedEvents] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timers, setTimers] = useState({});
  // Pagination for events (server-side)
  const [page, setPage] = useState(1)
  const [limit] = useState(9)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  const userData = authModel.getUserData();
  const userId = userData?._id || userData?.id;

  const matchesUser = useCallback((entry) => {
    if (!entry || !userId) return false;
    if (typeof entry === 'string') return entry === String(userId);
    if (typeof entry === 'object') {
      const entryId = entry._id || entry.id;
      if (entryId) return String(entryId) === String(userId);
      if (typeof entry.toString === 'function') return entry.toString() === String(userId);
    }
    return false;
  }, [userId]);

  const arrayHasUser = useCallback((arr) => Array.isArray(arr) && arr.some(matchesUser), [matchesUser]);

  // Fetch events from backend (server-side pagination)
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventController.getAllEvents(page, limit)
      if (res.success && Array.isArray(res.events)) {
        setAllEvents(res.events)
        setTotalEvents(res.totalEvents ?? 0)
        if (typeof res.totalPages === 'number') setTotalPages(res.totalPages)
        if (typeof res.hasNext === 'boolean') setHasNext(res.hasNext)
        if (typeof res.hasPrev === 'boolean') setHasPrev(res.hasPrev)
      } else {
        setAllEvents([])
        console.error('Error fetching events:', res.error || res.events)
      }
      setLoading(false)
    }
    fetchEvents()
  }, [page, limit])

  // Reset to first page when user changes filters/search/sorts
  useEffect(() => {
    setPage(1)
  }, [statusFilter, categoryFilter, searchTerm, sortOrder, claimStatus, rewardOrder, dateOrder])

  // Live timers for ongoing events (defensive: always use safeAllEvents)
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};
      (Array.isArray(allEvents) ? allEvents : []).forEach(event => {
        if (isEventOngoing(event)) updatedTimers[event._id] = getTimeRemaining(event);
      });
      setTimers(updatedTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [allEvents]);

  // Determine event status dynamically
  const getEventStatus = (event) => {
    const now = new Date();
    if (event.status) {
      const normalizedStatus = event.status.toLowerCase().trim();
      if (normalizedStatus === 'completed') return 'Completed';
      if (normalizedStatus === 'cancelled') return 'Cancelled';
    }
    const hasJoined = arrayHasUser(event.registeredStudents);
    const rewardClaimed = arrayHasUser(event.claimedStudents);

    if (!event?.time?.start || !event?.time?.end || !event?.date) return 'Upcoming';

    const eventStart = new Date(event.date);
    const [startHourStr, startMinuteStr] = event.time.start.replace(/AM|PM/i, "").split(":");
    let startHour = Number(startHourStr);
    const startMinute = Number(startMinuteStr || 0);
    if (/PM/i.test(event.time.start) && startHour !== 12) startHour += 12;
    if (/AM/i.test(event.time.start) && startHour === 12) startHour = 0;
    eventStart.setHours(startHour, startMinute, 0, 0);

    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);

    if (hasJoined) {
      if (rewardClaimed) return 'Completed';
      if (now > eventEnd && !rewardClaimed) return 'Claim Reward';
      if (now >= eventStart && now <= eventEnd) return 'Ongoing';
      return 'Registered';
    } else {
      if (now > eventEnd) return 'Completed';
      if (now >= eventStart && now <= eventEnd) return 'Ongoing';
      return 'Upcoming';
    }
  };

  const getTimeRemaining = (event) => {
    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);

    const diff = eventEnd - new Date();
    if (diff <= 0) return "00:00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const isEventOngoing = (event) => {
    if (!event?.time?.start || !event?.time?.end || !event?.date) return false;

    const now = new Date();
    const eventStart = new Date(event.date);
    const [startHourStr, startMinuteStr] = event.time.start.replace(/AM|PM/i, "").split(":");
    let startHour = Number(startHourStr);
    const startMinute = Number(startMinuteStr || 0);
    if (/PM/i.test(event.time.start) && startHour !== 12) startHour += 12;
    if (/AM/i.test(event.time.start) && startHour === 12) startHour = 0;
    eventStart.setHours(startHour, startMinute, 0, 0);

    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);

    return now >= eventStart && now <= eventEnd;
  };

  // Filter and sort events based on search, status, and Claim Reward tab filters
  const safeAllEvents = Array.isArray(allEvents) ? allEvents : [];
  let filteredEvents = safeAllEvents.filter(event => {
    const status = getEventStatus(event);
    if (statusFilter === 'Claim Reward') {
      const isFinalized = event.finalized === true;
      const isRegistered = arrayHasUser(event.registeredStudents);
      if (!(isFinalized && isRegistered)) return false;
      // Claim status filter
      if (claimStatus === 'claimed' && !arrayHasUser(event.claimedStudents)) return false;
      if (
        claimStatus === 'unclaimed' &&
        !(arrayHasUser(event.attendedStudents) && !arrayHasUser(event.claimedStudents))
      ) return false;
      if (claimStatus === 'unclaimable' && !arrayHasUser(event.absentStudents)) return false;
    } else if (statusFilter !== 'All') {
      // Special-case: show completed events in the 'Registered' tab if the user had registered
      if (statusFilter === 'Registered') {
        if (status === 'Registered') return true;
        if (arrayHasUser(event.registeredStudents) && status === 'Completed') return true;
        return false;
      }
      if (status !== statusFilter) return false;
    }
    if (categoryFilter !== 'All' && event.category !== categoryFilter) return false;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort and reward/date order for Claim Reward tab
  if (statusFilter === 'Claim Reward') {
    if (sortOrder === 'az') {
      filteredEvents = [...filteredEvents].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'za') {
      filteredEvents = [...filteredEvents].sort((a, b) => b.title.localeCompare(a.title));
    }
    if (rewardOrder === 'asc') {
      filteredEvents = [...filteredEvents].sort((a, b) => (a.reward || 0) - (b.reward || 0));
    } else if (rewardOrder === 'desc') {
      filteredEvents = [...filteredEvents].sort((a, b) => (b.reward || 0) - (a.reward || 0));
    }
    if (dateOrder === 'recent') {
      filteredEvents = [...filteredEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (dateOrder === 'oldest') {
      filteredEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }

  const handleJoinEvent = async (eventId, eventTitle) => {
    const res = await eventController.joinEvent(eventId);
    if (res.success) {
      setJoinedEvents([...joinedEvents, eventId]);

      setAllEvents(prev =>
        prev.map(ev =>
          ev._id === eventId
            ? { 
                ...ev, 
                registeredStudents: [...(ev.registeredStudents || []), userId] 
              }
            : ev
        )
      );

      const reward = allEvents.find(e => e._id === eventId)?.reward;
      setShowSuccessMessage(
        `You've successfully joined "${eventTitle}". You'll earn ${reward} CampusCoins upon attendance.`
      );
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } else {
      alert(res.error || "Failed to join event");
    }
  };

  const handleClaimReward = async (eventId) => {
    const res = await eventController.claimReward(eventId);
    if (res.success) {
      setBalance(res.newBalance);
      // Also refresh from backend to ensure global consistency
      try { await refreshBalance(); } catch {}

      // Update local event state
      setAllEvents(prev =>
        prev.map(ev =>
          ev._id === eventId
            ? { 
                ...ev, 
                claimedStudents: [...(ev.claimedStudents || []), userId],
                status: 'completed',
                justClaimed: true // flag for UI
              }
            : ev
        )
      );

      setShowSuccessMessage("Reward claimed successfully!");
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } else {
      console.error('Claim Reward Error:', res.error || "Failed to claim reward");
      setShowSuccessMessage(res.error || "Failed to claim reward");
      setTimeout(() => setShowSuccessMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 md:ml-64 min-h-screen  px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }
  const eventTypes = [...new Set((Array.isArray(allEvents) ? allEvents : []).map(event => event.category).filter(Boolean))];

  return (
    <div className="pt-20 md:ml-64 min-h-screen  px-4 pb-12 sm:px-6 lg:px-8">
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-gray-900">Events</h1>
      <p className="mt-1 text-sm text-gray-600">Discover upcoming activities, join in, and earn CampusCoins for participating.</p>
    </div>

    {/* Type filter buttons */}
    <div className="mb-5 flex flex-wrap gap-2">
      {eventTypes.length > 0 && (
        <>
          <button
            onClick={() => setCategoryFilter('All')}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${categoryFilter === 'All' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-emerald-100 hover:bg-emerald-50'}`}
          >
            All
          </button>
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setCategoryFilter(type)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${categoryFilter === type ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-emerald-100 hover:bg-emerald-50'}`}
            >
              {type}
            </button>
          ))}
        </>
      )}
    </div>

      {showSuccessMessage && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">{showSuccessMessage}</div>}

      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusCategories.map(status => (
          <button
            key={status}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${statusFilter === status ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-emerald-100 hover:bg-emerald-50'}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search bar (and filter only for Claim Reward) */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="w-full rounded-md border border-emerald-100 bg-white py-1.5 pl-10 pr-4 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {statusFilter === 'Claim Reward' && (
          <>
            {/* Sort by A-Z/Z-A */}
            <select
              className="w-full rounded-md border border-emerald-100 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none sm:w-40"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </select>
            {/* Filter by claim status */}
            <select
              className="w-full rounded-md border border-emerald-100 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none sm:w-48"
              value={claimStatus}
              onChange={e => setClaimStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="claimed">Claimed Only</option>
              <option value="unclaimed">Unclaimed Only</option>
              <option value="unclaimable">Unclaimable Only</option>
            </select>
            {/* Filter by reward amount */}
            <select
              className="w-full rounded-md border border-emerald-100 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none sm:w-48"
              value={rewardOrder}
              onChange={e => setRewardOrder(e.target.value)}
            >
              <option value="none">Reward (default)</option>
              <option value="asc">Reward: Low to High</option>
              <option value="desc">Reward: High to Low</option>
            </select>
            {/* Filter by date (recent/oldest) */}
            <select
              className="w-full rounded-md border border-emerald-100 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:outline-none sm:w-48"
              value={dateOrder}
              onChange={e => setDateOrder(e.target.value)}
            >
              <option value="none">Date (default)</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </>
        )}
      </div>

      {/* Events grid for Claim Reward tab: divided into sections */}
      {statusFilter === 'Claim Reward' ? (
        <div>
          {/* Only show the relevant section for the selected claimStatus */}
          {claimStatus === 'unclaimed' && (
            <>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Unclaimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  arrayHasUser(event.attendedStudents) && !arrayHasUser(event.claimedStudents)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  arrayHasUser(event.attendedStudents) && !arrayHasUser(event.claimedStudents)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No unclaimed rewards</div>
                )}
              </div>
            </>
          )}
          {claimStatus === 'claimed' && (
            <>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Claimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  arrayHasUser(event.claimedStudents)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  arrayHasUser(event.claimedStudents)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No claimed rewards</div>
                )}
              </div>
            </>
          )}
          {claimStatus === 'unclaimable' && (
            <>
              <h2 className="text-lg font-bold mb-2">Unclaimable Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.filter(event =>
                  arrayHasUser(event.absentStudents)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  arrayHasUser(event.absentStudents)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No unclaimable rewards</div>
                )}
              </div>
            </>
          )}
          {claimStatus === 'all' && (
            <>
              {/* Unclaimed Rewards (claimable) */}
              <h2 className="text-lg font-bold mb-2">Unclaimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  arrayHasUser(event.attendedStudents) && !arrayHasUser(event.claimedStudents)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  arrayHasUser(event.attendedStudents) && !arrayHasUser(event.claimedStudents)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No unclaimed rewards</div>
                )}
              </div>

              {/* Claimed Rewards */}
              <h2 className="text-lg font-bold mb-2">Claimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  arrayHasUser(event.claimedStudents)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  arrayHasUser(event.claimedStudents)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No claimed rewards</div>
                )}
              </div>

              {/* Unclaimable Rewards */}
              <h2 className="text-lg font-bold mb-2">Unclaimable Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.filter(event =>
                  arrayHasUser(event.absentStudents)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  arrayHasUser(event.absentStudents)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No unclaimable rewards</div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                userId={userId}
                timers={timers}
                handleClaimReward={handleClaimReward}
                handleJoinEvent={handleJoinEvent}
                statusFilter={statusFilter}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
              <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            </div>
          )}
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
  )
}
// EventCard component for rendering each event in the grid
const EventCard = ({ event, userId, timers, handleClaimReward, handleJoinEvent, statusFilter }) => {
  const userData = new AuthModel().getUserData();
  const matchesUser = (entry) => {
    if (!entry || !userId) return false;
    if (typeof entry === 'string') return entry === String(userId);
    if (typeof entry === 'object') {
      const entryId = entry._id || entry.id;
      if (entryId) return String(entryId) === String(userId);
      if (typeof entry.toString === 'function') return entry.toString() === String(userId);
    }
    return false;
  };
  const arrayHasUser = (arr) => Array.isArray(arr) && arr.some(matchesUser);
  // Helper to check if event is ongoing
  const isEventOngoing = (event) => {
    if (!event?.time?.start || !event?.time?.end || !event?.date) return false;
    const now = new Date();
    const eventStart = new Date(event.date);
    const [startHourStr, startMinuteStr] = event.time.start.replace(/AM|PM/i, "").split(":");
    let startHour = Number(startHourStr);
    const startMinute = Number(startMinuteStr || 0);
    if (/PM/i.test(event.time.start) && startHour !== 12) startHour += 12;
    if (/AM/i.test(event.time.start) && startHour === 12) startHour = 0;
    eventStart.setHours(startHour, startMinute, 0, 0);
    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);
    return now >= eventStart && now <= eventEnd;
  };
  const hasEnded = (event) => {
    if (!event?.time?.end || !event?.date) return false;
    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);
    return new Date() > eventEnd;
  };
  const hasJoined = arrayHasUser(event.registeredStudents);
  const isFull = typeof event.maxStudents === 'number' && Array.isArray(event.registeredStudents) && event.registeredStudents.length >= event.maxStudents;
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden relative`}>
      {/* Finalized banner: only show for admin/superadmin */}
      {event.finalized && userData?.role && (userData.role === 'admin' || userData.role === 'superadmin') && (
        <div className="absolute top-0 left-0 w-full flex justify-center z-20">
          <div className="bg-green-500 text-white font-bold text-sm px-6 py-2 rounded-b shadow-md mt-0 mb-2">
            Finalized
          </div>
        </div>
      )}
      {/* Attendance status banner and background icon for Claim Reward tab */}
      {statusFilter === 'Claim Reward' && (
        <>
          {/* Banner */}
          <div className="absolute top-0 left-0 w-full flex justify-center z-10">
            {arrayHasUser(event.attendedStudents) ? (
              <div className="bg-green-500 text-white font-bold text-sm px-6 py-2 rounded-b shadow-md mt-0 mb-2">
                Marked Present
              </div>
            ) : (
              <div className="bg-red-500 text-white font-bold text-sm px-6 py-2 rounded-b shadow-md mt-0 mb-2">
                Marked Absent
              </div>
            )}
          </div>
        </>
      )}
      <div className="p-5 pt-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {event.category}
            </span>
            {isEventOngoing(event) && (
              <>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Started
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {timers[event._id] || 'loading...'}
                </span>
              </>
            )}
          </div>
          <span className="flex items-center text-blue-600 font-medium">
            <CalendarIcon size={16} className="mr-1" />
            {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">{event.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{event.description?.substring(0, 60)}{event.description?.length > 60 ? '...' : ''}</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-500">
            <ClockIcon size={16} className="mr-1" />{event.time.start} - {event.time.end}
          </div>
          <div className="flex items-center text-gray-500"><MapPinIcon size={16} className="mr-1" />{event.location}</div>
        </div>
        <div className="mt-4 flex items-center text-blue-600"><CoinsIcon size={16} className="mr-1" />{event.reward} CampusCoin reward</div>
        <div className="mt-5 flex justify-between items-center relative">
          <Link to={`/student/event/${event._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View details</Link>
          {/* Claim Now button for Claim Reward tab (enabled for present, disabled for absent) */}
          {statusFilter === 'Claim Reward' && (
            arrayHasUser(event.claimedStudents) ? (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-gray-300 text-gray-600 text-sm font-bold rounded shadow cursor-not-allowed"
                disabled
              >
                Claimed
              </button>
            ) : arrayHasUser(event.attendedStudents) ? (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded shadow hover:bg-green-700 transition-colors"
                onClick={() => handleClaimReward(event._id)}
              >
                Claim Now
              </button>
            ) : (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-red-400 text-white text-sm font-bold rounded shadow opacity-60 cursor-not-allowed"
                disabled
              >
                Claim Now
              </button>
            )
          )}
          {/* Register/Joined button for non-Claim Reward tabs */}
          {statusFilter !== 'Claim Reward' && (
            hasJoined ? (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-gray-300 text-gray-600 text-sm font-bold rounded shadow cursor-not-allowed"
                disabled
              >
                Registered
              </button>
            ) : isFull ? (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-gray-300 text-gray-600 text-sm font-bold rounded shadow cursor-not-allowed"
                disabled
              >
                Full
              </button>
            ) : hasEnded(event) ? (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-gray-300 text-gray-600 text-sm font-bold rounded shadow cursor-not-allowed"
                disabled
              >
                Closed
              </button>
            ) : (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow hover:bg-blue-700 transition-colors"
                onClick={() => handleJoinEvent(event._id, event.title)}
              >
                Register
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;
