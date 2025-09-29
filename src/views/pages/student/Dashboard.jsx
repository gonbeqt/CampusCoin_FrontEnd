import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  CoinsIcon,
  TrendingUpIcon,
  ClockIcon,
  MapPinIcon,
} from 'lucide-react'
import EventCard from '../../../views/components/EventCard'
import WalletCard from '../../../views/components/WalletCard'
import RecentTransactionsCard from '../../../views/components/RecentTransactionsCard'
import productController from '../../../controllers/productController';
import eventController from '../../../controllers/eventController';

const StudentDashboard = ({ user }) => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      const res = await productController.getUserOrders();
      if (res.success) {
        // Map orders into the format RecentTransactionsCard expects
        const transactions = res.orders.map((o) => ({
          _id: o._id,
          status: o.status, // "paid" | "pending" | "cancelled"
          productId: o.productId,
          totalPrice: o.totalPrice,
          createdAt: o.createdAt,
        }));

        // newest first
        const sorted = transactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setRecentTransactions(sorted.slice(0, 3));
      }
    };

    fetchRecentTransactions();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventController.getAllEvents();
      if (res.success) {
        setAllEvents(res.events);
      } else {
        console.error("Error fetching events:", res.error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await eventController.getJoinedCompletedEventsCount();
      if (res.success) {
        setAttendanceCount(res.count);
      } else {
        console.error("Error fetching attendance:", res.error);
      }
    };

    fetchAttendance();
  }, []);

  const upcomingEvents = allEvents
  .filter(event => {
    if (!event?.date || !event?.time?.start) return false;

    const start = new Date(event.date);
    const [h, m] = event.time.start.replace(/AM|PM/i, "").split(":");
    let hour = Number(h);
    const minute = Number(m || 0);
    if (/PM/i.test(event.time.start) && hour !== 12) hour += 12;
    if (/AM/i.test(event.time.start) && hour === 12) hour = 0;
    start.setHours(hour, minute, 0, 0);

    return start > new Date();
  })
  .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextEvent = upcomingEvents[0] || null;

  const claimableEvents = allEvents.filter(ev => {
    const hasJoined = ev.registeredStudents?.includes(user?._id || user?.id);
    const rewardClaimed = ev.claimedStudents?.includes(user?._id || user?.id);
    const now = new Date();

    if (!ev?.time?.end || !ev?.date) return false;

    // build event end time
    const eventEnd = new Date(ev.date);
    const [endHourStr, endMinuteStr] = ev.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(ev.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(ev.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);

    return hasJoined && !rewardClaimed && now > eventEnd;
  });

  const handleClaimReward = async (eventId) => {
    const res = await eventController.claimReward(eventId);
    if (res.success) {
      user.balance = res.newBalance;

      setAllEvents(prev =>
        prev.map(ev =>
          ev._id === eventId
            ? { ...ev, claimedStudents: [...(ev.claimedStudents || []), user._id || user.id] }
            : ev
        )
      );

      setAllEvents(prev => prev.filter(ev => ev._id !== eventId));

      alert("Reward claimed successfully!");
    } else {
      alert(res.error || "Failed to claim reward");
    }
  };

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your CampusCoin account
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <WalletCard balance={user?.balance || 0} />
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center text-blue-600 mb-2">
                <CalendarIcon size={18} className="mr-2" />
                <span className="font-medium">Events</span>
              </div>
              <p className="text-2xl font-bold">{attendanceCount}</p>
              <p className="text-sm text-gray-500">Attended</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center text-green-600 mb-2">
                <TrendingUpIcon size={18} className="mr-2" />
                <span className="font-medium">Streak</span>
              </div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-500">Days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Next Event</h2>
          </div>
          {nextEvent ? (
            <div>
              <h3 className="font-medium text-gray-800">{nextEvent.title}</h3>
              <div className="flex items-center text-gray-500 mt-2">
                <ClockIcon size={16} className="mr-1" />
                <span className="text-sm">
                  {new Date(nextEvent.date).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPinIcon size={16} className="mr-1" />
                <span className="text-sm">{nextEvent.location}</span>
              </div>
              <div className="mt-3 flex items-center text-blue-600">
                <CoinsIcon size={16} className="mr-1" />
                <span>{nextEvent.reward} CampusCoin reward</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming events</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Upcoming Events
              </h2>
              <Link
                to="/student/events"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 3).map(event => (
                  <EventCard key={event._id} event={event} />
                ))
              ) : (
                <p className="text-gray-500">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Recent Transactions
              </h2>
              <Link
                to="/student/transactions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <RecentTransactionsCard transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default StudentDashboard