export default function NotaBar({ label, valor }) {
  if (valor == null) {
    return (
      <div className="nota-item">
        <div className="nota-label">{label}</div>
        <div className="nota-bar-wrap" />
        <div className="nota-val" style={{ color: 'var(--text-muted)' }}>—</div>
      </div>
    )
  }
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
