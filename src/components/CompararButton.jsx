import { useNavigate } from 'react-router-dom'
import './CompararButton.css'

export default function CompararButton({ veiculoAtual }) {
  const navigate = useNavigate()
  return (
    <button className="btn-comparar" onClick={() => navigate('/comparar', { state: { veiculoAtual } })}>
      ⇄ Comparar
    </button>
  )
}
