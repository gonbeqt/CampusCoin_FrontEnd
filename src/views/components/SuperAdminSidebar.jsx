import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  SettingsIcon,
  CoinsIcon
} from 'lucide-react'
const SuperAdminSidebar = ({user, showMobileMenu }) => {
  const location = useLocation()
  const navItems = [
    {
      name: 'Dashboard',
      path: '/superadmin',
      icon: <HomeIcon size={20} />,
    },
    {
      name: 'Admin Validation',
      path: '/superadmin/validate/admin',
      icon: <ShieldCheckIcon size={20} />,
    },
    {
      name: 'Student Validation',
      path: '/superadmin/validate/student',
      icon: <UsersIcon size={20} />,
    },
    {
      name: 'Seller Validation',
      path: '/superadmin/validate/seller',
      icon: <ShoppingBagIcon size={20} />,
    },
    {
      name: 'All Users',
      path: '/superadmin/users',
      icon: <CheckCircleIcon size={20} />,
    },
    {
      name: 'Settings',
      path: '/superadmin/settings',
      icon: <SettingsIcon size={20} />,
    },
  ]
  // Apply mobile menu visibility classes
  const sidebarClasses = `fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`
  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-indigo-900">
        <div className="flex items-center mb-5 pl-2.5">
          <CoinsIcon className="w-6 h-6 text-white" />
          <span className="ml-3 text-xl font-semibold text-white">
            CampusCoin Admin
          </span>
        </div>
        <div className="mb-6 px-4 py-3 bg-indigo-800 rounded-lg">
          <p className="text-sm font-medium text-white">Super Admin</p>
          <p className="text-lg font-bold text-white">{user?.name}</p>
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${location.pathname === item.path ? 'bg-indigo-700 text-white' : 'text-white hover:bg-indigo-700'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
export default SuperAdminSidebar