import React, { useState, useEffect } from 'react'

// Toast notification component (copied from EventManagement.jsx)
function Toast({ message, type, show }) {
  return (
    <div
      className={`fixed top-6 right-6 z-[9999] transition-transform duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-3 rounded shadow-lg min-w-[200px] text-center pointer-events-none`}
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}
    >
      {message}
    </div>
  );
}
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, UserPlusIcon } from 'lucide-react'
const UserManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search bar state
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setStudents(
        data.map(u => ({
          id: u._id,
          name: [u.first_name, u.middle_name, u.last_name, u.suffix].filter(Boolean).join(' ') || u.fullname || '',
          email: u.email,
          presentToday: false, // Update if you have attendance data
          totalPresent: 0,
          totalAbsent: 0,
          ...u
        }))
      );
    } catch (err) {
      showToast('Error fetching users: ' + err.message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(null)
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    role: 'student',
    presentToday: false,
    totalPresent: 0,
    totalAbsent: 0,
  })

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  };
  const handleAddStudent = async () => {
    try {
      const backendUrl = 'http://localhost:5000/api/users';
      const payload = {
        first_name: newStudent.first_name,
        middle_name: newStudent.middle_name,
        last_name: newStudent.last_name,
        email: newStudent.email,
        role: newStudent.role
      };
      if (newStudent.suffix && newStudent.suffix.trim() !== '') {
        payload.suffix = newStudent.suffix;
      }
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || 'Failed to add student', 'error');
        return;
      }
      setShowAddModal(false);
      setNewStudent({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        role: 'student',
        presentToday: false,
        totalPresent: 0,
        totalAbsent: 0,
      });
      showToast('Student added successfully!', 'success');
      fetchUsers(); // Refresh user list
    } catch (err) {
      showToast('Error adding student: ' + err.message, 'error');
    }
  }
  const handleEditStudent = async () => {
    if (!currentStudent) return;
    try {
      const backendUrl = `http://localhost:5000/api/users/${currentStudent.id}`;
      // Only send updatable fields
      const payload = {
        first_name: currentStudent.first_name,
        middle_name: currentStudent.middle_name,
        last_name: currentStudent.last_name,
        suffix: currentStudent.suffix,
        email: currentStudent.email,
        role: currentStudent.role
      };
      const res = await fetch(backendUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || 'Failed to update student', 'error');
        return;
      }
      setShowEditModal(false);
      setCurrentStudent(null);
      showToast('Student updated!', 'success');
      fetchUsers(); // Refresh user list
    } catch (err) {
      showToast('Error updating student: ' + err.message, 'error');
    }
  }
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Open delete confirmation modal
  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || 'Failed to delete user');
      }
      setShowDeleteModal(false);
      setStudentToDelete(null);
      await fetchUsers();
      showToast('Student deleted!', 'success');
    } catch (err) {
      setShowDeleteModal(false);
      setStudentToDelete(null);
      showToast('Error deleting student: ' + err.message, 'error');
    }
  };
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
  // Filter students by search term (name or email)
  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search)
    );
  });

  return (
    <div className="pt-16 md:ml-64">
      {/* Toast notification */}
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : (
        <div className="mb-6">
          <div className="flex flex-col gap-2 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600">Manage students and track their attendance.</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-2 w-full">
              <div className="relative w-full max-w-xs">
                {/* Search bar */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width={18}
                  height={18}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlusIcon size={18} className="mr-2" />
                Add Student
              </button>
            </div>
          </div>
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
                  {filteredStudents.map((student) => (
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
                            onClick={() => handleDeleteStudent(student)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon size={18} />
                          </button>
      {/* Delete confirmation modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-700 break-words text-center" style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                Are you sure you want to delete the user <span className="font-semibold">"{studentToDelete.name}"</span>?
                <br />
                <span className="text-red-600 font-medium text-center block">This action cannot be undone.</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => { setShowDeleteModal(false); setStudentToDelete(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  onClick={confirmDeleteStudent}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newStudent.first_name}
                      onChange={e => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newStudent.last_name}
                      onChange={e => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">Middle Name (Optional)</label>
                    <input
                      id="middle_name"
                      name="middle_name"
                      type="text"
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newStudent.middle_name}
                      onChange={e => setNewStudent({ ...newStudent, middle_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">Suffix (Optional)</label>
                    <input
                      id="suffix"
                      name="suffix"
                      type="text"
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Jr., Sr., III"
                      value={newStudent.suffix}
                      onChange={e => setNewStudent({ ...newStudent, suffix: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Account Type</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className={`py-2 px-3 text-sm font-medium rounded-md ${newStudent.role === 'student' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setNewStudent(prev => ({ ...prev, role: 'student' }))}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 text-sm font-medium rounded-md ${newStudent.role === 'seller' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setNewStudent(prev => ({ ...prev, role: 'seller' }))}
                    >
                      Seller
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 text-sm font-medium rounded-md ${newStudent.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setNewStudent(prev => ({ ...prev, role: 'admin' }))}
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="text"
                    disabled
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-100 text-gray-400 cursor-not-allowed sm:text-sm"
                    value="Default password is 1234"
                    tabIndex={-1}
                    readOnly
                  />
                </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditStudent();
              }}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit_first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      id="edit_first_name"
                      name="edit_first_name"
                      type="text"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={currentStudent.first_name || ''}
                      onChange={e => setCurrentStudent({ ...currentStudent, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      id="edit_last_name"
                      name="edit_last_name"
                      type="text"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={currentStudent.last_name || ''}
                      onChange={e => setCurrentStudent({ ...currentStudent, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit_middle_name" className="block text-sm font-medium text-gray-700">Middle Name (Optional)</label>
                    <input
                      id="edit_middle_name"
                      name="edit_middle_name"
                      type="text"
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={currentStudent.middle_name || ''}
                      onChange={e => setCurrentStudent({ ...currentStudent, middle_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit_suffix" className="block text-sm font-medium text-gray-700">Suffix (Optional)</label>
                    <input
                      id="edit_suffix"
                      name="edit_suffix"
                      type="text"
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Jr., Sr., III"
                      value={currentStudent.suffix || ''}
                      onChange={e => setCurrentStudent({ ...currentStudent, suffix: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit_email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="edit_email"
                    name="edit_email"
                    type="email"
                    required
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={currentStudent.email || ''}
                    onChange={e => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_role" className="block text-sm font-medium text-gray-700">Account Type</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className={`py-2 px-3 text-sm font-medium rounded-md ${currentStudent.role === 'student' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setCurrentStudent(prev => ({ ...prev, role: 'student' }))}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 text-sm font-medium rounded-md ${currentStudent.role === 'seller' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setCurrentStudent(prev => ({ ...prev, role: 'seller' }))}
                    >
                      Seller
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 text-sm font-medium rounded-md ${currentStudent.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setCurrentStudent(prev => ({ ...prev, role: 'admin' }))}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
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