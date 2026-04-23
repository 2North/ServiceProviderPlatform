import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllCategories } from '../api/categories.js'
import { getAllServices, getServicesByCategory } from '../api/services.js'
import ServiceCard from '../components/ServiceCard.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'

// Скелетон карточки для состояния загрузки
function ServiceCardSkeleton() {
  const shimmer = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 6,
  }

  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...shimmer, height: 20, width: '70%' }} />
      <div style={{ ...shimmer, height: 14, width: '100%' }} />
      <div style={{ ...shimmer, height: 14, width: '80%' }} />
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ ...shimmer, height: 36, width: 80 }} />
        <div style={{ ...shimmer, height: 36, width: 80 }} />
      </div>
      <div style={{ ...shimmer, height: 38, width: '100%', borderRadius: 8 }} />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Загрузка категорий
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })

  // Загрузка услуг: все или по категории
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services', selectedCategory],
    queryFn: () =>
      selectedCategory
        ? getServicesByCategory(selectedCategory)
        : getAllServices(),
  })

  const isLoading = servicesLoading

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Заголовок секции */}
      <div style={{ marginBottom: 36, position: 'relative' }}>
        {/* Фоновый glow */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 500,
            height: 200,
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <h1
          style={{
            color: '#f1f5f9',
            fontSize: 32,
            fontWeight: 700,
            margin: '0 0 8px',
            letterSpacing: -0.5,
            position: 'relative',
          }}
        >
          Каталог услуг
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.45)', margin: 0, fontSize: 15 }}>
          Найдите нужного специалиста среди{' '}
          <span style={{ color: '#a5b4fc' }}>{services.length}</span>{' '}
          {services.length === 1 ? 'услуги' : 'услуг'}
        </p>
      </div>

      {/* Фильтр категорий */}
      {catsLoading ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 34,
                width: 80 + i * 20,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.06)',
                animation: 'pulse 1.5s infinite',
              }}
            />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
        </div>
      ) : (
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {/* Сетка услуг */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: 'rgba(226,232,240,0.4)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontSize: 16, margin: 0 }}>
            {selectedCategory
              ? 'В этой категории пока нет услуг'
              : 'Услуги ещё не добавлены'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CatalogPage
