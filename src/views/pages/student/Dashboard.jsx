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
import authController from '../../../controllers/authController';
import { useBalance } from "../../../views/components/BalanceContext";

const StudentDashboard = () => {
  const { balance } = useBalance()
  const [userProfile, setUserProfile] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(0);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await authController.fetchUserProfile();
      if (res.success) {
        setUserProfile(res.user);
      } else {
        console.error('Failed to fetch profile:', res.error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      const res = await productController.getUserOrders();
      if (res.success) {
        const transactions = res.orders.map((o) => ({
          _id: o._id,
          status: o.status,
          productId: o.productId,
          totalPrice: o.totalPrice,
          createdAt: o.createdAt,
        }));
        const sorted = transactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentTransactions(sorted.slice(0, 3));
      }
    };
    fetchRecentTransactions();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventController.getAllEvents();
      if (res.success) setAllEvents(res.events);
    };
    fetchEvents();
  }, []);

  // Fetch attendance count
  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await eventController.getJoinedCompletedEventsCount();
      if (res.success) setAttendanceCount(res.count);
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

  const fullName = userProfile?.first_name || 'Student';

  return (
    <div className="pt-20 md:ml-64 min-h-screen  px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500/70">Dashboard Overview</p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome back, {fullName}!
        </h1>
        <p className="text-sm text-gray-600">
          Here's what's happening with your CampusCoin account
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
        <WalletCard />
        {/* Stats Card */}
        <div className="cc-card rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <CalendarIcon size={18} />
                <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Events</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{attendanceCount}</p>
              <p className="text-xs font-medium text-gray-500">Attended</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <TrendingUpIcon size={18} />
                <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Streak</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">5</p>
              <p className="text-xs font-medium text-gray-500">Days</p>
            </div>
          </div>
        </div>

        {/* Next Event Card */}
        <div className="cc-card rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Next Event</h2>
          </div>
          {nextEvent ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{nextEvent.title}</h3>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <ClockIcon size={16} />
                <span>
                  {new Date(nextEvent.date).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon size={16} />
                <span>{nextEvent.location}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                <CoinsIcon size={16} />
                <span>{nextEvent.reward} CampusCoin reward</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Upcoming Events & Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="cc-card mb-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link to="/student/events" className="text-sm font-medium text-emerald-600 transition hover:text-emerald-800">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 3).map(event => (
                  <EventCard key={event._id} event={event} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="cc-card rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <Link to="/student/transactions" className="text-sm font-medium text-emerald-600 transition hover:text-emerald-800">
                View all
              </Link>
            </div>
            <RecentTransactionsCard transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
