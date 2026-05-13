import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore.js'
import { getSpecialistById } from '../api/specialists.js'
import { getServicesBySpecialist } from '../api/services.js'
import { getReviewsBySpecialist, createReview } from '../api/reviews.js'
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

// ──────────────────────────────────────────────
// Секция отзывов
// ──────────────────────────────────────────────
function ReviewsSection({ specialistId }) {
  const qc = useQueryClient()
  const { token, user } = useAuthStore()
  const [form, setForm] = useState({ rating: '', text: '', bookingId: '' })
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['specialist-reviews', specialistId],
    queryFn: () => getReviewsBySpecialist(specialistId),
    enabled: !!specialistId,
  })

  const mutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialist-reviews', specialistId] })
      setForm({ rating: '', text: '', bookingId: '' })
      setShowForm(false)
      setError('')
    },
    onError: (err) => setError(err.response?.data?.message || 'Ошибка при отправке отзыва'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    mutation.mutate({
      specialistId: parseInt(specialistId, 10),
      clientId: user?.id,
      rating: parseInt(form.rating, 10),
      text: form.text,
      ...(form.bookingId ? { bookingId: parseInt(form.bookingId, 10) } : {}),
    })
  }

  const labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }

  return (
    <div style={{ marginTop: 40, position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>
          Отзывы
          {reviews.length > 0 && (
            <span style={{ marginLeft: 10, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#a5b4fc', fontSize: 13, fontWeight: 600, padding: '2px 10px' }}>
              {reviews.length}
            </span>
          )}
        </h2>
        {token && user?.role === 'CLIENT' && !showForm && (
          <button className="btn-ghost" onClick={() => setShowForm(true)} style={{ fontSize: 13, padding: '7px 16px' }}>
            Оставить отзыв
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <h3 style={{ color: '#a5b4fc', margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Мой отзыв</h3>

          <div>
            <label style={labelStyle}>Оценка</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <input
                    type="radio"
                    name="rating"
                    value={n}
                    checked={form.rating === String(n)}
                    onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: 28, color: form.rating >= String(n) ? '#fbbf24' : 'rgba(255,255,255,0.15)', transition: 'color 0.15s' }}>
                    ★
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>{n}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Текст отзыва</label>
            <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} placeholder="Поделитесь своим опытом..." rows={3} style={{ resize: 'vertical' }} required />
          </div>

          <div>
            <label style={labelStyle}>ID бронирования (необязательно)</label>
            <input type="number" value={form.bookingId} onChange={e => setForm(p => ({ ...p, bookingId: e.target.value }))} placeholder="Например: 42" />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-primary" disabled={mutation.isPending || !form.rating} style={{ flex: 1, justifyContent: 'center' }}>
              {mutation.isPending ? 'Отправка...' : 'Отправить отзыв'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setError('') }} style={{ fontSize: 13 }}>Отмена</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка отзывов...</p>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 14 }}>
          Отзывов пока нет
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.map(review => (
            <div key={review.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: 15, color: s <= review.rating ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>★</span>
                  ))}
                </div>
                <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12 }}>{review.rating}/5</span>
              </div>
              {review.text && <p style={{ color: 'rgba(226,232,240,0.75)', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>{review.text}</p>}
              {review.reply && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
                  <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ответ специалиста</span>
                  <p style={{ color: 'rgba(226,232,240,0.65)', fontSize: 13, margin: 0, lineHeight: 1.55 }}>{review.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SpecialistPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuthStore()

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

            {/* Кнопка бронирования для клиентов */}
            {token && user?.role === 'CLIENT' && (
              <button
                className="btn-primary"
                onClick={() => navigate(`/book/${id}`)}
                style={{ marginTop: 16, padding: '10px 24px', alignSelf: 'flex-start' }}
              >
                Забронировать
              </button>
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

      {/* Отзывы */}
      <ReviewsSection specialistId={id} />
    </div>
  )
}

export default SpecialistPage
