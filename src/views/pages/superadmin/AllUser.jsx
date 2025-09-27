// AllUser.jsx
import React, { useState, useEffect } from 'react'
import {
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    FileTextIcon,
    SearchIcon,
    PauseCircleIcon,
    PlayCircleIcon,
} from 'lucide-react'
import ValidationController from '../../../controllers/validationController'

const AllUser = () => {
    const [selectedAdmin, setSelectedAdmin] = useState(null)
    const [viewingDocument, setViewingDocument] = useState(null)
    const [filter, setFilter] = useState('all')
    const [isLoading, setIsLoading] = useState(false)
    const [admins, setAdmins] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [message, setMessage] = useState(null)

    useEffect(() => {
        const fetchAdmins = async () => {
            setIsLoading(true)
            try {
                const token = localStorage.getItem("authToken")
                // ✅ adjust to pass params object
                const result = await ValidationController.getAllUsersForSuperAdmin({
                    page: 1,
                    limit: 20,
                    token,
                })

                if (result?.success && Array.isArray(result.users)) {
                    const formattedAdmins = result.users.map(user => ({
                        id: user._id,
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                        accountStatus: user.accountStatus,
                        dateApplied: user.createdAt,
                        documents: [
                            ...(user.documents?.birCertificate
                                ? [{ id: user.documents.birCertificate, name: "BIR Certificate", type: "bir" }]
                                : []),
                            ...(user.documents?.businessPermit
                                ? [{ id: user.documents.businessPermit, name: "Business Permit", type: "permit" }]
                                : []),
                            ...(user.documents?.teachingCredential
                                ? [{ id: user.documents.teachingCredential, name: "Teacher Certificate Program", type: "tcp" }]
                                : []),
                            ...(user.documents?.teachingCredential
                                ? [{ id: user.documents.teachingCredential, name: "Licensed Professional Teacher", type: "lpt" }]
                                : []),
                            ...(user.documents?.studentId
                                ? [{ id: user.documents.studentId, name: "Student Id", type: "studentId" }]
                                : []),
                        ],
                    }))
                    setAdmins(formattedAdmins)
                } else {
                    setMessage({
                        type: 'error',
                        text: result?.error || 'Failed to load admin data',
                    })
                }
            } catch (error) {
                console.error('Error fetching admins:', error)
                setMessage({ type: 'error', text: 'Failed to load admin data' })
            }
            finally {
                setIsLoading(false)
            }
        }

        fetchAdmins()
    }, [])

    // ✅ Suspend user
    const handleSuspend = async (adminId) => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('authToken')
            const reason = prompt("Enter reason for suspension:") || "No reason provided"
            const result = await ValidationController.suspendUser(adminId, reason, token)

            if (result.success) {
                setMessage({ type: 'success', text: 'User suspended successfully' })
                setAdmins(admins.map(admin =>
                    admin.id === adminId ? { ...admin, accountStatus: 'suspended' } : admin
                ))
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to suspend user' })
            }
        } catch (error) {
            console.error('Suspend error:', error)
            setMessage({ type: 'error', text: 'An error occurred while suspending the user' })
        } finally {
            setIsLoading(false)
        }
    }

    // ✅ Reactivate user
    const handleReactivate = async (adminId) => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('authToken')
            const result = await ValidationController.reactivateUser(adminId, token)

            if (result.success) {
                setMessage({ type: 'success', text: 'User reactivated successfully' })
                setAdmins(admins.map(admin =>
                    admin.id === adminId ? { ...admin, accountStatus: 'approved' } : admin
                ))
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to reactivate user' })
            }
        } catch (error) {
            console.error('Reactivate error:', error)
            setMessage({ type: 'error', text: 'An error occurred while reactivating the user' })
        } finally {
            setIsLoading(false)
        }
    }

    // ✅ Filter + search
    const filteredAdmins = (admins || []).filter((admin) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            if (!admin.name.toLowerCase().includes(query) && !admin.email.toLowerCase().includes(query)) {
                return false
            }
        }
        if (filter === 'tcp') {
            return admin.documents.some((doc) => doc.name.toLowerCase().includes('tcp'))
        } else if (filter === 'lpt') {
            return admin.documents.some((doc) => doc.name.toLowerCase().includes('lpt'))
        }
        return true
    })

    return (
        <div className="pt-16 md:ml-64">
            {/* ... keep your header, search bar, etc. */}

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-700">All Users</h2>
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
                            </div>
                        ) : filteredAdmins.length === 0 ? (
                            <div className="p-5 text-center text-gray-500">No users found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Name', 'Email', 'Status'].map((header) => (
                                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAdmins.map((admin) => (
                                            <tr key={admin.id} onClick={() => setSelectedAdmin(admin)}>
                                                <td className="px-6 py-4">{admin.name}</td>
                                                <td className="px-6 py-4">{admin.email}</td>
                                                <td
                                                    className={`inline-block px-3 py-1 rounded-full text-white text-sm mt-3 ml- ${admin.accountStatus === 'pending'
                                                            ? 'bg-yellow-500'
                                                            : admin.accountStatus === 'approved'
                                                                ? 'bg-green-500'
                                                                : admin.accountStatus === 'rejected'
                                                                    ? 'bg-red-500'
                                                                    : admin.accountStatus === 'suspended'
                                                                        ? 'bg-gray-500'
                                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    {admin.accountStatus}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Details Panel */}
                <div>
                    {selectedAdmin ? (
                        <div className="bg-white rounded-lg shadow p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg font-semibold text-gray-700">Admin Details</h2>
                                <ShieldCheckIcon size={24} className="text-indigo-600" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-base font-medium">{selectedAdmin.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-base">{selectedAdmin.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date Applied</p>
                                    <p className="text-base">{new Date(selectedAdmin.dateApplied).toLocaleDateString()}</p>
                                </div>


                                <div className="flex space-x-3 mt-6">
                                    <button
                                        onClick={() => handleReactivate(selectedAdmin.id)}
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
                                                <CheckCircleIcon size={18} className="mr-2" /> Reactivate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleSuspend(selectedAdmin.id)}
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
                                                <XCircleIcon size={18} className="mr-2" /> Suspended
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-5  flex items-center justify-center">
                            <div className="text-center">
                                <ShieldCheckIcon size={48} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">Select an user to view their details</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default AllUser
