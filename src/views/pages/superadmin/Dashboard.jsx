import React from 'react'
import { Link } from 'react-router-dom'
import {
  UsersIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ClipboardCheckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react'
import Skeleton from '../../components/Skeleton'
import validationController from '../../../controllers/validationController'

const SuperAdminDashboard = ({ user }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [dashboardData, setDashboardData] = React.useState({
      totalUsers: 0,
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalSuspended: 0,
      recentValidations:[]

  })

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('authToken')

        // Fetch stats
        const statsRes = await validationController.getValidationStats(token)

        // Fetch recent validations (latest users list)
        const usersRes = await validationController.getAllUsersForSuperAdmin({
          page: 1,
          limit: 10,
          token,
        })

        if (statsRes.success && usersRes.success) {
          setDashboardData({
              totalUsers: statsRes.totalUsers || 0,
              totalPending: statsRes.totalPending || 0,
              totalApproved: statsRes.totalApproved || 0,
              totalRejected: statsRes.totalRejected || 0,
              totalSuspended: statsRes.totalSuspended || 0,
              recentValidations: usersRes.users || [],
           })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="pt-16 md:ml-64 min-h-screen ">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {user?.first_name}. Manage user validations and system administration.
        </p>
      </div>

      {isLoading ? (
       <div className="p-4">
                       <Skeleton rows={6} />
                     </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold mt-1">
                    {dashboardData.totalUsers}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <UsersIcon size={24} className="text-emerald-600" />
                </div>
              </div>
            
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500">Pending Validations</p>
                  <p className="text-2xl font-bold mt-1">
                    {dashboardData.totalPending}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShieldCheckIcon size={24} className="text-emerald-600" />
                </div>
              </div>
             
            </div>

            {/* Sellers */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500">Approve Validations</p>
                  <p className="text-2xl font-bold mt-1">
                    {dashboardData.totalApproved}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShieldCheckIcon size={24} className="text-emerald-600" />
                </div>
              </div>
              
            </div>
          </div>

          {/* Recent Activity + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Recent Validation Activity
                  </h2>
                  <Link
                    to="/superadmin/users"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all users
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recentValidations.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name || user.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 capitalize">
                              {user.role}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.accountStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : user.accountStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.accountStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-lg shadow p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Validation Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircleIcon size={20} className="text-red-500 mr-2" />
                      <span className="text-sm text-gray-700">Rejected Users</span>
                    </div>
                    <span className="text-sm font-medium">{dashboardData.totalRejected}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ClipboardCheckIcon size={20} className="text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-700">Suspended Users</span>
                    </div>
                    <span className="text-sm font-medium">{dashboardData.totalSuspended}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <Link to="/superadmin/validate/admin" className="block w-full text-left px-4 py-2 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Validate admin accounts</Link>
                  <Link to="/superadmin/validate/student" className="block w-full text-left px-4 py-2 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Validate student accounts</Link>
                  <Link to="/superadmin/validate/seller" className="block w-full text-left px-4 py-2 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Validate seller accounts</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SuperAdminDashboard
