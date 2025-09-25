import React from 'react'
import StudentSidebar from './StudentSidebar'
import AdminSidebar from './AdminSidebar'
import SellerSidebar from './SellerSidebar'

const RoleBasedSidebar = ({ user, userType, showMobileMenu }) => {
  if (!user) {
    return null // Or a loading spinner, or redirect to login
  }

  switch (user.role) {
    case 'student':
      return <StudentSidebar user={user} showMobileMenu={showMobileMenu} />
    case 'admin':
      return <AdminSidebar user={user} showMobileMenu={showMobileMenu} />
    case 'seller':
      return <SellerSidebar user={user} showMobileMenu={showMobileMenu} />
    default:
      return null // Handle unknown roles or show a default sidebar
  }
}

export default RoleBasedSidebar