'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN     = '#16a34a'
const DARK      = '#052e16'

type Period = 'day' | 'week' | 'month'

// ── Inline SVG bar chart (no external deps) ────────────────────────────────
function BarChart({ data, color = GREEN }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            title={`${d.label}: ${d.value}`}
            style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              background: color, opacity: d.value > 0 ? 1 : 0.18,
              height: `${Math.round((d.value / max) * 68)}px`,
              minHeight: d.value > 0 ? 4 : 2,
              transition: 'height 0.4s ease',
            }}
          />
          <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── SVG Line chart for weight ──────────────────────────────────────────────
function LineChart({ logs }: { logs: { date: string; weightKg: number }[] }) {
  if (!logs || logs.length < 2) return <p style={{ fontSize: 13, color: '#9ca3af' }}>Need at least 2 weight logs to show a chart.</p>
  const W = 340, H = 80, PAD = 12
  const vals = logs.map(l => l.weightKg)
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const range = max - min || 1
  const pts   = logs.map((l, i) => {
    const x = PAD + (i / (logs.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((l.weightKg - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, overflow: 'visible' }}>
      <polyline fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts.join(' ')} />
      {logs.map((l, i) => {
        const [x, y] = pts[i].split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r={3} fill={GREEN} />
      })}
    </svg>
  )
}

// ── Calorie bar ────────────────────────────────────────────────────────────
function CalBar({ consumed, target }: { consumed: number; target: number }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0
  const over = consumed > target && target > 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
        <span>{Math.round(consumed)} kcal consumed</span>
        <span style={{ fontWeight: 700, color: over ? '#f97316' : DARK }}>{Math.round(target)} kcal target</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 6, background: over ? '#f97316' : GREEN, width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ fontSize: 12, color: over ? '#f97316' : '#6b7280', marginTop: 5, textAlign: 'right' }}>
        {over ? `${Math.round(consumed - target)} kcal over` : `${Math.round(target - consumed)} kcal remaining`}
      </div>
    </div>
  )
}

export default function Progress() {
  const { user } = useAuth()
  const router   = useRouter()
  const [period, setPeriod]   = useState<Period>('week')
  const [sum, setSum]         = useState<any>(null)
  const [wt, setWt]           = useState<any>(null)
  const [streak, setStreak]   = useState<number | null>(null)
  const [loaded, setLoaded]   = useState(false)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p: Period) => {
    if (!user) return
    setLoading(true)
    try {
      const [s, w, st] = await Promise.all([
        api.getAnalyticsSummary(p).catch(() => null),
        api.getWeightStats().catch(() => null),
        api.getStreak().catch(() => null),
      ])
      setSum(s); setWt(w)
      if (st?.data?.streak != null) setStreak(st.data.streak)
    } catch {}
    finally { setLoading(false); setLoaded(true) }
  }, [user])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    load(period)
  }, [user, period]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const s    = sum?.summary   || {}
  const nut  = sum?.nutrients || {}
  const wat  = sum?.water     || {}
  const ins  = sum?.insights  || {}
  const daily: any[] = sum?.dailyBreakdown || []

  // Bar chart data from daily breakdown
  const adherenceBar = daily.map((d: any) => ({
    label: d.dayLabel?.slice(0, 3) || '',
    value: d.adherencePct || 0,
  }))
  const calBar = daily.map((d: any) => ({
    label: d.dayLabel?.slice(0, 3) || '',
    value: d.totalCalories || 0,
  }))

  // Macro stacked proportions
  const totalMacroG = (nut.proteinG || 0) + (nut.carbsG || 0) + (nut.fatG || 0) || 1
  const macroSegs = [
    { label: 'Protein', g: nut.proteinG || 0, color: GREEN },
    { label: 'Carbs',   g: nut.carbsG   || 0, color: '#f97316' },
    { label: 'Fat',     g: nut.fatG     || 0, color: '#a855f7' },
  ]

  const weightLogs: { date: string; weightKg: number }[] = wt?.logs || []
  const streakVal = streak ?? s.streak ?? 0

  const periodLabel = period === 'day' ? "Today" : period === 'week' ? 'Last 7 days' : 'Last 30 days'

  const statCards = [
    { icon: '✅', label: 'Adherence',   value: s.adherencePct != null ? `${s.adherencePct}%` : '–',     color: '#f0fdf4', ac: GREEN },
    { icon: '🔥', label: 'Streak',      value: `${streakVal} day${streakVal === 1 ? '' : 's'}`,          color: '#fff7ed', ac: '#f97316' },
    { icon: '⚡', label: 'Avg Calories',value: s.avgDailyCalories ? `${s.avgDailyCalories}` : '–',      color: '#eff6ff', ac: '#3b82f6' },
    { icon: '📅', label: 'Days Logged', value: s.loggedDays != null ? `${s.loggedDays}` : '–',           color: '#fdf4ff', ac: '#a855f7' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${DARK},${GREEN})`, padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>
            ← Back to Dashboard
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>📊 My Progress</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{periodLabel}</p>
            </div>
            {/* Period Selector */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 4, gap: 4, alignSelf: 'flex-start', marginTop: 8 }}>
              {(['day', 'week', 'month'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => { if (p !== period) setPeriod(p) }}
                  style={{
                    padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: period === p ? '#fff' : 'transparent',
                    color: period === p ? DARK : 'rgba(255,255,255,0.75)',
                    fontWeight: 700, fontSize: 13, fontFamily: FONT,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-30px auto 0', padding: '0 24px 60px', position: 'relative' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 14 }}>
            Loading…
          </div>
        )}

        {!loading && !s.hasPlan ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '56px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 10 }}>No progress yet</div>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
              Activate a plan and start logging meals — your streaks, adherence and trends will appear here.
            </p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: `linear-gradient(135deg,${GREEN},#22c55e)`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>
              Go to Dashboard →
            </button>
          </div>
        ) : !loading && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 20 }}>
              {statCards.map(c => (
                <div key={c.label} style={{ background: c.color, borderRadius: 20, padding: '22px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: 11, color: c.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: DARK }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Calorie balance bar */}
            {(s.totalCaloriesConsumed != null || s.avgDailyCalories != null) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 14 }}>🔥 Calorie Balance</div>
                <CalBar
                  consumed={s.totalCaloriesConsumed || s.avgDailyCalories || 0}
                  target={s.targetCalories || s.planCalories || 2000}
                />
              </div>
            )}

            {/* Daily adherence bar chart */}
            {adherenceBar.length > 1 && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 14 }}>📅 Daily Adherence %</div>
                <BarChart data={adherenceBar} color={GREEN} />
              </div>
            )}

            {/* Daily calories bar chart */}
            {calBar.length > 1 && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 14 }}>⚡ Daily Calories</div>
                <BarChart data={calBar} color="#3b82f6" />
              </div>
            )}

            {/* Macros stacked bar */}
            {(nut.proteinG || nut.carbsG || nut.fatG) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 14 }}>🥩 Avg Daily Macros</div>
                {/* Stacked proportion bar */}
                <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                  {macroSegs.map(m => (
                    <div key={m.label} style={{ width: `${(m.g / totalMacroG) * 100}%`, background: m.color, transition: 'width 0.4s ease' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {macroSegs.map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color }} />
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{m.label}: <strong style={{ color: DARK }}>{m.g}g</strong></span>
                    </div>
                  ))}
                  {nut.fiberG > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6' }} />
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Fiber: <strong style={{ color: DARK }}>{nut.fiberG}g</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weight + Water side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Weight with line chart */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 12 }}>⚖️ Weight</div>
                {wt?.hasData ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontFamily: FONT_SYNE, fontSize: 30, fontWeight: 800, color: DARK }}>{wt.currentWeight}<span style={{ fontSize: 15, color: '#9ca3af' }}> kg</span></span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: (wt.totalChange || 0) <= 0 ? GREEN : '#f97316' }}>
                        {(wt.totalChange || 0) > 0 ? '▲' : '▼'} {Math.abs(wt.totalChange || 0)} kg
                      </span>
                    </div>
                    {wt?.bmi != null && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>BMI {wt.bmi} · {wt.bmiCategory}</div>}
                    {weightLogs.length >= 2 && <LineChart logs={weightLogs.slice(-14)} />}
                  </>
                ) : <p style={{ fontSize: 13, color: '#9ca3af' }}>No weight logged yet.</p>}
                <button onClick={() => router.push('/weight')} style={{ marginTop: 12, padding: '10px 18px', background: '#f0fdf4', color: GREEN, border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                  Log / view weight →
                </button>
              </div>

              {/* Hydration with visual goal bar */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 12 }}>💧 Hydration</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: FONT_SYNE, fontSize: 30, fontWeight: 800, color: '#3b82f6' }}>{wat.avgGlasses ?? 0}</span>
                  <span style={{ fontSize: 14, color: '#9ca3af' }}>avg / {wat.goalGlasses ?? 8} goal</span>
                </div>
                {/* Hydration progress bar */}
                <div style={{ background: '#eff6ff', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', borderRadius: 6, background: '#3b82f6', width: `${Math.min(((wat.avgGlasses || 0) / (wat.goalGlasses || 8)) * 100, 100)}%`, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{wat.daysTracked || 0} days tracked this {period}</div>
              </div>
            </div>

            {/* Guardian Insights */}
            {(ins.wins || ins.focus || ins.keepGoing || ins.slipped) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 14 }}>🛡️ Guardian Insights</div>
                {[
                  ['🏆 Wins',       ins.wins,      '#f0fdf4', GREEN],
                  ['🎯 Focus',      ins.focus,     '#eff6ff', '#3b82f6'],
                  ['💪 Keep going', ins.keepGoing, '#fff7ed', '#f97316'],
                  ['⚠️ Slipped',    ins.slipped,   '#fff1f2', '#e11d48'],
                ].filter(([, v]) => v).map(([label, v, bg, ac]: any) => (
                  <div key={label} style={{ background: bg, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ac, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>
                      {Array.isArray(v) ? v.join(' · ') : String(v)}
                    </div>
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
