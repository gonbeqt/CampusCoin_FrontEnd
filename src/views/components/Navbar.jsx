import{useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon, MenuIcon, XIcon,CheckIcon } from 'lucide-react'
import AuthController from '../../controllers/authController'
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

  const [notifications] = useState([
    {
      id: '1',
      message: 'New event: Coding Workshop this Friday',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: '2',
      message: 'You earned 50 CampusCoins for attending Database Lecture',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      message: 'Reminder: AI Research Seminar tomorrow',
      time: '1 day ago',
      read: false,
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

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
           <button className="p-1 text-gray-600 hover:text-blue-600 focus:outline-none" onClick={toggleNotifications}>
              <BellIcon size={24} />
              {notifications > 0 && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {notifications}
                </div>
              )}
            </button>
          <div className="relative mr-3">
           
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-800">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  <CheckIcon size={14} className="mr-1" /> Mark all as read
                </button>
              </div>
            </div>
          )}
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
      </div>
    </nav>
  )
}
export default Navbar