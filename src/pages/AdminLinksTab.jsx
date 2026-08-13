import { useEffect, useState } from 'react'
import {
  listarRegistrationLinks,
  criarRegistrationLink,
  atualizarRegistrationLink,
  excluirRegistrationLink,
} from '../services/api'

const vazio = { nome: '', qtdConsultaModelo: '', qtdConsultaPlaca: '', limiteUsos: '', expiraEm: '' }

const Icone = ({ size = 15, children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

const IconeEditar = (props) => (
  <Icone {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </Icone>
)

const IconePower = (props) => (
  <Icone {...props}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </Icone>
)

const IconeExcluir = (props) => (
  <Icone {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icone>
)

export default function AdminLinksTab() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState(vazio)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregar = () =>
    listarRegistrationLinks()
      .then(setLinks)
      .catch(() => setErro('Erro ao carregar os links de registro.'))
      .finally(() => setLoading(false))

  useEffect(() => {
    carregar()
  }, [])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const urlDoLink = (token) => `${window.location.origin}/registro/${token}`

  const copiar = async (token) => {
    const texto = urlDoLink(token)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto)
      } else {
        throw new Error('clipboard indisponivel')
      }
      setMensagem('Link copiado para a área de transferência.')
      setErro('')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = texto
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      if (ok) {
        setMensagem('Link copiado para a área de transferência.')
        setErro('')
      } else {
        setErro('Não foi possível copiar. Copie manualmente: ' + texto)
      }
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    setMensagem('')
    const dto = {
      nome: form.nome || null,
      qtdConsultaModelo: Number(form.qtdConsultaModelo) || 0,
      qtdConsultaPlaca: Number(form.qtdConsultaPlaca) || 0,
      limiteUsos: Number(form.limiteUsos) || 0,
      expiraEm: form.expiraEm ? new Date(form.expiraEm + 'T23:59:59').toISOString() : null,
    }
    if (dto.qtdConsultaModelo === 0 && dto.qtdConsultaPlaca === 0) {
      setErro('Informe ao menos uma quantidade de consultas maior que zero.')
      setSalvando(false)
      return
    }
    try {
      if (editId) {
        await atualizarRegistrationLink(editId, { ...dto, ativo: true })
        setMensagem('Link atualizado.')
      } else {
        await criarRegistrationLink(dto)
        setMensagem('Link de registro criado.')
      }
      setForm(vazio)
      setEditId(null)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar o link.')
    } finally {
      setSalvando(false)
    }
  }

  const alternarAtivo = async (link) => {
    setErro('')
    setMensagem('')
    try {
      await atualizarRegistrationLink(link.id, {
        nome: link.nome,
        qtdConsultaModelo: link.qtdConsultaModelo,
        qtdConsultaPlaca: link.qtdConsultaPlaca,
        ativo: !link.ativo,
        limiteUsos: link.limiteUsos,
        expiraEm: link.expiraEm,
      })
      carregar()
    } catch {
      setErro('Erro ao alterar o status do link.')
    }
  }

  const excluir = async (link) => {
    if (!window.confirm(`Excluir o link "${link.token}"? Os usuários já cadastrados não são afetados.`)) return
    setErro('')
    setMensagem('')
    try {
      await excluirRegistrationLink(link.id)
      setMensagem('Link excluído.')
      carregar()
    } catch {
      setErro('Erro ao excluir o link.')
    }
  }

  const editar = (link) => {
    setEditId(link.id)
    setErro('')
    setMensagem('')
    setForm({
      nome: link.nome || '',
      qtdConsultaModelo: link.qtdConsultaModelo,
      qtdConsultaPlaca: link.qtdConsultaPlaca,
      limiteUsos: link.limiteUsos,
      expiraEm: link.expiraEm ? new Date(link.expiraEm).toLocaleDateString('en-CA') : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicao = () => {
    setEditId(null)
    setForm(vazio)
  }

  return (
    <div className="admin-links">
      {erro && <div className="admin-erro">{erro}</div>}
      {mensagem && <div className="admin-msg">{mensagem}</div>}

      <form onSubmit={submit} className="admin-links-form">
        <h3>{editId ? 'Editar link' : 'Novo link de registro'}</h3>
        <div className="admin-links-linha">
          <div className="admin-links-row">
          <div className="field">
            <label title="Nome (ex.: promoção)">Nome</label>
            <input
              name="nome"
              type="text"
              placeholder="Campanha"
              value={form.nome}
              onChange={handle}
              maxLength={100}
            />
          </div>
          <div className="field">
            <label title="Consultas de modelo">Consultas modelo</label>
            <input
              name="qtdConsultaModelo"
              type="number"
              min="0"
              value={form.qtdConsultaModelo}
              onChange={handle}
            />
          </div>
          <div className="field">
            <label title="Consultas de placa">Consultas placa</label>
            <input
              name="qtdConsultaPlaca"
              type="number"
              min="0"
              value={form.qtdConsultaPlaca}
              onChange={handle}
            />
          </div>
          <div className="field">
            <label title="0 = ilimitado">Limite usos</label>
            <input
              name="limiteUsos"
              type="number"
              min="0"
              value={form.limiteUsos}
              onChange={handle}
            />
          </div>
          <div className="field">
            <label title="Expira em (opcional)">Expira</label>
            <input
              name="expiraEm"
              type="date"
              value={form.expiraEm}
              onChange={handle}
            />
          </div>
        </div>
        <div className="admin-links-actions">
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? <span className="spinner" /> : editId ? 'Salvar' : 'Criar link'}
          </button>
          {editId && (
            <button type="button" className="btn-secundario" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
        </div>
        </div>
      </form>

      {loading && <div className="admin-loading">Carregando...</div>}

      {!loading && links.length === 0 && (
        <div className="admin-vazio">
          <p>Nenhum link de registro criado.</p>
        </div>
      )}

      {!loading && links.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Nome</th>
                <th className="admin-th-center">Modelo</th>
                <th className="admin-th-center">Placa</th>
                <th className="admin-th-center">Usos</th>
                <th>Expira</th>
                <th>Status</th>
                <th className="admin-th-add">Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.id}>
                  <td className="admin-nome">
                    <div className="admin-link-codigo">
                      <span className="admin-link-token">{l.token}</span>
                      <button className="admin-link-copiar" onClick={() => copiar(l.token)}>
                        Copiar
                      </button>
                    </div>
                    <div className="admin-link-url">{urlDoLink(l.token)}</div>
                  </td>
                  <td className="admin-email">{l.nome || '—'}</td>
                  <td className="admin-th-center">{l.qtdConsultaModelo}</td>
                  <td className="admin-th-center">{l.qtdConsultaPlaca}</td>
                  <td className="admin-th-center">
                    <span className={`admin-link-usos ${l.limiteUsos > 0 && l.usosAtuais >= l.limiteUsos ? 'esgotado' : ''}`}>
                      {l.usosAtuais}/{l.limiteUsos || '∞'}
                    </span>
                  </td>
                  <td className="admin-email">
                    {l.expiraEm ? new Date(l.expiraEm).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="admin-th-center">
                    <span className={`admin-link-status ${l.ativo ? 'ativo' : ''}`}>
                      {l.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="admin-add">
                    <div className="admin-acoes">
                      <button
                        className="admin-icone-btn"
                        title="Editar"
                        aria-label="Editar"
                        onClick={() => editar(l)}
                      >
                        <IconeEditar />
                      </button>
                      <button
                        className={`admin-icone-btn ${l.ativo ? '' : 'reativar'}`}
                        title={l.ativo ? 'Desativar' : 'Ativar'}
                        aria-label={l.ativo ? 'Desativar' : 'Ativar'}
                        onClick={() => alternarAtivo(l)}
                      >
                        <IconePower />
                      </button>
                      <button
                        className="admin-icone-btn danger"
                        title="Excluir"
                        aria-label="Excluir"
                        onClick={() => excluir(l)}
                      >
                        <IconeExcluir />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
