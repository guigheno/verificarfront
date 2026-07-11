import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { listarVeiculosSalvos, removerVeiculoSalvo } from '../services/api'
import './PerfilPage.css'

export default function PerfilPage() {
  const navigate = useNavigate()
  const [veiculos, setVeiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [removendoId, setRemovendoId] = useState(null)

  useEffect(() => {
    listarVeiculosSalvos()
      .then(setVeiculos)
      .catch(() => setErro('Erro ao carregar veículos salvos.'))
      .finally(() => setLoading(false))
  }, [])

  const remover = async (id) => {
    setRemovendoId(id)
    try {
      await removerVeiculoSalvo(id)
      setVeiculos(v => v.filter(item => item.id !== id))
    } catch {
      setErro('Erro ao remover veículo. Tente novamente.')
    } finally {
      setRemovendoId(null)
    }
  }

  return (
    <div className="perfil-root">
      <Navbar />
      <main className="perfil-main">
        <div className="perfil-header">
          <h1>Meus veículos</h1>
          <p>Veículos salvos durante suas consultas. Para comparar, abra uma consulta e use o botão "Comparar" na tela de resultado.</p>
        </div>

        {erro && <div className="perfil-erro">{erro}</div>}

        {loading && <div className="perfil-loading">Carregando...</div>}

        {!loading && veiculos.length === 0 && (
          <div className="perfil-vazio">
            <p>Você ainda não salvou nenhum veículo.</p>
            <button className="btn-consultar" onClick={() => navigate('/consulta')}>
              Fazer uma consulta →
            </button>
          </div>
        )}

        {!loading && veiculos.length > 0 && (
          <div className="perfil-grid">
            {veiculos.map(v => (
              <div key={v.id} className="perfil-card">
                <div className="perfil-card-header">
                  <h2>{v.marca} {v.modelo}</h2>
                  <button
                    className="perfil-remover"
                    onClick={() => remover(v.id)}
                    disabled={removendoId === v.id}
                    title="Remover"
                  >
                    {removendoId === v.id ? '...' : '✕'}
                  </button>
                </div>
                <div className="perfil-card-sub">
                  {v.anoModelo}{v.placa && ` · ${v.placa}`}
                </div>
                <div className="perfil-card-valores">
                  <div>
                    <span>Valor FIPE</span>
                    <strong>{v.valorFipe?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                  {v.valorEstimado != null && (
                    <div>
                      <span>Valor estimado</span>
                      <strong>{v.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                  )}
                  {v.notaGeral != null && (
                    <div>
                      <span>Nota geral</span>
                      <strong>{v.notaGeral.toFixed(1)}</strong>
                    </div>
                  )}
                </div>
                <div className="perfil-card-data">
                  Salvo em {new Date(v.salvoEm).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
