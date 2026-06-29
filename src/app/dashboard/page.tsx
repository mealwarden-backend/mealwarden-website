'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import GenerateDietWizard from '@/components/GenerateDietWizard'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

interface UserProfile {
  age: string
  weight: string
  height: string
  goal: string
  activity: string
  dietType: string
}

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

// ─── Edit Profile Modal ───────────────────────────────────
function EditProfileModal({
  profile, onClose, onSave, onReset,
}: {
  profile: UserProfile
  onClose: () => void
  onSave: (p: UserProfile) => void
  onReset: () => void
}) {
  const [form, setForm] = useState<UserProfile>({ ...profile })
  const [saved, setSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const goals = [
    { icon: '⚖️', label: 'Lose Weight',    value: 'lose' },
    { icon: '💪', label: 'Build Muscle',    value: 'muscle' },
    { icon: '🏃', label: 'Stay Healthy',    value: 'healthy' },
    { icon: '🎯', label: 'Maintain Weight', value: 'maintain' },
  ]
  const activities = [
    { icon: '🛋️', label: 'Sedentary',        sub: 'Little or no exercise',        value: 'sedentary' },
    { icon: '🚶', label: 'Lightly Active',    sub: 'Light exercise 1–3 days/week', value: 'light' },
    { icon: '🏋️', label: 'Moderately Active', sub: 'Moderate exercise 3–5 days',   value: 'moderate' },
    { icon: '🔥', label: 'Very Active',       sub: 'Hard exercise 6–7 days',        value: 'very' },
  ]
  const dietTypes = [
    { icon: '🥗', label: 'Vegetarian',  value: 'veg' },
    { icon: '🍗', label: 'Non-Veg',     value: 'nonveg' },
    { icon: '🌱', label: 'Vegan',       value: 'vegan' },
    { icon: '🥚', label: 'Eggetarian',  value: 'eggetarian' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box', fontFamily: FONT,
  }

  const handleSave = () => {
    onSave(form)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1400)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 540, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '22px 28px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>✏️ Edit Profile</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: FONT }}>Update your details anytime</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: FONT }}>×</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 28px', flex: 1, fontFamily: FONT }}>
          {saved && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✅</span>
              <span style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>Profile updated successfully!</span>
            </div>
          )}

          <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>Basic Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Age', key: 'age', placeholder: 'e.g. 28' },
              { label: 'Weight (kg)', key: 'weight', placeholder: 'e.g. 72' },
              { label: 'Height (cm)', key: 'height', placeholder: 'e.g. 175' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT }}>{f.label}</label>
                <input type="number" placeholder={f.placeholder} value={form[f.key as keyof UserProfile]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
          </div>

          <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>Your Goal</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
            {goals.map(g => (
              <div key={g.value} onClick={() => setForm({ ...form, goal: g.value })} style={{ padding: '14px 10px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', border: `2px solid ${form.goal === g.value ? '#16a34a' : '#e5e7eb'}`, background: form.goal === g.value ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{g.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: form.goal === g.value ? '#16a34a' : '#374151', fontFamily: FONT }}>{g.label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>Activity Level</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {activities.map(a => (
              <div key={a.value} onClick={() => setForm({ ...form, activity: a.value })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${form.activity === a.value ? '#16a34a' : '#e5e7eb'}`, background: form.activity === a.value ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.activity === a.value ? '#16a34a' : '#374151', fontFamily: FONT }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>{a.sub}</div>
                </div>
                {form.activity === a.value && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 11 }}>✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>Diet Preference</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
            {dietTypes.map(d => (
              <div key={d.value} onClick={() => setForm({ ...form, dietType: d.value })} style={{ padding: '14px 10px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', border: `2px solid ${form.dietType === d.value ? '#16a34a' : '#e5e7eb'}`, background: form.dietType === d.value ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{d.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: form.dietType === d.value ? '#16a34a' : '#374151', fontFamily: FONT }}>{d.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 16, padding: '20px' }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>⚠️ Danger Zone</div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.6, fontFamily: FONT }}>Resetting your profile will clear all your goals, activity settings, diet preferences, meal data and diet chart. This cannot be undone.</p>
            {!showResetConfirm ? (
              <button onClick={() => setShowResetConfirm(true)} style={{ padding: '10px 20px', background: '#fff', color: '#ef4444', border: '1.5px solid #fecdd3', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>🗑️ Reset My Profile</button>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #fecdd3', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 12, fontFamily: FONT }}>Are you sure? This will delete all your data.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
                  <button onClick={onReset} style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Yes, Reset Everything</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 28px', background: '#fff', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 12, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>Save Changes ✓</button>
        </div>
      </div>
    </>
  )
}

// ─── Onboarding Wizard ────────────────────────────────────
function OnboardingWizard({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({ age: '', weight: '', height: '', goal: '', activity: '', dietType: '' })

  const goals = [
    { icon: '⚖️', label: 'Lose Weight',    value: 'lose' },
    { icon: '💪', label: 'Build Muscle',    value: 'muscle' },
    { icon: '🏃', label: 'Stay Healthy',    value: 'healthy' },
    { icon: '🎯', label: 'Maintain Weight', value: 'maintain' },
  ]
  const activities = [
    { icon: '🛋️', label: 'Sedentary',        sub: 'Little or no exercise',        value: 'sedentary' },
    { icon: '🚶', label: 'Lightly Active',    sub: 'Light exercise 1–3 days/week', value: 'light' },
    { icon: '🏋️', label: 'Moderately Active', sub: 'Moderate exercise 3–5 days',   value: 'moderate' },
    { icon: '🔥', label: 'Very Active',       sub: 'Hard exercise 6–7 days',        value: 'very' },
  ]
  const dietTypes = [
    { icon: '🥗', label: 'Vegetarian',  value: 'veg' },
    { icon: '🍗', label: 'Non-Veg',     value: 'nonveg' },
    { icon: '🌱', label: 'Vegan',       value: 'vegan' },
    { icon: '🥚', label: 'Eggetarian',  value: 'eggetarian' },
  ]
  const steps = [
    { title: 'Basic Info',      subtitle: 'Help us personalize your guardian' },
    { title: 'Your Goal',       subtitle: 'What do you want to achieve?' },
    { title: 'Activity Level',  subtitle: 'How active are you?' },
    { title: 'Diet Preference', subtitle: 'What kind of food do you eat?' },
  ]

  const canNext = () => {
    if (step === 0) return profile.age && profile.weight && profile.height
    if (step === 1) return profile.goal
    if (step === 2) return profile.activity
    if (step === 3) return profile.dietType
    return false
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 15, color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box', fontFamily: FONT,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 60% at 20% 0%, #dcfce7 0%, #f0fdf4 40%, #ffffff 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ height: 4, background: '#f3f4f6' }}>
          <div style={{ height: '100%', width: `${((step + 1) / steps.length) * 100}%`, background: 'linear-gradient(to right,#16a34a,#4ade80)', transition: 'width 0.4s ease', borderRadius: 4 }} />
        </div>
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 18, color: '#fff' }}>MealWarden Setup</span>
          </div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{steps[step].title}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>{steps[step].subtitle}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: FONT }}>Step {step + 1} of {steps.length}</div>
        </div>
        <div style={{ padding: '28px 32px 32px', fontFamily: FONT }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Age', key: 'age', placeholder: 'e.g. 28' },
                { label: 'Current Weight (kg)', key: 'weight', placeholder: 'e.g. 72' },
                { label: 'Height (cm)', key: 'height', placeholder: 'e.g. 175' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>{f.label}</label>
                  <input type="number" placeholder={f.placeholder} value={profile[f.key as keyof UserProfile]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>
          )}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {goals.map(g => (
                <div key={g.value} onClick={() => setProfile({ ...profile, goal: g.value })} style={{ padding: '20px 16px', borderRadius: 16, cursor: 'pointer', textAlign: 'center', border: `2px solid ${profile.goal === g.value ? '#16a34a' : '#e5e7eb'}`, background: profile.goal === g.value ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{g.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: profile.goal === g.value ? '#16a34a' : '#374151', fontFamily: FONT }}>{g.label}</div>
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activities.map(a => (
                <div key={a.value} onClick={() => setProfile({ ...profile, activity: a.value })} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${profile.activity === a.value ? '#16a34a' : '#e5e7eb'}`, background: profile.activity === a.value ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: profile.activity === a.value ? '#16a34a' : '#374151', fontFamily: FONT }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontFamily: FONT }}>{a.sub}</div>
                  </div>
                  {profile.activity === a.value && (
                    <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 11 }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {dietTypes.map(d => (
                <div key={d.value} onClick={() => setProfile({ ...profile, dietType: d.value })} style={{ padding: '20px 16px', borderRadius: 16, cursor: 'pointer', textAlign: 'center', border: `2px solid ${profile.dietType === d.value ? '#16a34a' : '#e5e7eb'}`, background: profile.dietType === d.value ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{d.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: profile.dietType === d.value ? '#16a34a' : '#374151', fontFamily: FONT }}>{d.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>← Back</button>
            )}
            <button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else onComplete(profile) }} disabled={!canNext()} style={{ flex: 2, padding: '13px', background: canNext() ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#e5e7eb', color: canNext() ? '#fff' : '#9ca3af', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily: FONT, transition: 'all 0.3s ease' }}>
              {step < steps.length - 1 ? 'Continue →' : 'Set Up My Guardian 🛡️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Diet Generator Modal ──────────────────────────────
function AIDietGeneratorModal({
  profile, guardianName, onClose, onGenerated,
}: {
  profile: UserProfile
  guardianName: string
  onClose: () => void
  onGenerated: (chart: DietChart) => void
}) {
  const [step, setStep]                   = useState(0)
  const [generating, setGenerating]       = useState(false)
  const [error, setError]                 = useState('')
  const [generatedDiet, setGeneratedDiet] = useState<any>(null)
  const [form, setForm] = useState({ mealsPerDay: '5', wakeTime: '6:30 AM', sleepTime: '10:30 PM', allergies: '', gender: 'male', targetWeight: '', cuisine: 'Any' })
  const [conditions, setConditions] = useState<string[]>([])
  const [reportSoon, setReportSoon] = useState(false)
  const CONDITIONS = ['Diabetes', 'PCOS / PCOD', 'Thyroid', 'Hypertension', 'High cholesterol', 'Fatty liver', 'Gut / acidity', 'Gluten-free', 'Lactose intolerance']
  const CUISINES = ['Any', 'North Indian', 'South Indian', 'Continental', 'Mediterranean', 'Pan-Asian', 'Middle Eastern']
  const toggleCondition = (c: string) => setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const steps = [
    { title: 'Meal Preferences',          subtitle: 'Customize your diet plan' },
    { title: 'Generating Your Plan',      subtitle: `${guardianName} is building your chart` },
    { title: 'Your Diet Chart is Ready!', subtitle: 'Review before importing' },
  ]

  const handleGenerate = async () => {
    setStep(1); setGenerating(true); setError('')
    try {
      // Map the website's simple profile to the backend's generate schema.
      const goalMap: any = { lose: 'lose', muscle: 'gain', healthy: 'maintain', maintain: 'maintain' }
      const actMap: any = { sedentary: 'sedentary', light: 'light', moderate: 'moderate', very: 'very_active' }
      const dietMap: any = { veg: 'Vegetarian', nonveg: 'Non-Vegetarian', vegan: 'Vegan', eggetarian: 'Eggetarian' }
      const dayPref = profile.dietType === 'nonveg' ? 'nonveg' : 'veg'
      const payload = {
        age: parseInt(profile.age) || 30,
        gender: form.gender || 'other',
        heightCm: parseFloat(profile.height) || 170,
        weightKg: parseFloat(profile.weight) || 70,
        goal: goalMap[profile.goal] || 'maintain',
        targetWeightKg: parseFloat(form.targetWeight) || null,
        activityLevel: actMap[profile.activity] || 'light',
        dietType: dietMap[profile.dietType] || 'Vegetarian',
        cuisine: form.cuisine || 'Any',
        dayPrefs: Array(7).fill(dayPref),
        workoutTimes: Array(7).fill('none'),
        activityTypes: Array(7).fill('none'),
        liquidTypes: Array(7).fill('veg'),
        allergies: form.allergies || null,
        healthConditions: conditions,
        mealsPerDay: parseInt(form.mealsPerDay) || 5,
        wakeTime: form.wakeTime,
        sleepTime: form.sleepTime,
        customPrompt: null,
      }
      const res = await api.generateDiet(payload)
      const dp: any = res?.dietPlan
      const meals = (dp?.meals || []).map((m: any) => ({ time: m.timeHHMM, name: m.mealName, kcal: m.calories || 0, protein: m.proteinG || 0, foods: [] as string[], notes: '' }))
      const sum = (k: string) => meals.reduce((a: number, m: any) => a + (m[k] || 0), 0)
      setGeneratedDiet({
        planId: dp?.id,
        meals,
        totalCalories: res?.dailyCalorieTarget || sum('kcal'),
        totalProtein: sum('protein'),
        totalCarbs: (dp?.meals || []).reduce((a: number, m: any) => a + (m.carbsG || 0), 0),
        totalFat: (dp?.meals || []).reduce((a: number, m: any) => a + (m.fatG || 0), 0),
        tips: null, waterIntake: null,
      })
      setStep(2)
    } catch (e: any) {
      setError(e?.message || 'Could not generate your plan. Please try again.'); setStep(0)
    } finally { setGenerating(false) }
  }

  // Activate the generated plan on the backend so it shows up here AND in the app.
  const handleImport = async () => {
    if (!generatedDiet?.planId) return
    setGenerating(true)
    try {
      await api.activatePlan(generatedDiet.planId)
      api.clearCache?.()
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Could not activate the plan. Please try again.')
      setGenerating(false)
    }
  }

  return (
    <>
      <div onClick={!generating ? onClose : undefined} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 540, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', padding: '22px 26px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>🤖 {guardianName}&apos;s Diet Generator</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: FONT }}>{steps[step].subtitle}</div>
            </div>
            {!generating && <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: FONT }}>×</button>}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            {steps.map((_, i) => <div key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i <= step ? '#c4b5fd' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s ease' }} />)}
          </div>
        </div>

        {step === 0 && (
          <div style={{ overflowY: 'auto', padding: '24px 26px', flex: 1, fontFamily: FONT }}>
            {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}><p style={{ fontSize: 13, color: '#e11d48', fontWeight: 500, fontFamily: FONT }}>⚠️ {error}</p></div>}
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT }}>Using Your Profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[{ label: 'Age', value: `${profile.age}y` }, { label: 'Weight', value: `${profile.weight}kg` }, { label: 'Height', value: `${profile.height}cm` }].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2, fontFamily: FONT }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#052e16', fontFamily: FONT_SYNE }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Gender */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, fontFamily: FONT }}>Gender</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['male', 'female', 'other'].map(g => (
                    <div key={g} onClick={() => setForm({ ...form, gender: g })} style={{ flex: 1, padding: '11px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: `2px solid ${form.gender === g ? '#7c3aed' : '#e5e7eb'}`, background: form.gender === g ? '#f5f3ff' : '#f9fafb', transition: 'all 0.2s ease' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: form.gender === g ? '#7c3aed' : '#374151', textTransform: 'capitalize', fontFamily: FONT }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target weight + Cuisine */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, fontFamily: FONT }}>Target weight (kg)</label>
                  <input type="number" placeholder="optional" value={form.targetWeight} onChange={e => setForm({ ...form, targetWeight: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, fontFamily: FONT }}>Cuisine</label>
                  <select value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none', fontFamily: FONT, cursor: 'pointer' }}>
                    {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10, fontFamily: FONT }}>How many meals per day?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['3', '4', '5', '6'].map(n => (
                    <div key={n} onClick={() => setForm({ ...form, mealsPerDay: n })} style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', border: `2px solid ${form.mealsPerDay === n ? '#7c3aed' : '#e5e7eb'}`, background: form.mealsPerDay === n ? '#f5f3ff' : '#f9fafb', transition: 'all 0.2s ease' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: form.mealsPerDay === n ? '#7c3aed' : '#374151', fontFamily: FONT_SYNE }}>{n}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, fontFamily: FONT }}>meals</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: '⏰ Wake Up Time', key: 'wakeTime',  options: ['5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM'] },
                  { label: '🌙 Sleep Time',   key: 'sleepTime', options: ['9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM'] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>{f.label}</label>
                    <select value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none', fontFamily: FONT, cursor: 'pointer' }}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>Food Allergies or Items to Avoid (optional)</label>
                <input type="text" placeholder="e.g. peanuts, dairy, gluten..." value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }} />
              </div>
              {/* Health conditions + report upload */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10, fontFamily: FONT }}>Health conditions <span style={{ color: '#9ca3af', fontWeight: 500 }}>(optional)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {CONDITIONS.map(c => {
                    const on = conditions.includes(c)
                    return (
                      <div key={c} onClick={() => toggleCondition(c)} style={{ padding: '8px 14px', borderRadius: 100, cursor: 'pointer', border: `1.5px solid ${on ? '#7c3aed' : '#e5e7eb'}`, background: on ? '#f5f3ff' : '#f9fafb', fontSize: 12.5, fontWeight: 600, color: on ? '#7c3aed' : '#6b7280', fontFamily: FONT, transition: 'all 0.15s ease' }}>
                        {on ? '✓ ' : ''}{c}
                      </div>
                    )
                  })}
                </div>
                <div onClick={() => setReportSoon(v => !v)} style={{ border: '1.5px dashed #c4b5fd', borderRadius: 12, padding: '14px 16px', background: '#faf5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6d28d9', fontFamily: FONT }}>Upload a health report</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT }}>PDF or Word — your guardian will tailor the plan to your reports</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '4px 10px', whiteSpace: 'nowrap' }}>In app</span>
                </div>
                {reportSoon && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginTop: 8, display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: FONT }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>📱</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 3 }}>Available in the MealWarden app</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>Upload blood reports, BMI charts or doctor&apos;s notes in the app and your guardian reads them automatically, selecting the right conditions below. For now, pick conditions manually above.</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>✨</span>
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0, fontFamily: FONT }}>{guardianName} sizes your calories &amp; macros from your profile, then builds {form.mealsPerDay} meals between {form.wakeTime} and {form.sleepTime} — respecting your diet, cuisine and conditions.</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ padding: '60px 32px', textAlign: 'center', flex: 1, fontFamily: FONT }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🤖</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>{guardianName} is building your chart...</div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 32, fontFamily: FONT }}>Analyzing your profile, calculating your calorie needs, and creating a personalized meal plan just for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', maxWidth: 320, margin: '0 auto 32px' }}>
              {['📊 Calculating your TDEE & macros...', '🍽️ Selecting foods you love...', '⏰ Scheduling meals to your routine...', '✅ Finalizing your diet chart...'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', animation: 'dotBlink 1.4s ease-in-out infinite', animationDelay: `${i * 0.3}s`, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#374151', fontFamily: FONT }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(to right,#7c3aed,#a855f7)', borderRadius: 4, width: '70%' }} />
            </div>
          </div>
        )}

        {step === 2 && generatedDiet && (
          <div style={{ overflowY: 'auto', padding: '24px 26px', flex: 1, fontFamily: FONT }}>
            <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #ddd6fe', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 12, fontFamily: FONT }}>📊 Daily Nutrition Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { label: 'Calories', value: `${generatedDiet.totalCalories}`, unit: 'kcal', color: '#f97316' },
                  { label: 'Protein',  value: `${generatedDiet.totalProtein}`,  unit: 'g',    color: '#16a34a' },
                  { label: 'Carbs',    value: `${generatedDiet.totalCarbs}`,    unit: 'g',    color: '#3b82f6' },
                  { label: 'Fat',      value: `${generatedDiet.totalFat}`,      unit: 'g',    color: '#a855f7' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', background: '#fff', borderRadius: 10, padding: '10px 6px' }}>
                    <div style={{ fontSize: 9, color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, fontFamily: FONT }}>{s.label}</div>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#052e16' }}>{s.value}<span style={{ fontSize: 10, fontWeight: 500, fontFamily: FONT }}>{s.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 14 }}>Your Meal Plan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {generatedDiet.meals.map((m: any, i: number) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginBottom: 3, fontFamily: FONT }}>⏰ {m.time}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#052e16', fontFamily: FONT }}>{m.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', fontFamily: FONT }}>{m.kcal} kcal</div>
                      <div style={{ fontSize: 11, color: '#6b7280', fontFamily: FONT }}>{m.protein}g protein</div>
                    </div>
                  </div>
                  {m.foods && m.foods.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                      {m.foods.map((f: string, j: number) => <span key={j} style={{ fontSize: 11, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px', color: '#6b7280', fontFamily: FONT }}>{f}</span>)}
                    </div>
                  )}
                  {m.notes && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, fontStyle: 'italic', fontFamily: FONT }}>💡 {m.notes}</div>}
                </div>
              ))}
            </div>
            {generatedDiet.tips && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>💡 Nutrition Tips</div>
                {generatedDiet.tips.map((t: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5, fontFamily: FONT }}>{t}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 13, color: '#92400e', fontWeight: 600, fontFamily: FONT }}>💧 Water Intake: {generatedDiet.waterIntake}</div>
              </div>
            )}
            <button onClick={() => { setStep(0); setGeneratedDiet(null) }} style={{ width: '100%', padding: '11px', background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>🔄 Regenerate with Different Preferences</button>
          </div>
        )}

        {step !== 1 && (
          <div style={{ padding: '16px 26px', background: '#fff', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 12, flexShrink: 0 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
            {step === 0 && <button onClick={handleGenerate} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}>✨ Generate My Diet Chart →</button>}
            {step === 2 && <button onClick={handleImport} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>✅ Import This Diet Chart →</button>}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Diet Chart Upload Modal ──────────────────────────────
function DietChartUploadModal({
  onClose, onUpload, onAIGenerate, guardianName = 'Meenu',
}: {
  onClose: () => void
  onUpload: (chart: DietChart) => void
  onAIGenerate: () => void
  guardianName?: string
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 500, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#fff' }}>📸 Scan Diet Chart</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontFamily: FONT }}>Upload or photograph your dietitian's chart</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>×</button>
          </div>
        </div>
        <div style={{ padding: 24, fontFamily: FONT }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 18, marginBottom: 16, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>📲</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16', marginBottom: 4 }}>Upload a chart in the app</div>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0, fontFamily: FONT }}>Snap or upload your dietitian&apos;s chart (photo, PDF or handwriting) in the MealWarden app — your guardian reads it and it syncs here automatically. No plan yet? Generate one with {guardianName} right here.</p>
            </div>
          </div>
          <button onClick={onAIGenerate} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(168,85,247,0.3)' }}>✨ Generate Diet Chart with {guardianName}</button>
          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8, fontFamily: FONT }}>No dietitian needed · {guardianName} creates a personalized plan for you</p>
        </div>
      </div>
    </>
  )
}

// ─── Grocery List Modal — REAL DATA ──────────────────────
function GroceryListModal({ dietChart, onClose, onUpload }: { dietChart: DietChart | null; onClose: () => void; onUpload: () => void }) {
  const [groceryData, setGroceryData] = useState<any>(null)
  const [checked, setChecked]         = useState<Set<string>>(new Set())
  const [loading, setLoading]         = useState(false)

  // Fetch real grocery list from API on mount
  useEffect(() => {
    if (!dietChart) return
    setLoading(true)
    api.getGrocery()
      .then((d: any) => {
        setGroceryData(d)
        setChecked(new Set<string>(d?.checkedKeys || []))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dietChart])

  const categories: any[] = groceryData?.categories || []
  const totalItems = categories.reduce((s: number, c: any) => s + (c.items?.length || 0), 0)

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      api.setGroceryChecked([...next]).catch(() => {})
      return next
    })
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 500, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#fff' }}>🛒 Grocery List</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontFamily: FONT }}>
                {dietChart ? `From: ${groceryData?.planName || dietChart.fileName}` : 'Upload your diet chart to generate'}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>×</button>
          </div>
        </div>

        {!dietChart ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', fontFamily: FONT }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 700, color: '#052e16', marginBottom: 8 }}>No Diet Chart Yet</div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24, fontFamily: FONT }}>Upload your dietitian&apos;s chart and MealWarden will automatically generate your weekly grocery list.</p>
            <button onClick={() => { onClose(); onUpload() }} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>📸 Upload Diet Chart Now →</button>
          </div>
        ) : loading ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', fontFamily: FONT, color: '#6b7280', fontSize: 15 }}>
            Loading your grocery list…
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', fontFamily: FONT }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 15, color: '#6b7280' }}>Your grocery list is being generated. Check back shortly.</div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', padding: 24, flex: 1, fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT }}>{totalItems} items · {checked.size} checked</span>
              <span style={{ padding: '6px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT }}>
                {Math.round((checked.size / Math.max(totalItems, 1)) * 100)}% done
              </span>
            </div>
            {categories.map((cat: any, ci: number) => {
              const catName = cat.name || cat.category || cat.title || 'Items'
              return (
                <div key={ci} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16', marginBottom: 10, fontFamily: FONT }}>{catName}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(cat.items || []).map((it: any, ii: number) => {
                      const key = `${ci}-${ii}`
                      const done = checked.has(key)
                      const label = it.item || it.name || String(it)
                      return (
                        <div key={ii} onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: done ? '#f0fdf4' : '#f9fafb', borderRadius: 10, border: `1px solid ${done ? '#bbf7d0' : '#e5e7eb'}`, cursor: 'pointer' }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid #16a34a`, background: done ? '#16a34a' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                            {done ? '✓' : ''}
                          </div>
                          <span style={{ fontSize: 14, color: done ? '#6b7280' : '#374151', fontFamily: FONT, textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Analytics Modal — REAL DATA ─────────────────────────
function AnalyticsModal({
  onClose,
  meals,
  dietChart,
  profile,
}: {
  onClose: () => void
  meals: Meal[]
  dietChart: DietChart | null
  profile: UserProfile | null
}) {
  // ── Compute real stats ──
  const totalMeals   = meals.length
  const doneMeals    = meals.filter(m => m.done)
  const totalKcal    = meals.reduce((a, m) => a + m.kcal, 0)
  const doneKcal     = doneMeals.reduce((a, m) => a + m.kcal, 0)
  const totalProt    = meals.reduce((a, m) => a + m.protein, 0)
  const doneProt     = doneMeals.reduce((a, m) => a + m.protein, 0)
  const mealScore    = totalMeals > 0 ? Math.round((doneMeals.length / totalMeals) * 100) : 0
  const kcalPct      = totalKcal  > 0 ? Math.round((doneKcal  / totalKcal)  * 100) : 0
  const protPct      = totalProt  > 0 ? Math.round((doneProt  / totalProt)  * 100) : 0

  const hasData      = totalMeals > 0
  const hasActivity  = doneMeals.length > 0

  const goalLabels: Record<string, string> = {
    lose: 'Lose Weight', muscle: 'Build Muscle',
    healthy: 'Stay Healthy', maintain: 'Maintain Weight',
  }
  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentary', light: 'Lightly Active',
    moderate: 'Moderately Active', very: 'Very Active',
  }
  const dietLabels: Record<string, string> = {
    veg: 'Vegetarian', nonveg: 'Non-Veg',
    vegan: 'Vegan', eggetarian: 'Eggetarian',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 580, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#fff' }}>📊 My Analytics</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontFamily: FONT }}>
                {hasData ? 'Based on your actual meal activity today' : 'Upload a diet chart to see your analytics'}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>×</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: 24, flex: 1, fontFamily: FONT }}>

          {/* No diet chart uploaded */}
          {!hasData ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 700, color: '#052e16', marginBottom: 10 }}>No Data Yet</div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24, fontFamily: FONT }}>
                Upload your diet chart or let your guardian build one, then start logging your meals. Your real analytics will appear here.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 360, margin: '0 auto' }}>
                {[
                  { icon: '📈', label: 'Calorie tracking' },
                  { icon: '💪', label: 'Protein goals' },
                  { icon: '⭐', label: 'Meal score' },
                ].map(f => (
                  <div key={f.label} style={{ background: '#f9fafb', borderRadius: 14, padding: '16px 10px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{f.icon}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontFamily: FONT }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Real summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
                {[
                  { label: 'Meals Logged',  value: `${doneMeals.length}/${totalMeals}`, icon: '🍽️', color: '#f0fdf4', ac: '#16a34a' },
                  { label: 'Calories',      value: `${doneKcal} kcal`,                   icon: '🔥', color: '#fff7ed', ac: '#f97316' },
                  { label: 'Protein',       value: `${doneProt}g`,                        icon: '💪', color: '#eff6ff', ac: '#3b82f6' },
                  { label: 'Meal Score',    value: `${mealScore}%`,                       icon: '⭐', color: '#fdf4ff', ac: '#a855f7' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.color, borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, color: s.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, fontFamily: FONT }}>{s.label}</div>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress bars */}
              <div style={{ background: '#f9fafb', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Today's Progress</div>
                {[
                  { label: 'Calories', done: doneKcal, total: totalKcal, pct: kcalPct, unit: 'kcal', color: '#f97316' },
                  { label: 'Protein',  done: doneProt,  total: totalProt,  pct: protPct,  unit: 'g',    color: '#16a34a' },
                ].map(p => (
                  <div key={p.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, fontFamily: FONT }}>{p.label}</span>
                      <span style={{ fontSize: 13, color: '#052e16', fontWeight: 700, fontFamily: FONT }}>{p.done}{p.unit} / {p.total}{p.unit} ({p.pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: `linear-gradient(to right,${p.color},${p.color}aa)`, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal by meal breakdown */}
              <div style={{ background: '#f9fafb', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16', marginBottom: 14 }}>Meal Breakdown</div>
                {meals.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.done ? '#dcfce7' : '#f3f4f6', border: `1.5px solid ${m.done ? '#16a34a' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                      {m.done ? '✅' : '⭕'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#052e16', fontFamily: FONT }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>{m.time} · {m.kcal} kcal · {m.protein}g protein</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.done ? '#16a34a' : '#9ca3af', background: m.done ? '#dcfce7' : '#f3f4f6', padding: '3px 10px', borderRadius: 100, fontFamily: FONT, flexShrink: 0 }}>
                      {m.done ? 'Logged' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Meal score visual */}
              <div style={{ background: '#f9fafb', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16', marginBottom: 14 }}>Today's Consistency Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(#16a34a ${mealScore * 3.6}deg, #e5e7eb 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16' }}>{mealScore}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16', marginBottom: 4 }}>
                      {doneMeals.length} of {totalMeals} meals logged
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', fontFamily: FONT }}>
                      {mealScore === 100 ? '🎉 Perfect day! All meals logged!' :
                       mealScore >= 80  ? '🔥 Excellent! Almost there!' :
                       mealScore >= 50  ? '👍 Good progress — keep going!' :
                       mealScore > 0   ? '💪 Good start! Log more meals.' :
                       '📋 Tap meals in dashboard to log them.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diet chart info */}
              {dietChart && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 10 }}>📄 Diet Plan Info</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Chart Name',    value: dietChart.fileName },
                      { label: 'Uploaded On',   value: new Date(dietChart.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                      { label: 'Total Meals',   value: `${totalMeals} meals/day` },
                      { label: 'Total Calories', value: `${totalKcal} kcal/day` },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3, fontFamily: FONT }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16', fontFamily: FONT }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Profile & Goal Summary — always shown */}
          {profile && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 700, color: '#052e16', marginBottom: 12 }}>👤 Your Profile Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'Age',    value: `${profile.age}y` },
                  { label: 'Weight', value: `${profile.weight}kg` },
                  { label: 'Height', value: `${profile.height}cm` },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginBottom: 2, fontFamily: FONT }}>{s.label}</div>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'Goal',     value: goalLabels[profile.goal]     || profile.goal,     color: '#f0fdf4', ac: '#16a34a' },
                  { label: 'Activity', value: activityLabels[profile.activity] || profile.activity, color: '#eff6ff', ac: '#3b82f6' },
                  { label: 'Diet',     value: dietLabels[profile.dietType] || profile.dietType, color: '#fff7ed', ac: '#f97316' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.color, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: s.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, fontFamily: FONT }}>{s.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#052e16', fontFamily: FONT, lineHeight: 1.3 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Dashboard ───────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router   = useRouter()

  const [profile,         setProfile]         = useState<UserProfile | null>(null)
  const [dietChart,       setDietChart]       = useState<DietChart | null>(null)
  const [meals,           setMeals]           = useState<Meal[]>([])
  const [loaded,          setLoaded]          = useState(false)
  const [showUpload,      setShowUpload]      = useState(false)
  const [showGrocery,     setShowGrocery]     = useState(false)
  const [showAnalytics,   setShowAnalytics]   = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [sub,   setSub]   = useState<any>(null)
  const [water, setWater] = useState(0)
  const [streakDays, setStreakDays] = useState<number | null>(null)
  const [guardianName, setGuardianName] = useState('Meenu')
  const WATER_GOAL = 8

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/'); return }
    let active = true
    const localPref = (() => { try { return JSON.parse(localStorage.getItem('mw_profile') || 'null') } catch { return null } })()
    ;(async () => {
      try {
        const [p, md, ld] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getTodaysMeals().catch(() => null),
          api.getTodaysLogs().catch(() => ({ logs: [] })),
        ])
        if (!active) return
        const u: any = (p && (p.user || p)) || {}
        setGuardianName(u.guardian === 'custom' && u.customGuardian?.name ? u.customGuardian.name : u.guardian === 'maddy' ? 'Maddy' : 'Meenu')
        // Basics come from the shared backend; goal/activity/diet fall back to any local pref.
        if (u.age || u.weightKg || u.heightCm || localPref) {
          setProfile({
            age:      u.age ? String(u.age) : (localPref?.age || ''),
            weight:   u.weightKg ? String(u.weightKg) : (localPref?.weight || ''),
            height:   u.heightCm ? String(u.heightCm) : (localPref?.height || ''),
            goal:     u.goal || localPref?.goal || '',
            activity: u.activityLevel || localPref?.activity || '',
            dietType: u.dietType || localPref?.dietType || '',
          })
        }
        const loggedIds = new Set<string>(((ld?.logs) || []).map((l: any) => l.mealId).filter(Boolean))
        const bMeals: Meal[] = ((md?.meals) || []).map((m: any) => ({
          id: m.id,
          time: m.timeHHMM,
          name: m.mealName,
          kcal: Math.round((m.plannedCalories ?? m.calories) || 0),
          protein: Math.round(m.proteinG || 0),
          done: loggedIds.has(m.id),
        }))
        if ((md?.hasPlan ?? bMeals.length > 0) && bMeals.length > 0) {
          setDietChart({ fileName: md?.dayName ? `Your plan · ${md.dayName}` : 'Your active plan', uploadedAt: new Date().toISOString(), meals: bMeals })
          setMeals(bMeals)
        }
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscription + water (real backend data, same as the app).
  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      try {
        const [s, w, st] = await Promise.all([api.getSubscription().catch(() => null), api.getWater().catch(() => null), api.getStreak().catch(() => null)])
        if (!active) return
        if (s) setSub(s)
        if (w) setWater(Number(w.glasses ?? w.count ?? 0))
        if (st != null) setStreakDays(st.streak ?? st ?? 0)
      } catch {}
    })()
    return () => { active = false }
  }, [user])

  const changeWater = (delta: number) => {
    setWater(prev => {
      const next = Math.max(0, prev + delta)
      api.setWater(next).catch(() => {})
      return next
    })
  }

  if (!user || !loaded) return null

  if (!profile) {
    return (
      <OnboardingWizard onComplete={(p) => {
        setProfile(p)
        localStorage.setItem('mw_profile', JSON.stringify(p))
      }} />
    )
  }

  const doneMeals = meals.filter(m => m.done)
  const doneKcal  = doneMeals.reduce((a, m) => a + m.kcal, 0)
  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0)
  const doneProt  = doneMeals.reduce((a, m) => a + m.protein, 0)
  const totalProt = meals.reduce((a, m) => a + m.protein, 0)

  const toggleMeal = (i: number) => {
    const m = meals[i]; if (!m) return
    const wasDone = m.done
    const updated = meals.map((mm, idx) => idx === i ? { ...mm, done: !mm.done } : mm)
    setMeals(updated)
    if (dietChart) setDietChart({ ...dietChart, meals: updated })
    // Sync to the shared backend so logging matches the app.
    if (m.id) {
      const payload: any = { mealId: m.id, mealName: m.name, mealType: 'other' }
      if (m.kcal) payload.calories = m.kcal
      if (m.protein) payload.proteinG = m.protein
      api.toggleLog(payload).catch(() => {
        setMeals(prev => prev.map((mm, idx) => idx === i ? { ...mm, done: wasDone } : mm))
      })
    }
  }

  const handleSaveProfile = (p: UserProfile) => {
    setProfile(p)
    localStorage.setItem('mw_profile', JSON.stringify(p))
    // Best-effort sync of the basics to the shared backend.
    const payload: any = {}
    if (parseInt(p.age)) payload.age = parseInt(p.age)
    if (parseFloat(p.weight)) payload.weightKg = parseFloat(p.weight)
    if (parseFloat(p.height)) payload.heightCm = parseFloat(p.height)
    if (Object.keys(payload).length) api.updateProfile(payload).catch(() => {})
  }

  const handleResetProfile = () => {
    localStorage.removeItem('mw_profile')
    localStorage.removeItem('mw_diet_chart')
    setProfile(null); setDietChart(null); setMeals([])
    setShowEditProfile(false)
  }

  const handleDietChart = (chart: DietChart) => {
    setDietChart(chart); setMeals(chart.meals)
    localStorage.setItem('mw_diet_chart', JSON.stringify(chart))
    setShowUpload(false); setShowAIGenerator(false)
  }

  const goalLabels: Record<string, string> = {
    lose: 'Lose Weight 🎯', muscle: 'Build Muscle 💪',
    healthy: 'Stay Healthy 🏃', maintain: 'Maintain Weight ⚖️',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '48px 48px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 32, fontWeight: 500, fontFamily: FONT }}>← Back to Home</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 22, color: '#fff' }}>{user.avatar}</div>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 4, fontFamily: FONT }}>Good morning 🌿</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 28, fontWeight: 800, color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontFamily: FONT }}>Goal: {goalLabels[profile.goal] || profile.goal}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '5px 14px' }}>
                <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, fontFamily: FONT }}>{user.plan} Plan</span>
              </div>
              <button onClick={() => setShowEditProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'background 0.2s ease' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                ✏️ Edit Profile
              </button>
              <button onClick={() => router.push('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'background 0.2s ease' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                👤 My Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '-40px auto 0', padding: '0 48px 60px' }}>

        {/* Trial / subscription banner */}
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: sub.isTrial ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#f0fdf4', border: `1.5px solid ${sub.isTrial ? '#fcd34d' : '#bbf7d0'}`, borderRadius: 18, padding: '16px 22px', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16' }}>
                {sub.isTrial ? `🛡️ Gold trial — ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? '' : 's'} left` : `${String(sub.tier || 'free').toUpperCase()} plan`}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, fontFamily: FONT }}>
                {sub.isTrial ? 'All Gold features unlocked. Pick a plan to keep them after the trial.' : 'Manage your plan and unlock more features.'}
              </div>
            </div>
            <button onClick={() => router.push('/upgrade')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}>
              {'Membership →'}
            </button>
          </div>
        )}

        {/* Water tracker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: '16px 22px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>💧</span>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16' }}>Water · {water}/{WATER_GOAL} glasses</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {Array.from({ length: WATER_GOAL }).map((_, i) => (
                  <div key={i} style={{ width: 20, height: 10, borderRadius: 3, background: i < water ? '#3b82f6' : '#e5e7eb' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => changeWater(-1)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 20, cursor: 'pointer', color: '#374151' }}>−</button>
            <button onClick={() => changeWater(1)} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontSize: 20, cursor: 'pointer' }}>+</button>
          </div>
        </div>

        {/* Explore feature pages */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { icon: '🛡️', label: 'Ask Guardian', href: '/chat' },
            { icon: '📊', label: 'My Nutrition', href: '/nutrition' },
            { icon: '📅', label: 'Weekly Plan', href: '/weekly' },
            { icon: '📈', label: 'Progress', href: '/progress' },
            { icon: '⚖️', label: 'Weight', href: '/weight' },
            { icon: '🥣', label: 'Prep', href: '/prep' },
            { icon: '🛒', label: 'Grocery List', href: '/grocery' },
            { icon: '🪙', label: 'Coin Center', href: '/coins' },
            { icon: '🎁', label: 'Refer & Earn', href: '/refer' },
            { icon: '👑', label: 'Membership', href: '/upgrade' },
          ].map(l => (
            <button key={l.href} onClick={() => router.push(l.href)} style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 22 }}>{l.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#052e16' }}>{l.label}</span>
              <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 800 }}>→</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '🔥', label: 'Current Streak', value: streakDays === null ? '–' : `${streakDays} day${streakDays !== 1 ? 's' : ''}`, color: '#fff7ed', ac: '#f97316' },
            { icon: '🍽️', label: 'Meals Today',     value: meals.length ? `${doneMeals.length}/${meals.length}` : '–', color: '#f0fdf4', ac: '#16a34a' },
            { icon: '⚡', label: 'Calories Done',   value: meals.length ? `${doneKcal} kcal` : '–',                    color: '#eff6ff', ac: '#3b82f6' },
            { icon: '💪', label: 'Protein Done',    value: meals.length ? `${doneProt}g` : '–',                         color: '#fdf4ff', ac: '#a855f7' },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: s.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: FONT }}>{s.label}</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

          {/* Meal Plan */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 700, color: '#052e16' }}>Today's Meal Plan</div>
              <button onClick={() => setShowUpload(true)} style={{ padding: '7px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                📸 {dietChart ? 'Re-scan Chart' : 'Add Chart'}
              </button>
            </div>
            {meals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 8 }}>No Diet Chart Yet</div>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24, fontFamily: FONT }}>Upload your dietitian's chart or let {guardianName} create a personalized plan just for you!</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowUpload(true)} style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>📸 Scan Existing Chart</button>
                  <button onClick={() => setShowAIGenerator(true)} style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>✨ Generate with {guardianName}</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {meals.map((m, i) => (
                  <div key={i} onClick={() => toggleMeal(i)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: m.done ? '#f0fdf4' : '#f9fafb', border: `1.5px solid ${m.done ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.done ? '#16a34a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{m.done ? '✅' : '⭕'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: m.done ? '#16a34a' : '#9ca3af', fontWeight: 600, marginBottom: 2, fontFamily: FONT }}>{m.time}</div>
                      <div style={{ fontSize: 15, color: '#052e16', fontWeight: 600, fontFamily: FONT }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontFamily: FONT }}>{m.kcal} kcal · {m.protein}g protein</div>
                    </div>
                    {!m.done && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: '#16a34a', fontWeight: 600, flexShrink: 0, fontFamily: FONT }}>Tap to log →</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Progress */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: FONT }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 18 }}>Daily Progress</div>
              {meals.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '8px 0', fontFamily: FONT }}>Upload your diet chart to see progress tracking</p>
              ) : (
                [
                  { label: 'Calories', done: doneKcal, total: totalKcal, unit: 'kcal', color: '#f97316' },
                  { label: 'Protein',  done: doneProt,  total: totalProt,  unit: 'g',    color: '#16a34a' },
                ].map(p => (
                  <div key={p.label} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, fontFamily: FONT }}>{p.label}</span>
                      <span style={{ fontSize: 13, color: '#052e16', fontWeight: 700, fontFamily: FONT }}>{p.done}{p.unit} / {p.total}{p.unit}</span>
                    </div>
                    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.total > 0 ? Math.round((p.done / p.total) * 100) : 0}%`, background: `linear-gradient(to right,${p.color},${p.color}aa)`, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: FONT }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '📸', label: 'Scan Diet Chart',    color: '#fff7ed', ac: '#f97316', onClick: () => setShowUpload(true) },
                  { icon: '✨', label: `Generate with ${guardianName}`,   color: '#f5f3ff', ac: '#7c3aed', onClick: () => setShowAIGenerator(true) },
                  { icon: '🛒', label: 'View Grocery List',  color: '#f0fdf4', ac: '#16a34a', onClick: () => setShowGrocery(true) },
                  { icon: '📊', label: 'View Analytics',     color: '#eff6ff', ac: '#3b82f6', onClick: () => setShowAnalytics(true) },
                  { icon: '👑', label: 'View Membership', color: '#fffbeb', ac: '#ca8a04', onClick: () => router.push('/upgrade') },
                ].map(a => (
                  <div key={a.label} onClick={a.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, background: a.color, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', transition: 'transform 0.2s ease' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: a.ac, fontFamily: FONT }}>{a.label}</span>
                    <span style={{ marginLeft: 'auto', color: a.ac, fontSize: 16 }}>→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Summary */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: FONT }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16' }}>My Profile</div>
                <span onClick={() => setShowEditProfile(true)} style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>✏️ Edit</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Age',    value: `${profile.age}y` },
                  { label: 'Weight', value: `${profile.weight}kg` },
                  { label: 'Height', value: `${profile.height}cm` },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginBottom: 2, fontFamily: FONT }}>{s.label}</div>
                    <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Modals */}
      {showEditProfile && <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} onSave={handleSaveProfile} onReset={handleResetProfile} />}
      {showUpload && <DietChartUploadModal guardianName={guardianName} onClose={() => setShowUpload(false)} onUpload={handleDietChart} onAIGenerate={() => { setShowUpload(false); setShowAIGenerator(true) }} />}
      {showAIGenerator && <GenerateDietWizard guardianName={guardianName} profile={profile} onClose={() => setShowAIGenerator(false)} />}
      {showGrocery && <GroceryListModal dietChart={dietChart} onClose={() => setShowGrocery(false)} onUpload={() => { setShowGrocery(false); setShowUpload(true) }} />}
      {showAnalytics && (
        <AnalyticsModal
          onClose={() => setShowAnalytics(false)}
          meals={meals}
          dietChart={dietChart}
          profile={profile}
        />
      )}
    </div>
  );
}
