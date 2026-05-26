import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore.js'
import { getMe } from '../api/auth.js'
import { getAllCategories } from '../api/categories.js'
import { getOpenOrders, createOrder, respondToOrder } from '../api/orders.js'
import { getSpecialistByUserId } from '../api/specialists.js'

// ──────────────────────────────────────────────
// Форма создания заказа (CLIENT)
// ──────────────────────────────────────────────
function CreateOrderForm({ categories, clientId, onSuccess, onCancel }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', budget: '', desiredDate: '', categoryId: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['open-orders'] })
      onSuccess()
    },
    onError: (err) => setError(err.response?.data?.message || 'Ошибка при создании заказа'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    mutation.mutate({
      clientId,
      categoryId: parseInt(form.categoryId, 10),
      title: form.title,
      description: form.description,
      budget: parseFloat(form.budget),
      desiredDate: form.desiredDate,
    })
  }

  const labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}
    >
      <h3 style={{ color: '#a5b4fc', margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>Новый заказ</h3>

      <div>
        <label htmlFor="order-title" style={labelStyle}>Заголовок</label>
        <input id="order-title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Кратко опишите задачу" required />
      </div>

      <div>
        <label htmlFor="order-description" style={labelStyle}>Описание</label>
        <textarea id="order-description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Подробное описание задачи..." rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label htmlFor="order-budget" style={labelStyle}>Бюджет (EUR)</label>
          <input id="order-budget" type="number" min="0" step="0.01" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="0.00" required />
        </div>
        <div>
          <label htmlFor="order-date" style={labelStyle}>Желаемая дата</label>
          <input id="order-date" type="date" value={form.desiredDate} onChange={e => setForm(p => ({ ...p, desiredDate: e.target.value }))} />
        </div>
      </div>

      <div>
        <label htmlFor="order-category" style={labelStyle}>Категория</label>
        <select id="order-category" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required>
          <option value="">— Выберите категорию —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {error && (
        <div role="alert" style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn-primary" disabled={mutation.isPending} style={{ flex: 1, justifyContent: 'center' }}>
          {mutation.isPending ? 'Отправка...' : 'Создать заказ'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ fontSize: 13 }}>Отмена</button>
      </div>
    </form>
  )
}

// ──────────────────────────────────────────────
// Форма отклика на заказ (SPECIALIST)
// ──────────────────────────────────────────────
function RespondForm({ orderId, specialistId, onSuccess, onCancel }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ proposedPrice: '', message: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: respondToOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['open-orders'] })
      onSuccess()
    },
    onError: (err) => setError(err.response?.data?.message || 'Ошибка при отклике'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    mutation.mutate({ orderId, specialistId, proposedPrice: parseFloat(form.proposedPrice), message: form.message })
  }

  const labelStyle = { display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={e => e.stopPropagation()}
      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 18, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label htmlFor={`respond-price-${orderId}`} style={labelStyle}>Предлагаемая цена (EUR)</label>
          <input id={`respond-price-${orderId}`} type="number" min="0" step="0.01" value={form.proposedPrice} onChange={e => setForm(p => ({ ...p, proposedPrice: e.target.value }))} placeholder="0.00" required />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%' }}>
            <label htmlFor={`respond-message-${orderId}`} style={labelStyle}>Сообщение</label>
            <input id={`respond-message-${orderId}`} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Кратко о себе..." />
          </div>
        </div>
      </div>
      {error && (
        <div role="alert" style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn-primary" disabled={mutation.isPending} style={{ fontSize: 13, padding: '8px 16px' }}>
          {mutation.isPending ? 'Отправка...' : 'Откликнуться'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ fontSize: 13 }}>Отмена</button>
      </div>
    </form>
  )
}

// ──────────────────────────────────────────────
// Карточка заказа
// ──────────────────────────────────────────────
function OrderCard({ order, categories, role, specialistProfileId }) {
  const [showRespond, setShowRespond] = useState(false)

  const category = categories.find(c => c.id === order.categoryId)

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>{order.title}</h3>
          {order.description && (
            <p style={{ color: 'rgba(226,232,240,0.6)', fontSize: 13, margin: '0 0 10px', lineHeight: 1.55 }}>{order.description}</p>
          )}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {order.budget != null && (
              <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 15 }}>{order.budget} EUR</span>
            )}
            {order.desiredDate && (
              <span style={{ color: 'rgba(226,232,240,0.45)', fontSize: 13 }}>{order.desiredDate}</span>
            )}
            {category && (
              <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, color: '#a5b4fc', fontSize: 11, fontWeight: 600, padding: '2px 9px' }}>
                {category.name}
              </span>
            )}
          </div>
        </div>

        {role === 'SPECIALIST' && !showRespond && (
          <button className="btn-primary" onClick={() => setShowRespond(true)} style={{ fontSize: 13, padding: '8px 16px', flexShrink: 0 }}>
            Откликнуться
          </button>
        )}
      </div>

      {showRespond && (
        <RespondForm
          orderId={order.id}
          specialistId={specialistProfileId}
          onSuccess={() => setShowRespond(false)}
          onCancel={() => setShowRespond(false)}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Главная страница
// ──────────────────────────────────────────────
function OrderBoardPage() {
  const { user, token } = useAuthStore()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
  })

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', me?.id],
    queryFn: () => getSpecialistByUserId(me.id),
    enabled: !!me?.id && user?.role === 'SPECIALIST',
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['open-orders'],
    queryFn: getOpenOrders,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.4 }}>
            Доска заказов
          </h1>
          <p style={{ color: 'rgba(226,232,240,0.4)', margin: 0, fontSize: 14 }}>
            Открытые запросы от клиентов
          </p>
        </div>

        {user?.role === 'CLIENT' && !showCreateForm && (
          <button className="btn-primary" onClick={() => setShowCreateForm(true)} style={{ padding: '10px 22px' }}>
            + Создать заказ
          </button>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {showCreateForm && (
          <CreateOrderForm
            categories={categories}
            clientId={me?.id}
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {ordersLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 120, background: 'rgba(255,255,255,0.03)', borderRadius: 12, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)' }} />
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 15 }}>
            Открытых заказов пока нет
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                categories={categories}
                role={user?.role}
                specialistProfileId={myProfile?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderBoardPage
