import React, { useState, useEffect } from 'react'
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DownloadIcon,
  FileTextIcon,
  SearchIcon,
} from 'lucide-react'
import ValidationController from '../../../controllers/validationController'

const ValidateStudent = () => {
  const [selectedstudent, setSelectedstudent] = useState(null)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [students, setstudents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTargetId, setRejectTargetId] = useState(null)

  useEffect(() => {
    const fetchstudents = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("authToken")
        const result = await ValidationController.getPendingValidations(token)

        if (result?.success && Array.isArray(result.users)) {
          const onlyPendingstudents = result.users
            .filter(user => user.role === 'student' && user.accountStatus === 'pending')
            .map((user) => ({
              id: user._id,
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              storeId: user.storeId || "N/A",
              dateApplied: user.createdAt,
              documents: [
                ...(user.documents?.studentId
                  ? [
                    {
                      id: user.documents.studentId,
                      name: "Student Id",
                      type: "studentId",
                    },
                  ]
                  : []),
              ],
            }))

          setstudents(onlyPendingstudents)
        } else {
          setMessage({
            type: 'error',
            text: result?.error || 'Failed to load student data',
          })
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setMessage({ type: 'error', text: 'Failed to load student data' })
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchstudents()
  }, [])



  // Approve student
  const handleApprove = async (studentId) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const result = await ValidationController.approveUser(studentId, token)

      if (result.success) {
        setMessage({ type: 'success', text: 'student approved successfully' })
        setstudents(students.filter((student) => student.id !== studentId))
        if (selectedstudent?.id === studentId) setSelectedstudent(null)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to approve student' })
      }
    } catch (error) {
      console.error('Approve error:', error)
      setMessage({ type: 'error', text: 'An error occurred while approving the student' })
    } finally {
      setIsLoading(false)
    }
  }

  // Open reject modal
  const handleReject = (studentId) => {
    setRejectTargetId(studentId)
    setRejectReason('')
    setShowRejectModal(true)
  }

  // Perform reject (called from modal)
  const performReject = async () => {
    if (!rejectTargetId) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const result = await ValidationController.rejectUser(rejectTargetId, rejectReason || 'Not eligible', token)

      if (result.success) {
        setMessage({ type: 'success', text: 'student rejected' })
        setstudents(students.filter((student) => student.id !== rejectTargetId))
        if (selectedstudent?.id === rejectTargetId) setSelectedstudent(null)
        setShowRejectModal(false)
        setRejectTargetId(null)
        setRejectReason('')
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reject student' })
      }
    } catch (error) {
      console.error('Reject error:', error)
      setMessage({ type: 'error', text: 'An error occurred while rejecting the student' })
    } finally {
      setIsLoading(false)
    }
  }

  // View document
  const handleViewDocument = async (doc) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/validation/document/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Failed to fetch file')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      setViewingDocument({ name: doc.name, url, type: blob.type })
    } catch (error) {
      console.error('Document view error:', error)
      setMessage({ type: 'error', text: 'Error fetching document' })
    }
  }

  // Filter + search
  const filteredstudents = (students || []).filter((student) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!student.name.toLowerCase().includes(query) && !student.email.toLowerCase().includes(query)) {
        return false
      }
    }
    if (filter === 'bir') {
      return student.documents.some((doc) => doc.name.toLowerCase().includes('bir'))
    } else if (filter === 'bp') {
      return student.documents.some((doc) => doc.name.toLowerCase().includes('bp'))
    }
    return true
  })

  return (
    <div className="pt-16 md:ml-64">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">student Validation</h1>
          <p className="text-gray-600">Review and validate student accounts with BIR or Business Permit </p>
        </div>
        <div className="flex space-x-2">
          {['all', 'bir', 'bp'].map((key) => (
            <button
              key={key}
              className={`px-4 py-2 text-sm font-medium rounded ${filter === key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
                }`}
              onClick={() => setFilter(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending student List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">Pending student Validations</h2>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
              </div>
            ) : filteredstudents.length === 0 ? (
              <div className="p-5 text-center text-gray-500">No pending student validations found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Name', 'Email', 'Date Applied', 'Documents', 'Actions'].map((header) => (
                        <th
                          key={header}
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''
                            }`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredstudents.map((student) => (
                      <tr
                        key={student.id}
                        className={`cursor-pointer ${selectedstudent?.id === student.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        onClick={() => setSelectedstudent(student)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{student.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {new Date(student.dateApplied).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {student.documents.length} document(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(student.id)
                            }}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircleIcon size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(student.id)
                            }}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <XCircleIcon size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* student Details Panel */}
        <div>
          {selectedstudent ? (
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-700">student Details</h2>
                <ShieldCheckIcon size={24} className="text-indigo-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-base font-medium">{selectedstudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base">{selectedstudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Applied</p>
                  <p className="text-base">{new Date(selectedstudent.dateApplied).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Documents</p>
                  <div className="space-y-2">
                    {selectedstudent.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileTextIcon size={20} className="text-indigo-600 mr-2" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="p-1 text-gray-600 hover:text-indigo-600"
                            title="View Document"
                          >
                            <EyeIcon size={18} />
                          </button>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {viewingDocument && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Viewing: {viewingDocument.name}</p>
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 h-90">
                      {viewingDocument.type.includes("pdf") ? (
                        <iframe
                          src={viewingDocument.url}
                          title={viewingDocument.name}
                          className="w-full h-full"
                        />
                      ) : viewingDocument.type.startsWith("image/") ? (
                        <img
                          src={viewingDocument.url}
                          alt={viewingDocument.name}
                          className="max-h-full mx-auto"
                        />
                      ) : (
                        <p className="text-center text-gray-500">Preview not available</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => handleApprove(selectedstudent.id)}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <CheckCircleIcon size={18} className="mr-2" /> Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(selectedstudent.id)}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <XCircleIcon size={18} className="mr-2" /> Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-5 h-full flex items-center justify-center">
              <div className="text-center">
                <ShieldCheckIcon size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Select an student to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirements Info */}
      <div className="mt-6 bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Validation Requirements</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Teacher Certificate Program (TCP)</h3>
            <p className="text-sm text-blue-700">
              Verify that the certificate is authentic, issued by an accredited institution, and not expired.
              Check for name matching with the submitted ID.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Licensed Professional Teacher (LPT)</h3>
            <p className="text-sm text-purple-700">
              Verify the license number against the Professional Regulation Commission database. Ensure the
              license is active and matches the name on the submitted ID.
            </p>
          </div>
        </div>
      </div>
      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Reject Student</h3>
            <p className="text-sm text-gray-600 mb-4">Provide a reason for rejection (optional)</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="Enter rejection reason"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectTargetId(null); setRejectReason('') }}
                className="px-4 py-2 border rounded bg-white"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={performReject}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValidateStudent
