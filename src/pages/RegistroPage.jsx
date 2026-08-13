import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { validarRegistrationLink, register } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import './RegistroPage.css'

export default function RegistroPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [link, setLink] = useState(null)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    validarRegistrationLink(token)
      .then((data) => {
        if (!data.valido) {
          const msgs = {
            expirado: 'Este link de registro expirou.',
            inativo: 'Este link de registro foi desativado.',
            esgotado: 'Este link de registro atingiu o limite de cadastros.',
            nao_encontrado: 'Este link de registro é inválido ou não existe mais.',
          }
          setErro(msgs[data.status] || 'Este link de registro é inválido ou expirou.')
        } else {
          setLink(data)
        }
      })
      .catch(() => setErro('Não foi possível validar o link de registro.'))
      .finally(() => setCarregando(false))
  }, [token])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      await register(form.name, form.email, form.password, token)
      navigate('/login?cadastrado=1')
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao criar a conta.')
      setEnviando(false)
    }
  }

  return (
    <div className="registro-root">
      <div className="registro-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="registro-card">
        <div className="registro-brand">
          <span className="registro-logo">V</span>
          <span className="registro-brand-name">VerifiCar</span>
        </div>

        {carregando && <div className="registro-loading">Validando link...</div>}

        {!carregando && erro && (
          <div className="registro-invalido">
            <h1>Link inválido</h1>
            <p>{erro}</p>
            <Link to="/login" className="btn-primary">Ir para o login</Link>
          </div>
        )}

        {!carregando && link && (
          <>
            <div className="registro-beneficio">
              {link.nome && <span className="registro-nome-link">{link.nome}</span>}
              <p>
                Ao criar sua conta você recebe <strong>{link.qtdConsultaModelo}</strong>{' '}
                consulta{link.qtdConsultaModelo === 1 ? '' : 's'} de modelo e{' '}
                <strong>{link.qtdConsultaPlaca}</strong>{' '}
                consulta{link.qtdConsultaPlaca === 1 ? '' : 's'} de placa gratuitas.
              </p>
              <div className="registro-vagas">
                {link.limiteUsos > 0
                  ? `${link.usosAtuais} cadastro${link.usosAtuais === 1 ? '' : 's'} realizado${link.usosAtuais === 1 ? '' : 's'} · ${Math.max(0, link.limiteUsos - link.usosAtuais)} disponíve${Math.max(0, link.limiteUsos - link.usosAtuais) === 1 ? 'l' : 'is'}`
                  : `${link.usosAtuais} cadastro${link.usosAtuais === 1 ? '' : 's'} realizado${link.usosAtuais === 1 ? '' : 's'} · sem limite de vagas`}
              </div>
            </div>

            <form onSubmit={submit} className="registro-form">
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
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  value={form.password}
                  onChange={handle}
                  required
                />
              </div>

              {erro && <div className="registro-erro">{erro}</div>}

              <button type="submit" className="btn-primary" disabled={enviando}>
                {enviando ? <span className="spinner" /> : 'Criar conta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
