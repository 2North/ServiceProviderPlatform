import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK ?? '')

const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#6366f1',
    colorBackground: '#13141f',
    colorText: '#e2e8f0',
    colorDanger: '#f43f5e',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    borderRadius: '8px',
    colorInputBackground: 'rgba(255,255,255,0.05)',
    colorInputBorder: 'rgba(255,255,255,0.12)',
    focusBoxShadow: '0 0 0 2px rgba(99,102,241,0.35)',
  },
}

// ── Inner form (needs stripe context) ─────────────────────────────────────

function CheckoutForm({ amount, currency, onSuccess, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const fmtAmt = (v, cur) =>
    Number(v).toLocaleString('ro-MD', { style: 'currency', currency: cur?.toUpperCase() ?? 'EUR', maximumFractionDigits: 2 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitErr } = await elements.submit()
    if (submitErr) {
      setError(submitErr.message)
      setProcessing(false)
      return
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (confirmErr) {
      setError(confirmErr.message)
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ color: 'rgba(226,232,240,0.5)', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>К оплате</div>
        <div style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
          {fmtAmt(amount, currency)}
        </div>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: { billingDetails: { address: { country: 'MD' } } },
        }}
      />

      {error && (
        <div role="alert" style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={!stripe || processing}
          style={{ flex: 1, justifyContent: 'center', padding: '12px 20px', fontSize: 15, fontWeight: 600 }}
        >
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Обработка...
            </span>
          ) : 'Оплатить'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ fontSize: 13 }}>
          Отмена
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}

// ── Modal wrapper ──────────────────────────────────────────────────────────

export default function PaymentModal({ clientSecret, amount, currency, onSuccess, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Оплата бронирования"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 24,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ padding: 28, maxWidth: 460, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: 0 }}>Оплата бронирования</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{ background: 'none', border: 'none', color: 'rgba(226,232,240,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>

        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
          >
            <CheckoutForm
              amount={amount}
              currency={currency}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(226,232,240,0.4)', fontSize: 14 }}>
            Загрузка платёжной формы...
          </div>
        )}
      </div>
    </div>
  )
}
