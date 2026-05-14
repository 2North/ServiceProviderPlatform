import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login, register, getMe } from '../api/auth.js'
import { getSpecialistByUserId } from '../api/specialists.js'
import { useAuthStore } from '../store/useAuthStore.js'

// Фоновый декоративный blob
function GlowBlob({ style }) {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

function AuthPage() {
  const navigate = useNavigate()
  const { setAuth, setSpecialistProfileId } = useAuthStore()

  // Текущая вкладка: 'login' или 'register'
  const [tab, setTab] = useState('login')

  // Выбранная роль (только для UI, бэкенд определяет роль сам)
  const [selectedRole, setSelectedRole] = useState('CLIENT')

  // Поля формы
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg('')
  }

  const handleAuthSuccess = async (data) => {
    setAuth(data.token, { email: data.email, role: data.role })
    if (data.role === 'SPECIALIST') {
      try {
        const me = await getMe()
        const profile = await getSpecialistByUserId(me.id)
        if (profile?.id) {
          setSpecialistProfileId(profile.id)
        }
      } catch (e) {
        // Профиль ещё не создан — нормально для новых специалистов
      }
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  // Мутация входа
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: handleAuthSuccess,
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Неверный email или пароль')
    },
  })

  // Мутация регистрации
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: handleAuthSuccess,
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.')
    },
  })

  const isLoading = loginMutation.isPending || registerMutation.isPending

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (tab === 'login') {
      loginMutation.mutate({ email: form.email, password: form.password })
    } else {
      registerMutation.mutate({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: selectedRole,
      })
    }
  }

  const switchTab = (newTab) => {
    setTab(newTab)
    setErrorMsg('')
    setForm({ firstName: '', lastName: '', email: '', password: '' })
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        background: '#0c0d14',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Левая панель брендинга */}
      <div
        style={{
          flex: 1,
          display: 'none', // скрыть на мобильных
          position: 'relative',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
        className="auth-left-panel"
      >
        {/* Декоративные блобы */}
        <GlowBlob
          style={{
            width: 400,
            height: 400,
            top: -100,
            left: -100,
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }}
        />
        <GlowBlob
          style={{
            width: 300,
            height: 300,
            bottom: 50,
            right: -50,
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '60px 48px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Логотип */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>S</span>
            </div>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 22 }}>ServicePort</span>
          </div>

          <h1
            style={{
              color: '#f1f5f9',
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: '0 0 16px',
              letterSpacing: -0.5,
            }}
          >
            Маркетплейс<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              услуг и специалистов
            </span>
          </h1>

          <p style={{ color: 'rgba(226,232,240,0.55)', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
            Найдите нужного специалиста или предложите свои услуги тысячам клиентов на одной платформе.
          </p>

          {/* Фичи */}
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '✦', text: 'Каталог услуг с удобным поиском' },
              { icon: '✦', text: 'Проверенные специалисты' },
              { icon: '✦', text: 'Удобный дашборд для специалистов' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#6366f1', fontSize: 12 }}>{item.icon}</span>
                <span style={{ color: 'rgba(226,232,240,0.7)', fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Правая панель формы */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
        }}
      >
        {/* Фоновые блобы */}
        <GlowBlob
          style={{
            width: 350,
            height: 350,
            top: '10%',
            right: '5%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          }}
        />
        <GlowBlob
          style={{
            width: 250,
            height: 250,
            bottom: '15%',
            left: '5%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          }}
        />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          {/* Заголовок формы */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.3 }}>
              {tab === 'login' ? 'Добро пожаловать' : 'Создать аккаунт'}
            </h2>
            <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 14, margin: 0 }}>
              {tab === 'login'
                ? 'Войдите в свой аккаунт'
                : 'Зарегистрируйтесь, чтобы начать'}
            </p>
          </div>

          {/* Переключатель вкладок */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
            }}
          >
            {[
              { key: 'login', label: 'Войти' },
              { key: 'register', label: 'Регистрация' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: 7,
                  border: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: tab === key
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'transparent',
                  color: tab === key ? '#fff' : 'rgba(226,232,240,0.5)',
                  boxShadow: tab === key ? '0 2px 12px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Поля только для регистрации */}
            {tab === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
                      Имя
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Иван"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
                      Фамилия
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Иванов"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
                Пароль
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Выбор роли при регистрации */}
            {tab === 'register' && (
              <div>
                <label style={{ display: 'block', marginBottom: 10, color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>
                  Я хочу...
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    {
                      key: 'CLIENT',
                      title: 'Клиент',
                      desc: 'Нахожу специалистов и заказываю услуги',
                      icon: '🔍',
                    },
                    {
                      key: 'SPECIALIST',
                      title: 'Специалист',
                      desc: 'Предлагаю свои услуги и нахожу клиентов',
                      icon: '🛠',
                    },
                  ].map(({ key, title, desc, icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedRole(key)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 10,
                        border: selectedRole === key
                          ? '1px solid rgba(99,102,241,0.6)'
                          : '1px solid rgba(255,255,255,0.08)',
                        background: selectedRole === key
                          ? 'rgba(99,102,241,0.12)'
                          : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                      <div style={{ color: selectedRole === key ? '#a5b4fc' : '#e2e8f0', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        {title}
                      </div>
                      <div style={{ color: 'rgba(226,232,240,0.45)', fontSize: 11, lineHeight: 1.4 }}>
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Сообщение об ошибке */}
            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8,
                  color: '#f87171',
                  fontSize: 13,
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '13px' }}
            >
              {isLoading
                ? 'Загрузка...'
                : tab === 'login'
                ? 'Войти'
                : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>

      {/* CSS для отображения левой панели на широком экране */}
      <style>{`
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default AuthPage
