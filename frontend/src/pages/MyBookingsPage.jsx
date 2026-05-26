import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore.js'
import { getMe } from '../api/auth.js'
import { getBookingsByClient } from '../api/bookings.js'
import { createPaymentIntent, getPayment, refundPayment } from '../api/payments.js'
import PaymentModal from '../components/payment/PaymentModal.jsx'

// ── Status helpers ─────────────────────────────────────────────────────────

const BOOKING_STATUS_LABEL = {
  PENDING: 'Ожидает',
  PENDING_PAYMENT: 'Ожидает оплаты',
  CONFIRMED: 'Подтверждено',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
}

const BOOKING_STATUS_STYLE = {
  PENDING:         { background: 'rgba(251,191,36,0.1)',  border: '1px solid rgba(251,191,36,0.25)',  color: '#fbbf24' },
  PENDING_PAYMENT: { background: 'rgba(99,102,241,0.1)',  border: '1px solid rgba(99,102,241,0.25)',  color: '#a5b4fc' },
  CONFIRMED:       { background: 'rgba(52,211,153,0.1)',  border: '1px solid rgba(52,211,153,0.25)',  color: '#34d399' },
  COMPLETED:       { background: 'rgba(226,232,240,0.07)',border: '1px solid rgba(226,232,240,0.12)', color: 'rgba(226,232,240,0.5)' },
  CANCELLED:       { background: 'rgba(244,63,94,0.08)',  border: '1px solid rgba(244,63,94,0.2)',    color: '#f43f5e' },
}

const PAYMENT_STATUS_LABEL = {
  PENDING:          'Не оплачено',
  REQUIRES_ACTION:  'Требует действия',
  SUCCEEDED:        'Оплачено',
  FAILED:           'Ошибка',
  REFUNDED:         'Возврат',
  CANCELLED:        'Отменено',
}

const PAYMENT_STATUS_STYLE = {
  PENDING:          { color: 'rgba(226,232,240,0.4)' },
  REQUIRES_ACTION:  { color: '#fbbf24' },
  SUCCEEDED:        { color: '#34d399' },
  FAILED:           { color: '#f43f5e' },
  REFUNDED:         { color: '#a5b4fc' },
  CANCELLED:        { color: 'rgba(226,232,240,0.35)' },
}

function fmtDate(str) {
  if (!str) return '—'
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(str))
  } catch { return str }
}

function fmtCurrency(v, cur = 'EUR') {
  if (v == null) return '—'
  return Number(v).toLocaleString('ro-MD', { style: 'currency', currency: cur.toUpperCase(), maximumFractionDigits: 2 })
}

// ── Booking card ───────────────────────────────────────────────────────────

function BookingCard({ booking, onPay }) {
  const qc = useQueryClient()
  const [showConfirmRefund, setShowConfirmRefund] = useState(false)

  const refundMut = useMutation({
    mutationFn: () => refundPayment(booking.paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-bookings'] })
      setShowConfirmRefund(false)
    },
  })

  const canPay = booking.status === 'PENDING' ||
    (booking.status === 'PENDING_PAYMENT' && ['PENDING', 'REQUIRES_ACTION', 'FAILED'].includes(booking.paymentStatus))
  const canRefund = booking.paymentStatus === 'SUCCEEDED' && !['CANCELLED', 'COMPLETED'].includes(booking.status)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            {booking.serviceName ?? `Услуга #${booking.serviceId}`}
          </div>
          <div style={{ color: 'rgba(226,232,240,0.45)', fontSize: 13 }}>
            {booking.specialistName ?? `Специалист #${booking.specialistProfileId}`}
          </div>
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
          ...(BOOKING_STATUS_STYLE[booking.status] ?? {}),
        }}>
          {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {booking.slotDate && (
          <span style={{ color: 'rgba(226,232,240,0.5)', fontSize: 13 }}>
            {fmtDate(booking.slotDate)}
            {booking.startTime ? ` · ${booking.startTime}` : ''}
          </span>
        )}
        {booking.price != null && (
          <span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 14 }}>
            {fmtCurrency(booking.price)}
          </span>
        )}
        {booking.paymentStatus && (
          <span style={{ fontSize: 12, fontWeight: 500, ...(PAYMENT_STATUS_STYLE[booking.paymentStatus] ?? {}) }}>
            {PAYMENT_STATUS_LABEL[booking.paymentStatus] ?? booking.paymentStatus}
          </span>
        )}
      </div>

      {/* Note */}
      {booking.note && (
        <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
          {booking.note}
        </p>
      )}

      {/* Actions */}
      {(canPay || canRefund) && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {canPay && (
            <button
              className="btn-primary"
              onClick={() => onPay(booking)}
              style={{ fontSize: 13, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CardIcon />
              Оплатить
            </button>
          )}
          {canRefund && !showConfirmRefund && (
            <button
              className="btn-ghost"
              onClick={() => setShowConfirmRefund(true)}
              style={{ fontSize: 12, padding: '7px 14px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}
            >
              Запросить возврат
            </button>
          )}
          {showConfirmRefund && (
            <div style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              width: '100%',
            }}>
              <span style={{ color: '#f87171', fontSize: 13, flex: 1 }}>Вы уверены, что хотите вернуть средства?</span>
              <button
                className="btn-danger"
                onClick={() => refundMut.mutate()}
                disabled={refundMut.isPending}
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                {refundMut.isPending ? 'Отмена...' : 'Да, вернуть'}
              </button>
              <button
                className="btn-ghost"
                onClick={() => setShowConfirmRefund(false)}
                style={{ fontSize: 12 }}
              >
                Нет
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const [paymentState, setPaymentState] = useState(null)
  const [toast, setToast] = useState(null)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
  })

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['client-bookings', me?.id],
    queryFn: () => getBookingsByClient(me.id),
    enabled: !!me?.id,
  })

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const payMut = useMutation({
    mutationFn: async (booking) => {
      if (booking.paymentId && ['PENDING', 'REQUIRES_ACTION', 'FAILED'].includes(booking.paymentStatus)) {
        const p = await getPayment(booking.paymentId)
        return { clientSecret: p.clientSecret, amount: p.amount, currency: p.currency }
      }
      return createPaymentIntent(booking.id)
    },
    onSuccess: (data) => setPaymentState(data),
    onError: () => showToast('error', 'Не удалось создать платёж. Попробуйте позже.'),
  })

  const handlePay = (booking) => {
    payMut.mutate(booking)
  }

  const handlePaymentSuccess = () => {
    setPaymentState(null)
    qc.invalidateQueries({ queryKey: ['client-bookings'] })
    showToast('success', 'Оплата прошла успешно!')
  }

  const active = bookings.filter(b => !['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(b.status))
  const past = bookings.filter(b => ['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(b.status))

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            zIndex: 300,
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(244,63,94,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f43f5e',
            backdropFilter: 'blur(8px)',
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Payment modal */}
      {paymentState && (
        <PaymentModal
          clientSecret={paymentState.clientSecret}
          amount={paymentState.amount}
          currency={paymentState.currency}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentState(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.4 }}>
          Мои бронирования
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.4)', margin: 0, fontSize: 14 }}>
          История и управление вашими заказами услуг
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 120, background: 'rgba(255,255,255,0.025)', borderRadius: 14, animation: 'shimmer 1.5s infinite', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.025) 100%)', backgroundSize: '200% 100%' }} />
          ))}
          <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <div style={{ color: 'rgba(226,232,240,0.4)', fontSize: 15 }}>У вас пока нет бронирований</div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
                Активные
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(b => (
                  <BookingCard key={b.id} booking={b} onPay={handlePay} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>
                История
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {past.map(b => (
                  <BookingCard key={b.id} booking={b} onPay={handlePay} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
