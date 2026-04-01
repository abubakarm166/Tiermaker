import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User } from '../types/api'
import * as api from '../lib/api'
import { authStorage } from '../lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!authStorage.getAccessToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const u = await api.fetchMe()
      setUser(u)
    } catch {
      authStorage.clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password)
    authStorage.setTokens(data.access, data.refresh)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const data = await api.register(email, password)
    authStorage.setTokens(data.access, data.refresh)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    authStorage.clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
