import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AdminLinksTab from './AdminLinksTab'
import { listarUsuarios, adicionarConsultas } from '../services/api'
import './AdminPage.css'

export default function AdminPage() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('creditos')
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [inputs, setInputs] = useState({})
  const [adicionandoId, setAdicionandoId] = useState(null)
  const [mensagem, setMensagem] = useState('')

  const carregar = () =>
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setErro('Erro ao carregar usuários.'))
      .finally(() => setLoading(false))

  useEffect(() => {
    carregar()
  }, [])

  const setCampo = (id, campo, valor) =>
    setInputs(inp => ({ ...inp, [id]: { ...inp[id], [campo]: Math.max(0, Number(valor) || 0) } }))

  const adicionar = async (id) => {
    const { qtdConsultaModelo = 0, qtdConsultaPlaca = 0 } = inputs[id] || {}
    if (qtdConsultaModelo === 0 && qtdConsultaPlaca === 0) {
      setMensagem('Informe ao menos uma quantidade maior que zero.')
      return
    }
    setAdicionandoId(id)
    setMensagem('')
    try {
      const atualizado = await adicionarConsultas(id, { qtdConsultaModelo, qtdConsultaPlaca })
      setUsuarios(us => us.map(u => (u.id === id ? atualizado : u)))
      setInputs(inp => ({ ...inp, [id]: {} }))
      setMensagem(`Consultas adicionadas para ${atualizado.name}.`)
    } catch (e) {
      setMensagem(e.response?.data?.mensagem || 'Erro ao adicionar consultas.')
    } finally {
      setAdicionandoId(null)
    }
  }

  return (
    <div className="admin-root">
      <Navbar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Menu Admin</h1>
          <p>Gerencie os créditos de consulta e os links de registro.</p>
        </div>

        <div className="admin-tabs">
          <button
            className={aba === 'creditos' ? 'active' : ''}
            onClick={() => { setAba('creditos'); setErro(''); setMensagem('') }}
          >
            Créditos de usuários
          </button>
          <button
            className={aba === 'links' ? 'active' : ''}
            onClick={() => { setAba('links'); setErro(''); setMensagem('') }}
          >
            Links de registro
          </button>
        </div>

        {aba === 'links' && <AdminLinksTab />}

        {aba === 'creditos' && (
          <>
            {erro && <div className="admin-erro">{erro}</div>}
            {mensagem && <div className="admin-msg">{mensagem}</div>}

            {loading && <div className="admin-loading">Carregando...</div>}

            {!loading && usuarios.length === 0 && (
              <div className="admin-vazio">
                <p>Nenhum usuário cadastrado.</p>
                <button className="btn-consultar" onClick={() => navigate('/consulta')}>
                  Voltar para consultas →
                </button>
              </div>
            )}

            {!loading && usuarios.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th className="admin-th-center">Consultas M</th>
                      <th className="admin-th-center">Consultas P</th>
                      <th className="admin-th-add">Adicionar consultas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td className="admin-nome">
                          {u.name}
                          {u.role === 'Admin' && <span className="admin-role">Admin</span>}
                        </td>
                        <td className="admin-email">{u.email}</td>
                        <td className="admin-th-center">{u.qtdConsultaModelo}</td>
                        <td className="admin-th-center">{u.qtdConsultaPlaca}</td>
                        <td className="admin-add">
                          <div className="admin-add-row">
                            <label>
                              <span>M</span>
                              <input
                                type="number"
                                min="0"
                                value={inputs[u.id]?.qtdConsultaModelo ?? ''}
                                onChange={e => setCampo(u.id, 'qtdConsultaModelo', e.target.value)}
                              />
                            </label>
                            <label>
                              <span>P</span>
                              <input
                                type="number"
                                min="0"
                                value={inputs[u.id]?.qtdConsultaPlaca ?? ''}
                                onChange={e => setCampo(u.id, 'qtdConsultaPlaca', e.target.value)}
                              />
                            </label>
                            <button
                              className="admin-add-btn"
                              onClick={() => adicionar(u.id)}
                              disabled={adicionandoId === u.id}
                            >
                              {adicionandoId === u.id ? '...' : 'Adicionar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
