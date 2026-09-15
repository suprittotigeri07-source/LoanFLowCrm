import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { api, getAuthToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = getAuthToken()
      if (token) {
        // Try to fetch fresh profile from API
        try {
          const profile = await api.getCurrentUser()
          setUser(profile)
        } catch {
          // Token expired or invalid, fall back to stored data
          const stored = authService.getCurrentUser()
          if (stored) {
            setUser(stored)
          } else {
            authService.logout()
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email, password) => {
    const res = await authService.login(email, password)
    setUser(res.user)
    return res
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
