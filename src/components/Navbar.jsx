import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/consulta')}>
        <span className="navbar-logo">V</span>
        <span className="navbar-name">VerifiCar</span>
      </div>
      <div className="navbar-right">
        <button className="navbar-link" onClick={() => navigate('/perfil')}>Meus veículos</button>
        <span className="navbar-user">{user?.email}</span>
        <button className="navbar-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  )
}
