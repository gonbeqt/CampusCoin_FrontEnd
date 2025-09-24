import React, { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, UserPlusIcon } from 'lucide-react'
const UserManagement = () => {
  const [students, setStudents] = useState([
    {
      id: 'ST12345',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      presentToday: true,
      totalPresent: 15,
      totalAbsent: 2,
    },
    {
      id: 'ST12346',
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      presentToday: false,
      totalPresent: 12,
      totalAbsent: 5,
    },
    {
      id: 'ST12347',
      name: 'Michael Johnson',
      email: 'michael.johnson@university.edu',
      presentToday: true,
      totalPresent: 17,
      totalAbsent: 0,
    },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(null)
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    presentToday: false,
    totalPresent: 0,
    totalAbsent: 0,
  })
  const handleAddStudent = () => {
    const studentId = `ST${Math.floor(10000 + Math.random() * 90000)}`
    const student = {
      id: studentId,
      name: newStudent.name || '',
      email: newStudent.email || '',
      presentToday: false,
      totalPresent: 0,
      totalAbsent: 0,
    }
    setStudents([...students, student])
    setNewStudent({
      name: '',
      email: '',
      presentToday: false,
      totalPresent: 0,
      totalAbsent: 0,
    })
    setShowAddModal(false)
  }
  const handleEditStudent = () => {
    if (!currentStudent) return
    setStudents(
      students.map((student) =>
        student.id === currentStudent.id ? currentStudent : student
      )
    )
    setShowEditModal(false)
    setCurrentStudent(null)
  }
  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter((student) => student.id !== id))
    }
  }
  const handleToggleAttendance = (id) => {
    setStudents(
      students.map((student) => {
        if (student.id === id) {
          const presentToday = !student.presentToday
          return {
            ...student,
            presentToday,
            totalPresent: presentToday 
              ? student.totalPresent + 1 
              : student.totalPresent > 0 
                ? student.totalPresent - 1 
                : 0,
            totalAbsent: !presentToday 
              ? student.totalAbsent + 1 
              : student.totalAbsent > 0 
                ? student.totalAbsent - 1 
                : 0,
          }
        }
        return student
      })
    )
  }
  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlusIcon size={18} className="mr-2" />
            Add Student
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Manage students and track their attendance.
        </p>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Attendance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Present
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Absent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleAttendance(student.id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.presentToday
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.presentToday ? (
                          <>
                            <CheckIcon size={14} className="mr-1" />
                            Present
                          </>
                        ) : (
                          <>
                            <XIcon size={14} className="mr-1" />
                            Absent
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.totalPresent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.totalAbsent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentStudent(student)
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddStudent()
              }}
            >
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Student Modal */}
      {showEditModal && currentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditStudent()
              }}
            >
              <div className="mb-4">
                <label htmlFor="edit-id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <input
                  type="text"
                  id="edit-id"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                  value={currentStudent.id}
                  disabled
                />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={currentStudent.name}
                  onChange={(e) =>
                    setCurrentStudent({ ...currentStudent, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="edit-email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={currentStudent.email}
                  onChange={(e) =>
                    setCurrentStudent({ ...currentStudent, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Today
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={currentStudent.presentToday}
                      onChange={() =>
                        setCurrentStudent({ ...currentStudent, presentToday: true })
                      }
                    />
                    <span className="ml-2">Present</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={!currentStudent.presentToday}
                      onChange={() =>
                        setCurrentStudent({ ...currentStudent, presentToday: false })
                      }
                    />
                    <span className="ml-2">Absent</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="edit-present" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Present
                  </label>
                  <input
                    type="number"
                    id="edit-present"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={currentStudent.totalPresent}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        totalPresent: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="edit-absent" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Absent
                  </label>
                  <input
                    type="number"
                    id="edit-absent"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={currentStudent.totalAbsent}
                    onChange={(e) =>
                      setCurrentStudent({
                        ...currentStudent,
                        totalAbsent: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default UserManagement