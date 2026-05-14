import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore.js'
import {
  getServicesBySpecialist,
  createService,
  updateService,
  deleteService,
} from '../api/services.js'
import { getAllCategories } from '../api/categories.js'
import {
  getSpecialistById,
  getSpecialistByUserId,
  createSpecialist,
  updateSpecialist,
} from '../api/specialists.js'
import { createSlot, getAvailableSlots } from '../api/slots.js'
import { getBookingsBySpecialist, updateBookingStatus } from '../api/bookings.js'
import { getSpecialistAnalytics } from '../api/analytics.js'

// ──────────────────────────────────────────────
// Модальное окно подтверждения удаления
// ──────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ padding: 28, maxWidth: 380, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-modal-title" style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 1.55, margin: '0 0 20px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onCancel} style={{ fontSize: 13 }}>
            Отмена
          </button>
          <button className="btn-danger" onClick={onConfirm} style={{ padding: '9px 18px' }}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Форма услуги (создание / редактирование)
// ──────────────────────────────────────────────
function ServiceForm({ initial, categories, specialistProfileId, onSuccess, onCancel }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    duration: initial?.duration ?? '',
    categoryId: initial?.categoryId ?? '',
    active: initial?.active ?? true,
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  // Мутация создания
  const createMut = useMutation({
    mutationFn: (data) => createService(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialist-services'] })
      onSuccess()
    },
    onError: (err) =>
      setError(err.response?.data?.message || 'Ошибка при создании услуги'),
  })

  // Мутация обновления
  const updateMut = useMutation({
    mutationFn: (data) => updateService(initial.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialist-services'] })
      onSuccess()
    },
    onError: (err) =>
      setError(err.response?.data?.message || 'Ошибка при обновлении услуги'),
  })

  const isLoading = createMut.isPending || updateMut.isPending

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      duration: parseInt(form.duration, 10),
      categoryId: parseInt(form.categoryId, 10),
      active: form.active,
      specialistProfileId: specialistProfileId,
    }
    if (initial) {
      updateMut.mutate(payload)
    } else {
      createMut.mutate(payload)
    }
  }

  const labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          color: '#a5b4fc',
          margin: '0 0 4px',
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {initial ? 'Редактировать услугу' : 'Новая услуга'}
      </h3>

      <div>
        <label htmlFor="sf-title" style={labelStyle}>Название</label>
        <input
          id="sf-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Название услуги"
          required
        />
      </div>

      <div>
        <label htmlFor="sf-description" style={labelStyle}>Описание</label>
        <textarea
          id="sf-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Описание услуги..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label htmlFor="sf-price" style={labelStyle}>Цена (MDL)</label>
          <input
            id="sf-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label htmlFor="sf-duration" style={labelStyle}>Длительность (мин)</label>
          <input
            id="sf-duration"
            name="duration"
            type="number"
            min="1"
            value={form.duration}
            onChange={handleChange}
            placeholder="60"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="sf-category" style={labelStyle}>Категория</label>
        <select id="sf-category" name="categoryId" value={form.categoryId} onChange={handleChange} required>
          <option value="">— Выберите категорию —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Активность */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          color: 'rgba(226,232,240,0.7)',
          fontSize: 14,
        }}
      >
        <input
          type="checkbox"
          name="active"
          checked={form.active}
          onChange={handleChange}
          style={{ width: 'auto', accentColor: '#6366f1' }}
        />
        Услуга активна
      </label>

      {error && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            color: '#f87171',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isLoading ? 'Сохранение...' : initial ? 'Сохранить' : 'Добавить'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onCancel}
          style={{ fontSize: 13 }}
        >
          Отмена
        </button>
      </div>
    </form>
  )
}

// ──────────────────────────────────────────────
// Форма профиля специалиста
// ──────────────────────────────────────────────
function ProfileForm({ specialist, onSuccess, onCancel }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    bio: specialist?.bio ?? '',
    experience: specialist?.experience ?? '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  // Обновление профиля
  const updateMut = useMutation({
    mutationFn: (data) => updateSpecialist(specialist.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-specialist'] })
      onSuccess()
    },
    onError: (err) =>
      setError(err.response?.data?.message || 'Ошибка при сохранении профиля'),
  })

  // Создание профиля
  const createMut = useMutation({
    mutationFn: (data) => createSpecialist(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-specialist'] })
      onSuccess()
    },
    onError: (err) =>
      setError(err.response?.data?.message || 'Ошибка при создании профиля'),
  })

  const isLoading = updateMut.isPending || createMut.isPending

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      bio: form.bio,
      experience: parseInt(form.experience, 10) || 0,
    }
    if (specialist) {
      updateMut.mutate(payload)
    } else {
      createMut.mutate(payload)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        marginTop: 16,
      }}
    >
      <div>
        <label htmlFor="pf-bio" style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
          О себе (bio)
        </label>
        <textarea
          id="pf-bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Расскажите о своём опыте и навыках..."
          rows={4}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div>
        <label htmlFor="pf-experience" style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
          Опыт (лет)
        </label>
        <input
          id="pf-experience"
          name="experience"
          type="number"
          min="0"
          value={form.experience}
          onChange={handleChange}
          placeholder="3"
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            color: '#f87171',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ fontSize: 13 }}>
          Отмена
        </button>
      </div>
    </form>
  )
}

// ──────────────────────────────────────────────
// Основная страница дашборда
// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// Бейдж статуса слота
// ──────────────────────────────────────────────
function SlotStatusBadge({ status }) {
  const map = {
    AVAILABLE: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: '#4ade80', label: 'Доступен' },
    BOOKED: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24', label: 'Занят' },
    CANCELLED: { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', color: 'rgba(226,232,240,0.4)', label: 'Отменён' },
  }
  const s = map[status] || map.AVAILABLE
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, color: s.color, fontSize: 11, fontWeight: 600, padding: '2px 9px' }}>
      {s.label}
    </span>
  )
}

// ──────────────────────────────────────────────
// Бейдж статуса бронирования
// ──────────────────────────────────────────────
function BookingStatusBadge({ status }) {
  const map = {
    PENDING: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24', label: 'Ожидает' },
    CONFIRMED: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#a5b4fc', label: 'Подтверждено' },
    COMPLETED: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: '#4ade80', label: 'Завершено' },
    CANCELLED: { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', color: 'rgba(226,232,240,0.4)', label: 'Отменено' },
  }
  const s = map[status] || map.PENDING
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, color: s.color, fontSize: 11, fontWeight: 600, padding: '2px 9px' }}>
      {s.label}
    </span>
  )
}

function DashboardPage() {
  const qc = useQueryClient()
  const { specialistProfileId, setSpecialistProfileId } = useAuthStore()

  // Состояние форм
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // ID услуги к удалению

  // Состояние слотов
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [slotForm, setSlotForm] = useState({ slotDate: '', startTime: '', endTime: '' })
  const [slotError, setSlotError] = useState('')

  // Загрузка профиля специалиста
  const {
    data: specialist,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['my-specialist', specialistProfileId],
    queryFn: () => {
      if (specialistProfileId) return getSpecialistById(specialistProfileId)
      return null
    },
    enabled: !!specialistProfileId,
    onSuccess: (data) => {
      if (data && !specialistProfileId) {
        setSpecialistProfileId(data.id)
      }
    },
  })

  // Загрузка категорий
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })

  // Загрузка услуг специалиста
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['specialist-services', specialistProfileId],
    queryFn: () => getServicesBySpecialist(specialistProfileId),
    enabled: !!specialistProfileId,
  })

  // Мутация удаления
  const deleteMut = useMutation({
    mutationFn: (id) => deleteService(id, specialistProfileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialist-services'] })
      setDeleteTarget(null)
    },
  })

  // ── Слоты ──
  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['specialist-slots', specialistProfileId],
    queryFn: () => getAvailableSlots(specialistProfileId),
    enabled: !!specialistProfileId,
  })

  const createSlotMut = useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialist-slots'] })
      setShowSlotForm(false)
      setSlotForm({ slotDate: '', startTime: '', endTime: '' })
      setSlotError('')
    },
    onError: (err) => setSlotError(err.response?.data?.message || 'Ошибка при создании слота'),
  })

  const handleSlotSubmit = (e) => {
    e.preventDefault()
    createSlotMut.mutate({ specialistProfileId, ...slotForm })
  }

  // ── Бронирования ──
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['specialist-bookings', specialistProfileId],
    queryFn: () => getBookingsBySpecialist(specialistProfileId),
    enabled: !!specialistProfileId,
  })

  const updateStatusMut = useMutation({
    mutationFn: ({ bookingId, status }) => updateBookingStatus(bookingId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specialist-bookings'] }),
  })

  // ── Аналитика ──
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['specialist-analytics', specialistProfileId],
    queryFn: () => getSpecialistAnalytics(specialistProfileId),
    enabled: !!specialistProfileId,
  })

  const sectionTitle = (text) => (
    <h2
      style={{
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: 600,
        margin: '0 0 20px',
        letterSpacing: -0.2,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {text}
    </h2>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '30%',
          left: '-15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Заголовок страницы */}
      <div style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            color: '#f1f5f9',
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 6px',
            letterSpacing: -0.4,
          }}
        >
          Дашборд специалиста
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.4)', margin: 0, fontSize: 14 }}>
          Управляйте своим профилем и услугами
        </p>
      </div>

      {/* ── Профиль ── */}
      <div
        className="card"
        style={{ padding: 28, marginBottom: 32, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            {sectionTitle('Мой профиль')}
          </div>
          {!editingProfile && (
            <button
              className="btn-ghost"
              onClick={() => setEditingProfile(true)}
              style={{ fontSize: 13, padding: '7px 16px' }}
            >
              {specialist ? 'Редактировать' : 'Создать профиль'}
            </button>
          )}
        </div>

        {profileLoading ? (
          <p role="status" style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка...</p>
        ) : profileError || !specialist ? (
          !editingProfile && (
            <div
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                color: 'rgba(226,232,240,0.4)',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {specialistProfileId
                ? 'Ошибка загрузки профиля'
                : 'Профиль специалиста ещё не создан. Нажмите «Создать профиль».'}
            </div>
          )
        ) : (
          !editingProfile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12, display: 'block', marginBottom: 4 }}>
                  О себе
                </span>
                <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {specialist.bio || <em style={{ color: 'rgba(226,232,240,0.3)' }}>Не указано</em>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Опыт
                  </span>
                  <span style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>
                    {specialist.experience ?? '—'}{' '}
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(226,232,240,0.5)' }}>
                      {specialist.experience === 1 ? 'год' : specialist.experience < 5 ? 'года' : 'лет'}
                    </span>
                  </span>
                </div>
                <div>
                  <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Рейтинг
                  </span>
                  <span style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>
                    {specialist.rating != null ? specialist.rating.toFixed(1) : '—'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Статус
                  </span>
                  <span
                    style={{
                      color: specialist.verified ? '#4ade80' : 'rgba(226,232,240,0.4)',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {specialist.verified ? '✓ Проверен' : 'Не проверен'}
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Форма редактирования профиля */}
        {editingProfile && (
          <ProfileForm
            specialist={specialist}
            onSuccess={() => setEditingProfile(false)}
            onCancel={() => setEditingProfile(false)}
          />
        )}
      </div>

      {/* ── Мои услуги ── */}
      <div className="card" style={{ padding: 28, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {sectionTitle(
            <>
              Мои услуги
              {services.length > 0 && (
                <span
                  style={{
                    background: 'rgba(99,102,241,0.2)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 12,
                    color: '#a5b4fc',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 10px',
                  }}
                >
                  {services.length}
                </span>
              )}
            </>
          )}

          {!showServiceForm && !editingService && (
            <button
              className="btn-primary"
              onClick={() => {
                setShowServiceForm(true)
                setEditingService(null)
              }}
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              + Добавить услугу
            </button>
          )}
        </div>

        {/* Форма новой услуги */}
        {showServiceForm && !editingService && (
          <ServiceForm
            categories={categories}
            specialistProfileId={specialistProfileId}
            onSuccess={() => setShowServiceForm(false)}
            onCancel={() => setShowServiceForm(false)}
          />
        )}

        {/* Список услуг */}
        {servicesLoading ? (
          <p role="status" style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка услуг...</p>
        ) : services.length === 0 && !showServiceForm ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(226,232,240,0.35)',
              fontSize: 14,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 8,
            }}
          >
            Вы ещё не добавили ни одной услуги
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {services.map((service) => (
              <div key={service.id}>
                {/* Форма редактирования конкретной услуги */}
                {editingService?.id === service.id ? (
                  <ServiceForm
                    initial={editingService}
                    categories={categories}
                    specialistProfileId={specialistProfileId}
                    onSuccess={() => setEditingService(null)}
                    onCancel={() => setEditingService(null)}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '16px 18px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>
                          {service.title}
                        </span>
                        {!service.active && (
                          <span
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 4,
                              color: 'rgba(226,232,240,0.4)',
                              fontSize: 10,
                              padding: '2px 7px',
                              fontWeight: 600,
                              letterSpacing: 0.5,
                            }}
                          >
                            НЕАКТИВНА
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p
                          style={{
                            color: 'rgba(226,232,240,0.45)',
                            fontSize: 13,
                            margin: '0 0 8px',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {service.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 15 }}>
                          {service.price} MDL
                        </span>
                        <span style={{ color: 'rgba(226,232,240,0.5)', fontSize: 13 }}>
                          {service.duration} мин
                        </span>
                      </div>
                    </div>

                    {/* Кнопки управления */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          setEditingService(service)
                          setShowServiceForm(false)
                        }}
                        style={{ fontSize: 13, padding: '7px 14px' }}
                      >
                        Изменить
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => setDeleteTarget(service.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Мои слоты ── */}
      <div className="card" style={{ padding: 28, marginTop: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          {sectionTitle('Мои слоты')}
          {!showSlotForm && (
            <button className="btn-primary" onClick={() => setShowSlotForm(true)} style={{ fontSize: 13, padding: '8px 18px' }}>
              + Добавить слот
            </button>
          )}
        </div>

        {showSlotForm && (
          <form
            onSubmit={handleSlotSubmit}
            style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}
          >
            <h3 style={{ color: '#a5b4fc', margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Новый слот</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="slot-date" style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>Дата</label>
                <input id="slot-date" type="date" value={slotForm.slotDate} onChange={e => setSlotForm(p => ({ ...p, slotDate: e.target.value }))} required />
              </div>
              <div>
                <label htmlFor="slot-start" style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>Начало</label>
                <input id="slot-start" type="time" value={slotForm.startTime} onChange={e => setSlotForm(p => ({ ...p, startTime: e.target.value }))} required />
              </div>
              <div>
                <label htmlFor="slot-end" style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>Конец</label>
                <input id="slot-end" type="time" value={slotForm.endTime} onChange={e => setSlotForm(p => ({ ...p, endTime: e.target.value }))} required />
              </div>
            </div>
            {slotError && (
              <div role="alert" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
                {slotError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={createSlotMut.isPending} style={{ flex: 1, justifyContent: 'center' }}>
                {createSlotMut.isPending ? 'Сохранение...' : 'Создать слот'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => { setShowSlotForm(false); setSlotError('') }} style={{ fontSize: 13 }}>
                Отмена
              </button>
            </div>
          </form>
        )}

        {slotsLoading ? (
          <p role="status" style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка слотов...</p>
        ) : slots.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            Слоты ещё не добавлены
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {slots.map((slot) => (
              <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, flexWrap: 'wrap', gap: 10 }}>
                <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{slot.slotDate}</span>
                <span style={{ color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>{slot.startTime} — {slot.endTime}</span>
                <SlotStatusBadge status={slot.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Мои заказы (бронирования) ── */}
      <div className="card" style={{ padding: 28, marginTop: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 20 }}>{sectionTitle('Мои бронирования')}</div>

        {bookingsLoading ? (
          <p role="status" style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка...</p>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            Нет бронирований
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12 }}>#{b.id}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  {b.note && <p style={{ color: 'rgba(226,232,240,0.6)', fontSize: 13, margin: '0 0 4px', lineHeight: 1.5 }}>{b.note}</p>}
                  {b.createdAt && <span style={{ color: 'rgba(226,232,240,0.35)', fontSize: 12 }}>{b.createdAt}</span>}
                </div>
                {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {b.status === 'PENDING' && (
                      <button
                        className="btn-primary"
                        onClick={() => updateStatusMut.mutate({ bookingId: b.id, status: 'CONFIRMED' })}
                        disabled={updateStatusMut.isPending}
                        style={{ fontSize: 13, padding: '7px 14px' }}
                      >
                        Подтвердить
                      </button>
                    )}
                    {b.status === 'CONFIRMED' && (
                      <button
                        className="btn-ghost"
                        onClick={() => updateStatusMut.mutate({ bookingId: b.id, status: 'COMPLETED' })}
                        disabled={updateStatusMut.isPending}
                        style={{ fontSize: 13, padding: '7px 14px', color: '#4ade80', borderColor: 'rgba(34,197,94,0.3)' }}
                      >
                        Завершить
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Аналитика ── */}
      <div className="card" style={{ padding: 28, marginTop: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 20 }}>{sectionTitle('Аналитика')}</div>

        {analyticsLoading ? (
          <p role="status" style={{ color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>Загрузка...</p>
        ) : !analytics ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            Данные аналитики недоступны
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { label: 'Всего бронирований', value: analytics.totalBookings ?? '—' },
              { label: 'Завершено', value: analytics.completedBookings ?? '—', color: '#4ade80' },
              { label: 'Отменено', value: analytics.cancelledBookings ?? '—', color: '#f87171' },
              { label: 'Средний рейтинг', value: analytics.averageRating != null ? analytics.averageRating.toFixed(1) : '—', color: '#fbbf24' },
              { label: 'Доход (MDL)', value: analytics.totalEarnings != null ? analytics.totalEarnings.toFixed(0) : '—', color: '#6ee7b7' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '20px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ color: 'rgba(226,232,240,0.45)', fontSize: 12, lineHeight: 1.4 }}>{label}</span>
                <span style={{ color: color || '#f1f5f9', fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное подтверждение удаления */}
      {deleteTarget && (
        <ConfirmModal
          message="Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить."
          onConfirm={() => deleteMut.mutate(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default DashboardPage
