
import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import SuperAdminSidebar from './SuperAdminSidebar'
import { useAuth } from './AuthContext'

const SuperAdminLayout = () => {
  const { user, loading } = useAuth()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  if (loading) {
    return <div>Loading...</div> // Or a spinner
  }

  // If no user is logged in, or if the user is not a superadmin, redirect to login
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login" replace />
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar showMobileMenu={showMobileMenu} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={user} showMobileMenu={showMobileMenu} toggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
