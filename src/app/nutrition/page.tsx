'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import RecipeModal from '@/components/RecipeModal'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

interface Meal {
  id?: string
  time: string
  name: string
  kcal: number
  protein: number
  done: boolean
}

interface DietChart {
  fileName: string
  uploadedAt: string
  meals: Meal[]
}

interface DayLog {
  date: string
  meals: Meal[]
}

export default function Nutrition() {
  const { user } = useAuth()
  const router   = useRouter()

  const [dietChart,  setDietChart]  = useState<DietChart | null>(null)
  const [todayMeals, setTodayMeals] = useState<Meal[]>([])
  const [loaded,     setLoaded]     = useState(false)
  const [recipeMeal, setRecipeMeal] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const [md, ld] = await Promise.all([
          api.getTodaysMeals(),
          api.getTodaysLogs().catch(() => ({ logs: [] })),
        ])
        if (!active) return
        const loggedIds = new Set<string>(((ld?.logs) || []).map((l: any) => l.mealId).filter(Boolean))
        const meals: Meal[] = ((md?.meals) || []).map((m: any) => ({
          id: m.id,
          time: m.timeHHMM,
          name: m.mealName,
          kcal: Math.round((m.plannedCalories ?? m.calories) || 0),
          protein: Math.round(m.proteinG || 0),
          done: loggedIds.has(m.id),
        }))
        const hasPlan = (md?.hasPlan ?? meals.length > 0)
        if (hasPlan && meals.length > 0) {
          setDietChart({
            fileName: md?.dayName ? `Your plan · ${md.dayName}` : 'Your active plan',
            uploadedAt: new Date().toISOString(),
            meals,
          })
          setTodayMeals(meals)
        }
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  // ── Compute real stats from today's meals ──
  const doneMeals  = todayMeals.filter(m => m.done)
  const totalKcal  = todayMeals.reduce((a, m) => a + m.kcal, 0)
  const doneKcal   = doneMeals.reduce((a, m) => a + m.kcal, 0)
  const totalProt  = todayMeals.reduce((a, m) => a + m.protein, 0)
  const doneProt   = doneMeals.reduce((a, m) => a + m.protein, 0)
  const mealScore  = todayMeals.length > 0
    ? Math.round((doneMeals.length / todayMeals.length) * 100)
    : 0

  // ── Empty state — no diet chart uploaded ──
  if (!dietChart) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '48px 48px 60px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 24, fontWeight: 500, fontFamily: FONT }}>
              ← Back to Home
            </div>
            <h1 style={{ fontFamily: FONT_SYNE, fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>My Nutrition 📊</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, fontFamily: FONT }}>Track your weekly macros, calories and meal scores.</p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '-30px auto 0', padding: '0 48px 60px' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 24, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>
              No Nutrition Data Yet
            </div>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 32px', fontFamily: FONT }}>
              Your nutrition analytics will appear here once you upload your diet chart and start logging your meals. Upload your chart or generate one with AI to get started!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
              >
                📸 Go to Dashboard & Upload Chart →
              </button>
            </div>
            <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 560, margin: '48px auto 0' }}>
              {[
                { icon: '📈', title: 'Macro Tracking',   desc: 'See your daily protein, carbs and fat breakdown' },
                { icon: '🔥', title: 'Calorie Analytics', desc: 'Track calories consumed vs your daily goal' },
                { icon: '⭐', title: 'Meal Score',        desc: 'See how consistently you follow your diet plan' },
              ].map(f => (
                <div key={f.title} style={{ background: '#f9fafb', borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 14, fontWeight: 700, color: '#052e16', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, fontFamily: FONT }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Has diet chart — show real data ──
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '48px 48px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 24, fontWeight: 500, fontFamily: FONT }}>
            ← Back to Home
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>My Nutrition 📊</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, fontFamily: FONT }}>
                From: <strong style={{ color: '#4ade80' }}>{dietChart.fileName}</strong> · Uploaded {new Date(dietChart.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-30px auto 0', padding: '0 48px 60px' }}>

        {/* Today's Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Meals Logged',   value: `${doneMeals.length}/${todayMeals.length}`, icon: '🍽️', color: '#f0fdf4', ac: '#16a34a' },
            { label: 'Calories Done',  value: totalKcal > 0 ? `${doneKcal}/${totalKcal}` : '–', icon: '🔥', color: '#fff7ed', ac: '#f97316' },
            { label: 'Protein Done',   value: totalProt > 0 ? `${doneProt}g/${totalProt}g` : '–', icon: '💪', color: '#eff6ff', ac: '#3b82f6' },
            { label: 'Today\'s Score', value: todayMeals.length > 0 ? `${mealScore}%` : '–', icon: '⭐', color: '#fdf4ff', ac: '#a855f7' },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 20, padding: '22px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: s.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: FONT }}>{s.label}</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Today's Meal Log */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 700, color: '#052e16', marginBottom: 6 }}>Today's Meal Log</div>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, fontFamily: FONT }}>
              Tap meals in your dashboard to log them. They'll appear here.
            </p>

            {todayMeals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🍽️</div>
                <p style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT }}>No meals planned yet. Upload a diet chart from your dashboard.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todayMeals.map((m, i) => (
                  <div key={i} onClick={() => m.id && setRecipeMeal({ id: m.id, name: m.name })} style={{ display: 'flex', alignItems: 'center', gap: 14, background: m.done ? '#f0fdf4' : '#f9fafb', border: `1.5px solid ${m.done ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 14, padding: '13px 16px', cursor: m.id ? 'pointer' : 'default' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.done ? '#16a34a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {m.done ? '✅' : '⭕'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: m.done ? '#16a34a' : '#9ca3af', fontWeight: 600, marginBottom: 2, fontFamily: FONT }}>{m.time}</div>
                      <div style={{ fontSize: 14, color: '#052e16', fontWeight: 600, fontFamily: FONT }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontFamily: FONT }}>{m.kcal} kcal · {m.protein}g protein{m.id ? ' · 📖 tap for recipe' : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: m.done ? '#16a34a' : '#9ca3af', fontFamily: FONT }}>
                        {m.done ? 'Logged ✓' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Calorie & Protein Progress */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 20 }}>Today's Progress</div>

              {totalKcal === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: FONT, textAlign: 'center', padding: '12px 0' }}>
                  Log meals from your dashboard to see progress
                </p>
              ) : (
                [
                  { label: 'Calories', done: doneKcal, total: totalKcal, unit: 'kcal', color: '#f97316' },
                  { label: 'Protein',  done: doneProt,  total: totalProt,  unit: 'g',    color: '#16a34a' },
                ].map(p => {
                  const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0
                  return (
                    <div key={p.label} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, fontFamily: FONT }}>{p.label}</span>
                        <span style={{ fontSize: 13, color: '#052e16', fontWeight: 700, fontFamily: FONT }}>{p.done}{p.unit} / {p.total}{p.unit}</span>
                      </div>
                      <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(to right,${p.color},${p.color}aa)`, borderRadius: 6, transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: p.color, fontWeight: 600, fontFamily: FONT, textAlign: 'right' }}>{pct}% complete</div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Meal completion */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Meal Completion</div>

              {todayMeals.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: FONT, textAlign: 'center' }}>No meals yet</p>
              ) : (
                <>
                  {/* Score circle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: `conic-gradient(#16a34a ${mealScore * 3.6}deg, #f3f4f6 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, position: 'relative',
                    }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16' }}>{mealScore}%</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16' }}>
                        {doneMeals.length} of {todayMeals.length} meals logged
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontFamily: FONT }}>
                        {mealScore >= 80 ? '🔥 Excellent consistency!' :
                         mealScore >= 50 ? '👍 Good progress, keep going!' :
                         mealScore > 0  ? '💪 You\'re getting started!' :
                         '📋 Log your first meal today!'}
                      </div>
                    </div>
                  </div>

                  {/* Per meal dots */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {todayMeals.map((m, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 40 }}>
                        <div style={{ height: 6, borderRadius: 4, background: m.done ? '#16a34a' : '#e5e7eb', marginBottom: 4, transition: 'background 0.3s ease' }} />
                        <div style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', fontFamily: FONT }}>
                          {m.time.replace(' AM', '').replace(' PM', '')}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Diet Chart Info */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 700, color: '#052e16' }}>Your Diet Plan Overview</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 14px' }}>
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, fontFamily: FONT }}>📄 {dietChart.fileName}</span>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ padding: '7px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
              >
                📸 Update Chart
              </button>
            </div>
          </div>

          {/* Plan summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Meals',     value: `${todayMeals.length}`,     icon: '🍽️', color: '#f0fdf4', ac: '#16a34a' },
              { label: 'Daily Calories',  value: `${totalKcal} kcal`,        icon: '⚡',  color: '#fff7ed', ac: '#f97316' },
              { label: 'Daily Protein',   value: `${totalProt}g`,             icon: '💪',  color: '#eff6ff', ac: '#3b82f6' },
              { label: 'Meals Remaining', value: `${todayMeals.length - doneMeals.length}`, icon: '⏰', color: '#fdf4ff', ac: '#a855f7' },
            ].map(s => (
              <div key={s.label} style={{ background: s.color, borderRadius: 16, padding: '16px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 10, color: s.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontFamily: FONT }}>{s.label}</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* All meals table */}
          <div style={{ border: '1px solid #f3f4f6', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
              {['Time', 'Meal', 'Calories', 'Protein', 'Status'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontFamily: FONT }}>{h}</div>
              ))}
            </div>
            {todayMeals.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', padding: '14px 16px', borderBottom: i < todayMeals.length - 1 ? '1px solid #f3f4f6' : 'none', background: m.done ? '#f0fdf4' : '#fff', transition: 'background 0.2s ease' }}>
                <div style={{ fontSize: 13, color: '#6b7280', fontFamily: FONT }}>{m.time}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#052e16', fontFamily: FONT }}>{m.name}</div>
                <div style={{ fontSize: 13, color: '#374151', fontFamily: FONT }}>{m.kcal} kcal</div>
                <div style={{ fontSize: 13, color: '#374151', fontFamily: FONT }}>{m.protein}g</div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: m.done ? '#16a34a' : '#9ca3af', background: m.done ? '#dcfce7' : '#f3f4f6', padding: '3px 10px', borderRadius: 100, fontFamily: FONT }}>
                    {m.done ? '✓ Logged' : '○ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA to log meals */}
          {doneMeals.length < todayMeals.length && (
            <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16', marginBottom: 4 }}>
                  {todayMeals.length - doneMeals.length} meal{todayMeals.length - doneMeals.length > 1 ? 's' : ''} left to log today
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', fontFamily: FONT }}>Go to your dashboard and tap meals to mark them as done.</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(22,163,74,0.25)', flexShrink: 0 }}
              >
                Log Meals on Dashboard →
              </button>
            </div>
          )}

          {/* All done state */}
          {todayMeals.length > 0 && doneMeals.length === todayMeals.length && (
            <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 16, padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 4 }}>
                All meals logged for today!
              </div>
              <p style={{ fontSize: 14, color: '#16a34a', fontWeight: 600, fontFamily: FONT }}>
                Perfect score — 100% consistency! You're crushing it 🔥
              </p>
            </div>
          )}
        </div>
      </div>

      {recipeMeal && <RecipeModal mealId={recipeMeal.id} mealName={recipeMeal.name} onClose={() => setRecipeMeal(null)} />}
    </div>
  )
}