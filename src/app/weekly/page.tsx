'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const SEC_LABELS: Record<string,string> = {
  other:'Early Morning',breakfast:'Breakfast',morning_snack:'Mid Morning',
  lunch:'Lunch',pre_workout:'Pre Workout',post_workout:'Post Workout',
  evening_snack:'Evening Snack',dinner:'Dinner',before_bed:'Before Bed',
}
const SEC_ORDER = ['other','breakfast','morning_snack','lunch','pre_workout','post_workout','evening_snack','dinner','before_bed']
const SEC_ICONS: Record<string,string> = {
  breakfast:'🍳',morning_snack:'🍎',lunch:'🍱',evening_snack:'☕',
  dinner:'🌙',pre_workout:'⚡',post_workout:'💪',other:'🥗',before_bed:'😴',
}

function getSection(m: any): string {
  if (m.mealType && m.mealType !== 'other') return m.mealType
  const h = parseInt((m.timeHHMM || '0').split(':')[0])
  if (h >= 20 || h <= 4) return 'before_bed'
  if (h <= 9) return 'other'
  if (h <= 11) return 'morning_snack'
  if (h <= 14) return 'lunch'
  if (h <= 18) return 'pre_workout'
  return 'evening_snack'
}

export default function Weekly() {
  const { user } = useAuth()
  const router = useRouter()
  const [days, setDays] = useState<any[]>([])
  const [planName, setPlan] = useState<string|null>(null)
  const [sel, setSel] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [logIds, setLogIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const [d, logs] = await Promise.all([api.getWeeklyMeals(), api.getTodaysLogs()])
        if (!active) return
        const ds = (d?.days || []) as any[]
        setDays(ds); setPlan(d?.planName || null)
        const jsDow = new Date().getDay()
        const todayDow = jsDow === 0 ? 6 : jsDow - 1
        const idx = ds.findIndex((x: any) => x.dayIndex === todayDow || x.dayOfWeek === todayDow)
        setSel(idx >= 0 ? idx : 0)
        setLogIds(new Set<string>(((logs?.logs || []) as any[]).map((l: any) => l.mealId).filter(Boolean)))
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line

  if (!user || !loaded) return null

  const day = days[sel]
  const meals: any[] = day?.meals || []
  const totals = day?.totals || {}
  const grouped: Record<string,any[]> = {}
  meals.forEach(m => { const s = getSection(m); if (!grouped[s]) grouped[s] = []; grouped[s].push(m) })
  const sections = SEC_ORDER.filter(s => (grouped[s] || []).length > 0)
  const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

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
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Go to Dashboard →</button>
          </div>
        ) : (
          <>
            {/* Day tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 18 }}>
              {days.map((d: any, i: number) => (
                <button key={i} onClick={() => setSel(i)} style={{ flexShrink: 0, padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${i === sel ? '#16a34a' : '#e5e7eb'}`, background: i === sel ? '#16a34a' : '#fff', color: i === sel ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                  {(d.dayName || DAY_SHORT[i] || `D${i+1}`).slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Macro totals */}
            {(totals.calories || totals.proteinG) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
                {[
                  { label: 'Calories', val: `${Math.round(totals.calories || 0)}`, unit: 'kcal', ac: '#16a34a' },
                  { label: 'Protein',  val: `${Math.round(totals.proteinG || 0)}`, unit: 'g', ac: '#3b82f6' },
                  { label: 'Carbs',    val: `${Math.round(totals.carbsG || 0)}`,   unit: 'g', ac: '#f97316' },
                  { label: 'Fat',      val: `${Math.round(totals.fatG || 0)}`,     unit: 'g', ac: '#a855f7' },
                ].map(t => (
                  <div key={t.label} style={{ background: '#fff', borderRadius: 14, padding: '12px 10px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: t.ac }}>{t.val}<span style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT, fontWeight: 600 }}>{t.unit}</span></div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{t.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Grouped meal sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sections.length === 0 && (
                <div style={{ background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', color: '#9ca3af', fontSize: 14 }}>No meals scheduled for this day.</div>
              )}
              {sections.map(sec => (
                <div key={sec} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <span style={{ fontSize: 20 }}>{SEC_ICONS[sec] || '🍽️'}</span>
                    <span style={{ fontFamily: FONT_SYNE, fontSize: 12, fontWeight: 800, color: '#052e16', textTransform: 'uppercase', letterSpacing: 0.8 }}>{SEC_LABELS[sec] || sec}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{(grouped[sec] || []).length} meal{(grouped[sec] || []).length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ padding: '6px 0' }}>
                    {(grouped[sec] || []).map((m: any, i: number) => {
                      const logged = logIds.has(m.id)
                      const cal = Math.round((m.plannedCalories ?? m.calories) || 0)
                      const prot = Math.round(m.proteinG || 0)
                      const carb = Math.round(m.carbsG || 0)
                      const fat  = Math.round(m.fatG || 0)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: i < grouped[sec].length - 1 ? '1px solid #f9fafb' : 'none', opacity: logged ? 0.6 : 1 }}>
                          <div style={{ minWidth: 50, paddingTop: 2 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{m.timeHHMM || ''}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: logged ? '#9ca3af' : '#111827', textDecoration: logged ? 'line-through' : 'none' }}>{m.mealName}</div>
                              {logged && <span style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', borderRadius: 6, padding: '1px 6px' }}>✓</span>}
                            </div>
                            {!!m.quantity && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 5 }}>{m.quantity}{m.quantityUnit ? ' ' + m.quantityUnit : ''}</div>}
                            {(prot > 0 || carb > 0 || fat > 0) && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                {prot > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', background: '#eff6ff', borderRadius: 6, padding: '2px 7px' }}>P {prot}g</span>}
                                {carb > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', background: '#fff7ed', borderRadius: 6, padding: '2px 7px' }}>C {carb}g</span>}
                                {fat  > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', background: '#faf5ff', borderRadius: 6, padding: '2px 7px' }}>F {fat}g</span>}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#16a34a' }}>{cal}</div>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>kcal</div>
                            {!!m.id && <div onClick={() => router.push(`/recipe?mealId=${m.id}`)} style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', cursor: 'pointer', textDecoration: 'underline' }}>Recipe</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
