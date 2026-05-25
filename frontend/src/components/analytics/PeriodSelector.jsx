import { format, subDays, subMonths, subYears } from 'date-fns'

const PRESETS = [
  { label: '7д',   days: 7 },
  { label: '30д',  days: 30 },
  { label: '90д',  days: 90 },
  { label: 'Год',  days: 365 },
]

function toIso(d) { return format(d, 'yyyy-MM-dd') }

export default function PeriodSelector({ from, to, onChange }) {
  const today = toIso(new Date())

  const selectPreset = (days) => {
    onChange(toIso(subDays(new Date(), days)), today)
  }

  const isActive = (days) => {
    const expected = toIso(subDays(new Date(), days))
    return from === expected && to === today
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {PRESETS.map(({ label, days }) => (
        <button
          key={label}
          onClick={() => selectPreset(days)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            border: isActive(days)
              ? '1px solid rgba(99,102,241,0.6)'
              : '1px solid rgba(255,255,255,0.1)',
            background: isActive(days)
              ? 'rgba(99,102,241,0.15)'
              : 'rgba(255,255,255,0.04)',
            color: isActive(days) ? '#a5b4fc' : 'rgba(226,232,240,0.7)',
            transition: 'all 0.15s',
          }}
        >
          {label}
        </button>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
        <input
          type="date"
          value={from}
          max={to}
          onChange={e => onChange(e.target.value, to)}
          style={{ width: 140, fontSize: 13, padding: '6px 10px' }}
        />
        <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12 }}>—</span>
        <input
          type="date"
          value={to}
          min={from}
          max={toIso(new Date())}
          onChange={e => onChange(from, e.target.value)}
          style={{ width: 140, fontSize: 13, padding: '6px 10px' }}
        />
      </div>
    </div>
  )
}
