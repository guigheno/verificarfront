import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SalvarVeiculoButton from '../components/SalvarVeiculoButton'
import CompararButton from '../components/CompararButton'
import NotaBar from '../components/NotaBar'
import { consultarPlaca, getAnaliseCompleta } from '../services/api'
import './ResultadoPlacaPage.css'

function Row({ label, value }) {
  return (
    <div className="rp-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ListaSeparada({ texto }) {
  if (!texto) return <span>—</span>
  const itens = texto.split(';').map(s => s.trim()).filter(Boolean)
  if (itens.length <= 1) return <p className="rp-texto-simples">{texto}</p>
  return (
    <ul className="rp-lista-ia">
      {itens.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default function ResultadoPlacaPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [placa, setPlaca] = useState(null)
  const [analise, setAnalise] = useState(null)
  const [loadingPlaca, setLoadingPlaca] = useState(true)
  const [loadingAnalise, setLoadingAnalise] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!state?.placa) { navigate('/consulta'); return }

    // 1. Busca dados da placa
    consultarPlaca(state.placa)
      .then(async (dadosPlaca) => {
        setPlaca(dadosPlaca)
        setLoadingPlaca(false)

        // 2. Com os dados da placa, busca análise completa
        const anoInt = parseInt(dadosPlaca.anoModelo) || parseInt(dadosPlaca.anoFabricacao) || 0
        if (dadosPlaca.fipe?.modelo && anoInt >= 1985) {
          setLoadingAnalise(true)
          try {
            const resultado = await getAnaliseCompleta(
              dadosPlaca.marca,
              dadosPlaca.fipe.modelo,
              anoInt,
              state.quilometragem || 0,
              state.condicao || 'Não sei',
              state.placa,
              state.detalhes || {}
            )
            setAnalise(resultado)
          } catch (e) {
            // Análise falhou mas dados da placa ainda são exibidos
            console.warn('Análise completa indisponível:', e)
          } finally {
            setLoadingAnalise(false)
          }
        }
      })
      .catch(err => {
        if (err.response?.status === 404)
          setErro(`Placa "${state.placa}" não encontrada.`)
        else if (err.response?.status === 400)
          setErro(err.response.data?.mensagem || 'Placa inválida.')
        else
          setErro('Erro ao consultar a API. Tente novamente.')
        setLoadingPlaca(false)
      })
  }, [])

  const prec = analise?.precificacao
  const ia = analise?.analise

  // Sem valor FIPE real (combinação não encontrada na tabela) não há o que salvar/comparar
  const veiculoAtual = analise?.valorFipeNumerico ? {
    marca: analise.marca,
    modelo: analise.modelo,
    anoModelo: analise.anoModelo,
    placa: state?.placa || null,
    valorFipe: analise.valorFipeNumerico,
    valorEstimado: prec?.valorEstimado ?? null,
    percentualAjuste: prec?.percentualAjuste ?? null,
    notaGeral: ia?.notaGeral ?? null,
    notaConfiabilidade: ia?.notaConfiabilidade ?? null,
    notaCustoManutencao: ia?.notaCustoManutencao ?? null,
    notaConforto: ia?.notaConforto ?? null,
    notaDesempenho: ia?.notaDesempenho ?? null,
    notaConsumo: ia?.notaConsumo ?? null,
    notaEspacoInterno: ia?.notaEspacoInterno ?? null,
  } : null

  return (
    <div className="rp-root">
      <Navbar />
      <main className="rp-main">

        <div className="rp-actions">
          <button className="back-btn" onClick={() => navigate('/consulta')}>
            ← Nova consulta
          </button>
          {veiculoAtual && (
            <div className="rp-actions-right">
              <SalvarVeiculoButton veiculo={veiculoAtual} />
              <CompararButton veiculoAtual={veiculoAtual} />
            </div>
          )}
        </div>

        {loadingPlaca && (
          <div className="rp-loading">
            <div className="rp-spinner" />
            <p>Consultando dados da placa...</p>
          </div>
        )}

        {erro && <div className="rp-erro"><span>⚠</span> {erro}</div>}

        {placa && !loadingPlaca && (
          <div className="rp-content">

            {/* HERO */}
            <div className="rp-hero">
              <div className="rp-hero-left">
                {placa.logoUrl && (
                  <img src={placa.logoUrl} alt={placa.marca} className="rp-logo" />
                )}
                <div>
                  <div className="rp-placas">
                    <span className="rp-placa-badge">{placa.placa}</span>
                    {placa.placaAlternativa && placa.placaAlternativa !== placa.placa && (
                      <span className="rp-placa-alt">{placa.placaAlternativa}</span>
                    )}
                  </div>
                  <h1>{placa.marca} {placa.modelo}</h1>
                  <div className="rp-sub">
                    {placa.versao && <span>{placa.versao}</span>}
                    {placa.anoFabricacao && <span>{placa.anoFabricacao}/{placa.anoModelo}</span>}
                    {placa.cor && <span>{placa.cor}</span>}
                    {placa.municipio && <span>{placa.municipio} · {placa.uf}</span>}
                  </div>
                </div>
              </div>

              <div className={`rp-status-box ${placa.restricoes?.length > 0 ? 'restricao' : 'ok'}`}>
                <div className="rp-status-icon">{placa.restricoes?.length > 0 ? '⚠' : '✓'}</div>
                <div className="rp-status-label">
                  {placa.restricoes?.length > 0 ? 'Com restrições' : 'Sem restrições'}
                </div>
                <div className="rp-status-situacao">{placa.situacao}</div>
              </div>
            </div>

            <div className="rp-grid">

              {/* DADOS DO VEÍCULO */}
              <div className="rp-card">
                <h2 className="rp-card-title">Dados do veículo</h2>
                <div className="rp-ficha">
                  {placa.combustivel && <Row label="Combustível" value={placa.combustivel} />}
                  {placa.cilindradas && <Row label="Cilindradas" value={`${placa.cilindradas} cc`} />}
                  {placa.quantidadePassageiros && <Row label="Passageiros" value={placa.quantidadePassageiros} />}
                  {placa.tipoVeiculo && <Row label="Tipo" value={placa.tipoVeiculo} />}
                  {placa.segmento && <Row label="Segmento" value={placa.segmento} />}
                  {placa.origem && <Row label="Origem" value={placa.origem} />}
                </div>
              </div>

              {/* FIPE */}
              {placa.fipe && (
                <div className="rp-card rp-card-fipe">
                  <h2 className="rp-card-title">Melhor correspondência FIPE</h2>
                  <div className="rp-fipe-valor">{placa.fipe.valor}</div>
                  <div className="rp-fipe-modelo">{placa.fipe.modelo}</div>
                  <div className="rp-fipe-meta">
                    <span>Código: {placa.fipe.codigoFipe}</span>
                    <span>{placa.fipe.combustivel}</span>
                    <span>{placa.fipe.mesReferencia}</span>
                  </div>
                  <div className="rp-fipe-score">
                    Score de correspondência: <strong>{placa.fipe.score}%</strong>
                  </div>
                </div>
              )}

              {/* RESTRIÇÕES */}
              <div className={`rp-card rp-card-full ${placa.restricoes?.length > 0 ? 'rp-card-alerta' : 'rp-card-ok'}`}>
                <h2 className="rp-card-title">
                  {placa.restricoes?.length > 0 ? '⚠ Restrições encontradas' : '✓ Situação documental'}
                </h2>
                {placa.restricoes?.length > 0 ? (
                  <ul className="rp-restricoes">
                    {placa.restricoes.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                ) : (
                  <p className="rp-ok-text">Nenhuma restrição encontrada para este veículo.</p>
                )}
              </div>

              {/* LOADING ANÁLISE */}
              {loadingAnalise && (
                <div className="rp-card rp-card-full rp-card-loading">
                  <div className="rp-spinner-sm" />
                  <span>Gerando análise com IA e precificação...</span>
                </div>
              )}

              {/* PRECIFICAÇÃO */}
              {prec && (
                <div className="rp-card rp-card-full rp-card-prec">
                  <h2 className="rp-card-title">
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
              {ia && (
                <>
                  <div className="rp-card">
                    <h2 className="rp-card-title">
                      Avaliação geral
                      <span className="nota-geral">{ia.notaGeral?.toFixed(1)}</span>
                    </h2>
                    <div className="notas-list">
                      <NotaBar label="Confiabilidade" valor={ia.notaConfiabilidade} />
                      <NotaBar label="Custo manutenção" valor={ia.notaCustoManutencao} />
                      <NotaBar label="Conforto" valor={ia.notaConforto} />
                      <NotaBar label="Desempenho" valor={ia.notaDesempenho} />
                      <NotaBar label="Consumo" valor={ia.notaConsumo} />
                      <NotaBar label="Espaço interno" valor={ia.notaEspacoInterno} />
                    </div>
                    {ia.geradoPorIA && <div className="ia-badge">✦ Análise gerada por IA</div>}
                  </div>

                  {ia.resumoGeral && (
                    <div className="rp-card">
                      <h2 className="rp-card-title">Sobre o veículo</h2>
                      <p className="rp-descricao">{ia.resumoGeral}</p>
                    </div>
                  )}

                  <div className="rp-card">
                    <h2 className="rp-card-title rp-positivo-title">✓ Pontos positivos</h2>
                    <ListaSeparada texto={ia.pontosPositivos} />
                  </div>

                  <div className="rp-card">
                    <h2 className="rp-card-title rp-negativo-title">✕ Pontos negativos</h2>
                    <ListaSeparada texto={ia.pontosNegativos} />
                  </div>

                  {ia.problemasCronicos && (
                    <div className="rp-card rp-card-full rp-card-alerta">
                      <h2 className="rp-card-title">⚠ Problemas crônicos conhecidos</h2>
                      <ListaSeparada texto={ia.problemasCronicos} />
                    </div>
                  )}
                </>
              )}

            </div>

            <div className="rp-data">Dados consultados em {placa.dataConsulta}</div>
          </div>
        )}
      </main>
    </div>
  )
}
