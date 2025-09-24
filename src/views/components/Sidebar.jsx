import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  CalendarIcon,
  CoinsIcon,
  ShoppingBagIcon,
  HistoryIcon,
  UsersIcon,
  CheckSquareIcon,
  SettingsIcon,
  PackageIcon,
  PlusCircleIcon,
  BarChart2Icon,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
const Sidebar = ({ userType, showMobileMenu }) => {
  const location = useLocation()
  const { user } = useUser()
  const studentNavItems = [
    {
      name: 'Dashboard',
      path: '/student',
      icon: <HomeIcon size={20} />,
    },
    {
      name: 'Events',
      path: '/student/events',
      icon: <CalendarIcon size={20} />,
    },
    {
      name: 'Rewards',
      path: '/student/rewards',
      icon: <ShoppingBagIcon size={20} />,
    },
    {
      name: 'Transactions',
      path: '/student/transactions',
      icon: <HistoryIcon size={20} />,
    },
  ]
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
  const sellerNavItems = [
    {
      name: 'Dashboard',
      path: '/seller',
      icon: <HomeIcon size={20} />,
    },
    {
      name: 'Products',
      path: '/seller/products',
      icon: <PackageIcon size={20} />,
    },
    {
      name: 'Add Product',
      path: '/seller/products/add',
      icon: <PlusCircleIcon size={20} />,
    },
    {
      name: 'Sales',
      path: '/seller/sales',
      icon: <BarChart2Icon size={20} />,
    },
    {
      name: 'Settings',
      path: '/seller/settings',
      icon: <SettingsIcon size={20} />,
    },
  ]
  let navItems
  switch (userType) {
    case 'student':
      navItems = studentNavItems
      break
    case 'admin':
      navItems = adminNavItems
      break
    case 'seller':
      navItems = sellerNavItems
      break
    default:
      navItems = studentNavItems
  }
  // Apply mobile menu visibility classes
  const sidebarClasses = `fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
    showMobileMenu ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0`;
  return (
    <aside
      className={sidebarClasses}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-blue-800">
        <div className="flex items-center mb-5 pl-2.5">
          <CoinsIcon className="w-6 h-6 text-white" />
          <span className="ml-3 text-xl font-semibold text-white">
            CampusCoin
          </span>
        </div>
        {user?.role === 'student' && (
          <div className="mb-6 px-4 py-3 bg-blue-700 rounded-lg">
            <p className="text-sm font-medium text-white">Your Balance</p>
            <p className="text-2xl font-bold text-white flex items-center">
              <CoinsIcon className="w-5 h-5 mr-1" /> {user?.balance || 0}
            </p>
          </div>
        )}
        {user?.role === 'seller' && (
          <div className="mb-6 px-4 py-3 bg-blue-700 rounded-lg">
            <p className="text-sm font-medium text-white">Store ID</p>
            <p className="text-lg font-bold text-white">{user?.storeId}</p>
          </div>
        )}
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${location.pathname === item.path ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-700'}`}
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
export default Sidebar