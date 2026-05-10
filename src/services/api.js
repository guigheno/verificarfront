import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('verificar_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data.token)

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then(r => r.data)

// Consulta FIPE
export const getMarcas = () =>
  api.get('/consulta/marcas').then(r => r.data)

export const getModelos = (codigoMarca) =>
  api.get(`/consulta/marcas/${codigoMarca}/modelos`).then(r => r.data)

export const getAnos = (codigoMarca, codigoModelo) =>
  api.get(`/consulta/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`).then(r => r.data)

export const consultarFipe = (marca, modelo, ano) =>
  api.get('/consulta/fipe', { params: { marca, modelo, ano } }).then(r => r.data)

// Consulta por placa
export const consultarPlaca = (placa) =>
  api.get(`/consulta/placa/${placa}`).then(r => r.data)

export default api
