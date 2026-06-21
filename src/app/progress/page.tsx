'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Progress() {
  const { user } = useAuth()
  const router   = useRouter()
  const [sum, setSum]       = useState<any>(null)
  const [wt, setWt]         = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const [s, w] = await Promise.all([
          api.getAnalyticsSummary('week').catch(() => null),
          api.getWeightStats().catch(() => null),
        ])
        if (!active) return
        setSum(s); setWt(w)
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const s   = sum?.summary || {}
  const nut = sum?.nutrients || {}
  const wat = sum?.water || {}
  const ins = sum?.insights || {}

  const cards = [
    { icon: '✅', label: 'Adherence', value: s.adherencePct != null ? `${s.adherencePct}%` : '–', color: '#f0fdf4', ac: '#16a34a' },
    { icon: '🔥', label: 'Streak', value: s.streak != null ? `${s.streak} day${s.streak === 1 ? '' : 's'}` : '–', color: '#fff7ed', ac: '#f97316' },
    { icon: '⚡', label: 'Avg Calories', value: s.avgDailyCalories ? `${s.avgDailyCalories}` : '–', color: '#eff6ff', ac: '#3b82f6' },
    { icon: '📅', label: 'Days Logged', value: s.loggedDays != null ? `${s.loggedDays}` : '–', color: '#fdf4ff', ac: '#a855f7' },
  ]
  const macros = [
    { label: 'Protein', val: nut.proteinG, color: '#16a34a' },
    { label: 'Carbs',   val: nut.carbsG,   color: '#f97316' },
    { label: 'Fat',     val: nut.fatG,     color: '#a855f7' },
    { label: 'Fiber',   val: nut.fiberG,   color: '#3b82f6' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>📊 My Progress</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Your last 7 days at a glance.</p>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {!s.hasPlan ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '56px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 10 }}>No progress yet</div>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>Activate a plan and start logging meals — your streaks, adherence and trends will appear here.</p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Go to Dashboard →</button>
          </div>
        ) : (
          <>
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
                    <span style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#052e16' }}>{wt.currentWeight}<span style={{ fontSize: 16, color: '#9ca3af' }}> kg</span></span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: (wt.totalChange || 0) <= 0 ? '#16a34a' : '#f97316' }}>{(wt.totalChange || 0) > 0 ? '▲' : '▼'} {Math.abs(wt.totalChange || 0)} kg</span>
                  </div>
                ) : <p style={{ fontSize: 13, color: '#9ca3af' }}>No weight logged yet.</p>}
                {wt?.bmi != null && <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>BMI {wt.bmi} · {wt.bmiCategory}</div>}
                <button onClick={() => router.push('/weight')} style={{ marginTop: 16, padding: '10px 18px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Log / view weight →</button>
              </div>

              {/* Water */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Hydration</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#3b82f6' }}>{wat.avgGlasses ?? 0}</span>
                  <span style={{ fontSize: 14, color: '#9ca3af' }}>avg glasses/day · goal {wat.goalGlasses ?? 8}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>{wat.daysTracked || 0} days tracked this week</div>
              </div>
            </div>

            {/* Macros */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Avg Daily Macros</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {macros.map(m => (
                  <div key={m.label} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 14, padding: '16px 8px' }}>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: m.color }}>{m.val ?? 0}<span style={{ fontSize: 12, color: '#9ca3af' }}>g</span></div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            {(ins.wins || ins.focus || ins.keepGoing || ins.slipped) && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 14 }}>Guardian Insights</div>
                {[['🏆 Wins', ins.wins], ['🎯 Focus', ins.focus], ['💪 Keep going', ins.keepGoing], ['⚠️ Slipped', ins.slipped]].filter(([, v]) => v).map(([label, v]: any) => (
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
