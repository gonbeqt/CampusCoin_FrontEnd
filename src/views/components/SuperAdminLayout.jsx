import React, { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import SuperAdminSidebar from './SuperAdminSidebar'
import { useAuth } from './AuthContext'

const SuperAdminLayout = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  if (loading) {
    return <div>Loading...</div> // Or a spinner
  }

  // If no user is logged in, or if the user is not a superadmin, redirect to login
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login" replace />
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setShowMobileMenu(false)
  }

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname])

  return (
    <div className="relative flex min-h-screen bg-transparent">
      <SuperAdminSidebar user={user} showMobileMenu={showMobileMenu} onNavigate={closeMobileMenu} />
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-30 bg-black/45 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={user} showMobileMenu={showMobileMenu} toggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto bg-transparent px-4 py-6 md:px-10 md:py-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
