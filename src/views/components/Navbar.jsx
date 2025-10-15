import { useNavigate } from 'react-router-dom'
import { MenuIcon, XIcon, CoinsIcon } from 'lucide-react'
import AuthController from '../../controllers/authController'
import NotificationBell from '../../components/NotificationBell'
import NotificationModal from '../../components/NotificationModal'
import LogoutConfirmModal from '../../components/LogoutConfirmModal'
import { useState } from 'react'

const Navbar = ({ user, showMobileMenu, toggleMobileMenu }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await AuthController.logout()
    navigate('/login')
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  const confirmLogout = async () => {
    setConfirmOpen(false)
    await handleLogout()
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur-xl shadow-sm md:left-64">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 md:px-8 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 transition-colors hover:bg-emerald-50 md:hidden"
              onClick={toggleMobileMenu}
              type="button"
              aria-expanded={showMobileMenu}
              aria-controls="sidebar-navigation"
            >
              {showMobileMenu ? <XIcon size={22} /> : <MenuIcon size={22} />}
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-semibold text-emerald-700">
                <CoinsIcon size={20} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-emerald-900 sm:text-lg">CampusCoin</p>
                <p className="hidden text-xs font-medium uppercase tracking-[0.25em] text-emerald-500/90 sm:block">Engage · Reward · Grow</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden flex-col items-end text-right sm:flex">
              <p className="text-sm font-semibold text-emerald-900">{displayName}</p>
              <p className="text-xs font-medium text-emerald-500">
                {user?.role === 'student'
                  ? user?.student_id || 'Student'
                  : user?.role === 'seller'
                  ? 'Seller'
                  : user?.role === 'admin'
                  ? 'Admin'
                  : user?.role === 'superadmin'
                  ? 'Operator'
                  : 'Member'}
              </p>
            </div>
            <div className="relative flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <NotificationModal />
              <>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="rounded-full border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100/80 hover:text-emerald-900"
                  type="button"
                >
                  Logout
                </button>
                <LogoutConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmLogout} />
              </>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col leading-tight text-left sm:hidden">
          <p className="text-sm font-semibold text-emerald-900">{displayName}</p>
          <p className="text-xs font-medium text-emerald-500">
            {user?.role === 'student'
              ? user?.student_id || 'Student'
              : user?.role === 'seller'
              ? 'Seller'
              : user?.role === 'admin'
              ? 'Admin'
              : user?.role === 'superadmin'
              ? 'Operator'
              : 'Member'}
          </p>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
