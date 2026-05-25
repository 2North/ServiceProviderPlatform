export default function AnalyticsChart({ title, loading, empty, error, onRetry, children }) {
  return (
    <div
      style={{
        padding: '22px 20px 16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 260,
      }}
    >
      <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{title}</span>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 12 + i * 10,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.05)',
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ color: '#f87171', fontSize: 13 }}>Ошибка загрузки данных</span>
          {onRetry && (
            <button className="btn-ghost" onClick={onRetry} style={{ fontSize: 12, padding: '6px 14px' }}>
              Повторить
            </button>
          )}
        </div>
      ) : empty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>📊</span>
          <span style={{ color: 'rgba(226,232,240,0.35)', fontSize: 13 }}>Пока недостаточно данных</span>
        </div>
      ) : (
        <div style={{ flex: 1 }}>{children}</div>
      )}
    </div>
  )
}
