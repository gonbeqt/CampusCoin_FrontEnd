import React from 'react'
import {  useNavigate } from 'react-router-dom'
import { BellIcon, MenuIcon, XIcon } from 'lucide-react'
import AuthController from '../../controllers/authController'
const Navbar = ({ user, showMobileMenu, toggleMobileMenu }) => {
  const navigate = useNavigate()
  const [notifications] = React.useState(3)

  const handleLogout = async () => {
    await AuthController.logout()
    navigate('/login')
  }
const nameParts = [
    user.first_name,
    user.middle_name,
    user.last_name,
  ].filter(part => part != null && part !== '').map(part => part.trim());

  // Handle suffix separately
  const suffix = user.suffix && user.suffix.trim() ? user.suffix.trim() : null;

  // Join name parts with a single space
  let fullName = nameParts.join(' ').trim();

  // Append suffix without a space if it exists
  if (suffix) {
    fullName = fullName ? `${fullName}${suffix}` : suffix;
  }
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed top-0 left-0 right-0 z-50 md:left-64">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          <button
            className="p-2 mr-2 text-gray-600 rounded-lg md:hidden hover:bg-gray-100"
            onClick={toggleMobileMenu}
          >
            {showMobileMenu ? <XIcon size={24} /> : <MenuIcon size={24} />}
            <span className="sr-only">Toggle sidebar</span>
          </button>
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            CampusCoin
          </span>
        </div>
        <div className="flex items-center">
          <div className="relative mr-3">
            <button className="p-1 text-gray-600 hover:text-blue-600 focus:outline-none">
              <BellIcon size={24} />
              {notifications > 0 && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {notifications}
                </div>
              )}
            </button>
          </div>
          <div className="flex items-center">
            <div className="mr-3 hidden md:block">
              <div className="text-sm font-medium text-gray-900">
                {fullName}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'student'
                  ? `ID: ${user?.studentId}`
                  : 'Administrator'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-blue-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
export default Navbar