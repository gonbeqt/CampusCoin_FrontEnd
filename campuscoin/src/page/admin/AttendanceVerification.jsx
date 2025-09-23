import React, { useState } from 'react'
import {
  CheckIcon,
  XIcon,
  SearchIcon,
  FilterIcon,
  UserIcon,
} from 'lucide-react'
// Mock attendance data
const attendanceData = [
  {
    id: '1',
    studentName: 'Emma Thompson',
    studentId: 'ST54321',
    eventTitle: 'Blockchain Technology Workshop',
    checkInTime: '2023-10-15T14:05:23',
    status: 'pending',
    reward: 50,
  },
  {
    id: '2',
    studentName: 'Michael Johnson',
    studentId: 'ST65432',
    eventTitle: 'Blockchain Technology Workshop',
    checkInTime: '2023-10-15T14:10:45',
    status: 'pending',
    reward: 50,
  },
  {
    id: '3',
    studentName: 'Sophia Williams',
    studentId: 'ST76543',
    eventTitle: 'AI Research Seminar',
    checkInTime: '2023-10-10T10:03:12',
    status: 'approved',
    reward: 30,
  },
  {
    id: '4',
    studentName: 'James Brown',
    studentId: 'ST87654',
    eventTitle: 'AI Research Seminar',
    checkInTime: '2023-10-10T10:08:37',
    status: 'rejected',
    reward: 30,
  },
  {
    id: '5',
    studentName: 'Olivia Davis',
    studentId: 'ST98765',
    eventTitle: 'Database Systems Lecture',
    checkInTime: '2023-10-08T09:32:19',
    status: 'approved',
    reward: 50,
  },
]
const AttendanceVerification = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'approved', 'rejected'
  const filteredAttendance = attendanceData.filter((attendance) => {
    const matchesSearch =
      attendance.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendance.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || attendance.status === statusFilter
    return matchesSearch && matchesStatus
  })
  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Attendance Verification
        </h1>
        <p className="text-gray-600">
          Verify student attendance and approve CampusCoin rewards
        </p>
      </div>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search students or events..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <FilterIcon size={16} className="text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">Status:</span>
              <div className="ml-3 space-x-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('approved')}
                >
                  Approved
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('rejected')}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Reward
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon size={20} className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {attendance.studentId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {attendance.eventTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(attendance.checkInTime).toLocaleString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        },
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 font-medium">
                      {attendance.reward} CampusCoin
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : attendance.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {attendance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button className="p-1 bg-green-100 rounded-full text-green-600 hover:bg-green-200">
                          <CheckIcon size={16} />
                        </button>
                        <button className="p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200">
                          <XIcon size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAttendance.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No attendance records found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
export default AttendanceVerification