import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useUser } from '../../context/UserContext'
const Layout = ({ userType }) => {
  const { user } = useUser()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }
  // If user role doesn't match the required role for this layout, redirect
  if (user.role !== userType) {
    return <Navigate to={`/${user.role}`} replace />
  }
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType={userType} showMobileMenu={showMobileMenu} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar showMobileMenu={showMobileMenu} toggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default Layout