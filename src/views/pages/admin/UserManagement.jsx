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
  // Course filter state
  const [courseFilter, setCourseFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search bar state for students table only
  const [studentSearch, setStudentSearch] = useState("");
  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
        setUsers(
          data.map(u => ({
            id: u._id,
            name: [u.first_name, u.middle_name, u.last_name, u.suffix].filter(Boolean).join(' ') || u.fullname || '',
            email: u.email,
            presentToday: false, // Update if you have attendance data
            totalPresent: 0,
            totalAbsent: 0,
            ...u,
            courseShort: u.course ? u.course.split(' ')[0] : ''
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
        course: currentStudent.course,
        // email is not updatable
      };
      // If reset password field is exactly 'RESET', add password: '1234' to payload
      if (currentStudent.resetPasswordInput && currentStudent.resetPasswordInput.trim().toUpperCase() === 'RESET') {
        payload.password = '1234';
      }
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
    setUsers(
      users.map((user) => {
        if (user.id === id) {
          const presentToday = !user.presentToday
          return {
            ...user,
            presentToday,
            totalPresent: presentToday 
              ? user.totalPresent + 1 
              : user.totalPresent > 0 
                ? user.totalPresent - 1 
                : 0,
            totalAbsent: !presentToday 
              ? user.totalAbsent + 1 
              : user.totalAbsent > 0 
                ? user.totalAbsent - 1 
                : 0,
          }
        }
        return user
      })
    )
  }
  // Filter users by search term (name or email)
  // Filter users for each table
  const students = users.filter(u =>
    u.role === 'student' &&
    (
      u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (u.course && u.course.toLowerCase().includes(studentSearch.toLowerCase()))
    ) &&
    (courseFilter === "" || (u.course && u.course === courseFilter))
  );

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
              {/* No global search bar, replaced by per-table search */}
              <div className="flex-1" />
                {/* Add User button removed */}
            </div>
          </div>
          {/* Students Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-10 border-t-4 border-blue-200">
            <h2 className="text-lg font-bold px-6 pt-6 pb-2 text-blue-700">Students</h2>
            <div className="px-6 pb-2">
              <div className="relative w-full max-w-xs mb-2">
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
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center font-mono border-r border-gray-200">Student ID</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                      <div className="flex flex-col items-center">
                        <span>Course</span>
                        <select
                          className="mt-1 block w-28 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                          value={courseFilter}
                          onChange={e => setCourseFilter(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="BSIT">BSIT</option>
                          <option value="CMA">CMA</option>
                          <option value="CAHS">CAHS</option>
                          <option value="CEA">CEA</option>
                          <option value="CRIM">CRIM</option>
                        </select>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left border-r border-gray-200">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left border-r border-gray-200">Email</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">Verification Status</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">Balance</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center font-mono border-r border-gray-200">{student.student_id || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center border-r border-gray-200">{student.courseShort || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left border-r border-gray-200">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left border-r border-gray-200">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center border-r border-gray-200">
                        {student.isVerified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Verified</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Unverified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center border-r border-gray-200">{typeof student.balance === 'number' ? student.balance : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => { setShowEditModal(true); setCurrentStudent(student); }}
                          className="text-blue-600 hover:text-blue-900 mr-3 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                          title="Edit Student"
                        >
                          <PencilIcon size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                          title="Delete Student"
                        >
                          <TrashIcon size={18} />
                        </button>
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
      {/* Add Student modal removed */}
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
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label htmlFor="edit_email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="edit_email"
                      name="edit_email"
                      type="email"
                      required
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 bg-gray-100 text-gray-400 cursor-not-allowed focus:outline-none sm:text-sm"
                      value={currentStudent.email || ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="edit_course" className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    id="edit_course"
                    name="edit_course"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={currentStudent.course || ''}
                    onChange={e => setCurrentStudent({ ...currentStudent, course: e.target.value })}
                  >
                    <option value="">Select a course</option>
                    <option value="BSIT - Bachelor of Science in Information Technology">BSIT - Bachelor of Science in Information Technology</option>
                    <option value="CAHS - College of Allied Health Sciences">CAHS - College of Allied Health Sciences</option>
                    <option value="CMA - College of Management and Accountancy">CMA - College of Management and Accountancy</option>
                    <option value="CRIM - Criminology">CRIM - Criminology</option>
                    <option value="CEA - College of Engineering and Architecture">CEA - College of Engineering and Architecture</option>
                  </select>
                  <label htmlFor="reset_password" className="block text-sm font-medium text-gray-700 mt-4">Reset Password</label>
                  <input
                    id="reset_password"
                    name="reset_password"
                    type="text"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Type RESET to reset password to 1234"
                    value={currentStudent.resetPasswordInput || ''}
                    onChange={e => setCurrentStudent({ ...currentStudent, resetPasswordInput: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">To reset password type <span className="font-mono font-semibold">RESET</span>. The default password is <span className="font-mono font-semibold">1234</span></p>
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