import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoogleStatus, getGoogleAuthUrl, disconnectGoogle } from '../api/integrations.js'

function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
  } catch { return iso }
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [toast, setToast] = useState(null)
  const qc = useQueryClient()

  const googleConnected = searchParams.get('google') === 'connected'

  useEffect(() => {
    if (googleConnected) {
      setToast({ type: 'success', text: 'Google Календарь успешно подключён' })
      setSearchParams({}, { replace: true })
      qc.invalidateQueries({ queryKey: ['google-status'] })
    }
  }, [googleConnected])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const { data: status, isLoading } = useQuery({
    queryKey: ['google-status'],
    queryFn: getGoogleStatus,
    retry: false,
  })

  const disconnectMut = useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['google-status'] })
      setToast({ type: 'info', text: 'Google Календарь отключён' })
    },
    onError: () => setToast({ type: 'error', text: 'Не удалось отключить интеграцию' }),
  })

  const handleConnect = async () => {
    try {
      const { url } = await getGoogleAuthUrl()
      window.location.href = url
    } catch {
      setToast({ type: 'error', text: 'Не удалось запустить OAuth. Попробуйте ещё раз.' })
    }
  }

  const isConnected = status?.connected && status?.valid
  const isExpired = status?.connected && !status?.valid

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

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
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : toast.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : toast.type === 'error' ? 'rgba(244,63,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
            color: toast.type === 'success' ? '#34d399' : toast.type === 'error' ? '#f43f5e' : '#a5b4fc',
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s',
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 6px', letterSpacing: -0.4 }}>
          Настройки
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.4)', margin: 0, fontSize: 14 }}>
          Управление интеграциями и подключениями
        </p>
      </div>

      {/* Google Calendar Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(66,133,244,0.1)',
            border: '1px solid rgba(66,133,244,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4285F4',
            flexShrink: 0,
          }}>
            <CalendarIcon />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>Google Календарь</div>
            <div style={{ color: 'rgba(226,232,240,0.45)', fontSize: 12, marginTop: 2 }}>
              Автоматически добавляет подтверждённые брони в ваш календарь
            </div>
          </div>
          {/* Status badge */}
          {!isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: isConnected ? 'rgba(52,211,153,0.1)' : isExpired ? 'rgba(251,191,36,0.1)' : 'rgba(226,232,240,0.06)',
              border: `1px solid ${isConnected ? 'rgba(52,211,153,0.25)' : isExpired ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.1)'}`,
              color: isConnected ? '#34d399' : isExpired ? '#fbbf24' : 'rgba(226,232,240,0.4)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {isConnected ? 'Подключено' : isExpired ? 'Требует переподключения' : 'Не подключено'}
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '24px 24px' }}>

          {isLoading ? (
            <div style={{ height: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 8, animation: 'pulse 1.5s infinite ease-in-out' }} />
          ) : isConnected ? (
            <ConnectedView status={status} onDisconnect={() => disconnectMut.mutate()} disconnecting={disconnectMut.isPending} />
          ) : isExpired ? (
            <ExpiredView onReconnect={handleConnect} />
          ) : (
            <DisconnectedView onConnect={handleConnect} />
          )}

        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  )
}

function ConnectedView({ status, onDisconnect, disconnecting }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Info rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        <InfoRow label="Календарь" value={status.calendarId || 'Основной'} />
        <InfoRow label="Подключено" value={fmtDate(status.connectedAt)} />
      </div>

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'Брони автоматически создаются как события',
          'Отмены удаляются из календаря',
          'Данные клиента и услуги в описании события',
        ].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#34d399', flexShrink: 0 }}><CheckCircleIcon /></span>
            <span style={{ color: 'rgba(226,232,240,0.65)', fontSize: 13 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Disconnect */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
        <button
          className="btn-danger"
          onClick={onDisconnect}
          disabled={disconnecting}
          style={{ fontSize: 13, padding: '8px 18px' }}
        >
          {disconnecting ? 'Отключение...' : 'Отключить интеграцию'}
        </button>
        <p style={{ color: 'rgba(226,232,240,0.3)', fontSize: 11, margin: '8px 0 0' }}>
          Существующие события в календаре останутся, новые создаваться не будут.
        </p>
      </div>
    </div>
  )
}

function ExpiredView({ onReconnect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex',
        gap: 12,
        padding: '14px 16px',
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 10,
      }}>
        <span style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
        <div>
          <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Срок действия токена истёк</div>
          <div style={{ color: 'rgba(226,232,240,0.55)', fontSize: 12, lineHeight: 1.5 }}>
            Google отозвал доступ. Переподключитесь, чтобы продолжить синхронизацию броней.
          </div>
        </div>
      </div>
      <button className="btn-primary" onClick={onReconnect} style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content' }}>
        <GoogleLogo />
        Переподключить Google Календарь
      </button>
    </div>
  )
}

function DisconnectedView({ onConnect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ color: 'rgba(226,232,240,0.55)', fontSize: 14, margin: 0, lineHeight: 1.65 }}>
        Подключите свой Google аккаунт, чтобы подтверждённые брони автоматически появлялись в Google Календаре.
        Клиент получит приглашение, а вы сможете управлять расписанием в привычном интерфейсе.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'Автоматическое создание событий при подтверждении брони',
          'Удаление событий при отмене',
          'Отзыв доступа в любой момент',
        ].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(99,102,241,0.6)', flexShrink: 0 }} />
            <span style={{ color: 'rgba(226,232,240,0.5)', fontSize: 13 }}>{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onConnect}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 22px',
          background: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          color: '#3c4043',
          cursor: 'pointer',
          width: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'box-shadow 0.2s, transform 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <GoogleLogo />
        Войти через Google
      </button>

      <p style={{ color: 'rgba(226,232,240,0.25)', fontSize: 11, margin: '-8px 0 0' }}>
        Запрашиваются права только на чтение/запись событий в календаре.
      </p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: 'rgba(226,232,240,0.4)', fontSize: 11, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500, wordBreak: 'break-all' }}>{value}</div>
    </div>
  )
}
