import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore.js'

function Navbar() {
  const { token, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/auth')
  }

  return (
    <nav
      style={{
        background: 'rgba(12, 13, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Логотип */}
        <Link
          to="/"
          aria-label="ServicePort — на главную"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(99,102,241,0.45)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: -0.5 }}>
              S
            </span>
          </div>
          <span
            style={{
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: -0.3,
            }}
          >
            ServicePort
          </span>
        </Link>

        {/* Правая часть */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!token ? (
            <Link
              to="/auth"
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: 14, textDecoration: 'none' }}
            >
              Войти
            </Link>
          ) : (
            <>
              {user?.role === 'SPECIALIST' && (
                <Link
                  to="/dashboard"
                  style={{
                    color: '#a5b4fc',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    padding: '6px 12px',
                    borderRadius: 6,
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  Дашборд
                </Link>
              )}

              <Link
                to="/orders"
                style={{
                  color: '#a5b4fc',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '6px 12px',
                  borderRadius: 6,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                Доска заказов
              </Link>

              {/* Email пользователя */}
              <span
                style={{
                  color: 'rgba(226,232,240,0.5)',
                  fontSize: 13,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email}
              </span>

              <button
                className="btn-ghost"
                onClick={handleLogout}
                style={{ padding: '7px 14px', fontSize: 13 }}
              >
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
