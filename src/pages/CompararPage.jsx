import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NotaBar from '../components/NotaBar'
import { listarVeiculosSalvos } from '../services/api'
import './ResultadoPage.css'
import './CompararPage.css'

function formatarMoeda(valor) {
  if (valor == null) return '—'
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function ColunaVeiculo({ veiculo, tag }) {
  return (
    <div className="comp-coluna">
      <span className="comp-tag">{tag}</span>

      <div className="res-hero comp-hero">
        <div className="res-hero-info">
          <h1>{veiculo.marca} {veiculo.modelo}</h1>
          <div className="res-sub">{veiculo.anoModelo}{veiculo.placa && ` · ${veiculo.placa}`}</div>
        </div>
        <div className="res-preco-box">
          <div className="res-preco-label">Valor FIPE</div>
          <div className="res-preco">{formatarMoeda(veiculo.valorFipe)}</div>
        </div>
      </div>

      {veiculo.valorEstimado != null ? (
        <div className="res-card res-card-prec">
          <h2 className="res-card-title">
            Precificação inteligente
            <span className={`prec-badge ${veiculo.percentualAjuste >= 0 ? 'positivo' : 'negativo'}`}>
              {veiculo.percentualAjuste >= 0 ? '+' : ''}{veiculo.percentualAjuste}%
            </span>
          </h2>
          <div className="prec-grid">
            <div className="prec-item">
              <span>Valor estimado</span>
              <strong className="prec-valor">{formatarMoeda(veiculo.valorEstimado)}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="res-card comp-card-vazio">Sem precificação calculada para este veículo.</div>
      )}

      {veiculo.notaGeral != null ? (
        <div className="res-card">
          <h2 className="res-card-title">
            Avaliação geral
            <span className="nota-geral">{Number(veiculo.notaGeral).toFixed(1)}</span>
          </h2>
          <div className="notas-list">
            <NotaBar label="Confiabilidade" valor={veiculo.notaConfiabilidade} />
            <NotaBar label="Custo manutenção" valor={veiculo.notaCustoManutencao} />
            <NotaBar label="Conforto" valor={veiculo.notaConforto} />
            <NotaBar label="Desempenho" valor={veiculo.notaDesempenho} />
            <NotaBar label="Consumo" valor={veiculo.notaConsumo} />
            <NotaBar label="Espaço interno" valor={veiculo.notaEspacoInterno} />
          </div>
        </div>
      ) : (
        <div className="res-card comp-card-vazio">Sem análise de IA disponível para este veículo.</div>
      )}
    </div>
  )
}

export default function CompararPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [salvos, setSalvos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [selecionadoId, setSelecionadoId] = useState(null)

  useEffect(() => {
    if (!state?.veiculoAtual) { navigate('/consulta'); return }
    listarVeiculosSalvos()
      .then(setSalvos)
      .catch(() => setErro('Erro ao carregar veículos salvos.'))
      .finally(() => setLoading(false))
  }, [])

  if (!state?.veiculoAtual) return null

  const veiculoAtual = state.veiculoAtual
  const selecionado = salvos.find(v => v.id === selecionadoId)

  return (
    <div className="comp-root">
      <Navbar />
      <main className="comp-main">
        <div className="comp-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
          {selecionado && (
            <button className="comp-trocar" onClick={() => setSelecionadoId(null)}>Trocar veículo salvo</button>
          )}
        </div>

        <div className="comp-header">
          <h1>Comparar veículos</h1>
          <p>Lado a lado: a consulta atual e um veículo salvo no seu perfil</p>
        </div>

        {loading && <div className="comp-loading">Carregando veículos salvos...</div>}
        {erro && <div className="comp-erro">{erro}</div>}

        {!loading && !erro && salvos.length === 0 && (
          <div className="comp-vazio">
            <p>Você ainda não salvou nenhum veículo. Salve outro veículo na tela de resultado para poder comparar.</p>
            <button className="btn-consultar" onClick={() => navigate('/consulta')}>Fazer uma consulta →</button>
          </div>
        )}

        {!loading && !selecionado && salvos.length > 0 && (
          <div className="comp-lista">
            <p className="comp-instrucao">
              Escolha um veículo salvo para comparar com <strong>{veiculoAtual.marca} {veiculoAtual.modelo}</strong>:
            </p>
            <div className="comp-chips-grid">
              {salvos.map(v => (
                <button key={v.id} className="comp-item" onClick={() => setSelecionadoId(v.id)}>
                  <strong>{v.marca} {v.modelo}</strong>
                  <span>{v.anoModelo}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selecionado && (
          <div className="comp-grid">
            <ColunaVeiculo veiculo={veiculoAtual} tag="Consulta atual" />
            <ColunaVeiculo veiculo={selecionado} tag="Salvo no perfil" />
          </div>
        )}
      </main>
    </div>
  )
}
