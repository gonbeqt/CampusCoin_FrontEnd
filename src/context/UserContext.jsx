import React, { useState, createContext, useContext } from 'react'
const UserContext = createContext(undefined)
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // Mock login function
  const login = async (email, password) => {
    // In a real app, this would be an API call
    if (email && password) {
      if (email.includes('admin')) {
        setUser({
          id: '1',
          name: 'Admin User',
          email,
          role: 'admin',
        })
        return true
      } else if (email.includes('seller')) {
        setUser({
          id: '3',
          name: 'Campus Store',
          email,
          role: 'seller',
          storeId: 'ST001',
        })
        return true
      } else {
        setUser({
          id: '2',
          name: 'Student User',
          email,
          role: 'student',
          balance: 250,
          studentId: 'ST12345',
        })
        return true
      }
    }
    return false
  }
  const logout = () => {
    setUser(null)
  }
  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
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