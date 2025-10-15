import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CheckSquareIcon,
  SettingsIcon,
  ShoppingBagIcon,
  CoinsIcon,
  X,
} from 'lucide-react'

const AdminSidebar = ({ user, showMobileMenu, onNavigate }) => {
  const location = useLocation()

  const adminNavItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <HomeIcon size={20} />,
    },
    {
      name: 'Event Management',
      path: '/admin/events',
      icon: <CalendarIcon size={20} />,
    },
    {
      name: 'Attendance',
      path: '/admin/attendance',
      icon: <CheckSquareIcon size={20} />,
    },
    {
      name: 'Rewards',
      path: '/admin/rewards',
      icon: <ShoppingBagIcon size={20} />,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <UsersIcon size={20} />,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <SettingsIcon size={20} />,
    },
  ]

  const sidebarClasses = `fixed top-0 left-0 z-[60] h-screen transition-transform ${
    showMobileMenu ? 'translate-x-0' : '-translate-x-full'
  } md:w-64 md:translate-x-0`;

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <aside
      className={sidebarClasses}
      aria-label="Sidebar"
      id="sidebar-navigation"
    >
      <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 px-4 py-6 text-emerald-50">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-semibold text-emerald-100/80">Navigation</span>
          <button
            type="button"
            onClick={handleNavigate}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-700/40"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-700/40 px-3 py-4 shadow-lg shadow-emerald-950/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/60">
            <CoinsIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-100/80">CampusCoin</p>
            <p className="text-lg font-semibold text-white">Admin Console</p>
          </div>
        </div>
        <ul className="mt-8 space-y-2">
          {adminNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                onClick={handleNavigate}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${location.pathname === item.path ? 'bg-emerald-500/30 text-white shadow-inner shadow-emerald-900/20' : 'text-emerald-100 hover:bg-emerald-500/20 hover:text-white'}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-100 transition group-hover:bg-emerald-400/30 group-hover:text-white">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-1 pt-8 text-[11px] uppercase tracking-[0.3em] text-emerald-100/60">
          <p>Lead the change.</p>
          <p>Empower every event.</p>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar