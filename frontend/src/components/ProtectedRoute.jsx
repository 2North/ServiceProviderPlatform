import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore.js'

// Защищённый маршрут: проверяет авторизацию и роль
function ProtectedRoute({ children, role }) {
  const { token, user } = useAuthStore()

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
