import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import SpecialistPage from './pages/SpecialistPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<CatalogPage />} />
        <Route path="/specialists/:id" element={<SpecialistPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="SPECIALIST">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Редирект неизвестных путей на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
