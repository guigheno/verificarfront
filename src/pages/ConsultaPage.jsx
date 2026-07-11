import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getMarcas, getModelos, getAnos } from '../services/api'
import './ConsultaPage.css'

const NAO_SEI = 'Não sei'
const CONDICOES = ['Excelente', 'Bom', 'Regular', 'Ruim', NAO_SEI]
const CAMBIOS = ['Manual', 'Automático', 'CVT', NAO_SEI]
const PROPRIETARIOS = ['1', '2', '3+', NAO_SEI]
const PINTURAS = ['Original', 'Repintura parcial', 'Repintura total', NAO_SEI]
const INTERIORES = ['Bom', 'Desgastado', 'Danificado', NAO_SEI]
const PNEUS_OPCOES = ['Novos', 'Meia vida', 'Precisam troca', NAO_SEI]
const RODAS_OPCOES = ['Sem avarias', 'Amassadas/arranhadas', NAO_SEI]

// Campos tri-state: Sim / Não / Não sei — "Não sei" é o padrão e não altera o
// cálculo da precificação (não penaliza nem beneficia por falta de informação).
function TriChips({ label, valor, onChange, alerta }) {
  return (
    <div className={`field-extra ${alerta && valor === 'Sim' ? 'field-extra-alerta' : ''}`}>
      <label>{label}</label>
      <div className="condicao-chips">
        <button className={`chip ${valor === 'Sim' ? 'chip-active' : ''}`} onClick={() => onChange('Sim')}>Sim</button>
        <button className={`chip ${valor === 'Não' ? 'chip-active' : ''}`} onClick={() => onChange('Não')}>Não</button>
        <button className={`chip ${valor === NAO_SEI ? 'chip-active' : ''}`} onClick={() => onChange(NAO_SEI)}>Não sei</button>
      </div>
    </div>
  )
}

// Fatores escolhidos com base no que mais influencia o valor de mercado de
// um usado no Brasil e que o comprador consegue avaliar sem laudo técnico:
// câmbio, dono único, manutenção, documentação/débitos, estado de pintura,
// interior, pneus e rodas. O sinistro/leilão só aparece na consulta por
// modelo — na consulta por placa essa informação já vem da verificação
// documental real (restrições retornadas pela API de placas).
function DetalhesPrecificacao({
  cambio, setCambio,
  numeroProprietarios, setNumeroProprietarios,
  revisaoEmDia, setRevisaoEmDia,
  documentacaoRegular, setDocumentacaoRegular,
  estadoPintura, setEstadoPintura,
  estadoInterior, setEstadoInterior,
  estadoPneus, setEstadoPneus,
  estadoRodas, setEstadoRodas,
  sinistrado, setSinistrado,
  mostrarSinistro = true,
}) {
  return (
    <div className="extras-grid">
      <div className="field-extra">
        <label>Câmbio</label>
        <div className="condicao-chips">
          {CAMBIOS.map(c => (
            <button key={c} className={`chip ${cambio === c ? 'chip-active' : ''}`} onClick={() => setCambio(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="field-extra">
        <label>Proprietários anteriores</label>
        <div className="condicao-chips">
          {PROPRIETARIOS.map(n => (
            <button key={n} className={`chip ${numeroProprietarios === n ? 'chip-active' : ''}`} onClick={() => setNumeroProprietarios(n)}>{n}</button>
          ))}
        </div>
      </div>
      <div className="field-extra">
        <label>Estado da pintura</label>
        <div className="condicao-chips">
          {PINTURAS.map(p => (
            <button key={p} className={`chip ${estadoPintura === p ? 'chip-active' : ''}`} onClick={() => setEstadoPintura(p)}>{p}</button>
          ))}
        </div>
      </div>
      <div className="field-extra">
        <label>Estado do interior</label>
        <div className="condicao-chips">
          {INTERIORES.map(i => (
            <button key={i} className={`chip ${estadoInterior === i ? 'chip-active' : ''}`} onClick={() => setEstadoInterior(i)}>{i}</button>
          ))}
        </div>
      </div>
      <div className="field-extra">
        <label>Estado dos pneus</label>
        <div className="condicao-chips">
          {PNEUS_OPCOES.map(p => (
            <button key={p} className={`chip ${estadoPneus === p ? 'chip-active' : ''}`} onClick={() => setEstadoPneus(p)}>{p}</button>
          ))}
        </div>
      </div>
      <div className="field-extra">
        <label>Estado das rodas</label>
        <div className="condicao-chips">
          {RODAS_OPCOES.map(r => (
            <button key={r} className={`chip ${estadoRodas === r ? 'chip-active' : ''}`} onClick={() => setEstadoRodas(r)}>{r}</button>
          ))}
        </div>
      </div>
      <TriChips label="Revisões em concessionária?" valor={revisaoEmDia} onChange={setRevisaoEmDia} />
      <TriChips label="IPVA e multas em dia?" valor={documentacaoRegular} onChange={setDocumentacaoRegular} />
      {mostrarSinistro && (
        <div className="field-extra-full">
          <TriChips label="Já foi sinistrado ou é de leilão?" valor={sinistrado} onChange={setSinistrado} alerta />
        </div>
      )}
    </div>
  )
}

export default function ConsultaPage() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('modelo')

  // Modo modelo
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

  // Dados adicionais
  const [quilometragem, setQuilometragem] = useState('')
  const [condicao, setCondicao] = useState(NAO_SEI)
  const [cambio, setCambio] = useState(NAO_SEI)
  const [numeroProprietarios, setNumeroProprietarios] = useState(NAO_SEI)
  const [revisaoEmDia, setRevisaoEmDia] = useState(NAO_SEI)
  const [documentacaoRegular, setDocumentacaoRegular] = useState(NAO_SEI)
  const [sinistrado, setSinistrado] = useState(NAO_SEI)
  const [estadoPintura, setEstadoPintura] = useState(NAO_SEI)
  const [estadoInterior, setEstadoInterior] = useState(NAO_SEI)
  const [estadoPneus, setEstadoPneus] = useState(NAO_SEI)
  const [estadoRodas, setEstadoRodas] = useState(NAO_SEI)

  const detalhesPrecificacaoBase = {
    cambio,
    numeroProprietarios,
    revisaoEmDia,
    documentacaoRegular,
    ipvaEmDia: documentacaoRegular,
    estadoPintura,
    estadoInterior,
    estadoPneus,
    estadoRodas,
  }
  // Sinistro/leilão só entra na precificação quando vem do formulário (consulta por
  // modelo) — na consulta por placa, a API de placas já traz isso via restrições.
  const detalhesPrecificacaoModelo = { ...detalhesPrecificacaoBase, sinistrado }
  const detalhesPrecificacaoPlaca = { ...detalhesPrecificacaoBase, sinistrado: NAO_SEI }

  // Modo placa
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
    } catch { setErro('Erro ao carregar modelos.') }
    finally { setLoadingModelos(false) }
  }

  const selecionarModelo = async (modelo) => {
    setModeloSelecionado(modelo)
    setAnoSelecionado(null)
    setLoadingAnos(true)
    try {
      const data = await getAnos(marcaSelecionada.codigo, modelo.codigo)
      setAnos(data)
    } catch { setErro('Erro ao carregar anos do modelo.') }
    finally { setLoadingAnos(false) }
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
        quilometragem: quilometragem ? parseInt(quilometragem) : 0,
        condicao,
        detalhes: detalhesPrecificacaoModelo,
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
    navigate('/resultado-placa', {
      state: {
        placa: placaNorm,
        quilometragem: quilometragem ? parseInt(quilometragem) : 0,
        condicao,
        detalhes: detalhesPrecificacaoPlaca,
      }
    })
  }

  const marcasFiltradas = marcas.filter(m => m.nome.toLowerCase().includes(buscaMarca.toLowerCase()))
  const modelosFiltrados = modelos.filter(m => m.nome.toLowerCase().includes(buscaModelo.toLowerCase()))

  return (
    <div className="consulta-root">
      <Navbar />
      <main className="consulta-main">
        <div className="consulta-header">
          <h1>Consultar veículo</h1>
          <p>Consulte por marca e modelo ou informe a placa diretamente</p>
        </div>

        <div className="modo-tabs">
          <button className={modo === 'modelo' ? 'active' : ''} onClick={() => { setModo('modelo'); setErro('') }}>
            Por marca e modelo
          </button>
          <button className={modo === 'placa' ? 'active' : ''} onClick={() => { setModo('placa'); setErro('') }}>
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
                  onChange={e => { setPlaca(e.target.value.toUpperCase()); setPlacaErro('') }}
                  onKeyDown={e => e.key === 'Enter' && consultarPorPlaca()}
                />
                <button className="btn-consultar-placa" onClick={consultarPorPlaca}>Consultar</button>
              </div>
              {placaErro && <div className="placa-erro">{placaErro}</div>}
              <div className="placa-hint">Aceita placas no formato antigo (AAA9999) e Mercosul (AAA9A99)</div>

              <div className="placa-extras">
                <div className="field-extra">
                  <label>Quilometragem <span className="step-opcional">(opcional)</span></label>
                  <input
                    type="number"
                    className="search-input km-input"
                    placeholder="Ex: 80000"
                    value={quilometragem}
                    min={0}
                    onChange={e => setQuilometragem(e.target.value)}
                  />
                </div>
                <div className="field-extra">
                  <label>Condição do veículo</label>
                  <div className="condicao-chips">
                    {CONDICOES.map(c => (
                      <button key={c} className={`chip ${condicao === c ? 'chip-active' : ''}`} onClick={() => setCondicao(c)}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              <DetalhesPrecificacao
                cambio={cambio} setCambio={setCambio}
                numeroProprietarios={numeroProprietarios} setNumeroProprietarios={setNumeroProprietarios}
                revisaoEmDia={revisaoEmDia} setRevisaoEmDia={setRevisaoEmDia}
                documentacaoRegular={documentacaoRegular} setDocumentacaoRegular={setDocumentacaoRegular}
                estadoPintura={estadoPintura} setEstadoPintura={setEstadoPintura}
                estadoInterior={estadoInterior} setEstadoInterior={setEstadoInterior}
                estadoPneus={estadoPneus} setEstadoPneus={setEstadoPneus}
                estadoRodas={estadoRodas} setEstadoRodas={setEstadoRodas}
                mostrarSinistro={false}
              />
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
                  <div><h2>Marca</h2>{marcaSelecionada && <span className="step-selected">{marcaSelecionada.nome}</span>}</div>
                  {marcaSelecionada && (
                    <button className="step-change" onClick={() => { setMarcaSelecionada(null); setModeloSelecionado(null); setAnoSelecionado(null); setModelos([]); setAnos([]) }}>Alterar</button>
                  )}
                </div>
                {!marcaSelecionada && (
                  <div className="step-body">
                    <input className="search-input" placeholder="Buscar marca..." value={buscaMarca} onChange={e => setBuscaMarca(e.target.value)} />
                    {loadingMarcas ? <div className="step-loading">Carregando marcas...</div> : (
                      <div className="chips-grid">
                        {marcasFiltradas.map(m => <button key={m.codigo} className="chip" onClick={() => selecionarMarca(m)}>{m.nome}</button>)}
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
                    <div><h2>Modelo</h2>{modeloSelecionado && <span className="step-selected">{modeloSelecionado.nome}</span>}</div>
                    {modeloSelecionado && (
                      <button className="step-change" onClick={() => { setModeloSelecionado(null); setAnoSelecionado(null); setAnos([]) }}>Alterar</button>
                    )}
                  </div>
                  {!modeloSelecionado && (
                    <div className="step-body">
                      <input className="search-input" placeholder="Buscar modelo..." value={buscaModelo} onChange={e => setBuscaModelo(e.target.value)} />
                      {loadingModelos ? <div className="step-loading">Carregando modelos...</div> : (
                        <div className="chips-grid">
                          {modelosFiltrados.map(m => <button key={m.codigo} className="chip" onClick={() => selecionarModelo(m)}>{m.nome}</button>)}
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
                    <div><h2>Ano</h2>{anoSelecionado && <span className="step-selected">{anoSelecionado.nome}</span>}</div>
                    {anoSelecionado && <button className="step-change" onClick={() => setAnoSelecionado(null)}>Alterar</button>}
                  </div>
                  {!anoSelecionado && (
                    <div className="step-body">
                      {loadingAnos ? <div className="step-loading">Carregando anos disponíveis...</div> : (
                        <div className="chips-grid anos-grid">
                          {anos.map(a => <button key={a.codigo} className="chip" onClick={() => setAnoSelecionado(a)}>{a.nome}</button>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 — KM E CONDIÇÃO (opcional) */}
              {anoSelecionado && (
                <div className="step-card">
                  <div className="step-header">
                    <span className="step-num">04</span>
                    <div>
                      <h2>Dados adicionais <span className="step-opcional">(opcional)</span></h2>
                      <span className="step-selected">Melhora a precisão da precificação</span>
                    </div>
                  </div>
                  <div className="step-body step-body-row">
                    <div className="field-extra">
                      <label>Quilometragem</label>
                      <input
                        type="number"
                        className="search-input km-input"
                        placeholder="Ex: 80000"
                        value={quilometragem}
                        min={0}
                        onChange={e => setQuilometragem(e.target.value)}
                      />
                    </div>
                    <div className="field-extra">
                      <label>Condição do veículo</label>
                      <div className="condicao-chips">
                        {CONDICOES.map(c => (
                          <button
                            key={c}
                            className={`chip ${condicao === c ? 'chip-active' : ''}`}
                            onClick={() => setCondicao(c)}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DetalhesPrecificacao
                    cambio={cambio} setCambio={setCambio}
                    numeroProprietarios={numeroProprietarios} setNumeroProprietarios={setNumeroProprietarios}
                    revisaoEmDia={revisaoEmDia} setRevisaoEmDia={setRevisaoEmDia}
                    documentacaoRegular={documentacaoRegular} setDocumentacaoRegular={setDocumentacaoRegular}
                    estadoPintura={estadoPintura} setEstadoPintura={setEstadoPintura}
                    estadoInterior={estadoInterior} setEstadoInterior={setEstadoInterior}
                    estadoPneus={estadoPneus} setEstadoPneus={setEstadoPneus}
                    estadoRodas={estadoRodas} setEstadoRodas={setEstadoRodas}
                    sinistrado={sinistrado} setSinistrado={setSinistrado}
                  />
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
                  {quilometragem && <><span className="sep">·</span><span>{parseInt(quilometragem).toLocaleString('pt-BR')} km</span></>}
                  <span className="sep">·</span>
                  <span>{condicao}</span>
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
