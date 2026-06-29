'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

import { API_BASE_URL } from '../lib/constants'
const API = API_BASE_URL

interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: string
  token: string
  refreshToken: string  // persisted so api.ts can silently rotate on 401
}

interface AuthResult { success: boolean; error?: string }

interface AuthContextType {
  user: User | null
  loading: boolean
  login:           (emailOrUser: string | User, password?: string) => Promise<AuthResult>
  register:        (name: string, email: string, password: string, referralCode?: string) => Promise<AuthResult>
  loginWithGoogle: (idToken: string) => Promise<AuthResult>
  logout:          () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const initials = (n: string) => (n || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

// The backend wraps payloads as { success, message, data: { token, refreshToken, user } }.
// Normalise that (with a flat-shape fallback) into our User object.
function toUser(json: any, fallbackName: string, fallbackEmail: string): User | null {
  const d = json?.data || json || {}
  const u = d.user || d
  const token = d.token || d.accessToken || ''
  if (!token) return null
  return {
    id:           u.id || '',
    name:         u.name || fallbackName,
    email:        u.email || fallbackEmail,
    avatar:       initials(u.name || fallbackName || fallbackEmail),
    plan:         u.subscriptionTier || u.plan || 'free',
    token,
    refreshToken: d.refreshToken || '',  // persist so api.ts can silently rotate on 401
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mw_user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
    setLoading(false)
  }, [])

  const persist = (u: User) => { setUser(u); localStorage.setItem('mw_user', JSON.stringify(u)) }

  const login = async (emailOrUser: string | User, password?: string): Promise<AuthResult> => {
    // Pre-built user object (e.g. from a modal that already called the API).
    if (typeof emailOrUser === 'object') { persist(emailOrUser); return { success: true } }

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUser, password }),
      })
      const json = await res.json()
      if (!res.ok) return { success: false, error: json.message || json.error || 'Invalid email or password.' }
      const u = toUser(json, (emailOrUser as string).split('@')[0], emailOrUser as string)
      if (!u) return { success: false, error: 'Login failed — no session returned.' }
      persist(u)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  const register = async (name: string, email: string, password: string, referralCode?: string): Promise<AuthResult> => {
    try {
      // Backend expects firstName/lastName, not a single name field.
      const parts = name.trim().split(/\s+/)
      const firstName = parts[0] || 'Member'
      const lastName = parts.slice(1).join(' ')
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, ...(referralCode ? { referralCode } : {}) }),
      })
      const json = await res.json()
      if (!res.ok) return { success: false, error: json.message || json.error || 'Registration failed. Please try again.' }
      const u = toUser(json, name, email)
      if (!u) return { success: false, error: 'Registration failed — no session returned.' }
      persist(u)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Exchange a Google ID token for a MealWarden session via the shared backend,
  // so a Google login on the web is the same account as in the app.
  const loginWithGoogle = async (idToken: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const json = await res.json()
      if (!res.ok) return { success: false, error: json.message || 'Google sign-in failed.' }
      const u = toUser(json, 'there', '')
      if (!u) return { success: false, error: 'Google sign-in failed — no session returned.' }
      persist(u)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error during Google sign-in.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mw_user')
    localStorage.removeItem('mw_profile')
    localStorage.removeItem('mw_diet_chart')
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
