import { useNavigate } from 'react-router-dom'

// Карточка услуги для каталога
function ServiceCard({ service }) {
  const navigate = useNavigate()

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'transform 0.2s, border-color 0.2s',
        cursor: 'default',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Заголовок и бейдж категории */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3
          style={{
            margin: 0,
            color: '#f1f5f9',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {service.title}
        </h3>
        {service.categoryId && (
          <span
            style={{
              flexShrink: 0,
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 20,
              color: '#a5b4fc',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              letterSpacing: 0.3,
              textTransform: 'uppercase',
            }}
          >
            #{service.categoryId}
          </span>
        )}
      </div>

      {/* Описание */}
      {service.description && (
        <p
          style={{
            margin: 0,
            color: 'rgba(226,232,240,0.55)',
            fontSize: 13,
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {service.description}
        </p>
      )}

      {/* Цена и длительность */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        <div>
          <span
            style={{ color: 'rgba(226,232,240,0.4)', fontSize: 11, display: 'block', marginBottom: 2 }}
          >
            Цена
          </span>
          <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 18 }}>
            {service.price} <span style={{ fontSize: 12, fontWeight: 400 }}>MDL</span>
          </span>
        </div>
        <div>
          <span
            style={{ color: 'rgba(226,232,240,0.4)', fontSize: 11, display: 'block', marginBottom: 2 }}
          >
            Длительность
          </span>
          <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15 }}>
            {service.duration} <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(226,232,240,0.5)' }}>мин</span>
          </span>
        </div>
      </div>

      {/* Кнопка перехода к специалисту */}
      <button
        className="btn-primary"
        style={{ marginTop: 4, width: '100%', justifyContent: 'center', fontSize: 14, padding: '9px' }}
        onClick={() => navigate(`/specialists/${service.specialistProfileId}`)}
        disabled={!service.specialistProfileId}
      >
        Подробнее
      </button>
    </div>
  )
}

export default ServiceCard
