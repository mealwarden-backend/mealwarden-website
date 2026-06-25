'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const GUARDIANS: Record<string, { name: string; emoji: string; tagline: string }> = {
  meenu: { name: 'Meenu',  emoji: '🧕', tagline: 'Warm • Holistic • Ayurvedic wisdom' },
  maddy: { name: 'Maddy',  emoji: '👨‍⚕️', tagline: 'Precise • Science-backed • Analytical' },
}
const GENDERS = ['male', 'female', 'other']
const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

const bmiColor = (bmi: number): string => {
  if (bmi < 18.5) return '#3b82f6'
  if (bmi < 25)   return '#16a34a'
  if (bmi < 30)   return '#f97316'
  return '#ef4444'
}
const bmiLabel = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25)   return 'Healthy'
  if (bmi < 30)   return 'Overweight'
  return 'Obese'
}

export default function Profile() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [profile,  setProfile]  = useState<any>(null)
  const [coins,    setCoins]    = useState<any>(null)
  const [loaded,   setLoaded]   = useState(false)
  const [guardian, setGuardian] = useState<string>('meenu')

  // Edit modal state
  const [editOpen,   setEditOpen]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [fFirst,     setFFirst]     = useState('')
  const [fLast,      setFLast]      = useState('')
  const [fUser,      setFUser]      = useState('')
  const [fPhone,     setFPhone]     = useState('')
  const [fEmail,     setFEmail]     = useState('')
  const [fAge,       setFAge]       = useState('')
  const [fGender,    setFGender]    = useState('male')
  const [fHeight,    setFHeight]    = useState('')
  const [fWeight,    setFWeight]    = useState('')
  const [saveErr,    setSaveErr]    = useState('')

  // Delete confirm
  const [deleteStep, setDeleteStep] = useState(0)
  const [exporting,  setExporting]  = useState(false)

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.getProfile(), api.getCoinStatus()])
      setProfile(p?.user ?? p)
      setCoins(c)
    } catch {} finally { setLoaded(true) }
  }

  useEffect(() => {
    if (!user) { router.push('/'); return }
    // restore guardian from localStorage
    try {
      const saved = localStorage.getItem('mw_guardian')
      if (saved) setGuardian(saved)
    } catch {}
    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const p = profile || {}
  const realEmail = (e?: string) => (e && !e.endsWith('@phone.mealwarden.app') ? e : '')

  const completionChecks = [p.name, realEmail(p.email), p.phone, p.age, p.gender, p.heightCm, p.weightKg]
  const done  = completionChecks.filter((v: any) => v !== null && v !== undefined && String(v).trim() !== '').length
  const total = completionChecks.length
  const pct   = Math.round((done / total) * 100)

  const openEdit = () => {
    const parts = (p.name || '').trim().split(/\s+/).filter(Boolean)
    setFFirst(parts[0] || '')
    setFLast(parts.slice(1).join(' '))
    setFUser(p.username || '')
    setFPhone(p.phone || '')
    setFEmail(realEmail(p.email))
    setFAge(p.age ? String(p.age) : '')
    setFGender(p.gender || 'male')
    setFHeight(p.heightCm ? String(p.heightCm) : '')
    setFWeight(p.weightKg ? String(p.weightKg) : '')
    setSaveErr('')
    setEditOpen(true)
  }

  const saveEdit = async () => {
    const payload: any = {}
    const fullName = [fFirst.trim(), fLast.trim()].filter(Boolean).join(' ')
    if (fullName && fullName !== p.name) payload.name = fullName
    if (fUser.trim()) payload.username = fUser.trim()
    if (fPhone.trim()) payload.phone = fPhone.trim()
    const emailVal = fEmail.trim()
    if (emailVal && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal) && emailVal !== realEmail(p.email)) payload.email = emailVal
    const age = parseInt(fAge); if (age >= 10 && age <= 100) payload.age = age
    if (GENDERS.includes(fGender)) payload.gender = fGender
    const h = parseFloat(fHeight); if (h >= 50 && h <= 300) payload.heightCm = h
    const w = parseFloat(fWeight); if (w >= 20 && w <= 300) payload.weightKg = w
    if (Object.keys(payload).length === 0) { setEditOpen(false); return }
    setSaving(true); setSaveErr('')
    try {
      await api.updateProfile(payload)
      await load()
      setEditOpen(false)
    } catch (e: any) {
      setSaveErr(e?.message || 'Could not save. Please try again.')
    } finally { setSaving(false) }
  }

  const handleGuardian = (key: string) => {
    setGuardian(key)
    try { localStorage.setItem('mw_guardian', key) } catch {}
  }

  const doExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const data = await api.exportData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a'); a.href = url; a.download = 'mealwarden-data.json'; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert('Export failed: ' + (e?.message || 'Please try again.'))
    } finally { setExporting(false) }
  }

  const doLogout = () => {
    if (!window.confirm('Logout of MealWarden?')) return
    try { api.clearCache() } catch {}
    logout()
    router.push('/')
  }

  const doDelete = async () => {
    if (deleteStep === 0) { setDeleteStep(1); return }
    try {
      await api.deleteAccount()
    } catch {}
    try { api.clearCache() } catch {}
    logout()
    router.push('/')
  }

  // Coins
  const coinBal     = Number(coins?.mealCoins      ?? 0)
  const coinLife    = Number(coins?.lifetimeEarned  ?? 0)
  const coinRedeem  = Number(coins?.lifetimeRedeemed ?? 0)
  const curBadge    = coins?.currentBadgeKey
  const nextBadge   = coins?.nextBadge

  // BMI
  const bmi = p.bmi ?? (p.heightCm && p.weightKg ? +(p.weightKg / ((p.heightCm / 100) ** 2)).toFixed(1) : null)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 70px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 28, fontWeight: 500 }}>← Back to Dashboard</div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
              {p.avatarUrl
                ? <img src={p.avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                : (p.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{p.name || 'Your Profile'}</h1>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                {p.username ? `@${p.username} · ` : ''}{realEmail(p.email) || p.phone || 'Set up your account info'}
              </div>
              {curBadge && (
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 14px' }}>
                  <span style={{ fontSize: 15 }}>🏅</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>{String(curBadge).replace(/_/g,' ').toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '-40px auto 0', padding: '0 24px 80px' }}>
        {/* Profile completion */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16' }}>{pct === 100 ? '✅ Profile complete' : 'Complete your profile'}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', borderRadius: 10, padding: '3px 10px' }}>{done}/{total}</span>
          </div>
          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right,#16a34a,#4ade80)', borderRadius: 6, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: 12.5, color: '#6b7280' }}>
            {pct === 100 ? 'Your Warden has everything it needs to fine-tune every meal for you.' : `${total - done} more field${total - done !== 1 ? 's' : ''} to go — tap Edit below so your Warden can size every meal for you.`}
          </div>
        </div>

        {/* Meal Coins */}
        <div style={{ background: 'linear-gradient(135deg,#78350f,#d97706)', borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(217,119,6,0.25)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Meal Coins</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🪙</div>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 28, fontWeight: 900, color: '#fff' }}>{coinBal.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Current balance</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#fff' }}>{coinLife.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Lifetime earned</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#fff' }}>{coinRedeem.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Redeemed</div>
            </div>
          </div>
          {nextBadge && (
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
              🏅 Next: {nextBadge.daysLeft} day{nextBadge.daysLeft === 1 ? '' : 's'} to {nextBadge.name}
              {nextBadge.coins ? ` · +${nextBadge.coins} coins` : ''}
            </div>
          )}
          {!nextBadge && (
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
              🏆 You've unlocked every badge — legendary!
            </div>
          )}
        </div>

        {/* Guardian selector */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>Your Guardian</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Object.entries(GUARDIANS).map(([key, meta]) => {
              const sel = guardian === key
              return (
                <div key={key} onClick={() => handleGuardian(key)} style={{ border: `2px solid ${sel ? '#16a34a' : '#e5e7eb'}`, borderRadius: 16, padding: '18px 14px', cursor: 'pointer', textAlign: 'center', background: sel ? '#f0fdf4' : '#fff', position: 'relative', transition: 'border-color 0.15s, background 0.15s' }}>
                  {sel && <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 900 }}>✓</div>}
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{meta.emoji}</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 4 }}>{meta.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{meta.tagline}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Account details */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16' }}>Account Details</div>
            <button onClick={openEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', color: '#16a34a', fontWeight: 800, fontSize: 13, fontFamily: FONT }}>✏️ Edit</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Email',    value: realEmail(p.email) || '—' },
              { label: 'Phone',    value: p.phone || '—' },
              { label: 'Age',      value: p.age ? `${p.age} yrs` : '—' },
              { label: 'Gender',   value: cap(p.gender) || '—' },
              { label: 'Height',   value: p.heightCm ? `${p.heightCm} cm` : '—' },
              { label: 'Weight',   value: p.weightKg ? `${p.weightKg} kg` : '—' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: 13.5, color: '#6b7280', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: row.value === '—' ? '#d1d5db' : '#111827' }}>{row.value}</span>
              </div>
            ))}
            {bmi !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0' }}>
                <span style={{ fontSize: 13.5, color: '#6b7280', fontWeight: 600 }}>BMI</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: bmiColor(bmi) }}>{bmi}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: bmiColor(bmi), background: bmiColor(bmi) + '1a', borderRadius: 8, padding: '2px 9px' }}>{bmiLabel(bmi)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={doExport} disabled={exporting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '16px 24px', cursor: exporting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, color: '#374151', fontFamily: FONT, opacity: exporting ? 0.6 : 1 }}>
            📤 {exporting ? 'Exporting…' : 'Export my data (JSON)'}
          </button>
          <button onClick={doLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', border: '1.5px solid #fca5a5', borderRadius: 16, padding: '16px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#ef4444', fontFamily: FONT }}>
            🚪 Logout
          </button>
          <button onClick={doDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: deleteStep > 0 ? '#ef4444' : '#fff', border: `1.5px solid ${deleteStep > 0 ? '#ef4444' : '#fca5a5'}`, borderRadius: 16, padding: '16px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: deleteStep > 0 ? '#fff' : '#9ca3af', fontFamily: FONT }}>
            🗑️ {deleteStep > 0 ? 'Tap again to permanently delete everything' : 'Delete my account'}
          </button>
          {deleteStep > 0 && (
            <button onClick={() => setDeleteStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', fontFamily: FONT }}>Cancel</button>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setEditOpen(false) }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16' }}>Edit Profile</div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <Field label="First Name" value={fFirst} onChange={setFFirst} placeholder="First" />
              <Field label="Last Name"  value={fLast}  onChange={setFLast}  placeholder="Last" />
            </div>
            <Field label="Username" value={fUser}  onChange={setFUser}  placeholder="e.g. prasanna_k" />
            <Field label="Phone"    value={fPhone} onChange={setFPhone} placeholder="e.g. 9876543210" type="tel" />
            <Field label="Email"    value={fEmail} onChange={setFEmail} placeholder="you@email.com"  type="email" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <Field label="Age (yrs)"   value={fAge}    onChange={setFAge}    placeholder="30"  type="number" />
              <Field label="Height (cm)" value={fHeight} onChange={setFHeight} placeholder="170" type="number" />
            </div>
            <Field label="Weight (kg)" value={fWeight} onChange={setFWeight} placeholder="72" type="number" />
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {GENDERS.map(g => (
                  <button key={g} onClick={() => setFGender(g)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `2px solid ${fGender === g ? '#16a34a' : '#e5e7eb'}`, background: fGender === g ? '#f0fdf4' : '#fff', color: fGender === g ? '#16a34a' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                    {cap(g)}
                  </button>
                ))}
              </div>
            </div>
            {saveErr && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{saveErr}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid #e5e7eb', background: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#374151', fontFamily: FONT }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: FONT }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', boxSizing: 'border-box' }}
      />
    </div>
  )
}
