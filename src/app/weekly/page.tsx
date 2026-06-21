'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Weekly() {
  const { user } = useAuth()
  const router   = useRouter()
  const [days, setDays]     = useState<any[]>([])
  const [planName, setPlan] = useState<string | null>(null)
  const [sel, setSel]       = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const d = await api.getWeeklyMeals()
        if (!active) return
        const ds = (d?.days || []) as any[]
        setDays(ds); setPlan(d?.planName || null)
        const todayDow = new Date().getDay()
        const idx = ds.findIndex(x => x.dayOfWeek === todayDow)
        setSel(idx >= 0 ? idx : 0)
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const day = days[sel]
  const meals: any[] = day?.meals || []
  const kcal = (m: any) => Math.round((m.plannedCalories ?? m.calories) || 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>📅 Weekly Plan</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{planName ? `Your 7-day plan · ${planName}` : 'Your full 7-day plan'}</p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {days.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>No active plan yet</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Activate a diet plan to see your full week here.</p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Go to Dashboard →</button>
          </div>
        ) : (
          <>
            {/* Day tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 18 }}>
              {days.map((d, i) => (
                <button key={i} onClick={() => setSel(i)} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${i === sel ? '#16a34a' : '#e5e7eb'}`, background: i === sel ? '#16a34a' : '#fff', color: i === sel ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                  {(d.dayName || `Day ${i + 1}`).slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Day totals */}
            {day?.totals && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
                {[
                  { label: 'Calories', val: `${Math.round(day.totals.calories || 0)}`, ac: '#16a34a' },
                  { label: 'Protein', val: `${Math.round(day.totals.proteinG || 0)}g`, ac: '#3b82f6' },
                  { label: 'Carbs', val: `${Math.round(day.totals.carbsG || 0)}g`, ac: '#f97316' },
                  { label: 'Fat', val: `${Math.round(day.totals.fatG || 0)}g`, ac: '#a855f7' },
                ].map(t => (
                  <div key={t.label} style={{ background: '#fff', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: t.ac }}>{t.val}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{t.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Meals */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>{day?.dayName || 'Meals'}</div>
              {meals.length === 0 ? (
                <p style={{ fontSize: 14, color: '#9ca3af' }}>No meals scheduled for this day.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {meals.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14 }}>
                      <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', fontFamily: FONT }}>{m.timeHHMM}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#052e16' }}>{m.mealName}</div>
                        {m.quantity && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{m.quantity} {m.quantityUnit || ''}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', fontFamily: FONT_SYNE }}>{kcal(m)}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
