// Горизонтальный фильтр по категориям (пилюли)
function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 28,
      }}
    >
      {/* Кнопка "Все" */}
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: '7px 18px',
          borderRadius: 20,
          border: selected === null
            ? '1px solid rgba(99,102,241,0.6)'
            : '1px solid rgba(255,255,255,0.1)',
          background: selected === null
            ? 'rgba(99,102,241,0.18)'
            : 'rgba(255,255,255,0.04)',
          color: selected === null ? '#a5b4fc' : 'rgba(226,232,240,0.6)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          fontWeight: selected === null ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Все
      </button>

      {/* Категории */}
      {categories.map((cat) => {
        const isActive = selected === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              padding: '7px 18px',
              borderRadius: 20,
              border: isActive
                ? '1px solid rgba(99,102,241,0.6)'
                : '1px solid rgba(255,255,255,0.1)',
              background: isActive
                ? 'rgba(99,102,241,0.18)'
                : 'rgba(255,255,255,0.04)',
              color: isActive ? '#a5b4fc' : 'rgba(226,232,240,0.6)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
