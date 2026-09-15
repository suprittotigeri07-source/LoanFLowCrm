// Auth Service — connected to Django JWT backend
import { api, getStoredUser, clearAuth } from '../api'

export const authService = {
  login: async (email, password) => {
    const res = await api.login(email, password)
    return { token: res.access, user: res.user }
  },

  logout: () => {
    clearAuth()
  },

  getCurrentUser: () => {
    return getStoredUser()
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('crm_access_token')
  },

  getRedirectPath: (role) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'ASM': return '/asm/dashboard'
      case 'TELECALLER': return '/telecaller/dashboard'
      default: return '/login'
    }
  },
}
