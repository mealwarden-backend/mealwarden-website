'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { buildReportHTML } from '@/lib/reportBuilder'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN     = '#16a34a'

type Period = 'day' | 'week' | 'month'
const PERIODS: { v: Period; label: string }[] = [
  { v: 'day',   label: 'Today' },
  { v: 'week',  label: 'Week'  },
  { v: 'month', label: 'Month' },
]

export default function Progress() {
  const { user } = useAuth()
  const router   = useRouter()
  const [period, setPeriod]       = useState<Period>('week')
  const [sum, setSum]             = useState<any>(null)
  const [wt, setWt]               = useState<any>(null)
  const [journey, setJourney]     = useState<any>(null)
  const [loaded, setLoaded]       = useState(false)
  const [fetching, setFetching]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [journeyLoading, setJourneyLoading] = useState(false)

  const load = useCallback(async (p: Period) => {
    setFetching(true)
    try {
      const [s, w] = await Promise.all([
        api.getAnalyticsSummary(p).catch(() => null),
        api.getWeightStats().catch(() => null),
      ])
      setSum(s); setWt(w)
    } catch {} finally { setFetching(false); setLoaded(true) }
  }, [])

  const loadJourney = useCallback(async (p: Period) => {
    setJourneyLoading(true)
    try {
      const res = await (api as any).getJourneySummary(p)
      setJourney(res)
    } catch {} finally { setJourneyLoading(false) }
  }, [])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    load(period); loadJourney(period)
  }, [user, router]) // eslint-disable-line

  const switchPeriod = (p: Period) => {
    if (p === period) return
    setPeriod(p); load(p); loadJourney(p)
  }

  const exportReport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const s   = sum?.summary || {}
      const nut = sum?.nutrients || {}
      const wat = sum?.water || {}
      const ins = sum?.insights || {}
      const pLabel = period === 'day' ? "Today's" : period === 'week' ? 'Last 7 days' : 'Last 30 days'
      const html = buildReportHTML(pLabel, s, nut, wat, ins, wt, journey)
      const blob = new Blob([html], { type: 'text/html' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = 'MealWarden_Progress_' + new Date().toISOString().slice(0, 10) + '.html'
      a.click()
      URL.revokeObjectURL(url)
    } catch {} finally { setExporting(false) }
  }

  if (!user || !loaded) return null

  const s   = sum?.summary || {}
  const nut = sum?.nutrients || {}
  const wat = sum?.water || {}
  const ins = sum?.insights || {}
  const periodLabel = period === 'day' ? "Today's" : period === 'week' ? 'Last 7 days' : 'Last 30 days'
  const journeyEntries: any[] = journey?.entries || []

  const cards = [
    { icon: '✅', label: 'Adherence',    value: s.adherencePct != null ? s.adherencePct + '%' : '–', color: '#f0fdf4', ac: GREEN },
    { icon: '🔥', label: 'Streak',       value: s.streak != null ? s.streak + ' day' + (s.streak === 1 ? '' : 's') : '–', color: '#fff7ed', ac: '#f97316' },
    { icon: '⚡', label: 'Avg Calories', value: s.avgDailyCalories ? s.avgDailyCalories + ' kcal' : '–', color: '#eff6ff', ac: '#3b82f6' },
    { icon: '📅', label: 'Days Logged',  value: s.loggedDays != null ? String(s.loggedDays) : '–', color: '#fdf4ff', ac: '#a855f7' },
  ]
  const macros = [
    { label: 'Protein', val: nut.proteinG, planned: nut.plannedProteinG, color: GREEN },
    { label: 'Carbs',   val: nut.carbsG,   planned: nut.plannedCarbsG,   color: '#f97316' },
    { label: 'Fat',     val: nut.fatG,     planned: nut.plannedFatG,     color: '#a855f7' },
    { label: 'Fiber',   val: nut.fiberG || Math.round((s.eatenCalories || 0) * 14 / 1000),   planned: nut.plannedFiberG || Math.round((s.plannedCalories || 0) * 14 / 1000),   color: '#3b82f6' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>
            ← Back to Dashboard
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>📊 My Progress</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{periodLabel} snapshot</p>
            </div>
            {s.hasPlan && (
              <button onClick={exportReport} disabled={exporting} style={{
                padding: '10px 20px',
                background: exporting ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                border: 'none', borderRadius: 10, color: '#052e16', fontWeight: 700, fontSize: 13,
                cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {exporting ? '⏳ Exporting…' : '📄 Download Report'}
              </button>
            )}
          </div>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 4, gap: 4 }}>
            {PERIODS.map(p => (
              <button key={p.v} onClick={() => switchPeriod(p.v)} style={{
                padding: '8px 20px', borderRadius: 9, border: 'none', fontFamily: FONT,
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                background: period === p.v ? '#fff' : 'transparent',
                color: period === p.v ? '#052e16' : 'rgba(255,255,255,0.75)',
                boxShadow: period === p.v ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              }}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-30px auto 0', padding: '0 24px 60px', position: 'relative' }}>
        {fetching && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(249,250,251,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 28 }}>⏳</div>
          </div>
        )}

        {!s.hasPlan ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '56px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 10 }}>No progress yet</div>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
              Activate a plan and start logging meals — your streaks, adherence and trends will appear here.
            </p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>
              Go to Dashboard →
            </button>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 20 }}>
              {cards.map(c => (
                <div key={c.label} style={{ background: c.color, borderRadius: 20, padding: '22px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: 11, color: c.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16' }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Weight */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Weight</div>
                {wt?.hasData ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#052e16' }}>
                      {wt.currentWeight}<span style={{ fontSize: 16, color: '#9ca3af' }}> kg</span>
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: (wt.totalChange || 0) <= 0 ? GREEN : '#f97316' }}>
                      {(wt.totalChange || 0) > 0 ? '▲' : '▼'} {Math.abs(wt.totalChange || 0)} kg
                    </span>
                  </div>
                ) : <p style={{ fontSize: 13, color: '#9ca3af' }}>No weight logged yet.</p>}
                {wt?.bmi != null && <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>BMI {wt.bmi} · {wt.bmiCategory}</div>}
                <button onClick={() => router.push('/weight')} style={{ marginTop: 16, padding: '10px 18px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                  Log / view weight →
                </button>
              </div>

              {/* Water */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Hydration</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#3b82f6' }}>{wat.avgGlasses ?? 0}</span>
                  <span style={{ fontSize: 14, color: '#9ca3af' }}>avg glasses/day · goal {wat.goalGlasses ?? 8}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>{wat.daysTracked || 0} days tracked</div>
              </div>
            </div>

            {/* Macros */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Avg Daily Macros</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {macros.map(m => (
                  <div key={m.label} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 14, padding: '16px 8px' }}>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: m.color }}>
                      {m.val ?? 0}<span style={{ fontSize: 12, color: '#9ca3af' }}>g</span>
                    </div>
                    {m.planned > 0 && (
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>/ {m.planned}g plan</div>
                    )}
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Balance — planned vs consumed (day view only) */}
            {period === 'day' && (nut.plannedProteinG > 0 || nut.plannedCarbsG > 0 || nut.plannedFatG > 0) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 4 }}>Nutrition Balance</div>
                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Planned vs eaten today</p>
                {macros.filter(m => (m.planned ?? 0) > 0 || (m.val ?? 0) > 0).map((m, i, arr) => {
                  const eaten   = m.val ?? 0
                  const planned = m.planned ?? 0
                  const pct     = planned > 0 ? Math.min(100, Math.round((eaten / planned) * 100)) : 0
                  const delta   = Math.round(eaten - planned)
                  const onTarget = planned > 0 && Math.abs(delta) <= planned * 0.1
                  const over    = delta > 0
                  return (
                    <div key={m.label} style={{ marginBottom: i < arr.length - 1 ? 18 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 8, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#374151' }}>{m.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{eaten}g</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>&nbsp;/ {planned}g</span>
                        {planned > 0 && !onTarget && (
                          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: over ? '#c2410c' : '#1d4ed8', background: over ? '#fff7ed' : '#eff6ff', border: `1px solid ${over ? '#fed7aa' : '#bfdbfe'}`, borderRadius: 6, padding: '2px 6px' }}>
                            {over ? '+' : ''}{delta}g
                          </span>
                        )}
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: m.color, opacity: onTarget ? 1 : over ? 0.7 : 0.85, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
                        {pct}% of plan{onTarget ? ' · ✓ on target' : over ? ' · slightly over' : pct < 50 ? ' · more to eat' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Journey Summary */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16' }}>📈 Journey Summary</div>
                {journeyLoading && <div style={{ fontSize: 12, color: '#9ca3af' }}>Loading…</div>}
              </div>
              {journeyEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#9ca3af', fontSize: 14 }}>
                  {journeyLoading ? '⏳ Loading your journey…' : 'No journey data yet. Keep logging meals daily to build your history!'}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: FONT }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Period', 'Avg Calories', 'Adherence', 'Protein', 'Weight'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Period' ? 'left' : 'center', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1.5px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {journeyEntries.map((e: any, i: number) => {
                        const ac = e.adherencePct >= 80 ? GREEN : e.adherencePct >= 50 ? '#f97316' : '#ef4444'
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#052e16' }}>{e.week || e.label || ('Week ' + (i + 1))}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#374151' }}>{e.avgCalories ? e.avgCalories + ' kcal' : '–'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              {e.adherencePct != null ? <span style={{ fontWeight: 700, color: ac }}>{e.adherencePct}%</span> : '–'}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#374151' }}>{e.proteinG != null ? e.proteinG + 'g' : '–'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#374151' }}>{e.weight != null ? e.weight + ' kg' : '–'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {journeyEntries.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { color: GREEN,      label: '≥80% adherence = on track' },
                    { color: '#f97316',  label: '50–79% = room to improve' },
                    { color: '#ef4444',  label: '<50% = needs attention' },
                  ].map(k => (
                    <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: k.color }} />
                      {k.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Insights */}
            {(ins.wins || ins.focus || ins.keepGoing || ins.slipped) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 14 }}>Guardian Insights</div>
                {([['🏆 Wins', ins.wins], ['🎯 Focus', ins.focus], ['💪 Keep going', ins.keepGoing], ['⚠️ Slipped', ins.slipped]] as [string, any][])
                  .filter(([, v]) => v)
                  .map(([label, v]) => (
                    <div key={label} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6 }}>{Array.isArray(v) ? v.join(' · ') : String(v)}</div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
