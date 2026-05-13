import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore.js'
import { getServicesBySpecialist } from '../api/services.js'
import { getAvailableSlots } from '../api/slots.js'
import { createBooking } from '../api/bookings.js'

function BookingPage() {
  const { specialistId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [form, setForm] = useState({ serviceId: '', timeSlotId: '', note: '' })
  const [error, setError] = useState('')

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['specialist-services', specialistId],
    queryFn: () => getServicesBySpecialist(specialistId),
    enabled: !!specialistId,
  })

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['specialist-slots', specialistId],
    queryFn: () => getAvailableSlots(specialistId),
    enabled: !!specialistId,
  })

  const availableSlots = slots.filter(s => s.status === 'AVAILABLE')

  const bookMut = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      alert('Бронирование успешно создано!')
      navigate('/')
    },
    onError: (err) => setError(err.response?.data?.message || 'Ошибка при создании бронирования'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    bookMut.mutate({
      clientId: user?.id,
      serviceId: parseInt(form.serviceId, 10),
      timeSlotId: parseInt(form.timeSlotId, 10),
      note: form.note,
    })
  }

  const isLoading = servicesLoading || slotsLoading

  const labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
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

      <div style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <button
          className="btn-ghost"
          onClick={() => navigate(-1)}
          style={{ fontSize: 13, padding: '7px 14px', marginBottom: 20 }}
        >
          ← Назад
        </button>
        <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.4 }}>
          Бронирование услуги
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.4)', margin: 0, fontSize: 14 }}>
          Выберите услугу и удобное время
        </p>
      </div>

      <div className="card" style={{ padding: 32, position: 'relative', zIndex: 1 }}>
        {isLoading ? (
          <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка данных...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Услуга</label>
              <select
                value={form.serviceId}
                onChange={e => setForm(p => ({ ...p, serviceId: e.target.value }))}
                required
              >
                <option value="">— Выберите услугу —</option>
                {services.filter(s => s.active !== false).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.price} MDL ({s.duration} мин)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Время</label>
              <select
                value={form.timeSlotId}
                onChange={e => setForm(p => ({ ...p, timeSlotId: e.target.value }))}
                required
              >
                <option value="">— Выберите слот —</option>
                {availableSlots.length === 0 ? (
                  <option disabled>Нет доступных слотов</option>
                ) : (
                  availableSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.slotDate} {slot.startTime} – {slot.endTime}
                    </option>
                  ))
                )}
              </select>
              {availableSlots.length === 0 && !slotsLoading && (
                <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12, margin: '6px 0 0' }}>
                  У специалиста нет свободных слотов
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Комментарий (необязательно)</label>
              <textarea
                value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="Уточните детали или пожелания..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={bookMut.isPending || availableSlots.length === 0}
              style={{ justifyContent: 'center', padding: '12px 0' }}
            >
              {bookMut.isPending ? 'Отправка...' : 'Забронировать'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default BookingPage
