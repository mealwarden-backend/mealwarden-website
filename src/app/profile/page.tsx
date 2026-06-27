'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/api'
import { GUARDIANS } from '@/lib/appData'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const G         = '#16a34a'   // brand green

const PERSONALITIES = [
  { v: 'friendly',     label: 'Friendly' },
  { v: 'motivational', label: 'Motivational' },
  { v: 'calm',         label: 'Calm & mindful' },
  { v: 'tough',        label: 'Tough love' },
  { v: 'sweet',        label: 'Sweet & caring' },
  { v: 'bestie',       label: 'Playful bestie' },
]
const GENDER_OPTIONS = [
  { v: 'male',   label: 'Male' },
  { v: 'female', label: 'Female' },
  { v: 'other',  label: 'Other' },
]
const AVATAR_EMOJIS = ['👩','🧑‍🍳','👨','🧕','🧑','👵','🧓','🦸','🏃','🧘']

const s = {
  page: {
    minHeight: '100vh', background: '#f0fdf4', fontFamily: FONT,
    paddingBottom: 60,
  } as React.CSSProperties,
  header: {
    background: '#052e16', padding: '28px 24px 24px',
  } as React.CSSProperties,
  headerInner: {
    maxWidth: 680, margin: '0 auto',
  } as React.CSSProperties,
  headerTitle: {
    fontFamily: FONT_SYNE, fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4,
  } as React.CSSProperties,
  headerSub: {
    fontSize: 14, color: '#86efac',
  } as React.CSSProperties,
  body: {
    maxWidth: 680, margin: '0 auto', padding: '24px 16px',
  } as React.CSSProperties,
  card: {
    background: '#fff', borderRadius: 20, padding: '22px 24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 18,
  } as React.CSSProperties,
  cardTitle: {
    fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#052e16', marginBottom: 18,
  } as React.CSSProperties,
  avatarRing: {
    width: 88, height: 88, borderRadius: 44, background: '#f0fdf4',
    border: `3px solid ${G}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 42, cursor: 'pointer', transition: 'box-shadow .2s',
    margin: '0 auto 8px',
  } as React.CSSProperties,
  avatarRow: {
    display: 'flex', gap: 10, flexWrap: 'wrap' as const, justifyContent: 'center', marginTop: 10,
  },
  avatarOpt: (active: boolean): React.CSSProperties => ({
    width: 44, height: 44, borderRadius: 22, fontSize: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    border: active ? `2.5px solid ${G}` : '2px solid #e5e7eb',
    background: active ? '#f0fdf4' : '#fff',
    transition: 'all .15s',
  }),
  label: {
    fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const,
    letterSpacing: .5, marginBottom: 6, display: 'block',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '11px 13px', border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, color: '#111827', background: '#f9fafb', outline: 'none',
    boxSizing: 'border-box' as const, fontFamily: FONT,
  } as React.CSSProperties,
  grid2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
  } as React.CSSProperties,
  grid3: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14,
  } as React.CSSProperties,
  fieldGroup: { marginBottom: 16 } as React.CSSProperties,
  emailRow: {
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  verifyBadge: (verified: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
    borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: verified ? '#dcfce7' : '#fef9c3',
    color: verified ? '#16a34a' : '#854d0e',
  }),
  guardianCard: (active: boolean): React.CSSProperties => ({
    border: active ? `2px solid ${G}` : '2px solid #e5e7eb',
    borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .15s',
    background: active ? '#f0fdf4' : '#fff', flex: 1,
  }),
  guardianRow: {
    display: 'flex', gap: 12,
  } as React.CSSProperties,
  guardianEmoji: { fontSize: 32, display: 'block', marginBottom: 6 } as React.CSSProperties,
  guardianName: { fontSize: 15, fontWeight: 700, color: '#052e16' } as React.CSSProperties,
  guardianTagline: { fontSize: 12, color: '#6b7280', marginTop: 2 } as React.CSSProperties,
  chipRow: {
    display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 8,
  },
  chip: (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s',
    background: active ? G : '#f3f4f6',
    color: active ? '#fff' : '#374151',
    border: 'none',
  }),
  saveBtn: (busy: boolean): React.CSSProperties => ({
    background: busy ? '#86efac' : G, color: '#fff', border: 'none',
    borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700,
    cursor: busy ? 'not-allowed' : 'pointer', fontFamily: FONT,
    transition: 'background .2s',
  }),
  savedTag: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    background: '#dcfce7', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#16a34a',
  } as React.CSSProperties,
  dangerBtn: {
    background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 12,
    padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
  } as React.CSSProperties,
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  genderBtn: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', borderRadius: 10, border: active ? `2px solid ${G}` : '1.5px solid #e5e7eb',
    background: active ? '#f0fdf4' : '#f9fafb', color: active ? G : '#374151',
    fontFamily: FONT, fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
    transition: 'all .15s',
  }),
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [loaded,   setLoaded]   = useState(false)
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [verified, setVerified] = useState(false)
  const [age,      setAge]      = useState('')
  const [weight,   setWeight]   = useState('')
  const [height,   setHeight]   = useState('')
  const [gender,   setGender]   = useState('male')
  const [emoji,    setEmoji]    = useState('👩')
  const [showEmoji, setShowEmoji] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  // Guardian
  const [gSel,    setGSel]    = useState<'meenu' | 'maddy'>('meenu')
  const [cgPers,  setCgPers]  = useState<string[]>(['friendly'])
  const [savingG, setSavingG] = useState(false)
  const [savedG,  setSavedG]  = useState(false)

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
        setVerified(!!u.emailVerified)
        setAge(u.age ? String(u.age) : '')
        setWeight(u.weightKg ? String(u.weightKg) : '')
        setHeight(u.heightCm ? String(u.heightCm) : '')
        setGender(u.gender || 'male')
        setEmoji(u.avatarEmoji || '👩')
        const g = u.guardian as any
        if (g === 'maddy') setGSel('maddy')
        else setGSel('meenu')
        if (Array.isArray(u.guardianPersonalities) && u.guardianPersonalities.length > 0) {
          setCgPers(u.guardianPersonalities)
        }
      } catch {}
      if (active) setLoaded(true)
    })()
    return () => { active = false }
  }, [user, router])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.updateProfile({
        name, age: age ? Number(age) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        heightCm: height ? Number(height) : undefined,
        gender, avatarEmoji: emoji,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
    setSaving(false)
  }

  const saveGuardian = async () => {
    setSavingG(true)
    try {
      await api.updateProfile({
        guardian: gSel,
        guardianPersonalities: cgPers,
      })
      setSavedG(true)
      setTimeout(() => setSavedG(false), 2500)
    } catch {}
    setSavingG(false)
  }

  const togglePers = (v: string) => {
    setCgPers(prev =>
      prev.includes(v) ? (prev.length > 1 ? prev.filter(x => x !== v) : prev) : [...prev, v]
    )
  }

  if (!loaded) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT, color: '#6b7280', fontSize: 15 }}>Loading your profile…</div>
    </div>
  )

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10,
                       padding: '6px 12px', color: '#86efac', cursor: 'pointer', fontSize: 20 }}
            >‹</button>
            <div>
              <div style={s.headerTitle}>My Profile</div>
              <div style={s.headerSub}>Manage your account, body stats &amp; guardian</div>
            </div>
          </div>
        </div>
      </div>

      <div style={s.body}>

        {/* Avatar + Name */}
        <div style={s.card}>
          <div style={s.cardTitle}>Your Identity</div>

          {/* Avatar picker */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div
              style={s.avatarRing}
              onClick={() => setShowEmoji(v => !v)}
              title="Change avatar"
            >{emoji}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT }}>Tap to change</div>
            {showEmoji && (
              <div style={s.avatarRow}>
                {AVATAR_EMOJIS.map(e => (
                  <button
                    key={e}
                    style={s.avatarOpt(emoji === e)}
                    onClick={() => { setEmoji(e); setShowEmoji(false) }}
                  >{e}</button>
                ))}
              </div>
            )}
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Display name</label>
            <input
              style={s.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Email</label>
            <div style={s.emailRow}>
              <input
                style={{ ...s.input, flex: 1 }}
                value={email}
                readOnly
              />
              <span style={s.verifyBadge(verified)}>
                {verified ? '✓ Verified' : '⚠ Unverified'}
              </span>
            </div>
            {!verified && (
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 6 }}>
                Check your inbox to verify your email address.
              </div>
            )}
          </div>
        </div>

        {/* Body Stats */}
        <div style={s.card}>
          <div style={s.cardTitle}>Body Stats</div>

          <div style={{ ...s.fieldGroup }}>
            <label style={s.label}>Gender</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {GENDER_OPTIONS.map(g => (
                <button
                  key={g.v}
                  style={s.genderBtn(gender === g.v)}
                  onClick={() => setGender(g.v)}
                >{g.label}</button>
              ))}
            </div>
          </div>

          <div style={s.grid3}>
            <div>
              <label style={s.label}>Age (yrs)</label>
              <input style={s.input} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="--" />
            </div>
            <div>
              <label style={s.label}>Weight (kg)</label>
              <input style={s.input} type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="--" />
            </div>
            <div>
              <label style={s.label}>Height (cm)</label>
              <input style={s.input} type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="--" />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={s.saveBtn(saving)} onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span style={s.savedTag}>✓ Saved!</span>}
          </div>
        </div>

        {/* Guardian Selector */}
        <div style={s.card}>
          <div style={s.cardTitle}>Your Guardian</div>
          <div style={s.guardianRow}>
            {GUARDIANS.map(g => (
              <div
                key={g.name.toLowerCase()}
                style={s.guardianCard(gSel === g.name.toLowerCase())}
                onClick={() => setGSel(g.name.toLowerCase() as 'meenu' | 'maddy')}
              >
                <span style={s.guardianEmoji}>{g.emoji}</span>
                <div style={s.guardianName}>{g.name}</div>
                <div style={s.guardianTagline}>{g.tagline}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={s.label}>Guardian personality</label>
            <div style={s.chipRow}>
              {PERSONALITIES.map(p => (
                <button
                  key={p.v}
                  style={s.chip(cgPers.includes(p.v))}
                  onClick={() => togglePers(p.v)}
                >{p.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Pick up to 3 traits that shape how your guardian speaks to you.
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={s.saveBtn(savingG)} onClick={saveGuardian} disabled={savingG}>
              {savingG ? 'Saving…' : 'Update guardian'}
            </button>
            {savedG && <span style={s.savedTag}>✓ Saved!</span>}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...s.card, border: '1.5px solid #fecaca' }}>
          <div style={{ ...s.cardTitle, color: '#dc2626' }}>Account</div>
          <div style={s.row}>
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              Sign out of your account across all devices.
            </div>
            <button
              style={s.dangerBtn}
              onClick={() => { logout(); router.push('/') }}
            >Sign out</button>
          </div>
        </div>

      </div>
    </div>
  )
}
