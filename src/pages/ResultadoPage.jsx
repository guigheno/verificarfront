import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SalvarVeiculoButton from '../components/SalvarVeiculoButton'
import CompararButton from '../components/CompararButton'
import NotaBar from '../components/NotaBar'
import { useAuth } from '../contexts/AuthContext'
import { getAnaliseCompleta } from '../services/api'
import './ResultadoPage.css'

function ListaSeparada({ texto }) {
  if (!texto) return <span>—</span>
  const itens = texto.split(';').map(s => s.trim()).filter(Boolean)
  if (itens.length <= 1) return <p className="res-texto">{texto}</p>
  return (
    <ul className="res-lista">
      {itens.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default function ResultadoPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!state?.marca) { navigate('/consulta'); return }

    getAnaliseCompleta(
      state.marca,
      state.modelo,
      state.ano,
      state.quilometragem || 0,
      state.condicao || 'Não sei',
      state.placa || null,
      state.detalhes || {}
    )
      .then(data => { setData(data); refreshProfile() })
      .catch(err => {
        if (err.response?.status === 403)
          setErro(err.response.data?.mensagem || 'Você atingiu o limite de consultas.')
        else if (err.response?.status === 404)
          setErro('Veículo não encontrado na tabela FIPE para o ano selecionado.')
        else
          setErro('Erro ao consultar a API. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }, [])

  const analise = data?.analise
  const prec = data?.precificacao

  // Sem valor FIPE real (combinação não encontrada na tabela) não há o que salvar/comparar
  const veiculoAtual = data?.valorFipeNumerico ? {
    marca: data.marca,
    modelo: data.modelo,
    anoModelo: data.anoModelo,
    placa: state?.placa || null,
    valorFipe: data.valorFipeNumerico,
    valorEstimado: prec?.valorEstimado ?? null,
    percentualAjuste: prec?.percentualAjuste ?? null,
    notaGeral: analise?.notaGeral ?? null,
    notaConfiabilidade: analise?.notaConfiabilidade ?? null,
    notaCustoManutencao: analise?.notaCustoManutencao ?? null,
    notaConforto: analise?.notaConforto ?? null,
    notaDesempenho: analise?.notaDesempenho ?? null,
    notaConsumo: analise?.notaConsumo ?? null,
    notaEspacoInterno: analise?.notaEspacoInterno ?? null,
  } : null

  return (
    <div className="resultado-root">
      <Navbar />
      <main className="resultado-main">

        <div className="resultado-actions">
          <button className="back-btn" onClick={() => navigate('/consulta')}>
            ← Nova consulta
          </button>
          {veiculoAtual && !loading && (
            <div className="resultado-actions-right">
              <SalvarVeiculoButton veiculo={veiculoAtual} />
              <CompararButton veiculoAtual={veiculoAtual} />
            </div>
          )}
        </div>

        {loading && (
          <div className="resultado-loading">
            <div className="loading-spinner" />
            <p>Gerando análise completa...</p>
            <span className="loading-hint">Consultando FIPE e analisando o veículo com IA...</span>
          </div>
        )}

        {erro && <div className="resultado-erro"><span>⚠</span> {erro}</div>}

        {data && !loading && (
          <div className="resultado-content">

            {/* HERO */}
            <div className="res-hero">
              <div className="res-hero-info">
                <h1>{data.marca} {data.modelo}</h1>
                <div className="res-sub">{data.anoModelo} · {data.mesReferencia}</div>
              </div>
              <div className="res-preco-box">
                <div className="res-preco-label">Valor FIPE</div>
                <div className="res-preco">{data.valorFipe}</div>
                <div className="res-preco-ref">{data.mesReferencia}</div>
              </div>
            </div>

            <div className="res-grid">

              {/* PRECIFICAÇÃO */}
              {prec && (
                <div className="res-card res-card-full res-card-prec">
                  <h2 className="res-card-title">
                    Precificação inteligente
                    <span className={`prec-badge ${prec.percentualAjuste >= 0 ? 'positivo' : 'negativo'}`}>
                      {prec.percentualAjuste >= 0 ? '+' : ''}{prec.percentualAjuste}%
                    </span>
                  </h2>
                  <div className="prec-grid">
                    <div className="prec-item">
                      <span>Valor estimado</span>
                      <strong className="prec-valor">
                        {prec.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>
                    <div className="prec-item">
                      <span>Faixa de negociação</span>
                      <strong>{prec.faixaMinima} — {prec.faixaMaxima}</strong>
                    </div>
                  </div>
                  <p className="prec-recomendacao">{prec.recomendacao}</p>
                  <div className="prec-fatores">
                    {prec.fatoresAjuste.map((f, i) => <span key={i} className="prec-fator">{f}</span>)}
                  </div>
                </div>
              )}

              {/* ANÁLISE IA */}
              {analise && (
                <>
                  {/* AVALIAÇÃO */}
                  <div className="res-card">
                    <h2 className="res-card-title">
                      Avaliação geral
                      <span className="nota-geral">{analise.notaGeral?.toFixed(1)}</span>
                    </h2>
                    <div className="notas-list">
                      <NotaBar label="Confiabilidade" valor={analise.notaConfiabilidade} />
                      <NotaBar label="Custo manutenção" valor={analise.notaCustoManutencao} />
                      <NotaBar label="Conforto" valor={analise.notaConforto} />
                      <NotaBar label="Desempenho" valor={analise.notaDesempenho} />
                      <NotaBar label="Consumo" valor={analise.notaConsumo} />
                      <NotaBar label="Espaço interno" valor={analise.notaEspacoInterno} />
                    </div>
                    {analise.geradoPorIA && (
                      <div className="ia-badge">✦ Análise gerada por IA</div>
                    )}
                  </div>

                  {/* RESUMO */}
                  {analise.resumoGeral && (
                    <div className="res-card">
                      <h2 className="res-card-title">Sobre o veículo</h2>
                      <p className="res-descricao">{analise.resumoGeral}</p>
                    </div>
                  )}

                  {/* PONTOS POSITIVOS */}
                  <div className="res-card">
                    <h2 className="res-card-title positivo-title">✓ Pontos positivos</h2>
                    <ListaSeparada texto={analise.pontosPositivos} />
                  </div>

                  {/* PONTOS NEGATIVOS */}
                  <div className="res-card">
                    <h2 className="res-card-title negativo-title">✕ Pontos negativos</h2>
                    <ListaSeparada texto={analise.pontosNegativos} />
                  </div>

                  {/* PROBLEMAS CRÔNICOS */}
                  {analise.problemasCronicos && (
                    <div className="res-card res-card-full res-card-alerta">
                      <h2 className="res-card-title">⚠ Problemas crônicos conhecidos</h2>
                      <ListaSeparada texto={analise.problemasCronicos} />
                    </div>
                  )}
                </>
              )}

              {/* HISTÓRICO */}
              {data.historico?.length > 0 && (
                <div className="res-card res-card-full">
                  <h2 className="res-card-title">Histórico de eventos</h2>
                  <div className="historico-list">
                    {data.historico.map(h => (
                      <div key={h.id} className="historico-item">
                        <div className="historico-tipo">{h.tipoEvento}</div>
                        <div className="historico-desc">{h.descricao}</div>
                        <div className="historico-data">
                          {new Date(h.dataEvento).toLocaleDateString('pt-BR')} · {h.fonte}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  )
}
