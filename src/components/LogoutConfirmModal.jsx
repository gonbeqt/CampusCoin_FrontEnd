import React from 'react'
import ReactDOM from 'react-dom'

const LogoutConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Confirm logout</h3>
        <p className="mb-4 text-sm text-gray-600">Are you sure you want to logout? You will be required to sign in again to access your account.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Logout</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default LogoutConfirmModal
