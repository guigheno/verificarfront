import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { login, register } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import './LoginPage.css'

export default function LoginPage() {
  const { login: authLogin } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const token = await login(form.email, form.password)
        authLogin(token)
      } else {
        await register(form.name, form.email, form.password)
        const token = await login(form.email, form.password)
        authLogin(token)
      }
    } catch (err) {
        setError(err.response?.data?.mensagem || err.response?.data?.message || 'Credenciais inválidas.')    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="login-left">
        <div className="login-brand">
          <span className="login-logo">V</span>
          <span className="login-brand-name">VerifiCar</span>
        </div>
        <div className="login-hero">
          <h1>Faça <em>bons negócios.</em></h1>
          <p>Consulte o valor FIPE atualizado, histórico e análise completa de qualquer veículo antes de fechar negócio.</p>
        </div>
        <div className="login-badges">
          <span className="badge">Valor FIPE real</span>
          <span className="badge">Análise de risco</span>
          <span className="badge">Dados técnicos</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError('') }}
            >Entrar</button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); setError('') }}
            >Criar conta</button>
          </div>

          <form onSubmit={submit} className="login-form">
            {mode === 'register' && (
              <div className="field">
                <label>Nome</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={handle}
                  required
                />
              </div>
            )}
            <div className="field">
              <label>E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
