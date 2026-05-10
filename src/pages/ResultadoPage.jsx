import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { consultarFipe } from '../services/api'
import './ResultadoPage.css'

function NotaBar({ label, valor }) {
  const pct = (valor / 5) * 100
  const cor = valor >= 4 ? 'var(--success)' : valor >= 3 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="nota-item">
      <div className="nota-label">{label}</div>
      <div className="nota-bar-wrap">
        <div className="nota-bar" style={{ width: `${pct}%`, background: cor }} />
      </div>
      <div className="nota-val" style={{ color: cor }}>{valor?.toFixed(1)}</div>
    </div>
  )
}

export default function ResultadoPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!state?.marca) { navigate('/consulta'); return }

    consultarFipe(state.marca, state.modelo, state.ano)
      .then(setData)
      .catch(err => {
        if (err.response?.status === 404)
          setErro('Veículo não encontrado na tabela FIPE para o ano selecionado.')
        else
          setErro('Erro ao consultar a API. Tente novamente.')
      })
      .finally(() => setLoading(false))
  }, [])

  const dc = data?.dadosComplementares

  return (
    <div className="resultado-root">
      <Navbar />
      <main className="resultado-main">

        <button className="back-btn" onClick={() => navigate('/consulta')}>
          ← Nova consulta
        </button>

        {loading && (
          <div className="resultado-loading">
            <div className="loading-spinner" />
            <p>Consultando tabela FIPE...</p>
          </div>
        )}

        {erro && (
          <div className="resultado-erro">
            <span>⚠</span> {erro}
          </div>
        )}

        {data && !loading && (
          <div className="resultado-content">

            {/* HERO */}
            <div className="res-hero">
              <div className="res-hero-info">
                <div className="res-codigo">Código FIPE: {data.codigoFipe}</div>
                <h1>{data.marca} {data.modelo}</h1>
                <div className="res-sub">
                  {data.anoModelo} · {data.combustivel} · {data.mesReferencia}
                </div>
              </div>
              <div className="res-preco-box">
                <div className="res-preco-label">Valor FIPE</div>
                <div className="res-preco">{data.valorFipe}</div>
                <div className="res-preco-ref">{data.mesReferencia}</div>
              </div>
            </div>

            {/* SEM DADOS COMPLEMENTARES */}
            {!dc && (
              <div className="res-no-data">
                <span>ℹ</span>
                Esse veículo ainda não possui análise detalhada cadastrada na plataforma.
                Só o valor FIPE está disponível.
              </div>
            )}

            {/* COM DADOS COMPLEMENTARES */}
            {dc && (
              <div className="res-grid">

                {/* FICHA TÉCNICA */}
                <div className="res-card">
                  <h2 className="res-card-title">Ficha técnica</h2>
                  <div className="ficha-grid">
                    {dc.versao && <div className="ficha-item"><span>Versão</span><strong>{dc.versao}</strong></div>}
                    {dc.motorizacao && <div className="ficha-item"><span>Motorização</span><strong>{dc.motorizacao}</strong></div>}
                    {dc.aspiracao && <div className="ficha-item"><span>Aspiração</span><strong>{dc.aspiracao}</strong></div>}
                    {dc.cambio && <div className="ficha-item"><span>Câmbio</span><strong>{dc.cambio}</strong></div>}
                    {dc.categoria && <div className="ficha-item"><span>Categoria</span><strong>{dc.categoria}</strong></div>}
                    {dc.paisOrigem && <div className="ficha-item"><span>País de origem</span><strong>{dc.paisOrigem}</strong></div>}
                    <div className="ficha-item"><span>Importado</span><strong>{dc.importado ? 'Sim' : 'Não'}</strong></div>
                  </div>
                </div>

                {/* AVALIAÇÃO */}
                <div className="res-card">
                  <h2 className="res-card-title">
                    Avaliação geral
                    <span className="nota-geral">{dc.notaGeral?.toFixed(1)}</span>
                  </h2>
                  <div className="notas-list">
                    <NotaBar label="Consumo" valor={dc.notaConsumo} />
                    <NotaBar label="Conforto" valor={dc.notaConforto} />
                    <NotaBar label="Desempenho" valor={dc.notaDesempenho} />
                    <NotaBar label="Confiabilidade" valor={dc.notaConfiabilidade} />
                    <NotaBar label="Custo de manutenção" valor={dc.notaCustoManutencao} />
                    <NotaBar label="Espaço interno" valor={dc.notaEspacoInterno} />
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                {dc.descricao && (
                  <div className="res-card res-card-full">
                    <h2 className="res-card-title">Sobre o veículo</h2>
                    <p className="res-descricao">{dc.descricao}</p>
                  </div>
                )}

                {/* PONTOS */}
                <div className="res-card">
                  <h2 className="res-card-title">✓ Pontos positivos</h2>
                  <p className="res-texto positivo">{dc.pontosPositivos || '—'}</p>
                </div>

                <div className="res-card">
                  <h2 className="res-card-title">✕ Pontos negativos</h2>
                  <p className="res-texto negativo">{dc.pontosNegativos || '—'}</p>
                </div>

                {/* PROBLEMAS CRÔNICOS */}
                {dc.problemasCronicos && (
                  <div className="res-card res-card-full res-card-alerta">
                    <h2 className="res-card-title">⚠ Problemas crônicos conhecidos</h2>
                    <p className="res-texto">{dc.problemasCronicos}</p>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
