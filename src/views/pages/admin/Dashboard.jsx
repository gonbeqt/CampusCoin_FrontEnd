import React, { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom'
import {
  CalendarIcon,
  UsersIcon,
  CoinsIcon,
  TrendingUpIcon,
  BarChartIcon,
  PieChartIcon,
} from 'lucide-react'
import WalletConnect from '../../../views/components/WalletConnect'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const AdminDashboard = ({ user }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalStudents: 0,
    totalCoinsIssued: 0,
    totalCoinsRedeemed: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ totalAttended: 0, totalPossible: 0 });
  const [attendanceByCategory, setAttendanceByCategory] = useState([]);
  const [eventAttendanceTimeline, setEventAttendanceTimeline] = useState([]);
  const [chartType, setChartType] = useState('pie'); // pie | bar | line
  const [showChartMenu, setShowChartMenu] = useState(false);
  const chartMenuRef = useRef(null);
  const chartOptions = [
    { value: 'pie', label: 'Attendance Pie' },
    { value: 'bar', label: 'Attendance by Category' },
    { value: 'line', label: 'Events & Attendance Over Time' }
  ];

  // Close chart menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (chartMenuRef.current && !chartMenuRef.current.contains(event.target)) {
        setShowChartMenu(false);
      }
    }
    if (showChartMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChartMenu]);
  useEffect(() => {
    // Fetch analytics
    fetch(`${API_BASE}/admin-dashboard/analytics`)
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          totalEvents: data.totalEvents,
          totalStudents: data.totalStudents,
          totalCoinsIssued: data.totalCampusCoin,
          activeEvents: data.activeEvents, // Use backend value
          verifiedStudents: data.verifiedStudents // New value
        }));
        if (data.attendanceSummary) setAttendanceSummary(data.attendanceSummary);
        if (data.attendanceByCategory) setAttendanceByCategory(data.attendanceByCategory);
        if (data.eventAttendanceTimeline) {
          // Sort by date ascending for line chart
          const sortedTimeline = [...data.eventAttendanceTimeline].sort((a, b) => new Date(a.date) - new Date(b.date));
          setEventAttendanceTimeline(sortedTimeline);
        }
      });
    // Fetch all events for recentEvents table (upcoming/ongoing only)
    fetch(`${API_BASE}/events/all-events`)
      .then(res => res.json())
      .then(data => {
        // Debug: log what is returned from backend
        // console.log('Fetched events from backend:', data);
        if (data.events) {
          // Filter for upcoming events
          const upcoming = data.events.filter(ev => ev.status === 'upcoming');
          // Sort by soonest start date/time (nearest future event first)
          const sortedUpcoming = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
          if (sortedUpcoming.length > 0) {
            setRecentEvents(sortedUpcoming.slice(0, 10));
          } else {
            // Fallback: show 10 most recent events (any status), soonest first
            const sortedAll = [...data.events].sort((a, b) => new Date(a.date) - new Date(b.date));
            setRecentEvents(sortedAll.slice(0, 10));
          }
        } else if (Array.isArray(data)) {
          // If backend returns array directly
          // console.log('Fetched events (array):', data);
          const upcoming = data.filter(ev => ev.status === 'upcoming');
          const sortedUpcoming = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
          if (sortedUpcoming.length > 0) {
            setRecentEvents(sortedUpcoming);
          } else {
            const sortedAll = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
            setRecentEvents(sortedAll.slice(0, 5));
          }
        }
      });
  }, []);
  const handleWalletConnect = (balance) => {
    setIsWalletConnected(true);
    setWalletBalance(balance);
  };
  return (
    <div className="pt-16 md:ml-64 min-h-screen ">
      {/* Main grid: make columns equal height */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {user?.name}. Here's an overview of the CampusCoin system.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <WalletConnect 
            onConnect={handleWalletConnect}
            isConnected={isWalletConnected}
            walletBalance={walletBalance}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Events</p>
              <p className="text-2xl font-bold mt-1">{stats.totalEvents}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CalendarIcon size={24} className="text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" /> {stats.activeEvents} active
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">Total Students</p>
              <p className="text-2xl font-bold mt-1">{stats.totalStudents}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <UsersIcon size={24} className="text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-medium flex items-center">
              <TrendingUpIcon size={16} className="mr-1" />
              {stats.verifiedStudents} verified
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">CampusCoin Economy</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalCoinsIssued}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CoinsIcon size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600 font-medium">
              {stats.totalCoinsRedeemed} redeemed
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Make the two main columns stretch to equal height */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-white rounded-lg shadow p-8 flex flex-col flex-1 min-h-[370px] h-full" style={{ height: '100%' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Recent Events
              </h2>
              <Link
                to="/admin/events"
                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
              >
                Manage events
              </Link>
            </div>
            {/* Make table body fill available space and scroll, so card matches height of analytics+quick actions */}
            <div className="overflow-x-auto flex-1 flex flex-col" style={{ minHeight: 0 }}>
              <div className="relative flex-1 flex flex-col h-full" style={{ minHeight: 0 }}>
                <table className="min-w-full divide-y divide-gray-200 text-left table-fixed" style={{ tableLayout: 'fixed' }}>
                  <thead className="bg-gray-50 sticky top-0 z-10" style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Event</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Registered</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Status</th>
                    </tr>
                  </thead>
                </table>
                <div className="overflow-y-auto flex-1" style={{ minHeight: 0, maxHeight: 'calc(100vh - 420px)' }}>
                  <table className="min-w-full divide-y divide-gray-200 text-left table-fixed" style={{ tableLayout: 'fixed' }}>
                    <tbody className="bg-white divide-y divide-gray-200" style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                      {recentEvents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No events found.</td>
                        </tr>
                      ) : (
                        recentEvents.map((event) => (
                          <tr key={event._id || event.id} style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                            <td className="px-6 py-4 whitespace-nowrap w-1/3">
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-1/4">
                              <div className="text-sm text-gray-500">
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-1/6 text-center">
                              <div className="text-sm flex items-center justify-center">
                                {(() => {
                                  const reg = Array.isArray(event.registeredStudents) ? event.registeredStudents.length : 0;
                                  const min = event.minRegistrations;
                                  const max = event.maxRegistrations;
                                  // If max exists, always show reg/max
                                  if (typeof max === 'number') {
                                    if (typeof min === 'number' && reg < min) {
                                      return (
                                        <span className="relative group">
                                          <span className="text-red-600 font-semibold cursor-help">{reg}<sup>*</sup></span>
                                          <span className="mx-1">/</span>
                                          <span>{max}</span>
                                          <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap">
                                            {min} minimum
                                          </span>
                                        </span>
                                      );
                                    } else {
                                      return <span>{reg} / {max}</span>;
                                    }
                                  }
                                  // Only min
                                  if (typeof min === 'number') {
                                    if (reg < min) {
                                      return (
                                        <span className="relative group">
                                          <span className="text-red-600 font-semibold cursor-help">{reg}<sup>*</sup></span>
                                          <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap">
                                            {min} minimum
                                          </span>
                                        </span>
                                      );
                                    } else {
                                      return <span>{reg}</span>;
                                    }
                                  }
                                  // Neither min nor max
                                  return <span>{reg}</span>;
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-1/6">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : event.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{event.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
  <div className="flex flex-col h-full justify-between">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex flex-col items-center justify-center mb-4 w-full">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-lg font-semibold text-gray-700 text-center w-full">
                  Event Analytics
                </h2>
                <div className="relative ml-2" ref={chartMenuRef}>
                  <button
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 bg-blue-50"
                    tabIndex={0}
                    onClick={() => setShowChartMenu((v) => !v)}
                  >
                    {chartOptions.find(opt => opt.value === chartType)?.label}
                  </button>
                  {showChartMenu && (
                    <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow z-10">
                      {chartOptions.map(opt => (
                        <div
                          key={opt.value}
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${chartType === opt.value ? 'font-bold text-blue-700' : ''}`}
                          onClick={() => { setChartType(opt.value); setShowChartMenu(false); }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-80">
              {chartType === 'pie' && (
                <>
                  <ResponsiveContainer width={260} height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Attended', value: attendanceSummary.totalAttended },
                          { name: 'Absent', value: Math.max(attendanceSummary.totalPossible - attendanceSummary.totalAttended, 0) }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        fill="#8884d8"
                      >
                        <Cell key="attended" fill="#4ade80" />
                        <Cell key="absent" fill="#f87171" />
                      </Pie>
                      <Tooltip />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" height={30} wrapperStyle={{ marginTop: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-gray-500 text-sm mt-6 text-center w-full">
                    Attendance from 5 most recent finalized events
                  </p>
                </>
              )}
              {chartType === 'bar' && (
                <>
                  <ResponsiveContainer width={320} height={220}>
                    <BarChart data={attendanceByCategory} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalAttendance" fill="#4ade80" name="Attendance" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-gray-500 text-sm mt-6 text-center w-full">
                    Attendance by category (finalized events)
                  </p>
                </>
              )}
              {chartType === 'line' && (
                <>
                  <ResponsiveContainer width={320} height={220}>
                    <LineChart data={eventAttendanceTimeline} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString()} />
                      <YAxis allowDecimals={false} />
                      <Tooltip labelFormatter={d => new Date(d).toLocaleDateString()} />
                      <Legend />
                      <Line type="monotone" dataKey="eventCount" stroke="#60a5fa" name="Events" dot={false} />
                      <Line type="monotone" dataKey="attendance" stroke="#4ade80" name="Attendance" />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-gray-500 text-sm mt-6 text-center w-full">
                    Events and attendance over time (finalized events)
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-2">
                <Link to="/admin/events" className="block w-full text-left px-4 py-2 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Create new event</Link>
                <Link to="/admin/attendance" className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100">Verify attendance</Link>
                <Link to="/admin/rewards" className="block w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100">Manage rewards</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminDashboard