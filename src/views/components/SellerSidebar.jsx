import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  PackageIcon,
  PlusCircleIcon,
  BarChart2Icon,
  SettingsIcon,
  CoinsIcon,
} from 'lucide-react'

const SellerSidebar = ({ user, showMobileMenu }) => {
  const location = useLocation()

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
        {user?.role === 'seller' && (
          <div className="mb-6 px-4 py-3 bg-blue-700 rounded-lg">
            <p className="text-sm font-medium text-white">Store ID</p>
            <p className="text-lg font-bold text-white">{user?.storeId}</p>
          </div>
        )}
        <ul className="space-y-2">
          {sellerNavItems.map((item) => (
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

export default SellerSidebar