'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import RecipeModal from '@/components/RecipeModal'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN     = '#16a34a'
const DARK      = '#052e16'

interface Meal {
  id?: string
  time: string
  name: string
  mealType: string
  kcal: number        // planned calories (target / never overwritten)
  actualKcal: number  // real calories after scan/edit — same as kcal if unchanged
  protein: number
  carbsG: number
  fatG: number
  fiberG: number
  done: boolean
  originalName?: string  // original planned meal name — set only when the meal was replaced
}

interface DietChart {
  fileName: string
  uploadedAt: string
  meals: Meal[]
}

const SECTION_LABELS: Record<string, { label: string; emoji: string }> = {
  other:         { label: 'Early Morning',   emoji: '🌅' },
  breakfast:     { label: 'Breakfast',       emoji: '🍳' },
  morning_snack: { label: 'Mid-Morning',     emoji: '🍎' },
  lunch:         { label: 'Lunch',           emoji: '🍛' },
  pre_workout:   { label: 'Pre-Workout',     emoji: '⚡' },
  post_workout:  { label: 'Post-Workout',    emoji: '💪' },
  evening_snack: { label: 'Evening Snack',   emoji: '🍵' },
  dinner:        { label: 'Dinner',          emoji: '🍽️' },
  before_bed:    { label: 'Before Bed',      emoji: '🌙' },
}
const SECTION_ORDER = ['other','breakfast','morning_snack','lunch','pre_workout','post_workout','evening_snack','dinner','before_bed']

function getSec(m: Meal) {
  if (m.mealType && m.mealType !== 'other') return m.mealType
  const [h] = m.time.split(':').map(Number)
  if (h >= 20 || h <= 4) return 'before_bed'
  if (h <= 9)  return 'other'
  if (h <= 11) return 'morning_snack'
  if (h <= 14) return 'lunch'
  return 'evening_snack'
}

export default function Nutrition() {
  const { user } = useAuth()
  const router   = useRouter()

  const [dietChart,  setDietChart]  = useState<DietChart | null>(null)
  const [todayMeals, setTodayMeals] = useState<Meal[]>([])
  const [loaded,     setLoaded]     = useState(false)
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [recipeMeal, setRecipeMeal] = useState<{ id: string; name: string } | null>(null)

  // Edit modal state
  const [editMeal,   setEditMeal]   = useState<Meal | null>(null)
  const [editForm,   setEditForm]   = useState({ name: '', time: '', kcal: '', protein: '', carbs: '', fat: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [estimating, setEstimating] = useState(false)

  // Add meal modal state
  const [addModal,    setAddModal]   = useState(false)
  const [addForm,     setAddForm]    = useState({ name: '', mealType: 'breakfast', time: '08:00', kcal: '', protein: '', carbs: '', fat: '' })
  const [addSaving,   setAddSaving]  = useState(false)
  const [addEstimate, setAddEstimate] = useState(false)

  // Macro detail overlay
  const [macroMeal, setMacroMeal] = useState<Meal | null>(null)

  // Logging state
  const [toggling, setToggling] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [md, ld] = await Promise.all([
        api.getTodaysMeals(),
        api.getTodaysLogs().catch(() => ({ logs: [] })),
      ])
      const loggedIds = new Set<string>(((ld?.logs) || []).map((l: any) => l.mealId).filter(Boolean))
      const rawMeals: any[] = md?.meals || []
      const meals: Meal[] = rawMeals.map((m: any) => ({
        id: m.id,
        time: m.timeHHMM,
        name: m.mealName,
        mealType: m.mealType || 'other',
        // planned = never overwritten baseline; actual = current value after edits
        kcal:       Math.round((m.plannedCalories ?? m.calories) || 0),
        actualKcal: Math.round(m.calories || 0),
        protein: Math.round((m.plannedProteinG ?? m.proteinG) || 0),
        carbsG:  Math.round((m.plannedCarbsG   ?? m.carbsG  ) || 0),
        fatG:    Math.round((m.plannedFatG     ?? m.fatG    ) || 0),
        fiberG:  Math.round(m.fiberG || 0),
        done: loggedIds.has(m.id),
        originalName: (m.originalMealName && m.originalMealName !== m.mealName)
          ? m.originalMealName : undefined,
      }))
      const hasPlan = md?.hasPlan ?? meals.length > 0
      if (md?.planId) setActivePlanId(md.planId)
      if (hasPlan && meals.length > 0) {
        setDietChart({
          fileName: md?.dayName ? `Your plan · ${md.dayName}` : 'Your active plan',
          uploadedAt: new Date().toISOString(),
          meals,
        })
        setTodayMeals(meals)
      }
    } catch {}
  }, [user])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    loadData().finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const estimateAdd = async () => {
    if (!addForm.name.trim() || addEstimate) return
    setAddEstimate(true)
    try {
      const res = await api.estimateMeal(addForm.name.trim())
      const d = res?.data || {}
      setAddForm(f => ({ ...f, kcal: d.calories != null ? String(d.calories) : f.kcal, protein: d.proteinG != null ? String(d.proteinG) : f.protein, carbs: d.carbsG != null ? String(d.carbsG) : f.carbs, fat: d.fatG != null ? String(d.fatG) : f.fat }))
    } catch {} finally { setAddEstimate(false) }
  }

  const addMeal = async () => {
    if (!activePlanId || !addForm.name.trim() || addSaving) return
    if (!addForm.time.match(/^\d{2}:\d{2}$/)) { alert('Use HH:MM time format e.g. 08:30'); return }
    setAddSaving(true)
    try {
      await (api as any).addMealToPlan(activePlanId, {
        mealName: addForm.name.trim(),
        mealType: addForm.mealType,
        timeHHMM: addForm.time,
        calories: addForm.kcal ? parseFloat(addForm.kcal) : null,
        proteinG: addForm.protein ? parseFloat(addForm.protein) : null,
        carbsG:   addForm.carbs ? parseFloat(addForm.carbs) : null,
        fatG:     addForm.fat ? parseFloat(addForm.fat) : null,
      })
      setAddModal(false)
      setAddForm({ name: '', mealType: 'breakfast', time: '08:00', kcal: '', protein: '', carbs: '', fat: '' })
      await loadData()
    } catch (e: any) { alert(e?.message || 'Failed to add meal') } finally { setAddSaving(false) }
  }

  const toggleMeal = useCallback(async (meal: Meal) => {
    if (!meal.id || toggling) return
    setToggling(meal.id)
    // Optimistic update
    setTodayMeals(prev => prev.map(m => m.id === meal.id ? { ...m, done: !m.done } : m))
    try {
      const payload: any = { mealId: meal.id, mealName: meal.name, mealType: meal.mealType }
      if (meal.kcal)    payload.calories = meal.kcal
      if (meal.protein) payload.proteinG = meal.protein
      if (meal.carbsG)  payload.carbsG   = meal.carbsG
      if (meal.fatG)    payload.fatG     = meal.fatG
      await api.toggleLog(payload)
    } catch {
      // Rollback on error
      setTodayMeals(prev => prev.map(m => m.id === meal.id ? { ...m, done: !m.done } : m))
    } finally { setToggling(null) }
  }, [toggling])

  const openEdit = (meal: Meal) => {
    setEditMeal(meal)
    setEditForm({ name: meal.name, time: meal.time, kcal: meal.kcal ? String(meal.kcal) : '', protein: meal.protein ? String(meal.protein) : '', carbs: meal.carbsG ? String(meal.carbsG) : '', fat: meal.fatG ? String(meal.fatG) : '' })
  }

  const estimateMacros = async () => {
    if (!editForm.name.trim() || estimating) return
    setEstimating(true)
    try {
      const res = await (api as any).estimateMeal?.(editForm.name.trim())
      const d = res?.data || {}
      setEditForm(f => ({ ...f, kcal: d.calories != null ? String(d.calories) : f.kcal, protein: d.proteinG != null ? String(d.proteinG) : f.protein, carbs: d.carbsG != null ? String(d.carbsG) : f.carbs, fat: d.fatG != null ? String(d.fatG) : f.fat }))
    } catch {} finally { setEstimating(false) }
  }

  const saveEdit = async () => {
    if (!editMeal?.id || editSaving) return
    setEditSaving(true)
    try {
      await api.updateMeal(editMeal.id, {
        mealName: editForm.name.trim() || editMeal.name,
        timeHHMM: editForm.time.trim() || editMeal.time,
        calories: parseFloat(editForm.kcal) || null,
        proteinG: parseFloat(editForm.protein) || null,
        carbsG:   parseFloat(editForm.carbs) || null,
        fatG:     parseFloat(editForm.fat) || null,
      })
      await loadData()
      setEditMeal(null)
    } catch {} finally { setEditSaving(false) }
  }

  if (!user || !loaded) return null

  // ── Compute stats ──
  const doneMeals   = todayMeals.filter(m => m.done)
  const totalKcal   = todayMeals.reduce((a, m) => a + m.kcal,       0) // planned target
  const doneKcal    = doneMeals.reduce( (a, m) => a + m.actualKcal, 0) // actual consumed
  const totalProt   = todayMeals.reduce((a, m) => a + m.protein, 0)
  const doneProt    = doneMeals.reduce( (a, m) => a + m.protein, 0)
  const totalCarbs  = todayMeals.reduce((a, m) => a + m.carbsG,  0)
  const doneCarbs   = doneMeals.reduce( (a, m) => a + m.carbsG,  0)
  const totalFat    = todayMeals.reduce((a, m) => a + m.fatG,    0)
  const doneFat     = doneMeals.reduce( (a, m) => a + m.fatG,    0)
  const totalFiber  = todayMeals.reduce((a, m) => a + m.fiberG,  0)
  const doneFiber   = doneMeals.reduce( (a, m) => a + m.fiberG,  0)
  const mealScore   = todayMeals.length > 0
    ? Math.round((doneMeals.length / todayMeals.length) * 100) : 0

  // Group by section
  const grouped: Record<string, Meal[]> = {}
  todayMeals.forEach(m => {
    const sec = getSec(m)
    if (!grouped[sec]) grouped[sec] = []
    grouped[sec].push(m)
  })
  const orderedSections = SECTION_ORDER.filter(s => grouped[s]?.length > 0)

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
              Your nutrition analytics will appear here once you upload your diet chart and start logging your meals. Upload your chart or let your guardian build one to get started!
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
            <div style={{ display: 'flex', gap: 10 }}>
              {activePlanId && (
                <button
                  onClick={() => setAddModal(true)}
                  style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 10, color: '#052e16', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                >
                  + Add Meal
                </button>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '-30px auto 0', padding: '0 48px 60px' }}>

        {/* Today's Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Meals Logged',   value: `${doneMeals.length}/${todayMeals.length}`, icon: '🍽️', color: '#f0fdf4', ac: '#16a34a' },
            { label: 'Calories Eaten', value: totalKcal > 0 ? `${doneKcal}/${totalKcal}` : '–', icon: '🔥', color: '#fff7ed', ac: '#f97316' },
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

          {/* Today's Meal Log — Grouped by section */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 700, color: '#052e16' }}>Today's Meal Log</div>
              <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, fontFamily: FONT }}>{doneMeals.length}/{todayMeals.length} done</span>
            </div>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, fontFamily: FONT }}>
              Tap ✓ to log a meal, 📊 for macros, ✏️ to edit.
            </p>

            {todayMeals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🍽️</div>
                <p style={{ fontSize: 14, color: '#9ca3af', fontFamily: FONT }}>No meals planned yet. Upload a diet chart from your dashboard.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {orderedSections.map(sec => {
                  const info = SECTION_LABELS[sec] || { label: sec, emoji: '🍴' }
                  return (
                    <div key={sec}>
                      {/* Section header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{info.emoji}</span>
                        <span style={{ fontFamily: FONT_SYNE, fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8 }}>{info.label}</span>
                        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>
                          {grouped[sec].filter(m => m.done).length}/{grouped[sec].length}
                        </span>
                      </div>
                      {/* Meals in this section */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {grouped[sec].map((m, i) => (
                          <div key={m.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: m.done ? '#f0fdf4' : '#f9fafb', border: `1.5px solid ${m.done ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 14, padding: '11px 14px' }}>
                            {/* Toggle button */}
                            <button
                              onClick={() => toggleMeal(m)}
                              disabled={!m.id || toggling === m.id}
                              title={m.done ? 'Mark as undone' : 'Log this meal'}
                              style={{ width: 30, height: 30, borderRadius: '50%', background: m.done ? GREEN : '#e5e7eb', border: 'none', color: '#fff', fontSize: 13, cursor: m.id ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s ease' }}
                            >
                              {toggling === m.id ? '…' : m.done ? '✓' : '○'}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: m.done ? GREEN : '#9ca3af', fontWeight: 600, fontFamily: FONT }}>{m.time}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <div style={{ fontSize: 14, color: '#052e16', fontWeight: 600, fontFamily: FONT }}>{m.name}</div>
                                {m.originalName && (
                                  <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', fontStyle: 'italic' }}>was: {m.originalName}</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: '#6b7280', fontFamily: FONT }}>
                                  {m.actualKcal !== m.kcal ? `${m.actualKcal} kcal` : `${m.kcal} kcal`} · {m.protein}g P · {m.carbsG}g C · {m.fatG}g F{m.fiberG > 0 ? ` · ${m.fiberG}g Fiber` : ''}
                                </span>
                                {(() => {
                                  const delta = m.actualKcal - m.kcal
                                  if (m.kcal === 0 || Math.abs(delta) < 20) return m.kcal > 0 ? <span style={{ fontSize: 10, color: GREEN }}>🟢</span> : null
                                  const over = delta > 0
                                  return (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: over ? '#ea580c' : '#2563eb', background: over ? '#fff7ed' : '#eff6ff', border: `1px solid ${over ? '#fed7aa' : '#bfdbfe'}`, borderRadius: 6, padding: '1px 6px' }}>
                                      {over ? '🔺' : '🔻'} {over ? '+' : ''}{delta} vs plan
                                    </span>
                                  )
                                })()}
                              </div>
                            </div>
                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                              {m.id && (
                                <>
                                  <button onClick={() => setMacroMeal(m)} title="Macro detail" style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</button>
                                  <button onClick={() => openEdit(m)} title="Edit meal" style={{ width: 28, height: 28, borderRadius: 8, background: '#fdf4ff', border: '1px solid #e9d5ff', color: '#a855f7', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                                  <button onClick={() => setRecipeMeal({ id: m.id!, name: m.name })} title="View recipe" style={{ width: 28, height: 28, borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa', color: '#f97316', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📖</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
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
                  { label: 'Calories (eaten vs plan)', done: doneKcal,  total: totalKcal,  unit: 'kcal', color: '#f97316' },
                  { label: 'Protein',  done: doneProt,  total: totalProt,  unit: 'g',    color: GREEN },
                  { label: 'Carbs',    done: doneCarbs, total: totalCarbs, unit: 'g',    color: '#f59e0b' },
                  { label: 'Fat',      done: doneFat,   total: totalFat,   unit: 'g',    color: '#ec4899' },
                  { label: 'Fiber',    done: doneFiber, total: totalFiber, unit: 'g',    color: '#3b82f6' },
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
                <div style={{ fontSize: 13, color: '#374151', fontFamily: FONT }}>
                  {m.actualKcal !== m.kcal
                    ? <span>{m.actualKcal} <span style={{ color: '#9ca3af', fontSize: 11 }}>/{m.kcal} plan</span></span>
                    : <span>{m.kcal}</span>} kcal
                </div>
                <div style={{ fontSize: 13, color: '#374151', fontFamily: FONT }}>{m.protein}g</div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: m.done ? '#16a34a' : '#9ca3af', background: m.done ? '#dcfce7' : '#f3f4f6', padding: '3px 10px', borderRadius: 100, fontFamily: FONT }}>
                    {m.done ? '✓ Logged' : '○ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining meals reminder */}
          {doneMeals.length < todayMeals.length && (
            <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 2 }}>
                  {todayMeals.length - doneMeals.length} meal{todayMeals.length - doneMeals.length > 1 ? 's' : ''} left to log
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', fontFamily: FONT }}>Tap ✓ on any meal above to log it directly.</p>
              </div>
              <div style={{ fontSize: 26 }}>🍽️</div>
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

      {/* ── Macro Detail Overlay ── */}
      {macroMeal && (
        <div onClick={() => setMacroMeal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: DARK }}>{macroMeal.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{macroMeal.time} · {(SECTION_LABELS[macroMeal.mealType] || SECTION_LABELS.other).label}</div>
              </div>
              <button onClick={() => setMacroMeal(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Macro rings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Calories', value: macroMeal.kcal, unit: 'kcal', color: '#f97316', bg: '#fff7ed' },
                { label: 'Protein',  value: macroMeal.protein, unit: 'g', color: GREEN,      bg: '#f0fdf4' },
                { label: 'Carbs',    value: macroMeal.carbsG, unit: 'g', color: '#f59e0b',   bg: '#fffbeb' },
                { label: 'Fat',      value: macroMeal.fatG,   unit: 'g', color: '#ec4899',   bg: '#fdf2f8' },
              ].map(n => (
                <div key={n.label} style={{ background: n.bg, borderRadius: 16, padding: '16px 10px', textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: n.color }}>{n.value}</div>
                  <div style={{ fontSize: 10, color: n.color, fontWeight: 600, marginTop: 1 }}>{n.unit}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{n.label}</div>
                </div>
              ))}
            </div>

            {/* Macro proportion bar */}
            {(() => {
              const totalCal = (macroMeal.protein * 4) + (macroMeal.carbsG * 4) + (macroMeal.fatG * 9)
              if (totalCal === 0) return null
              const pPct = Math.round((macroMeal.protein * 4 / totalCal) * 100)
              const cPct = Math.round((macroMeal.carbsG  * 4 / totalCal) * 100)
              const fPct = 100 - pPct - cPct
              return (
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>Calorie Breakdown</div>
                  <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${pPct}%`, background: GREEN }} />
                    <div style={{ width: `${cPct}%`, background: '#f59e0b' }} />
                    <div style={{ width: `${fPct}%`, background: '#ec4899' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[{ label: `Protein ${pPct}%`, color: GREEN }, { label: `Carbs ${cPct}%`, color: '#f59e0b' }, { label: `Fat ${fPct}%`, color: '#ec4899' }].map(l => (
                      <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                        <span style={{ fontSize: 11, color: '#6b7280', fontFamily: FONT }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={() => { setMacroMeal(null); openEdit(macroMeal) }} style={{ flex: 1, padding: '10px', background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 10, color: '#a855f7', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>✏️ Edit Meal</button>
              <button onClick={() => setMacroMeal(null)} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, color: '#6b7280', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Meal Modal ── */}
      {editMeal && (
        <div onClick={() => setEditMeal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: DARK }}>Edit Meal</div>
              <button onClick={() => setEditMeal(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name + AI estimate button */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Meal Name</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontFamily: FONT, outline: 'none', color: DARK }}
                    onFocus={e => (e.target.style.borderColor = GREEN)}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  <button
                    onClick={estimateMacros}
                    disabled={estimating || !editForm.name.trim()}
                    title="Use AI to estimate macros"
                    style={{ padding: '10px 14px', background: estimating ? '#f0fdf4' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: estimating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {estimating ? '…' : '✨ AI Estimate'}
                  </button>
                </div>
                {estimating && <p style={{ fontSize: 11, color: GREEN, marginTop: 4 }}>Estimating macros with AI…</p>}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Time</label>
                  <input type="time" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontFamily: FONT, outline: 'none', color: DARK, boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = GREEN)} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Calories (kcal)</label>
                  <input type="number" value={editForm.kcal} onChange={e => setEditForm(f => ({ ...f, kcal: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontFamily: FONT, outline: 'none', color: DARK, boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = '#f97316')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'Protein (g)', key: 'protein' as const, color: GREEN },
                  { label: 'Carbs (g)',   key: 'carbs'   as const, color: '#f59e0b' },
                  { label: 'Fat (g)',     key: 'fat'     as const, color: '#ec4899' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type="number" value={editForm[f.key]} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontFamily: FONT, outline: 'none', color: DARK, boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = f.color)} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={saveEdit} disabled={editSaving} style={{ flex: 1, padding: '12px', background: editSaving ? '#d1fae5' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: editSaving ? 'not-allowed' : 'pointer', fontFamily: FONT }}>
                {editSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setEditMeal(null)} style={{ padding: '12px 20px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, color: '#6b7280', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
