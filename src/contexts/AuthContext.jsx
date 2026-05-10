import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('verificar_token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('verificar_token')
    if (!t) return null
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      return {
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      }
    } catch { return null }
  })

  const login = useCallback((newToken) => {
    localStorage.setItem('verificar_token', newToken)
    setToken(newToken)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      })
    } catch { setUser(null) }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('verificar_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
