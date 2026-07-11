import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('verificar_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('verificar_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data.token)

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then(r => r.data)

// Consulta FIPE (dropdowns)
export const getMarcas = () =>
  api.get('/consulta/marcas').then(r => r.data)

export const getModelos = (codigoMarca) =>
  api.get(`/consulta/marcas/${codigoMarca}/modelos`).then(r => r.data)

export const getAnos = (codigoMarca, codigoModelo) =>
  api.get(`/consulta/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`).then(r => r.data)

// Análise completa (Ciclo 2/3) — FIPE + IA + precificação + histórico
export const getAnaliseCompleta = (marca, modelo, ano, quilometragem = 0, condicao = 'Não sei', placa = null, detalhes = {}) => {
  const params = {
    marca,
    modelo,
    ano,
    quilometragem,
    condicao,
    cambio: detalhes.cambio ?? 'Não sei',
    numeroProprietarios: detalhes.numeroProprietarios ?? 'Não sei',
    ipvaEmDia: detalhes.ipvaEmDia ?? 'Não sei',
    revisaoEmDia: detalhes.revisaoEmDia ?? 'Não sei',
    documentacaoRegular: detalhes.documentacaoRegular ?? 'Não sei',
    sinistrado: detalhes.sinistrado ?? 'Não sei',
    estadoPintura: detalhes.estadoPintura ?? 'Não sei',
    estadoInterior: detalhes.estadoInterior ?? 'Não sei',
    estadoPneus: detalhes.estadoPneus ?? 'Não sei',
    estadoRodas: detalhes.estadoRodas ?? 'Não sei',
  }
  if (placa) params.placa = placa
  return api.get('/analise/completa', { params }).then(r => r.data)
}

// Consulta por placa
export const consultarPlaca = (placa) =>
  api.get(`/consulta/placa/${placa}`).then(r => r.data)

// Veículos salvos no perfil (Ciclo 3) — base para o futuro sistema de comparação
export const salvarVeiculo = (dto) =>
  api.post('/veiculos-salvos', dto).then(r => r.data)

export const listarVeiculosSalvos = () =>
  api.get('/veiculos-salvos').then(r => r.data)

export const removerVeiculoSalvo = (id) =>
  api.delete(`/veiculos-salvos/${id}`).then(r => r.data)

export default api
