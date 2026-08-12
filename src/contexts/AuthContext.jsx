import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

function decodeUser(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    }
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('verificar_token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('verificar_token')
    return t ? decodeUser(t) : null
  })
  const [perfil, setPerfil] = useState(null)

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getMe()
      setPerfil(p)
      setUser({ email: p.email, role: p.role })
    } catch {}
  }, [])

  useEffect(() => {
    if (token) refreshProfile()
  }, [token, refreshProfile])

  const login = useCallback((newToken) => {
    localStorage.setItem('verificar_token', newToken)
    setToken(newToken)
    setUser(decodeUser(newToken))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('verificar_token')
    setToken(null)
    setUser(null)
    setPerfil(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, perfil, login, logout, refreshProfile, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
