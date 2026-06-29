'use client'

import { useState, CSSProperties } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const GENDERS  = ['male', 'female', 'other']
const GOALS    = [{ v: 'lose', label: 'Fat Loss' }, { v: 'recomp', label: 'Lean & Toned' }, { v: 'gain', label: 'Muscle Gain' }, { v: 'maintain', label: 'Maintain' }]
const ACTIVITY = [
  { v: 'sedentary', label: 'Sedentary', hint: 'Little/no exercise' },
  { v: 'light', label: 'Lightly active', hint: '1–3 days/week' },
  { v: 'moderate', label: 'Moderately active', hint: '3–5 days/week' },
  { v: 'active', label: 'Active', hint: '6–7 days/week' },
  { v: 'very_active', label: 'Very active', hint: 'Hard daily / physical job' },
]
const DIET_TYPES = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain']
const CUISINES   = ['North Indian', 'South Indian', 'Continental', 'Mediterranean', 'Pan-Asian', 'Middle Eastern', 'Anything']
const CONDITIONS = ['Diabetes', 'PCOS / PCOD', 'Thyroid', 'Hypertension', 'High cholesterol', 'Fatty liver', 'Gut / acidity', 'Gluten-free', 'Lactose intolerance', 'Anemia']
const TRAININGS  = [{ v: 'none', label: 'No workouts' }, { v: 'gym', label: 'Gym' }, { v: 'cardio', label: 'Cardio' }, { v: 'sport', label: 'Sport' }, { v: 'walk', label: 'Walking' }, { v: 'yoga', label: 'Yoga' }]
// 48 half-hour slots across the full day: "12:00 AM" … "11:30 PM".
const TIME_OPTIONS: string[] = (() => {
  const out: string[] = []
  for (let m = 0; m < 24 * 60; m += 30) {
    const h24 = Math.floor(m / 60)
    const mm = m % 60 === 0 ? '00' : '30'
    const ampm = h24 < 12 ? 'AM' : 'PM'
    let h12 = h24 % 12; if (h12 === 0) h12 = 12
    out.push(`${h12}:${mm} ${ampm}`)
  }
  return out
})()
const timeToMin = (s: string): number => {
  const m = String(s).trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1], 10) % 12
  if (/PM/i.test(m[3])) h += 12
  return h * 60 + parseInt(m[2], 10)
}
// Minutes awake (wake → sleep), wrapping past midnight for night owls.
const awakeMinutes = (wake: string, sleep: string): number =>
  (((timeToMin(sleep) - timeToMin(wake)) % 1440) + 1440) % 1440
const MIN_AWAKE_MIN = 6 * 60

const label: CSSProperties = { fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', margin: '18px 0 8px', fontFamily: FONT }
const inputBox: CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 15, color: '#111827', background: '#f9fafb', outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} style={{ padding: '9px 14px', borderRadius: 100, cursor: 'pointer', border: `1.5px solid ${active ? '#7c3aed' : '#e5e7eb'}`, background: active ? '#f5f3ff' : '#f9fafb', fontSize: 13, fontWeight: 600, color: active ? '#7c3aed' : '#6b7280', fontFamily: FONT, transition: 'all 0.15s ease' }}>
      {children}
    </div>
  )
}

export default function GenerateDietWizard({ guardianName, profile, onClose }: { guardianName: string; profile?: any; onClose: () => void }) {
  const [step, setStep] = useState(0) // 0,1,2 input · 3 generating · 4 review
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  // Step 0 — about you
  const [age, setAge]           = useState(profile?.age || '')
  const [gender, setGender]     = useState('male')
  const [height, setHeight]     = useState(profile?.height || '')
  const [weight, setWeight]     = useState(profile?.weight || '')
  const [goal, setGoal]         = useState(profile?.goal && ['lose', 'recomp', 'gain', 'maintain'].includes(profile.goal) ? profile.goal : 'recomp')
  const [target, setTarget]     = useState('')
  const [activity, setActivity] = useState(profile?.activity && ACTIVITY.some(a => a.v === profile.activity) ? profile.activity : 'light')

  // Step 1 — routine & health
  const [mealsChoice, setMealsChoice] = useState<string>('5') // '3'|'4'|'5'|'6'|'auto'|'other'
  const [mealsOther, setMealsOther]   = useState('')
  const [wake, setWake]         = useState('6:30 AM')
  const [sleep, setSleep]       = useState('10:30 PM')
  const [conditions, setConds]  = useState<string[]>([])
  const [otherOn, setOtherOn]   = useState(false)
  const [otherText, setOther]   = useState('')
  const [allergies, setAllerg]  = useState('')
  const [reportSoon, setReport] = useState(false)

  // Step 2 — food & training
  const [dietType, setDietType] = useState('Vegetarian')
  const [cuisines, setCuisines] = useState<string[]>(['South Indian'])
  const [customCuisine, setCC]  = useState('')
  const [training, setTraining] = useState('none')
  const [trainTime, setTrainT]  = useState('morning')
  const [notes, setNotes]       = useState('')

  const toggle = (arr: string[], set: (a: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])

  // null = let the guardian decide; otherwise a clamped 2–8 count.
  const resolveMeals = (): number | null => {
    if (mealsChoice === 'auto') return null
    if (mealsChoice === 'other') { const n = parseInt(mealsOther, 10); return isNaN(n) ? null : Math.max(2, Math.min(8, n)) }
    const n = parseInt(mealsChoice, 10); return isNaN(n) ? null : n
  }
  const mealsDisplay = (() => { const r = resolveMeals(); return r == null ? 'the right number of' : String(r) })()

  const validate0 = () => {
    const a = parseInt(String(age)), h = parseFloat(String(height)), w = parseFloat(String(weight))
    if (!(a >= 10 && a <= 100)) return 'Enter a valid age (10–100).'
    if (!(h >= 100 && h <= 250)) return 'Enter a valid height in cm.'
    if (!(w >= 25 && w <= 300)) return 'Enter a valid weight in kg.'
    return ''
  }

  const next = () => {
    if (step === 0) { const e = validate0(); if (e) { setError(e); return } }
    if (step === 1 && awakeMinutes(wake, sleep) < MIN_AWAKE_MIN) {
      setError(`Please keep at least 6 hours between your wake-up and sleep times so ${guardianName} can space your meals healthily.`)
      return
    }
    setError('')
    if (step < 2) { setStep(step + 1); return }
    generate()
  }

  const generate = async () => {
    setStep(3); setError('')
    try {
      const dayPref = dietType === 'Non-Vegetarian' ? 'nonveg' : 'veg'
      const cuisineList = [...cuisines, ...(customCuisine.trim() ? [customCuisine.trim()] : [])]
      const conds = [...conditions, ...(otherOn ? otherText.split(',').map(s => s.trim()).filter(Boolean) : [])]
      const payload = {
        age: parseInt(String(age)),
        gender,
        heightCm: parseFloat(String(height)),
        weightKg: parseFloat(String(weight)),
        goal,
        targetWeightKg: parseFloat(String(target)) || null,
        activityLevel: activity,
        healthConditions: conds,
        allergies: allergies.trim() || null,
        dietType,
        cuisine: cuisineList.length ? cuisineList.join(', ') : 'Anything',
        dayPrefs: Array(7).fill(dayPref),
        workoutTimes: Array(7).fill(training === 'none' ? 'none' : trainTime),
        activityTypes: Array(7).fill(training),
        liquidTypes: Array(7).fill('veg'),
        mealsPerDay: resolveMeals(),
        wakeTime: wake,
        sleepTime: sleep,
        customPrompt: notes.trim() || null,
      }
      const res = await api.generateDiet(payload)
      const dp: any = res?.dietPlan
      setResult({
        planId: dp?.id,
        cal: res?.dailyCalorieTarget || 0,
        meals: (dp?.meals || []).map((m: any) => ({ time: m.timeHHMM, name: m.mealName, kcal: m.calories || 0, protein: m.proteinG || 0 })),
      })
      setStep(4)
    } catch (e: any) {
      setError(e?.message || 'Could not generate your plan. Please try again.')
      setStep(2)
    }
  }

  const activate = async () => {
    if (!result?.planId) return
    setStep(3)
    try { await api.activatePlan(result.planId); api.clearCache?.(); window.location.reload() }
    catch (e: any) { setError(e?.message || 'Could not activate. Please try again.'); setStep(4) }
  }

  const steps = ['About you', 'Routine & health', 'Food & training']
  const busy = step === 3

  return (
    <>
      <div onClick={!busy ? onClose : undefined} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 560, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 19, fontWeight: 800, color: '#fff' }}>✨ Generate with {guardianName}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{step <= 2 ? steps[step] : step === 3 ? `${guardianName} is building your plan` : 'Your plan is ready'}</div>
            </div>
            {!busy && <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>×</button>}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: (step > 2 ? 2 : step) >= i ? '#e9d5ff' : 'rgba(255,255,255,0.25)' }} />)}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '8px 24px 24px', flex: 1 }}>
          {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 14px', marginTop: 16 }}><p style={{ fontSize: 13, color: '#e11d48', fontWeight: 500 }}>⚠️ {error}</p></div>}

          {/* STEP 0 — About you */}
          {step === 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={label}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="28" style={inputBox} /></div>
                <div><label style={label}>Activity</label>
                  <select value={activity} onChange={e => setActivity(e.target.value)} style={{ ...inputBox, cursor: 'pointer' }}>
                    {ACTIVITY.map(a => <option key={a.v} value={a.v}>{a.label}</option>)}
                  </select>
                </div>
                <div><label style={label}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" style={inputBox} /></div>
                <div><label style={label}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="72" style={inputBox} /></div>
              </div>
              <label style={label}>Gender</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {GENDERS.map(g => <div key={g} style={{ flex: 1 }}><Chip active={gender === g} onClick={() => setGender(g)}><span style={{ textTransform: 'capitalize' }}>{g}</span></Chip></div>)}
              </div>
              <label style={label}>Goal</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {GOALS.map(g => <Chip key={g.v} active={goal === g.v} onClick={() => setGoal(g.v)}>{g.label}</Chip>)}
              </div>
              <label style={label}>Target weight (kg) <span style={{ color: '#9ca3af', fontWeight: 500 }}>· optional</span></label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="optional" style={inputBox} />
            </>
          )}

          {/* STEP 1 — Routine & health */}
          {step === 1 && (
            <>
              <label style={label}>How many meals per day?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {['3', '4', '5', '6'].map(n => <Chip key={n} active={mealsChoice === n} onClick={() => setMealsChoice(n)}>{n} meals</Chip>)}
                <Chip active={mealsChoice === 'auto'} onClick={() => setMealsChoice('auto')}>Let {guardianName} decide</Chip>
                <Chip active={mealsChoice === 'other'} onClick={() => setMealsChoice('other')}>Other</Chip>
                {mealsChoice === 'other' && (
                  <input
                    type="number" min={2} max={8} value={mealsOther}
                    onChange={e => setMealsOther(e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
                    placeholder="e.g. 7"
                    style={{ ...inputBox, width: 90, padding: '8px 12px' }}
                  />
                )}
              </div>
              {mealsChoice === 'auto' && <p style={{ fontSize: 12.5, color: '#6b7280', margin: '8px 0 0', fontFamily: FONT }}>{guardianName} will choose the ideal number of meals from your goal, routine and timings.</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={label}>⏰ Wake-up time</label>
                  <select value={wake} onChange={e => setWake(e.target.value)} style={{ ...inputBox, cursor: 'pointer' }}>{TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <div><label style={label}>🌙 Sleep time</label>
                  <select value={sleep} onChange={e => setSleep(e.target.value)} style={{ ...inputBox, cursor: 'pointer' }}>{TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
              </div>
              {awakeMinutes(wake, sleep) < MIN_AWAKE_MIN && (
                <p style={{ fontSize: 12.5, color: '#d97706', margin: '8px 0 0', fontWeight: 600, fontFamily: FONT }}>
                  ⚠️ Please keep at least 6 hours between wake-up and sleep so {guardianName} can space your meals healthily.
                </p>
              )}
              <label style={label}>Health conditions <span style={{ color: '#9ca3af', fontWeight: 500 }}>· optional</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CONDITIONS.map(c => <Chip key={c} active={conditions.includes(c)} onClick={() => toggle(conditions, setConds, c)}>{conditions.includes(c) ? '✓ ' : ''}{c}</Chip>)}
                <Chip active={otherOn} onClick={() => setOtherOn(o => !o)}>Other</Chip>
              </div>
              {otherOn && <input value={otherText} onChange={e => setOther(e.target.value)} placeholder="Type condition(s), comma separated" style={{ ...inputBox, marginTop: 10 }} />}
              <div onClick={() => setReport(v => !v)} style={{ border: '1.5px dashed #c4b5fd', borderRadius: 12, padding: '14px 16px', background: '#faf5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                <span style={{ fontSize: 22 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6d28d9' }}>Upload a health report</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>PDF or Word — {guardianName} will tailor your plan to it</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '4px 10px' }}>In app</span>
              </div>
              {reportSoon && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginTop: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📱</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 3 }}>Available in the MealWarden app</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>Upload your blood reports, BMI charts or doctor&apos;s notes in the app and {guardianName} will read them and automatically select the right conditions below. For now, pick conditions manually.</div>
                  </div>
                </div>
              )}
              <label style={label}>Allergies / foods to avoid <span style={{ color: '#9ca3af', fontWeight: 500 }}>· optional</span></label>
              <input value={allergies} onChange={e => setAllerg(e.target.value)} placeholder="e.g. peanuts, lactose, no mushrooms" style={inputBox} />
            </>
          )}

          {/* STEP 2 — Food & training */}
          {step === 2 && (
            <>
              <label style={label}>What do you eat?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIET_TYPES.map(d => <Chip key={d} active={dietType === d} onClick={() => setDietType(d)}>{d}</Chip>)}
              </div>
              <label style={label}>Cuisine <span style={{ color: '#9ca3af', fontWeight: 500 }}>· pick one or more</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CUISINES.map(c => <Chip key={c} active={cuisines.includes(c)} onClick={() => toggle(cuisines, setCuisines, c)}>{cuisines.includes(c) ? '✓ ' : ''}{c}</Chip>)}
              </div>
              <input value={customCuisine} onChange={e => setCC(e.target.value)} placeholder="Add another cuisine (optional)" style={{ ...inputBox, marginTop: 10 }} />
              <label style={label}>Do you work out?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TRAININGS.map(tr => <Chip key={tr.v} active={training === tr.v} onClick={() => setTraining(tr.v)}>{tr.label}</Chip>)}
              </div>
              {training !== 'none' && (
                <>
                  <label style={label}>When do you train?</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['morning', 'evening', 'both'].map(tm => <div key={tm} style={{ flex: 1 }}><Chip active={trainTime === tm} onClick={() => setTrainT(tm)}><span style={{ textTransform: 'capitalize', display: 'block', textAlign: 'center' }}>{tm}</span></Chip></div>)}
                  </div>
                </>
              )}
              <label style={label}>Anything else for {guardianName}? <span style={{ color: '#9ca3af', fontWeight: 500 }}>· optional</span></label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. high protein, no dinner carbs, love paneer, intermittent fasting…" style={{ ...inputBox, minHeight: 70, resize: 'vertical' }} />
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 14px', marginTop: 16, display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 18 }}>✨</span>
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0 }}>{guardianName} will size your calories &amp; macros, then build {mealsDisplay} meals between {wake} and {sleep} — respecting your diet, cuisine, training and conditions.</p>
              </div>
            </>
          )}

          {/* STEP 3 — Generating */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🤖</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>{guardianName} is building your plan…</div>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Sizing calories &amp; macros and crafting {mealsDisplay} meals for your day. This takes ~20–30 seconds.</p>
              <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: '75%', background: 'linear-gradient(to right,#7c3aed,#a855f7)', borderRadius: 4 }} /></div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && result && (
            <>
              <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #ddd6fe', borderRadius: 14, padding: '16px 18px', margin: '16px 0 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>DAILY TARGET</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 30, fontWeight: 800, color: '#052e16' }}>{result.cal}<span style={{ fontSize: 15, color: '#9ca3af' }}> kcal</span></div>
              </div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>Day 1 preview</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.meals.slice(0, 12).map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '11px 14px' }}>
                    <div style={{ width: 54, fontSize: 12, fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>{m.time}</div>
                    <div style={{ flex: 1, fontSize: 13.5, color: '#052e16', fontWeight: 500 }}>{m.name}</div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>{m.kcal}</div><div style={{ fontSize: 9, color: '#9ca3af' }}>kcal</div></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {step !== 3 && (
          <div style={{ padding: '14px 24px', background: '#fff', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 12, flexShrink: 0 }}>
            <button onClick={step === 0 || step === 4 ? onClose : () => setStep(step - 1)} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>{step === 4 ? 'Close' : step === 0 ? 'Cancel' : '← Back'}</button>
            {step <= 2 && <button onClick={next} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}>{step < 2 ? 'Continue →' : `✨ Generate with ${guardianName}`}</button>}
            {step === 4 && <button onClick={activate} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>✅ Use this plan →</button>}
          </div>
        )}
      </div>
    </>
  )
}
