import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { consultarPlaca } from '../services/api'
import './ResultadoPlacaPage.css'

export default function ResultadoPlacaPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!state?.placa) { navigate('/consulta'); return }

    consultarPlaca(state.placa)
      .then(setData)
      .catch(err => {
        if (err.response?.status === 404)
          setErro(`Placa "${state.placa}" não encontrada.`)
        else if (err.response?.status === 400)
          setErro(err.response.data?.mensagem || 'Placa inválida.')
        else
          setErro('Erro ao consultar a API. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rp-root">
      <Navbar />
      <main className="rp-main">

        <button className="back-btn" onClick={() => navigate('/consulta')}>
          ← Nova consulta
        </button>

        {loading && (
          <div className="rp-loading">
            <div className="rp-spinner" />
            <p>Consultando dados da placa...</p>
          </div>
        )}

        {erro && (
          <div className="rp-erro">
            <span>⚠</span> {erro}
          </div>
        )}

        {data && !loading && (
          <div className="rp-content">

            {/* HERO */}
            <div className="rp-hero">
              <div className="rp-hero-left">
                {data.logoUrl && (
                  <img src={data.logoUrl} alt={data.marca} className="rp-logo" />
                )}
                <div>
                  <div className="rp-placas">
                    <span className="rp-placa-badge">{data.placa}</span>
                    {data.placaAlternativa && data.placaAlternativa !== data.placa && (
                      <span className="rp-placa-alt">{data.placaAlternativa}</span>
                    )}
                  </div>
                  <h1>{data.marca} {data.modelo}</h1>
                  <div className="rp-sub">
                    {data.versao && <span>{data.versao}</span>}
                    {data.anoFabricacao && <span>{data.anoFabricacao}/{data.anoModelo}</span>}
                    {data.cor && <span>{data.cor}</span>}
                    {data.municipio && <span>{data.municipio} · {data.uf}</span>}
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className={`rp-status-box ${data.restricoes?.length > 0 ? 'restricao' : 'ok'}`}>
                <div className="rp-status-icon">
                  {data.restricoes?.length > 0 ? '⚠' : '✓'}
                </div>
                <div className="rp-status-label">
                  {data.restricoes?.length > 0 ? 'Com restrições' : 'Sem restrições'}
                </div>
                <div className="rp-status-situacao">{data.situacao}</div>
              </div>
            </div>

            <div className="rp-grid">

              {/* DADOS DO VEÍCULO */}
              <div className="rp-card">
                <h2 className="rp-card-title">Dados do veículo</h2>
                <div className="rp-ficha">
                  {data.combustivel && <Row label="Combustível" value={data.combustivel} />}
                  {data.cilindradas && <Row label="Cilindradas" value={`${data.cilindradas} cc`} />}
                  {data.quantidadePassageiros && <Row label="Passageiros" value={data.quantidadePassageiros} />}
                  {data.tipoVeiculo && <Row label="Tipo" value={data.tipoVeiculo} />}
                  {data.segmento && <Row label="Segmento" value={data.segmento} />}
                  {data.origem && <Row label="Origem" value={data.origem} />}
                </div>
              </div>

              {/* FIPE */}
              {data.fipe && (
                <div className="rp-card rp-card-fipe">
                  <h2 className="rp-card-title">Melhor correspondência FIPE</h2>
                  <div className="rp-fipe-valor">{data.fipe.valor}</div>
                  <div className="rp-fipe-modelo">{data.fipe.modelo}</div>
                  <div className="rp-fipe-meta">
                    <span>Código: {data.fipe.codigoFipe}</span>
                    <span>{data.fipe.combustivel}</span>
                    <span>{data.fipe.mesReferencia}</span>
                  </div>
                  <div className="rp-fipe-score">
                    Score de correspondência: <strong>{data.fipe.score}%</strong>
                  </div>
                </div>
              )}

              {/* RESTRIÇÕES */}
              <div className={`rp-card rp-card-full ${data.restricoes?.length > 0 ? 'rp-card-alerta' : 'rp-card-ok'}`}>
                <h2 className="rp-card-title">
                  {data.restricoes?.length > 0 ? '⚠ Restrições encontradas' : '✓ Situação documental'}
                </h2>
                {data.restricoes?.length > 0 ? (
                  <ul className="rp-restricoes">
                    {data.restricoes.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="rp-ok-text">Nenhuma restrição encontrada para este veículo.</p>
                )}
              </div>

            </div>

            <div className="rp-data">
              Dados consultados em {data.dataConsulta}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="rp-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
