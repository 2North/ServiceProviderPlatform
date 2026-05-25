export const COLORS = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#f43f5e',
  sky: '#38bdf8',
  slate: 'rgba(226,232,240,0.15)',
}

export const PIE_PALETTE = [
  '#6366f1', '#8b5cf6', '#34d399', '#fbbf24', '#f43f5e',
  '#38bdf8', '#a78bfa', '#6ee7b7', '#fcd34d', '#fb7185',
]

export const AXIS_STYLE = {
  tick: { fill: 'rgba(226,232,240,0.4)', fontSize: 11 },
  axisLine: { stroke: 'rgba(255,255,255,0.08)' },
  tickLine: false,
}

export const GRID_STYLE = {
  stroke: 'rgba(255,255,255,0.05)',
  strokeDasharray: '3 3',
}

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1a1b2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    fontSize: 13,
    color: '#e2e8f0',
  },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: 'rgba(226,232,240,0.6)', marginBottom: 4 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
}
