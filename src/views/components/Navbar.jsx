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

  // Robust name extraction for admin display
  const nameParts = [
    user?.first_name || user?.firstName,
    user?.middle_name || user?.middleName,
    user?.last_name || user?.lastName
  ].filter(Boolean).map(part => part.trim());
  const suffix = user?.suffix && user.suffix.trim() ? user.suffix.trim() : null;
  let fullName = nameParts.join(' ').trim();
  if (!fullName) {
    fullName = user?.name || user?.fullName || '';
  }
  if (suffix) {
    fullName = fullName ? `${fullName} ${suffix}` : suffix;
  }

  // Map common role values to user-friendly labels
  const roleLabel = (() => {
    const r = (user?.role || '').toString().toLowerCase();
    const map = {
      admin: 'Admin',
      superadmin: 'Super Admin',
      student: 'Student',
      seller: 'Seller'
    };
    return map[r] || (r ? r.charAt(0).toUpperCase() + r.slice(1) : '');
  })();


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
              {/* Display name (or student ID fallback) and show role label underneath */}
              {(fullName || user?.role) && (
                <>
                  {fullName ? (
                    <div className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{fullName}</div>
                  ) : user?.role === 'student' && user?.student_id ? (
                    <div className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">ID: {user.student_id}</div>
                  ) : (
                    <div className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{user?.email || ''}</div>
                  )}

                  <div className="text-xs text-gray-500 text-start">
                    {user?.role
                      ? `${roleLabel}`
                      : roleLabel}
                  </div>
                </>
              )}
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
