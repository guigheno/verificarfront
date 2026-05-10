import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getMarcas, getModelos, getAnos } from '../services/api'
import './ConsultaPage.css'

export default function ConsultaPage() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('modelo') // 'modelo' | 'placa'

  // --- Estado modo modelo ---
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [anos, setAnos] = useState([])
  const [marcaSelecionada, setMarcaSelecionada] = useState(null)
  const [modeloSelecionado, setModeloSelecionado] = useState(null)
  const [anoSelecionado, setAnoSelecionado] = useState(null)
  const [loadingMarcas, setLoadingMarcas] = useState(true)
  const [loadingModelos, setLoadingModelos] = useState(false)
  const [loadingAnos, setLoadingAnos] = useState(false)
  const [buscaMarca, setBuscaMarca] = useState('')
  const [buscaModelo, setBuscaModelo] = useState('')

  // --- Estado modo placa ---
  const [placa, setPlaca] = useState('')
  const [placaErro, setPlacaErro] = useState('')

  const [erro, setErro] = useState('')

  useEffect(() => {
    getMarcas()
      .then(setMarcas)
      .catch(() => setErro('Erro ao carregar marcas. Verifique se a API está rodando.'))
      .finally(() => setLoadingMarcas(false))
  }, [])

  const selecionarMarca = async (marca) => {
    setMarcaSelecionada(marca)
    setModeloSelecionado(null)
    setAnoSelecionado(null)
    setAnos([])
    setBuscaModelo('')
    setLoadingModelos(true)
    try {
      const data = await getModelos(marca.codigo)
      setModelos(data)
    } catch {
      setErro('Erro ao carregar modelos.')
    } finally {
      setLoadingModelos(false)
    }
  }

  const selecionarModelo = async (modelo) => {
    setModeloSelecionado(modelo)
    setAnoSelecionado(null)
    setLoadingAnos(true)
    try {
      const data = await getAnos(marcaSelecionada.codigo, modelo.codigo)
      setAnos(data)
    } catch {
      setErro('Erro ao carregar anos do modelo.')
    } finally {
      setLoadingAnos(false)
    }
  }

  const podeConsultarModelo = marcaSelecionada && modeloSelecionado && anoSelecionado

  const consultarPorModelo = () => {
    if (!podeConsultarModelo) return
    navigate('/resultado', {
      state: {
        tipo: 'modelo',
        marca: marcaSelecionada.nome,
        modelo: modeloSelecionado.nome,
        ano: parseInt(anoSelecionado.nome),
        codigoMarca: marcaSelecionada.codigo,
        codigoModelo: modeloSelecionado.codigo,
        codigoAno: anoSelecionado.codigo,
      }
    })
  }

  const consultarPorPlaca = () => {
    const placaNorm = placa.trim().toUpperCase().replace(/[-\s]/g, '')
    const antigoOk = /^[A-Z]{3}\d{4}$/.test(placaNorm)
    const mercosulOk = /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placaNorm)

    if (!antigoOk && !mercosulOk) {
      setPlacaErro('Placa inválida. Use o formato AAA9999 ou AAA9A99.')
      return
    }

    setPlacaErro('')
    navigate('/resultado-placa', { state: { placa: placaNorm } })
  }

  const marcasFiltradas = marcas.filter(m =>
    m.nome.toLowerCase().includes(buscaMarca.toLowerCase())
  )
  const modelosFiltrados = modelos.filter(m =>
    m.nome.toLowerCase().includes(buscaModelo.toLowerCase())
  )

  return (
    <div className="consulta-root">
      <Navbar />
      <main className="consulta-main">
        <div className="consulta-header">
          <h1>Consultar veículo</h1>
          <p>Consulte por marca e modelo ou informe a placa diretamente</p>
        </div>

        {/* TABS */}
        <div className="modo-tabs">
          <button
            className={modo === 'modelo' ? 'active' : ''}
            onClick={() => { setModo('modelo'); setErro('') }}
          >
            Por marca e modelo
          </button>
          <button
            className={modo === 'placa' ? 'active' : ''}
            onClick={() => { setModo('placa'); setErro('') }}
          >
            Por placa
          </button>
        </div>

        {erro && <div className="consulta-erro">{erro}</div>}

        {/* MODO PLACA */}
        {modo === 'placa' && (
          <div className="placa-section">
            <div className="placa-card">
              <div className="placa-icon">🔍</div>
              <h2>Consulta por placa</h2>
              <p>Informe a placa do veículo para obter dados completos, restrições e valor de mercado.</p>
              <div className="placa-input-wrap">
                <input
                  className="placa-input"
                  placeholder="Ex: ABC1234 ou ABC1D23"
                  value={placa}
                  maxLength={8}
                  onChange={e => {
                    setPlaca(e.target.value.toUpperCase())
                    setPlacaErro('')
                  }}
                  onKeyDown={e => e.key === 'Enter' && consultarPorPlaca()}
                />
                <button className="btn-consultar-placa" onClick={consultarPorPlaca}>
                  Consultar
                </button>
              </div>
              {placaErro && <div className="placa-erro">{placaErro}</div>}
              <div className="placa-hint">
                Aceita placas no formato antigo (AAA9999) e Mercosul (AAA9A99)
              </div>
            </div>
          </div>
        )}

        {/* MODO MODELO */}
        {modo === 'modelo' && (
          <>
            <div className="consulta-steps">

              {/* STEP 1 — MARCA */}
              <div className={`step-card ${marcaSelecionada ? 'done' : ''}`}>
                <div className="step-header">
                  <span className="step-num">01</span>
                  <div>
                    <h2>Marca</h2>
                    {marcaSelecionada && <span className="step-selected">{marcaSelecionada.nome}</span>}
                  </div>
                  {marcaSelecionada && (
                    <button className="step-change" onClick={() => {
                      setMarcaSelecionada(null)
                      setModeloSelecionado(null)
                      setAnoSelecionado(null)
                      setModelos([])
                      setAnos([])
                    }}>Alterar</button>
                  )}
                </div>
                {!marcaSelecionada && (
                  <div className="step-body">
                    <input
                      className="search-input"
                      placeholder="Buscar marca..."
                      value={buscaMarca}
                      onChange={e => setBuscaMarca(e.target.value)}
                    />
                    {loadingMarcas ? (
                      <div className="step-loading">Carregando marcas...</div>
                    ) : (
                      <div className="chips-grid">
                        {marcasFiltradas.map(m => (
                          <button key={m.codigo} className="chip" onClick={() => selecionarMarca(m)}>
                            {m.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2 — MODELO */}
              {marcaSelecionada && (
                <div className={`step-card ${modeloSelecionado ? 'done' : ''}`}>
                  <div className="step-header">
                    <span className="step-num">02</span>
                    <div>
                      <h2>Modelo</h2>
                      {modeloSelecionado && <span className="step-selected">{modeloSelecionado.nome}</span>}
                    </div>
                    {modeloSelecionado && (
                      <button className="step-change" onClick={() => {
                        setModeloSelecionado(null)
                        setAnoSelecionado(null)
                        setAnos([])
                      }}>Alterar</button>
                    )}
                  </div>
                  {!modeloSelecionado && (
                    <div className="step-body">
                      <input
                        className="search-input"
                        placeholder="Buscar modelo..."
                        value={buscaModelo}
                        onChange={e => setBuscaModelo(e.target.value)}
                      />
                      {loadingModelos ? (
                        <div className="step-loading">Carregando modelos...</div>
                      ) : (
                        <div className="chips-grid">
                          {modelosFiltrados.map(m => (
                            <button key={m.codigo} className="chip" onClick={() => selecionarModelo(m)}>
                              {m.nome}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — ANO */}
              {modeloSelecionado && (
                <div className={`step-card ${anoSelecionado ? 'done' : ''}`}>
                  <div className="step-header">
                    <span className="step-num">03</span>
                    <div>
                      <h2>Ano</h2>
                      {anoSelecionado && <span className="step-selected">{anoSelecionado.nome}</span>}
                    </div>
                    {anoSelecionado && (
                      <button className="step-change" onClick={() => setAnoSelecionado(null)}>Alterar</button>
                    )}
                  </div>
                  {!anoSelecionado && (
                    <div className="step-body">
                      {loadingAnos ? (
                        <div className="step-loading">Carregando anos disponíveis...</div>
                      ) : (
                        <div className="chips-grid anos-grid">
                          {anos.map(a => (
                            <button key={a.codigo} className="chip" onClick={() => setAnoSelecionado(a)}>
                              {a.nome}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {podeConsultarModelo && (
              <div className="consulta-footer">
                <div className="consulta-resumo">
                  <span>{marcaSelecionada.nome}</span>
                  <span className="sep">·</span>
                  <span>{modeloSelecionado.nome}</span>
                  <span className="sep">·</span>
                  <span>{anoSelecionado.nome}</span>
                </div>
                <button className="btn-consultar" onClick={consultarPorModelo}>
                  Consultar agora →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
