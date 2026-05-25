export default function KpiCard({ title, value, delta, deltaLabel, loading }) {
  const isPositive = delta > 0
  const isNegative = delta < 0

  return (
    <div
      style={{
        padding: '22px 20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <span style={{ color: 'rgba(226,232,240,0.5)', fontSize: 12, fontWeight: 500, letterSpacing: 0.3 }}>
        {title}
      </span>

      {loading ? (
        <div style={{ height: 34, borderRadius: 6, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite' }} />
      ) : (
        <span style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1 }}>
          {value ?? '—'}
        </span>
      )}

      {delta != null && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: isPositive ? '#4ade80' : isNegative ? '#f87171' : 'rgba(226,232,240,0.4)',
          }}>
            {isPositive ? '↑' : isNegative ? '↓' : '→'}{' '}
            {Math.abs(delta)}%
          </span>
          {deltaLabel && (
            <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
