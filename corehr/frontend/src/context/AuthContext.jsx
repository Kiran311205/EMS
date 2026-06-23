import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user_data')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])  

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    const { access, refresh, role, full_name, email, user_id } = res.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    const userData = { id: user_id, username, role, full_name, email }
    localStorage.setItem('user_data', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await api.post('/auth/users/logout/', { refresh })
    } catch (_) {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'
  const isHR = user?.role === 'hr' || user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isHR }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
