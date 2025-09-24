import React, { useState } from 'react'
import { WalletIcon, XIcon, CoinsIcon } from 'lucide-react'
const WalletConnect = ({
  onConnect,
  isConnected,
  walletBalance = 0,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const handleConnect = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    //testing purposes
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (privateKey.length < 8) {
        setError('Invalid private key format')
        setIsLoading(false)
        return
      }
      // Generate a random balance between 0.1 and 10 ETH
      const randomBalance = Math.floor(Math.random() * 990 + 10) / 100
      onConnect(randomBalance)
      setShowModal(false)
      setPrivateKey('')
    } catch (err) {
      setError('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      {isConnected ? (
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <WalletIcon size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Wallet Balance</p>
            <p className="text-sm font-semibold flex items-center">
              <CoinsIcon size={14} className="mr-1 text-yellow-500" />
              {walletBalance.toFixed(2)} ETH
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          <WalletIcon size={16} />
          <span>Connect Wallet</span>
        </button>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleConnect}>
              <div className="mb-4">
                <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Private Key
                </label>
                <input
                  type="password"
                  id="privateKey"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Never share your private key with anyone. This is for demo purposes only.
                </p>
              </div>
              {error && (
                <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
export default WalletConnect