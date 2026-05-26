import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllCategories } from '../api/categories.js'
import { getAllServices, getServicesByCategory } from '../api/services.js'
import ServiceCard from '../components/ServiceCard.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'

const PAGE_SIZE = 9

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
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 0; i < totalPages; i++) pages.push(i)

  const btnBase = {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(226,232,240,0.6)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    transition: 'all 0.15s',
  }
  const btnActive = {
    ...btnBase,
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc',
    fontWeight: 700,
  }
  const btnDisabled = { ...btnBase, opacity: 0.3, cursor: 'default' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 40 }}>
      <button
        style={page === 0 ? btnDisabled : btnBase}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      {pages.map(p => (
        <button
          key={p}
          style={p === page ? btnActive : btnBase}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}

      <button
        style={page === totalPages - 1 ? btnDisabled : btnBase}
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </div>
  )
}

function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [page, setPage] = useState(0)

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })

  const { data: pageData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', selectedCategory, page],
    queryFn: () =>
      selectedCategory
        ? getServicesByCategory(selectedCategory, { page, size: PAGE_SIZE })
        : getAllServices({ page, size: PAGE_SIZE }),
    keepPreviousData: true,
  })

  const services = pageData?.content ?? []
  const totalPages = pageData?.totalPages ?? 0
  const totalElements = pageData?.totalElements ?? 0

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setPage(0)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 36, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 200,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{ color: '#f1f5f9', fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.5, position: 'relative' }}>
          Каталог услуг
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.45)', margin: 0, fontSize: 15 }}>
          Найдите нужного специалиста среди{' '}
          <span style={{ color: '#a5b4fc' }}>{totalElements}</span>{' '}
          {totalElements === 1 ? 'услуги' : 'услуг'}
        </p>
      </div>

      {catsLoading ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 34, width: 80 + i * 20, borderRadius: 20, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
        </div>
      ) : (
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />
      )}

      {servicesLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[...Array(PAGE_SIZE)].map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(226,232,240,0.4)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontSize: 16, margin: 0 }}>
            {selectedCategory ? 'В этой категории пока нет услуг' : 'Услуги ещё не добавлены'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}

export default CatalogPage
