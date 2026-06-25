'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { GUARDIANS } from '@/lib/appData'
import BrandImg from '@/components/BrandImg'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const PERSONALITIES = [
  { v: 'friendly', label: 'Friendly' }, { v: 'motivational', label: 'Motivational' },
  { v: 'calm', label: 'Calm & mindful' }, { v: 'tough', label: 'Tough love' },
  { v: 'sweet', label: 'Sweet & caring' }, { v: 'bestie', label: 'Playful bestie' },
]
const AVATARS = ['👩', '🧑‍🍳', '👨', '🧕', '🧑', '👵', '🧓', '🦸']
const inputBox = { width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' as const, fontFamily: FONT }
const card = { background: '#fff', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 18 }
const cardTitle = { fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800 as const, color: '#052e16', marginBottom: 18 }

export default function Settings() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [loaded, setLoaded]   = useState(false)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [age, setAge]         = useState('')
  const [weight, setWeight]   = useState('')
  const [height, setHeight]   = useState('')
  const [gender, setGender]   = useState('male')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [busy, setBusy]       = useState('')

  // Water goal
  const [waterGoal, setWaterGoal] = useState(8)
  const [savingW, setSavingW]     = useState(false)
  const [savedW, setSavedW]       = useState(false)

  // Notification preferences
  const [notifs, setNotifs] = useState({
    mealReminders:    true,
    prepAlerts:       true,
    groceryReminders: false,
    dailySummary:     true,
    waterReminders:   true,
  })
  const [savingN, setSavingN] = useState(false)
  const [savedN, setSavedN]   = useState(false)

  // Guardian
  const [gSel, setGSel]       = useState<'meenu' | 'maddy' | 'custom'>('meenu')
  const [cgName, setCgName]   = useState('')
  const [cgSex, setCgSex]     = useState<'female' | 'male' | 'other'>('female')
  const [cgPers, setCgPers]   = useState<string[]>(['friendly'])
  const [cgEmoji, setCgEmoji] = useState('👩')
  const [savingG, setSavingG] = useState(false)
  const [savedG, setSavedG]   = useState(false)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const p = await api.getProfile()
        const u: any = p?.user || p || {}
        if (!active) return
        setName(u.name || user.name || '')
        setEmail(u.email || user.email || '')
        setAge(u.age ? String(u.age) : '')
        setWeight(u.weightKg ? String(u.weightKg) : '')
        setHeight(u.heightCm ? String(u.heightCm) : '')
        setGender(u.gender || 'male')
        setWaterGoal(u.waterGoalGlasses || u.waterGoal || 8)
        if (u.notificationPreferences) {
          setNotifs(prev => ({ ...prev, ...u.notificationPreferences }))
        }
        setGSel((u.guardian as any) || 'meenu')
        if (u.guardian === 'custom' && u.customGuardian) {
          const cg: any = u.customGuardian
          setCgName(cg.name || '')
          setCgSex(cg.sex || 'female')
          setCgPers(cg.personalities || (cg.personality ? [cg.personality] : ['friendly']))
          setCgEmoji(cg.emoji || '👩')
        }
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const save = async () => {
    setSaving(true); setSaved(false)
    const payload: any = { gender }
    if (parseInt(age)) payload.age = parseInt(age)
    if (parseFloat(weight)) payload.weightKg = parseFloat(weight)
    if (parseFloat(height)) payload.heightCm = parseFloat(height)
    try { await api.updateProfile(payload); setSaved(true); setTimeout(() => setSaved(false), 2500) } catch {} finally { setSaving(false) }
  }

  const togglePers = (v: string) => setCgPers(prev => prev.includes(v) ? prev.filter(x => x !== v) : prev.length >= 3 ? prev : [...prev, v])

  const saveGuardian = async () => {
    if (gSel === 'custom' && (!cgName.trim() || cgPers.length === 0)) return
    setSavingG(true); setSavedG(false)
    try {
      if (gSel === 'custom') {
        await api.updateProfile({ guardian: 'custom', customGuardian: { name: cgName.trim(), sex: cgSex, personality: cgPers[0], personalities: cgPers, emoji: cgEmoji } })
      } else {
        await api.updateProfile({ guardian: gSel })
      }
      api.clearCache?.()
      setSavedG(true); setTimeout(() => setSavedG(false), 2500)
    } catch {} finally { setSavingG(false) }
  }

  const saveWaterGoal = async () => {
    setSavingW(true); setSavedW(false)
    try {
      await api.updateProfile({ waterGoalGlasses: waterGoal })
      setSavedW(true); setTimeout(() => setSavedW(false), 2500)
    } catch {} finally { setSavingW(false) }
  }

  const saveNotifs = async () => {
    setSavingN(true); setSavedN(false)
    try {
      await api.updateProfile({ notificationPreferences: notifs })
      setSavedN(true); setTimeout(() => setSavedN(false), 2500)
    } catch {} finally { setSavingN(false) }
  }

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const doExport = async () => {
    setBusy('export')
    try {
      const data = await api.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'mealwarden-data.json'; a.click()
      URL.revokeObjectURL(url)
    } catch {} finally { setBusy('') }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Settings ⚙️</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Manage your account and your data.</p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {saved && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✅</span><span style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>Profile saved.</span>
          </div>
        )}

        {/* Profile */}
        <div style={card}>
          <div style={cardTitle}>Profile</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Full name</label>
              <input value={name} disabled style={{ ...inputBox, color: '#6b7280' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Email</label>
              <input value={email} disabled style={{ ...inputBox, color: '#6b7280' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} style={inputBox} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...inputBox, cursor: 'pointer' }}>
                {['male', 'female', 'other'].map(g => <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={inputBox} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} style={inputBox} />
            </div>
          </div>
          <button onClick={save} disabled={saving} style={{ marginTop: 18, padding: '12px 24px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: FONT }}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>

        {/* Guardian */}
        <div style={card}>
          <div style={cardTitle}>Your Guardian</div>
          {savedG && <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '10px 16px', marginBottom: 14, fontSize: 13.5, color: '#16a34a', fontWeight: 600 }}>✅ Guardian updated.</div>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            {GUARDIANS.map(g => {
              const key = g.name.toLowerCase()
              const on = gSel === key
              return (
                <div key={g.name} onClick={() => setGSel(key as any)} style={{ flex: '1 1 170px', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${on ? '#16a34a' : '#e5e7eb'}`, background: on ? '#f0fdf4' : '#f9fafb' }}>
                  <BrandImg src={g.img} fallback={g.emoji} size={40} radius={12} bg="#fff" />
                  <div><div style={{ fontSize: 14, fontWeight: 800, color: '#052e16' }}>{g.name}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{g.tagline}</div></div>
                </div>
              )
            })}
            <div onClick={() => setGSel('custom')} style={{ flex: '1 1 170px', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${gSel === 'custom' ? '#16a34a' : '#e5e7eb'}`, background: gSel === 'custom' ? '#f0fdf4' : '#f9fafb' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{cgEmoji}</div>
              <div><div style={{ fontSize: 14, fontWeight: 800, color: '#052e16' }}>Create your own</div><div style={{ fontSize: 11, color: '#d97706', fontWeight: 700 }}>✦ GOLD</div></div>
            </div>
          </div>

          {gSel === 'custom' && (
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}>Name</label>
              <input value={cgName} onChange={e => setCgName(e.target.value)} placeholder="e.g. Aria" style={inputBox} />
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', margin: '14px 0 6px' }}>Sex</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['female', 'male', 'other'] as const).map(s => (
                  <div key={s} onClick={() => setCgSex(s)} style={{ flex: 1, padding: '10px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: `2px solid ${cgSex === s ? '#7c3aed' : '#e5e7eb'}`, background: cgSex === s ? '#f5f3ff' : '#fff', fontSize: 13, fontWeight: 700, color: cgSex === s ? '#7c3aed' : '#374151', textTransform: 'capitalize' }}>{s}</div>
                ))}
              </div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', margin: '14px 0 6px' }}>Avatar</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AVATARS.map(em => (
                  <div key={em} onClick={() => setCgEmoji(em)} style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', border: `2px solid ${cgEmoji === em ? '#7c3aed' : '#e5e7eb'}`, background: cgEmoji === em ? '#f5f3ff' : '#fff' }}>{em}</div>
                ))}
              </div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', margin: '14px 0 6px' }}>Personality · pick up to 3</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PERSONALITIES.map(p => {
                  const on = cgPers.includes(p.v)
                  return <div key={p.v} onClick={() => togglePers(p.v)} style={{ padding: '8px 14px', borderRadius: 100, cursor: 'pointer', border: `1.5px solid ${on ? '#7c3aed' : '#e5e7eb'}`, background: on ? '#f5f3ff' : '#fff', fontSize: 12.5, fontWeight: 600, color: on ? '#7c3aed' : '#6b7280' }}>{on ? '✓ ' : ''}{p.label}</div>
                })}
              </div>
            </div>
          )}

          <button onClick={saveGuardian} disabled={savingG} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: savingG ? 'default' : 'pointer', opacity: savingG ? 0.7 : 1, fontFamily: FONT }}>{savingG ? 'Saving…' : 'Save guardian'}</button>
        </div>

        {/* Plan */}
        <div style={card}>
          <div style={cardTitle}>Plan</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '14px 18px', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#052e16' }}>Manage your plan & trial</div>
            <button onClick={() => router.push('/upgrade')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>View plans →</button>
          </div>
        </div>

        {/* Water Goal */}
        <div style={card}>
          <div style={cardTitle}>💧 Daily Water Goal</div>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 18 }}>How many glasses of water do you aim for each day?</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
            <button
              onClick={() => setWaterGoal(g => Math.max(4, g - 1))}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}
            >−</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 36, fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{waterGoal}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>glasses / day</div>
            </div>
            <button
              onClick={() => setWaterGoal(g => Math.min(15, g + 1))}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}
            >+</button>
          </div>
          {/* Visual indicator */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < waterGoal ? '#3b82f6' : '#e5e7eb', transition: 'background 0.2s ease' }} />
            ))}
          </div>
          <button
            onClick={saveWaterGoal}
            disabled={savingW}
            style={{ padding: '11px 24px', background: savedW ? '#16a34a' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}
          >
            {savingW ? 'Saving…' : savedW ? '✅ Saved!' : 'Save Goal'}
          </button>
        </div>

        {/* Notification Preferences */}
        <div style={card}>
          <div style={cardTitle}>🔔 Notification Preferences</div>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 18, lineHeight: 1.6 }}>
            Manage your push notification preferences. These are synced to your mobile app.
          </p>
          {([
            { key: 'mealReminders',    icon: '🍽️', label: 'Meal reminders',     desc: 'Get notified before each scheduled meal' },
            { key: 'prepAlerts',       icon: '🥗', label: 'Prep alerts',         desc: 'Reminders to prep ingredients in advance' },
            { key: 'waterReminders',   icon: '💧', label: 'Water reminders',     desc: 'Nudges to hit your daily water goal' },
            { key: 'dailySummary',     icon: '📊', label: 'Daily summary',       desc: 'End-of-day recap of meals logged and adherence' },
            { key: 'groceryReminders', icon: '🛒', label: 'Grocery reminders',   desc: 'Remind to buy items before the week starts' },
          ] as const).map(n => (
            <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 22, lineHeight: 1.2 }}>{n.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16' }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{n.desc}</div>
                </div>
              </div>
              <div
                onClick={() => toggleNotif(n.key)}
                style={{
                  width: 44, height: 26, borderRadius: 13, cursor: 'pointer',
                  background: notifs[n.key] ? '#16a34a' : '#d1d5db',
                  position: 'relative', flexShrink: 0,
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: notifs[n.key] ? 21 : 3,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          ))}
          <button
            onClick={saveNotifs}
            disabled={savingN}
            style={{ marginTop: 18, padding: '11px 24px', background: savedN ? '#16a34a' : '#052e16', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}
          >
            {savingN ? 'Saving…' : savedN ? '✅ Saved!' : 'Save Preferences'}
          </button>
        </div>

        {/* Data & privacy */}
        <div style={card}>
          <div style={cardTitle}>Data &amp; privacy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={doExport} disabled={busy === 'export'} style={{ textAlign: 'left', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#052e16' }}>{busy === 'export' ? '⏳ Preparing…' : '⬇️ Export my data (JSON)'}</button>
            <button onClick={() => router.push('/privacy')} style={{ textAlign: 'left', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#052e16' }}>🔒 Privacy Policy</button>
            <button onClick={() => router.push('/delete-account')} style={{ textAlign: 'left', padding: '14px 16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#ef4444' }}>🗑️ Delete my account</button>
          </div>
        </div>

        <button onClick={() => { logout(); router.push('/') }} style={{ width: '100%', padding: '14px', background: '#fff', color: '#ef4444', border: '1.5px solid #fecdd3', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>🚪 Log out</button>
      </div>
    </div>
  )
}
