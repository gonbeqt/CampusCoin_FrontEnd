import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import RoleBasedSidebar from './RoleBasedSidebar'
import AuthController from '../../controllers/authController'

const Layout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = AuthController.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) {
    return <div>Loading...</div> // Or a spinner
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <RoleBasedSidebar user={user} userType={user.role} showMobileMenu={showMobileMenu} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={user} showMobileMenu={showMobileMenu} toggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default Layout