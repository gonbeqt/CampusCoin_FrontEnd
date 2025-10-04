import React, { useState, useEffect } from 'react'
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
  const { balance, setBalance } = useBalance();
  const [allEvents, setAllEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [joinedEvents, setJoinedEvents] = useState([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timers, setTimers] = useState({});

  const userData = authModel.getUserData();
  const userId = userData?._id || userData?.id;

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventController.getAllEvents()
      if (res.success) setAllEvents(res.events)
      else console.error('Error fetching events:', res.error)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  // Live timers for ongoing events
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};
      allEvents.forEach(event => {
        if (isEventOngoing(event)) updatedTimers[event._id] = getTimeRemaining(event);
      });
      setTimers(updatedTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [allEvents]);

  // Determine event status dynamically
  const getEventStatus = (event) => {
    const now = new Date();
    const hasJoined = event.registeredStudents?.includes(userId);
    const rewardClaimed = event.claimedStudents?.includes(userId);

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
  let filteredEvents = allEvents.filter(event => {
    const status = getEventStatus(event);
    if (statusFilter === 'Claim Reward') {
      const isFinalized = event.finalized === true;
      const isRegistered = Array.isArray(event.registeredStudents) && event.registeredStudents.includes(userId);
      if (!(isFinalized && isRegistered)) return false;
      // Claim status filter
      if (claimStatus === 'claimed' && !(event.claimedStudents && event.claimedStudents.includes(userId))) return false;
      if (claimStatus === 'unclaimed' && !(Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) && !(event.claimedStudents && event.claimedStudents.includes(userId)))) return false;
      if (claimStatus === 'unclaimable' && !(Array.isArray(event.absentStudents) && event.absentStudents.includes(userId))) return false;
    } else if (statusFilter !== 'All' && status !== statusFilter) {
      return false;
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

  if (loading) return <div className="pt-16 md:ml-64 flex justify-center items-center h-64"><p className="text-gray-500">Loading events...</p></div>
  const eventTypes = [...new Set(allEvents.map(event => event.category).filter(Boolean))];

  return (
  <div className="pt-16 md:ml-64">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Events</h1>
      <p className="text-gray-600">Discover events, join, and earn CampusCoins by attending</p>
    </div>

    {/* Type filter buttons */}
    <div className="flex gap-2 mb-4">
      {eventTypes.length > 0 && (
        <>
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1 rounded-full ${categoryFilter === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setCategoryFilter(type)}
              className={`px-3 py-1 rounded-full ${categoryFilter === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </>
      )}
    </div>

      {showSuccessMessage && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">{showSuccessMessage}</div>}

      {/* Status Tabs */}
      <div className="flex gap-4 mb-4">
        {statusCategories.map(status => (
          <button
            key={status}
            className={`px-4 py-2 rounded-md font-medium ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search bar (and filter only for Claim Reward) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="pl-10 pr-4 py-1.5 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {statusFilter === 'Claim Reward' && (
          <>
            {/* Sort by A-Z/Z-A */}
            <select
              className="w-full sm:w-40 px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </select>
            {/* Filter by claim status */}
            <select
              className="w-full sm:w-48 px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
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
              className="w-full sm:w-48 px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
              value={rewardOrder}
              onChange={e => setRewardOrder(e.target.value)}
            >
              <option value="none">Reward (default)</option>
              <option value="asc">Reward: Low to High</option>
              <option value="desc">Reward: High to Low</option>
            </select>
            {/* Filter by date (recent/oldest) */}
            <select
              className="w-full sm:w-48 px-2 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
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
              <h2 className="text-lg font-bold mb-2">Unclaimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) &&
                  !(event.claimedStudents && event.claimedStudents.includes(userId))
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) &&
                  !(event.claimedStudents && event.claimedStudents.includes(userId))
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No unclaimed rewards</div>
                )}
              </div>
            </>
          )}
          {claimStatus === 'claimed' && (
            <>
              <h2 className="text-lg font-bold mb-2">Claimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  event.claimedStudents && event.claimedStudents.includes(userId)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  event.claimedStudents && event.claimedStudents.includes(userId)
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
                  Array.isArray(event.absentStudents) && event.absentStudents.includes(userId)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  Array.isArray(event.absentStudents) && event.absentStudents.includes(userId)
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
                  Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) &&
                  !(event.claimedStudents && event.claimedStudents.includes(userId))
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) &&
                  !(event.claimedStudents && event.claimedStudents.includes(userId))
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No unclaimed rewards</div>
                )}
              </div>

              {/* Claimed Rewards */}
              <h2 className="text-lg font-bold mb-2">Claimed Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.filter(event =>
                  event.claimedStudents && event.claimedStudents.includes(userId)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  event.claimedStudents && event.claimedStudents.includes(userId)
                ).length === 0 && (
                  <div className="col-span-full text-center py-4 text-gray-500">No claimed rewards</div>
                )}
              </div>

              {/* Unclaimable Rewards */}
              <h2 className="text-lg font-bold mb-2">Unclaimable Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.filter(event =>
                  Array.isArray(event.absentStudents) && event.absentStudents.includes(userId)
                ).map(event => (
                  <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
                ))}
                {filteredEvents.filter(event =>
                  Array.isArray(event.absentStudents) && event.absentStudents.includes(userId)
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
              <EventCard key={event._id} event={event} userId={userId} timers={timers} handleClaimReward={handleClaimReward} statusFilter={statusFilter} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
              <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// EventCard component for rendering each event in the grid
const EventCard = ({ event, userId, timers, handleClaimReward, statusFilter }) => {
  const userData = new AuthModel().getUserData();
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
            {Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) ? (
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
            event.claimedStudents && event.claimedStudents.includes(userId) ? (
              <button
                className="absolute right-0 bottom-0 mb-1 mr-1 px-4 py-2 bg-gray-300 text-gray-600 text-sm font-bold rounded shadow cursor-not-allowed"
                disabled
              >
                Claimed
              </button>
            ) : Array.isArray(event.attendedStudents) && event.attendedStudents.includes(userId) ? (
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
        </div>
      </div>
    </div>
  );
};

export default Events;
