import React, { useState, useEffect } from 'react'
import { WalletIcon, XIcon, CoinsIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import WalletController from '../../controllers/walletController'

const WalletConnect = ({
  onConnect,
  isConnected: externalIsConnected,
  walletBalance: externalWalletBalance = 0,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isConnected, setIsConnected] = useState(externalIsConnected || false)
  const [walletData, setWalletData] = useState(null)
  const [walletBalance, setWalletBalance] = useState(externalWalletBalance)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  useEffect(() => {
    // Check if wallet exists on component mount
    checkExistingWallet()
  }, [])

  useEffect(() => {
    // Update local state when external props change
    if (externalIsConnected !== undefined) {
      setIsConnected(externalIsConnected)
    }
    if (externalWalletBalance !== undefined) {
      setWalletBalance(externalWalletBalance)
    }
  }, [externalIsConnected, externalWalletBalance])

  const checkExistingWallet = async () => {
    try {
      const result = await WalletController.getWallet()
      if (result.success && result.wallet) {
        setWalletData(result.wallet)
        setIsConnected(true)
        setWalletBalance(result.wallet.balance || 0)
        if (onConnect) {
          onConnect(result.wallet.balance || 0, result.wallet)
        }
      }
    } catch (error) {
      console.error('Error checking existing wallet:', error)
    }
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const result = await WalletController.createWallet(privateKey)
      
      if (result.success) {
        setWalletData(result.wallet)
        setIsConnected(true)
        setWalletBalance(result.wallet?.balance || 0)
        setSuccess('Wallet connected successfully!')
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          setShowModal(false)
          setPrivateKey('')
          setSuccess('')
        }, 1500)
        
        // Call parent callback if provided
        if (onConnect) {
          onConnect(result.wallet?.balance || 0, result.wallet)
        }
      } else {
        setError(result.error || 'Failed to connect wallet')
      }
    } catch (err) {
      console.error('Wallet connection error:', err)
      setError('An unexpected error occurred while connecting wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setPrivateKey('')
    setError('')
    setSuccess('')
  }

  const refreshBalance = async () => {
    try {
      const result = await WalletController.getBalance()
      if (result.success) {
        setWalletBalance(result.balance)
        if (walletData) {
          setWalletData({ ...walletData, balance: result.balance })
        }
      }
    } catch (error) {
      console.error('Error refreshing balance:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      const result = await WalletController.disconnectWallet()
      if (result.success) {
        setIsConnected(false)
        setWalletData(null)
        setWalletBalance(0)
        if (onConnect) {
          onConnect(0, null)
        }
      } else {
        setError(result.error || 'Failed to disconnect wallet')
      }
    } catch (err) {
      console.error('Wallet disconnect error:', err)
      setError('An unexpected error occurred while disconnecting wallet')
    } finally {
      setIsLoading(false)
      setShowDisconnectModal(false)
    }
  }

  return (
    <>
      {isConnected && walletData ? (
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <WalletIcon size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">
              Wallet: {WalletController.getFormattedAddress(walletData.address)}
            </p>
            <p className="text-sm font-semibold flex items-center">
              <CoinsIcon size={14} className="mr-1 text-yellow-500" />
              {parseFloat(walletBalance).toFixed(4)} ETH
            </p>
          </div>
          <div className="ml-3 flex items-center space-x-2">
            <button
              onClick={refreshBalance}
              className="text-blue-600 hover:text-blue-800 text-xs"
              disabled={isLoading}
            >
              Refresh
            </button>
            <button
              onClick={() => setShowDisconnectModal(true)}
              className="text-red-600 hover:text-red-800 text-xs"
              disabled={isLoading}
            >
              Disconnect
            </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]]">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
              <button
                onClick={handleModalClose}
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
                  placeholder="Enter your private key (with or without 0x)"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Never share your private key with anyone. Enter a valid 64-character hexadecimal key.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-4 flex items-center">
                  <AlertCircleIcon size={16} className="mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm mb-4 flex items-center">
                  <CheckCircleIcon size={16} className="mr-2" />
                  {success}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !privateKey.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Disconnect Wallet</h3>
              <p className="text-sm text-gray-600 mt-1">Are you sure you want to disconnect your wallet?</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WalletConnect