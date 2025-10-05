import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuIcon, XIcon } from 'lucide-react'
import AuthController from '../../controllers/authController'
import NotificationBell from '../../components/NotificationBell'
import NotificationModal from '../../components/NotificationModal'
const Navbar = ({ user, showMobileMenu, toggleMobileMenu }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await AuthController.logout()
    navigate('/login')
  }
  const nameParts = [
  user?.first_name,
  user?.middle_name,
  user?.last_name,
].filter(part => part != null && part !== '').map(part => part.trim());

const suffix = user?.suffix && user.suffix.trim() ? user.suffix.trim() : null;

let fullName = nameParts.join(' ').trim();
if (suffix) {
  fullName = fullName ? `${fullName} ${suffix}` : suffix;
}

  // Notification functionality moved to NotificationBell component

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
          <NotificationBell />
          <NotificationModal />
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