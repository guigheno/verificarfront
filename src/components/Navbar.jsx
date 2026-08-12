import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

export default function Navbar() {
  const { user, perfil, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'Admin'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const valor = (n) => (isAdmin ? '∞' : n ?? 0)

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/consulta')}>
        <span className="navbar-logo">V</span>
        <span className="navbar-name">VerifiCar</span>
      </div>
      <div className="navbar-right">
        <ThemeToggle />
        <div className="navbar-consultas">
          <span className="consulta-badge" title="Consultas por modelo">
            <span className="consulta-icon">M</span>
            {valor(perfil?.qtdConsultaModelo)}
          </span>
          <span className="consulta-badge" title="Consultas por placa">
            <span className="consulta-icon">P</span>
            {valor(perfil?.qtdConsultaPlaca)}
          </span>
        </div>
        <button className="navbar-link" onClick={() => navigate('/perfil')}>Meus veículos</button>
        <span className="navbar-user">{user?.email}</span>
        <button className="navbar-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  )
}
