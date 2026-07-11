import { useState } from 'react'
import { salvarVeiculo } from '../services/api'
import './SalvarVeiculoButton.css'

export default function SalvarVeiculoButton({ veiculo }) {
  const [estado, setEstado] = useState('idle') // idle | salvando | salvo | erro

  const salvar = async () => {
    if (estado === 'salvando') return
    setEstado('salvando')
    try {
      await salvarVeiculo(veiculo)
      setEstado('salvo')
    } catch {
      setEstado('erro')
    }
  }

  return (
    <button
      className={`btn-salvar-veiculo ${estado === 'salvo' ? 'salvo' : ''} ${estado === 'erro' ? 'erro' : ''}`}
      onClick={salvar}
      disabled={estado === 'salvando' || estado === 'salvo'}
    >
      {estado === 'idle' && '☆ Salvar veículo'}
      {estado === 'salvando' && 'Salvando...'}
      {estado === 'salvo' && '★ Salvo no perfil'}
      {estado === 'erro' && 'Erro ao salvar — tentar de novo'}
    </button>
  )
}
