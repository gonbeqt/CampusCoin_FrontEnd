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

  // Build full name for everyone (students and admins)
  const nameParts = [
    user?.first_name || user?.firstName,
    user?.middle_name || user?.middleName,
    user?.last_name || user?.lastName
  ].filter(Boolean).map(part => part.trim())

  const suffix = user?.suffix && user.suffix.trim() ? user.suffix.trim() : null

  let displayName = nameParts.join(' ').trim()
  if (!displayName) displayName = user?.name || user?.fullName || 'User'
  if (suffix) displayName = `${displayName} ${suffix}`

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
          <div className="flex items-center">
            <NotificationBell />
            <div className="ml-3 hidden md:block text-right">
              <div className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">
                {displayName}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'student'
                  ? `${user?.student_id || 'N/A'}`
                  : 'Administrator'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 text-sm text-blue-600 hover:underline"
            >
              Logout
            </button>
          </div>
          <NotificationModal />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
