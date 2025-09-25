// Context Provider - Integrates with MVC Controller
import React, { useState, createContext, useContext, useEffect } from 'react'
import AuthController from '../controllers/authController'

const UserContext = createContext(undefined)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize user state from stored data
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = AuthController.getCurrentToken()
        const storedUser = AuthController.getCurrentUser()
        
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(storedUser)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Subscribe to auth controller updates
  useEffect(() => {
    const handleAuthUpdate = (data) => {
      switch (data.type) {
        case 'LOGIN_SUCCESS':
          setUser(data.user)
          setToken(data.token)
          break
          
        case 'LOGOUT':
          setUser(null)
          setToken(null)
          break
          
        default:
          break
      }
    }

    AuthController.subscribe(handleAuthUpdate)

    return () => {
      AuthController.unsubscribe(handleAuthUpdate)
    }
  }, [])

  // Wrapper functions for controller methods
  const register = async (userData) => {
    return await AuthController.register(userData)
  }

  const login = async (email, password) => {
    return await AuthController.login({ email, password })
  }

  const verifyEmail = async (email, code) => {
    return await AuthController.verifyEmail(email, code)
  }

  const resendVerificationCode = async (email) => {
    return await AuthController.resendVerificationCode(email)
  }

  const logout = () => {
    AuthController.logout()
  }

  // Helper functions
  const isAuthenticated = () => {
    return AuthController.isAuthenticated()
  }

  const getUserRole = () => {
    return AuthController.getUserRole()
  }

  const getRouteForRole = (role) => {
    return AuthController.getRouteForRole(role)
  }

  return (
    <UserContext.Provider
      value={{
        // State
        user,
        token,
        loading,
        
        // Authentication methods
        register,
        login,
        verifyEmail,
        resendVerificationCode,
        logout,
        
        // Helper methods
        isAuthenticated,
        getUserRole,
        getRouteForRole
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}