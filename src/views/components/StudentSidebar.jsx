import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBalance } from "./BalanceContext";
import {
  HomeIcon,
  CalendarIcon,
  ShoppingBagIcon,
  HistoryIcon,
  X,
} from 'lucide-react'

import WebLogo from '../../assets/images/Web logo.png'

const StudentSidebar = ({ user, showMobileMenu, onNavigate }) => {
  const location = useLocation()
  const { balance } = useBalance()

  const studentNavItems = [
    { name: 'Dashboard', path: '/student', icon: <HomeIcon size={20} /> },
    { name: 'Events', path: '/student/events', icon: <CalendarIcon size={20} /> },
    { name: 'Rewards', path: '/student/rewards', icon: <ShoppingBagIcon size={20} /> },
    { name: 'Transactions', path: '/student/transactions', icon: <HistoryIcon size={20} /> },
  ]

  const sidebarClasses = `fixed top-0 left-0 z-[60] h-screen transition-transform ${
    showMobileMenu ? 'translate-x-0' : '-translate-x-full'
  } md:w-64 md:translate-x-0`;

  const handleNavigate = () => {
    if (onNavigate) onNavigate()
  }

  return (
    <aside className={sidebarClasses} aria-label="Sidebar" id="sidebar-navigation">
      {/* Sidebar Container */}
      <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 px-5 py-6 text-emerald-50 font-sans">
        
        {/* Mobile Header */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-semibold text-emerald-100/80">Menu</span>
          <button
            type="button"
            onClick={handleNavigate}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 px-3 py-1.5 text-xs font-medium text-emerald-50 transition-colors hover:bg-emerald-700/50"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>

        {/* Header Section with Pure Logo */}
        <div className="flex items-center gap-3 px-4 py-4">
          {/* ✅ Pure logo without container */}
          <img
            src={WebLogo}
            alt="CampusCoin Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <p className="text-sm font-medium text-emerald-100/90">CampusCoin</p>
            <p className="text-base font-semibold text-white">Student Hub</p>
          </div>
        </div>

        {/* Balance Section */}
        {user?.role === 'student' && (
          <div className="mt-6 rounded-lg border border-emerald-600/40 bg-emerald-700/30 px-4 py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-100/80">
              Balance
            </p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
              <img src={WebLogo} alt="Web Logo" className="h-6 w-6" /> {balance}
            </p>
            <p className="text-xs font-medium text-emerald-100/60 mt-1">
              Attend events to earn more rewards.
            </p>
          </div>
        )}

        {/* Navigation */}
        <ul className="mt-8 space-y-1.5">
          {studentNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                onClick={handleNavigate}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-emerald-600/40 text-white'
                    : 'text-emerald-100 hover:bg-emerald-700/40 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                    location.pathname === item.path
                      ? 'bg-emerald-600/70 text-white'
                      : 'bg-emerald-600/30 text-emerald-100 group-hover:bg-emerald-600/50 group-hover:text-white'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto pt-8 text-xs text-emerald-100/70 border-t border-emerald-700/50">
          <p className="font-semibold">Need help?</p>
          <p className="text-emerald-100/60">Contact your campus support.</p>
        </div>
      </div>
    </aside>
  )
}

export default StudentSidebar
