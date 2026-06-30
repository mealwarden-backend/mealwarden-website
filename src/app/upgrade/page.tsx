'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { PLANS, TRIAL_DAYS, launchDaysLeft } from '@/lib/appData'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

export default function Upgrade() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tier, setTier]           = useState('free')
  const [isTrial, setIsTrial]     = useState(false)
  const [trialDays, setTrialDays] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [annual, setAnnual]       = useState(false)
  const daysLeft = launchDaysLeft()

  // Promo code
  const [code, setCode]   = useState('')
  const [busy, setBusy]   = useState(false)
  const [msg, setMsg]     = useState('')
  const [msgOk, setMsgOk] = useState(false)

  useEffect(() => { if (!authLoading && !user) router.push('/') }, [authLoading, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSub = useCallback(async () => {
    try {
      const d = await api.getSubscription()
      setTier(String(d?.tier || d?.paidTier || 'free'))
      setIsTrial(!!d?.isTrial)
      setTrialDays(Number(d?.trialDaysLeft || 0))
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { if (user) loadSub() }, [user, loadSub])

  const redeem = async () => {
    if (!code.trim() || busy) return
    setBusy(true); setMsg('')
    try {
      const d = await api.activateCode(code.trim().toUpperCase())
      setMsgOk(true); setMsg(`${String(d?.tier || 'Plan').toUpperCase()} unlocked! 🎉`)
      setCode(''); loadSub()
    } catch (e: any) {
      setMsgOk(false); setMsg(e?.message || 'That code isn\'t valid.')
    } finally { setBusy(false) }
  }

  if (authLoading || !user) return null

  const getPrice = (plan: typeof PLANS[number]) => {
    if (plan.launchMonthly === 0) return '₹0'
    return annual
      ? `₹${Math.round(plan.launchAnnual / 12)}`
      : `₹${plan.launchMonthly}`
  }
  const getOriginalPrice = (plan: typeof PLANS[number]) => {
    if (plan.originalMonthly === 0) return null
    return annual
      ? `₹${Math.round(plan.originalAnnual / 12)}`
      : `₹${plan.originalMonthly}`
  }
  const getSavings = (plan: typeof PLANS[number]) => {
    if (plan.originalMonthly === 0) return null
    const orig   = annual ? Math.round(plan.originalAnnual / 12) : plan.originalMonthly
    const launch = annual ? Math.round(plan.launchAnnual / 12)   : plan.launchMonthly
    const pct    = Math.round(((orig - launch) / orig) * 100)
    return pct > 0 ? `${pct}% off` : null
  }
  const isCurrentTier = (key: string) => tier === key && !isTrial

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a,#22c55e)', padding: '40px 24px 70px', textAlign: 'center' }}>
        <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: 14, cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>
          ← Back to Dashboard
        </div>

        {isTrial && (
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 100, padding: '6px 18px', marginBottom: 14, fontSize: 13, color: '#fff', fontWeight: 700 }}>
            ⏳ Gold trial — {trialDays} day{trialDays === 1 ? '' : 's'} remaining
          </div>
        )}

        <h1 style={{ fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.15 }}>
          Choose your plan
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, maxWidth: 480, margin: '0 auto 18px', lineHeight: 1.6 }}>
          {isTrial
            ? `Your ${TRIAL_DAYS}-day Gold trial is active. Lock in launch pricing before it ends.`
            : `Every account starts with a ${TRIAL_DAYS}-day Gold trial. No card needed.`}
        </p>

        {/* Launch offer banner */}
        {daysLeft > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100, padding: '7px 20px', marginBottom: 20, fontSize: 13, color: '#fff', fontWeight: 700 }}>
            🔥 Launch offer · {daysLeft} day{daysLeft === 1 ? '' : 's'} left · Ends Aug 31, 2026
          </div>
        )}

        {/* Monthly / Annual toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: 4 }}>
          {['Monthly', 'Annual · Save 33%'].map((label, i) => (
            <button key={label} onClick={() => setAnnual(i === 1)}
              style={{
                padding: '9px 22px', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: (i === 1) === annual ? '#fff' : 'transparent',
                color: (i === 1) === annual ? '#052e16' : 'rgba(255,255,255,0.85)',
                fontWeight: 700, fontSize: 13, fontFamily: FONT,
                boxShadow: (i === 1) === annual ? '0 2px 10px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.2s',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '-48px auto 0', padding: '0 20px 60px' }}>

        {/* ── Plan cards ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
          {PLANS.map((plan) => {
            const origPrice = getOriginalPrice(plan)
            const savings   = getSavings(plan)
            const current   = isCurrentTier(plan.key)
            const isPop     = !!plan.popular

            return (
              <div key={plan.key}
                style={{
                  background: isPop ? 'linear-gradient(160deg,#f0fdf4,#dcfce7)' : '#fff',
                  borderRadius: 22, padding: '28px 20px',
                  border: `2px solid ${isPop ? '#16a34a' : current ? '#6b7280' : '#e5e7eb'}`,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: isPop ? '0 16px 48px rgba(22,163,74,0.18)' : '0 4px 20px rgba(0,0,0,0.06)',
                }}>

                {isPop && (
                  <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 18px', borderRadius: '0 0 12px 12px', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                    ★ MOST POPULAR
                  </div>
                )}
                {current && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#e5e7eb', color: '#6b7280', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100 }}>
                    CURRENT
                  </div>
                )}

                {/* Emoji + name */}
                <div style={{ fontSize: 28, marginBottom: 8, marginTop: isPop ? 14 : 0 }}>{plan.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: isPop ? '#052e16' : '#111827', marginBottom: 2 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{plan.tagline}</div>

                {/* AI limits pill */}
                {plan.genLimit > 0 && (
                  <div style={{ display: 'inline-block', background: isPop ? 'rgba(22,163,74,0.12)' : '#f3f4f6', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: isPop ? '#16a34a' : '#374151', marginBottom: 14 }}>
                    ✦ {plan.genLimit} gen{plan.genLimit > 1 ? 's' : ''} + {plan.uploadLimit} upload{plan.uploadLimit > 1 ? 's' : ''} / mo
                  </div>
                )}

                {/* Price */}
                <div style={{ marginBottom: 4, minHeight: 22 }}>
                  {origPrice && (
                    <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through', marginRight: 6 }}>{origPrice}</span>
                  )}
                  {savings && (
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#fef3c7', color: '#92400e', borderRadius: 100, padding: '2px 8px' }}>{savings}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: isPop ? '#052e16' : '#111827', lineHeight: 1 }}>{getPrice(plan)}</span>
                  {plan.launchMonthly > 0 && <span style={{ fontSize: 13, color: '#6b7280' }}>/mo</span>}
                </div>
                {plan.launchMonthly > 0 ? (
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>
                    {annual ? `billed ₹${plan.launchAnnual}/yr` : 'billed monthly'}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>forever free</div>
                )}

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22, paddingBottom: 22, borderBottom: `1px solid ${isPop ? 'rgba(22,163,74,0.2)' : '#f3f4f6'}` }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: isPop ? '#16a34a' : '#f0fdf4', border: `1.5px solid ${isPop ? '#16a34a' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 9, color: isPop ? '#fff' : '#16a34a' }}>✓</span>
                      </div>
                      <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.45 }}>{f}</span>
                    </div>
                  ))}
                  {plan.soon?.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: 0.6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#f3f4f6', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 9 }}>🚀</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.45 }}>{f} <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af' }}>Soon</span></span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: current || plan.key === 'free' ? 'default' : 'pointer',
                    background: current ? '#f3f4f6' : isPop ? 'linear-gradient(135deg,#16a34a,#22c55e)' : plan.key === 'free' ? '#f3f4f6' : '#052e16',
                    color: current || plan.key === 'free' ? '#6b7280' : '#fff',
                    fontWeight: 800, fontSize: 14, fontFamily: FONT,
                    boxShadow: isPop ? '0 6px 20px rgba(22,163,74,0.3)' : 'none',
                    opacity: loading ? 0.6 : 1,
                  }}
                  disabled={current || loading || plan.key === 'free'}
                  onClick={() => {
                    if (plan.key === 'free' || current) return
                    alert('Payment integration coming soon. Use a promo code below, or subscribe directly in the MealWarden app.')
                  }}
                >
                  {current
                    ? 'Current plan'
                    : plan.key === 'free'
                    ? 'Always free'
                    : isTrial
                    ? `Subscribe to ${plan.name}`
                    : `Get ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Trust row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 28px', marginBottom: 36 }}>
          {[
            ['🛡️', `${TRIAL_DAYS}-day free Gold trial`],
            ['💳', 'No card needed to start'],
            ['↩️', 'Cancel anytime'],
            ['📱', 'Available on iOS & Android'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {text}
            </div>
          ))}
        </div>

        {/* MealWarden Credits upsell */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '22px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 36 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginBottom: 4 }}>Need more AI actions this month?</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.55 }}>
              Top up with MealWarden Credits — extra diet generations (₹49) or plan uploads (₹69) beyond your monthly limit.
            </div>
          </div>
          <button
            onClick={() => router.push('/mw-credits')}
            style={{ padding: '11px 20px', borderRadius: 12, border: '1.5px solid #16a34a', background: 'transparent', color: '#16a34a', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}>
            Buy Credits →
          </button>
        </div>

        {/* Promo code */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '22px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginBottom: 4 }}>Have a promo code?</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>Enter it below to unlock a plan or trial extension.</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && redeem()}
              placeholder="e.g. LAUNCH50"
              style={{
                flex: 1, minWidth: 160, padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: FONT,
                outline: 'none', background: '#f9fafb', fontWeight: 700, letterSpacing: 1,
              }}
            />
            <button
              onClick={redeem}
              disabled={busy || !code.trim()}
              style={{
                padding: '12px 22px', borderRadius: 12, border: 'none', cursor: busy ? 'wait' : 'pointer',
                background: busy || !code.trim() ? '#e5e7eb' : '#052e16',
                color: busy || !code.trim() ? '#9ca3af' : '#fff',
                fontWeight: 800, fontSize: 14, fontFamily: FONT,
              }}>
              {busy ? 'Checking…' : 'Redeem'}
            </button>
          </div>
          {msg && (
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: msgOk ? '#16a34a' : '#dc2626' }}>
              {msg}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
          Paid plans are billed via Razorpay (India) or App Store / Play Store.<br />
          Prices in INR. Launch pricing valid until Aug 31, 2026.
        </p>
      </div>
    </div>
  )
}
