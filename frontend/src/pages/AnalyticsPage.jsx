import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuthStore } from '../store/useAuthStore.js'
import {
  getRevenue, getWorkload, getRatingHistory,
  getServicesBreakdown, getAnalyticsSummary,
} from '../api/analytics.js'
import KpiCard from '../components/analytics/KpiCard.jsx'
import AnalyticsChart from '../components/analytics/AnalyticsChart.jsx'
import PeriodSelector from '../components/analytics/PeriodSelector.jsx'
import {
  COLORS, PIE_PALETTE, AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE,
} from '../components/analytics/chartTheme.js'

function toIso(d) { return format(d, 'yyyy-MM-dd') }

function fmtDate(str) {
  if (!str) return ''
  try { return format(new Date(str), 'd MMM', { locale: ru }) } catch { return str }
}

function fmtCurrency(v) {
  if (v == null) return '—'
  return Number(v).toLocaleString('ro-MD', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

// ── Custom Tooltip components ──────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <div style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: 6 }}>{fmtDate(label)}</div>
      <div style={{ color: COLORS.emerald, fontWeight: 600 }}>
        {fmtCurrency(payload[0]?.value)}
      </div>
      <div style={{ color: 'rgba(226,232,240,0.5)', fontSize: 11, marginTop: 2 }}>
        {payload[1]?.value ?? 0} броней
      </div>
    </div>
  )
}

function WorkloadTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const total = (payload[0]?.value ?? 0) + (payload[1]?.value ?? 0)
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <div style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: 6 }}>{fmtDate(label)}</div>
      <div style={{ color: COLORS.indigo }}>Занято: {payload[1]?.value ?? 0}</div>
      <div style={{ color: 'rgba(226,232,240,0.45)' }}>Свободно: {payload[0]?.value ?? 0}</div>
      <div style={{ color: 'rgba(226,232,240,0.35)', fontSize: 11, marginTop: 2 }}>Всего: {total}</div>
    </div>
  )
}

function RatingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <div style={{ ...TOOLTIP_STYLE.labelStyle, marginBottom: 6 }}>{fmtDate(label)}</div>
      <div style={{ color: COLORS.amber, fontWeight: 600 }}>
        {payload[0]?.value != null ? Number(payload[0].value).toFixed(2) : '—'}
      </div>
      <div style={{ color: 'rgba(226,232,240,0.45)', fontSize: 11 }}>
        {payload[1]?.value ?? 0} отзывов
      </div>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>{d?.serviceName}</div>
      <div style={{ color: COLORS.emerald }}>{fmtCurrency(d?.revenue)}</div>
      <div style={{ color: 'rgba(226,232,240,0.5)', fontSize: 11 }}>
        {d?.bookingsCount} броней · {d?.share}%
      </div>
    </div>
  )
}

// ── CSV export ─────────────────────────────────────────────────────────────

function buildCsv(revenue, workload, rating, breakdown) {
  const rows = [['Дата', 'Доход (EUR)', 'Брони', 'Слотов всего', 'Слотов занято', 'Загруженность %', 'Средний рейтинг', 'Отзывов']]
  const all = (revenue ?? []).map(r => r.date)
  all.forEach(date => {
    const rev = revenue?.find(r => r.date === date)
    const wl = workload?.find(w => w.date === date)
    const rat = rating?.find(r => r.date === date)
    rows.push([
      date,
      rev?.amount ?? 0,
      rev?.bookingsCount ?? 0,
      wl?.slotsTotal ?? 0,
      wl?.slotsBooked ?? 0,
      wl?.utilizationPct ?? 0,
      rat?.averageRating ?? '',
      rat?.reviewsCount ?? 0,
    ])
  })
  return rows.map(r => r.join(',')).join('\n')
}

function downloadCsv(csv, filename) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { specialistProfileId } = useAuthStore()
  const pid = specialistProfileId

  const [from, setFrom] = useState(toIso(subDays(new Date(), 30)))
  const [to, setTo] = useState(toIso(new Date()))

  const handlePeriod = (f, t) => { setFrom(f); setTo(t) }

  const qOpts = { enabled: !!pid }

  const summaryQ = useQuery({
    queryKey: ['analytics-summary', pid],
    queryFn: () => getAnalyticsSummary(pid),
    ...qOpts,
  })

  const revenueQ = useQuery({
    queryKey: ['analytics-revenue', pid, from, to],
    queryFn: () => getRevenue(pid, from, to),
    ...qOpts,
  })

  const workloadQ = useQuery({
    queryKey: ['analytics-workload', pid, from, to],
    queryFn: () => getWorkload(pid, from, to),
    ...qOpts,
  })

  const ratingQ = useQuery({
    queryKey: ['analytics-rating', pid, from, to],
    queryFn: () => getRatingHistory(pid, from, to),
    ...qOpts,
  })

  const breakdownQ = useQuery({
    queryKey: ['analytics-breakdown', pid],
    queryFn: () => getServicesBreakdown(pid),
    ...qOpts,
  })

  const s = summaryQ.data

  // Workload chart needs free + booked as separate bars
  const workloadData = (workloadQ.data ?? []).map(d => ({
    ...d,
    slotsFree: d.slotsTotal - d.slotsBooked,
  }))

  const handleExport = () => {
    const csv = buildCsv(revenueQ.data, workloadQ.data, ratingQ.data, breakdownQ.data)
    downloadCsv(csv, `analytics_${from}_${to}.csv`)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.4 }}>
            Аналитика
          </h1>
          <p style={{ color: 'rgba(226,232,240,0.4)', margin: 0, fontSize: 13 }}>
            Данные обновляются каждые 5 минут
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={revenueQ.isLoading}
          style={{ fontSize: 13, padding: '8px 16px' }}
        >
          Скачать CSV
        </button>
      </div>

      {/* Period selector */}
      <div style={{ marginBottom: 28 }}>
        <PeriodSelector from={from} to={to} onChange={handlePeriod} />
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard
          title="Доход за 30 дней"
          value={s ? fmtCurrency(s.totalRevenue30d) : null}
          delta={s?.revenueChangePct != null ? Number(s.revenueChangePct) : null}
          deltaLabel="vs предыдущий период"
          loading={summaryQ.isLoading}
        />
        <KpiCard
          title="Брони за 30 дней"
          value={s?.totalBookings30d ?? null}
          delta={s?.bookingsChangePct != null ? Number(s.bookingsChangePct) : null}
          deltaLabel="vs предыдущий период"
          loading={summaryQ.isLoading}
        />
        <KpiCard
          title="Средний рейтинг"
          value={s?.avgRating != null ? Number(s.avgRating).toFixed(2) : null}
          loading={summaryQ.isLoading}
        />
        <KpiCard
          title="Повторные клиенты"
          value={s?.repeatClientPct != null ? `${s.repeatClientPct}%` : null}
          loading={summaryQ.isLoading}
        />
      </div>

      {/* Charts 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 20 }}>

        {/* Revenue area chart */}
        <AnalyticsChart
          title="Доход по дням"
          loading={revenueQ.isLoading}
          empty={!revenueQ.isLoading && !revenueQ.data?.some(d => d.amount > 0)}
          error={revenueQ.isError}
          onRetry={() => revenueQ.refetch()}
        >
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueQ.data ?? []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="date" tickFormatter={fmtDate} {...AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis {...AXIS_STYLE} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="amount" stroke={COLORS.emerald} fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="bookingsCount" stroke="transparent" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Workload stacked bar */}
        <AnalyticsChart
          title="Загруженность слотов"
          loading={workloadQ.isLoading}
          empty={!workloadQ.isLoading && !workloadQ.data?.some(d => d.slotsTotal > 0)}
          error={workloadQ.isError}
          onRetry={() => workloadQ.refetch()}
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={workloadData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={8}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="date" tickFormatter={fmtDate} {...AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis {...AXIS_STYLE} />
              <Tooltip content={<WorkloadTooltip />} cursor={TOOLTIP_STYLE.cursor} />
              <Bar dataKey="slotsFree" stackId="a" fill="rgba(226,232,240,0.1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="slotsBooked" stackId="a" fill={COLORS.indigo} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Rating line chart */}
        <AnalyticsChart
          title="Динамика рейтинга"
          loading={ratingQ.isLoading}
          empty={!ratingQ.isLoading && !ratingQ.data?.some(d => d.averageRating != null)}
          error={ratingQ.isError}
          onRetry={() => ratingQ.refetch()}
        >
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={ratingQ.data ?? []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="date" tickFormatter={fmtDate} {...AXIS_STYLE} interval="preserveStartEnd" />
              <YAxis {...AXIS_STYLE} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip content={<RatingTooltip />} />
              <Line type="monotone" dataKey="averageRating" stroke={COLORS.amber} strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="reviewsCount" stroke="transparent" />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Services pie */}
        <AnalyticsChart
          title="Распределение по услугам"
          loading={breakdownQ.isLoading}
          empty={!breakdownQ.isLoading && !breakdownQ.data?.length}
          error={breakdownQ.isError}
          onRetry={() => breakdownQ.refetch()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 210 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownQ.data ?? []}
                  dataKey="bookingsCount"
                  nameKey="serviceName"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {(breakdownQ.data ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
              {(breakdownQ.data ?? []).slice(0, 6).map((d, i) => (
                <div key={d.serviceId} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_PALETTE[i % PIE_PALETTE.length], flexShrink: 0 }} />
                  <span style={{ color: 'rgba(226,232,240,0.7)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.serviceName}
                  </span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(226,232,240,0.45)', fontSize: 11, flexShrink: 0 }}>
                    {d.share}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnalyticsChart>

      </div>
    </div>
  )
}
