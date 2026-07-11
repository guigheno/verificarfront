import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import ConsultaPage from './pages/ConsultaPage'
import ResultadoPage from './pages/ResultadoPage'
import ResultadoPlacaPage from './pages/ResultadoPlacaPage'
import PerfilPage from './pages/PerfilPage'
import CompararPage from './pages/CompararPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/consulta" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/consulta" element={<PrivateRoute><ConsultaPage /></PrivateRoute>} />
          <Route path="/resultado" element={<PrivateRoute><ResultadoPage /></PrivateRoute>} />
          <Route path="/resultado-placa" element={<PrivateRoute><ResultadoPlacaPage /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><PerfilPage /></PrivateRoute>} />
          <Route path="/comparar" element={<PrivateRoute><CompararPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/consulta" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
