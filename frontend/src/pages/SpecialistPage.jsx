import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSpecialistById } from '../api/specialists.js'
import { getServicesBySpecialist } from '../api/services.js'
import ServiceCard from '../components/ServiceCard.jsx'

// Звёзды рейтинга
function RatingStars({ rating }) {
  const value = Math.round(rating || 0)
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: 16,
            color: star <= value ? '#fbbf24' : 'rgba(255,255,255,0.15)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// Аватар с инициалами
function Avatar({ email, size = 80 }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : '??'
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        flexShrink: 0,
      }}
    >
      <span style={{ color: '#fff', fontWeight: 700, fontSize: size * 0.3 }}>
        {initials}
      </span>
    </div>
  )
}

// Скелетон страницы специалиста
function SpecialistSkeleton() {
  const b = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 6,
  }
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      <div className="card" style={{ padding: 32, display: 'flex', gap: 24, marginBottom: 40 }}>
        <div style={{ ...b, width: 80, height: 80, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...b, height: 24, width: '40%' }} />
          <div style={{ ...b, height: 16, width: '60%' }} />
          <div style={{ ...b, height: 14, width: '80%' }} />
        </div>
      </div>
    </div>
  )
}

function SpecialistPage() {
  const { id } = useParams()

  const { data: specialist, isLoading, error } = useQuery({
    queryKey: ['specialist', id],
    queryFn: () => getSpecialistById(id),
    enabled: !!id,
  })

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['specialist-services', id],
    queryFn: () => getServicesBySpecialist(id),
    enabled: !!id,
  })

  if (isLoading) return <SpecialistSkeleton />

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 16 }}>
          Специалист не найден или произошла ошибка
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Декоративный glow */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Карточка профиля */}
      <div className="card" style={{ padding: '32px', marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <Avatar email={specialist?.userEmail} size={80} />

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1
                style={{
                  color: '#f1f5f9',
                  fontSize: 22,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: -0.3,
                }}
              >
                {specialist?.userEmail ?? 'Специалист'}
              </h1>

              {/* Бейдж "Проверен" */}
              {specialist?.verified && (
                <span
                  style={{
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 20,
                    color: '#4ade80',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    letterSpacing: 0.3,
                  }}
                >
                  ✓ Проверен
                </span>
              )}
            </div>

            {/* Рейтинг и опыт */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RatingStars rating={specialist?.rating} />
                <span style={{ color: 'rgba(226,232,240,0.5)', fontSize: 13 }}>
                  {specialist?.rating != null ? specialist.rating.toFixed(1) : '—'}
                </span>
              </div>

              {specialist?.experience != null && (
                <span
                  style={{
                    color: 'rgba(226,232,240,0.5)',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#a5b4fc' }}>◈</span>
                  {specialist.experience}{' '}
                  {specialist.experience === 1
                    ? 'год опыта'
                    : specialist.experience < 5
                    ? 'года опыта'
                    : 'лет опыта'}
                </span>
              )}
            </div>

            {/* Биография */}
            {specialist?.bio && (
              <p
                style={{
                  color: 'rgba(226,232,240,0.65)',
                  fontSize: 14,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {specialist.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Услуги специалиста */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2
          style={{
            color: '#f1f5f9',
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 20px',
            letterSpacing: -0.2,
          }}
        >
          Услуги
          {services.length > 0 && (
            <span
              style={{
                marginLeft: 10,
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 12,
                color: '#a5b4fc',
                fontSize: 13,
                fontWeight: 600,
                padding: '2px 10px',
              }}
            >
              {services.length}
            </span>
          )}
        </h2>

        {servicesLoading ? (
          <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка услуг...</p>
        ) : services.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(226,232,240,0.35)',
              fontSize: 14,
            }}
          >
            Специалист ещё не добавил услуги
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SpecialistPage
