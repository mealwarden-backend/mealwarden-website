'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PLANS, TRIAL_DAYS } from '@/lib/appData'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

export default function Upgrade() {
  const { user } = useAuth()
  const router   = useRouter()

  const [annual, setAnnual]   = useState(true)
  const [tier, setTier]       = useState('free')
  const [isTrial, setIsTrial] = useState(false)
  const [trialDays, setTrialDays] = useState(0)
  const [loading, setLoading] = useState(true)

  // Redeem code
  const [code, setCode]       = useState('')
  const [busy, setBusy]       = useState(false)
  const [msg, setMsg]         = useState('')
  const [msgOk, setMsgOk]     = useState(false)

  useEffect(() => { if (!user) router.push('/') }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSub = async () => {
    try {
      const d = await api.getSubscription()
      setTier(String(d?.tier || 'free'))
      setIsTrial(!!d?.isTrial)
      setTrialDays(Number(d?.trialDaysLeft || 0))
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { if (user) loadSub() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const redeem = async () => {
    if (!code.trim() || busy) return
    setBusy(true); setMsg('')
    try {
      const d = await api.activateCode(code.trim().toUpperCase())
      setMsgOk(true); setMsg(`${String(d?.tier || 'Plan').toUpperCase()} unlocked! 🎉`)
      setCode('')
      loadSub()
    } catch (e: any) {
      setMsgOk(false); setMsg(e?.message || 'That code isn\'t valid.')
    } finally { setBusy(false) }
  }

  if (!user) return null

  const priceMain = (p: typeof PLANS[number]) => p.monthly === 0 ? '₹0' : (annual ? `₹${Math.round(p.annual / 12)}` : `₹${p.monthly}`)
  const priceSub  = (p: typeof PLANS[number]) => p.monthly === 0 ? 'forever' : (annual ? `/mo · billed ₹${p.annual}/yr` : '/month')

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '48px 48px 80px', textAlign: 'center' }}>
        <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 24, fontWeight: 500 }}>← Back to Dashboard</div>
        <h1 style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Choose Your Plan 💎</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
          {isTrial
            ? `You're on the Gold free trial — ${trialDays} day${trialDays === 1 ? '' : 's'} left. Pick a plan to keep your features after it ends.`
            : `You're on the ${tier.toUpperCase()} plan. Upgrade anytime.`}
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: 4, marginTop: 22 }}>
          {['Monthly', 'Annual · Save 33%'].map((label, i) => (
            <button key={label} onClick={() => setAnnual(i === 1)} style={{ padding: '9px 20px', borderRadius: 100, background: (i === 1) === annual ? '#fff' : 'transparent', color: (i === 1) === annual ? '#052e16' : 'rgba(255,255,255,0.85)', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '-50px auto 0', padding: '0 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
          {PLANS.map((p) => {
            const current = tier === p.key
            return (
              <div key={p.key} style={{ background: p.popular ? '#f0fdf4' : '#fff', border: `2px solid ${p.popular ? '#16a34a' : '#e5e7eb'}`, borderRadius: 24, padding: '34px 26px', position: 'relative', boxShadow: p.popular ? '0 20px 60px rgba(22,163,74,0.18)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
                {p.popular && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                {current && <div style={{ position: 'absolute', top: 16, right: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '2px 10px', fontSize: 11, color: '#16a34a', fontWeight: 700 }}>Current</div>}

                <div style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>{p.tagline}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                  <span style={{ fontFamily: FONT, fontSize: 38, fontWeight: 800, color: '#052e16' }}>{priceMain(p)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #e5e7eb' }}>{priceSub(p)}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.popular ? '#16a34a' : '#f0fdf4', border: `1.5px solid ${p.popular ? '#16a34a' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 10, color: p.popular ? '#fff' : '#16a34a' }}>✓</span>
                      </div>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button disabled={current || loading} style={{ width: '100%', padding: '13px', background: current ? '#f3f4f6' : (p.popular ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#052e16'), color: current ? '#9ca3af' : '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: current ? 'not-allowed' : 'pointer', fontFamily: FONT }}
                  onClick={() => { if (!current && p.key !== 'free') { setMsgOk(false); setMsg('Paid plans launch soon — got an invite/founding code? Redeem it below to unlock now.') } }}>
                  {current ? 'Current plan' : p.key === 'free' ? 'Free' : `Choose ${p.name}`}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', marginTop: 18 }}>
          Every account starts with a {TRIAL_DAYS}-day free Gold trial. Paid plans are billed via the App Store / Google Play. Prices in INR.
        </p>

        {/* Redeem code */}
        <div style={{ maxWidth: 460, margin: '32px auto 0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#052e16', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 12 }}>Have a code?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Invite / founding code"
              style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: '#111827', outline: 'none', letterSpacing: 1, fontFamily: FONT }} />
            <button onClick={redeem} disabled={!code.trim() || busy} style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, padding: '0 22px', fontWeight: 800, fontSize: 14, cursor: !code.trim() || busy ? 'not-allowed' : 'pointer', opacity: !code.trim() || busy ? 0.6 : 1, fontFamily: FONT }}>{busy ? '…' : 'Unlock'}</button>
          </div>
          {msg && <p style={{ marginTop: 12, fontSize: 13, color: msgOk ? '#16a34a' : '#6b7280', fontWeight: msgOk ? 700 : 500 }}>{msg}</p>}
        </div>
      </div>
    </div>
  )
}
