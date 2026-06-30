'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS, TRIAL_DAYS, launchDaysLeft } from '@/lib/appData'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const router     = useRouter()
  const [annual, setAnnual]     = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => { setDaysLeft(launchDaysLeft()) }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const priceMain = (p: typeof PLANS[number]) => {
    if (p.launchMonthly === 0) return '₹0'
    return annual ? `₹${Math.round(p.launchAnnual / 12)}` : `₹${p.launchMonthly}`
  }
  const priceOrig = (p: typeof PLANS[number]) => {
    if (p.originalMonthly === 0) return null
    return annual ? `₹${Math.round(p.originalAnnual / 12)}` : `₹${p.originalMonthly}`
  }
  const savePct = (p: typeof PLANS[number]) => {
    if (p.originalMonthly === 0) return null
    const orig   = annual ? Math.round(p.originalAnnual / 12) : p.originalMonthly
    const launch = annual ? Math.round(p.launchAnnual / 12)   : p.launchMonthly
    const pct    = Math.round(((orig - launch) / orig) * 100)
    return pct > 0 ? pct : null
  }

  return (
    <section id="pricing" ref={sectionRef} className="section-pad" style={{ background: '#f9fafb' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 1.5, textTransform: 'uppercase' }}>Pricing</span>
          </div>
          <h2 className="section-h2" style={{ fontFamily: FONT, fontWeight: 800, lineHeight: 1.1, marginBottom: 18 }}>
            Start Free.<br /><span className="gradient-text-green">Upgrade When Ready.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 520, margin: '0 auto 18px', lineHeight: 1.8 }}>
            Every new account starts with a <strong>{TRIAL_DAYS}-day free Gold trial</strong> — all features unlocked, no card needed.
          </p>

          {/* Launch offer banner */}
          {daysLeft > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 100, padding: '7px 20px', marginBottom: 18, fontSize: 13, color: '#92400e', fontWeight: 700 }}>
              🔥 Launch offer — {daysLeft} day{daysLeft === 1 ? '' : 's'} left · Ends Aug 31, 2026
            </div>
          )}

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e5e7eb', borderRadius: 100, padding: 4 }}>
            {['Monthly', 'Annual · Save 33%'].map((label, i) => (
              <button key={label} onClick={() => setAnnual(i === 1)}
                style={{
                  padding: '9px 22px', borderRadius: 100,
                  background: (i === 1) === annual ? '#fff' : 'transparent',
                  color: (i === 1) === annual ? '#052e16' : '#6b7280',
                  border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT,
                  boxShadow: (i === 1) === annual ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {PLANS.map((plan) => {
            const orig  = priceOrig(plan)
            const pct   = savePct(plan)
            const isPop = !!plan.popular

            return (
              <div key={plan.key} className="price-card reveal"
                style={{
                  background: isPop ? 'linear-gradient(160deg,#f0fdf4,#dcfce7)' : '#fff',
                  borderRadius: 24, padding: '30px 24px',
                  border: `2px solid ${isPop ? '#16a34a' : '#e5e7eb'}`, position: 'relative',
                  boxShadow: isPop ? '0 20px 60px rgba(22,163,74,0.18)' : '0 4px 24px rgba(0,0,0,0.05)',
                }}>
                {isPop && (
                  <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 18px', borderRadius: '0 0 12px 12px', whiteSpace: 'nowrap', fontFamily: FONT, boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
                    ★ MOST POPULAR
                  </div>
                )}

                {/* Emoji + name */}
                <div style={{ fontSize: 26, marginBottom: 8, marginTop: isPop ? 12 : 0 }}>{plan.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: isPop ? '#052e16' : '#374151', marginBottom: 3 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>{plan.tagline}</div>

                {/* AI limits pill */}
                {plan.genLimit > 0 && (
                  <div style={{ display: 'inline-block', background: isPop ? 'rgba(22,163,74,0.12)' : '#f3f4f6', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: isPop ? '#16a34a' : '#374151', marginBottom: 14 }}>
                    ✦ {plan.genLimit} gen{plan.genLimit > 1 ? 's' : ''} + {plan.uploadLimit} upload{plan.uploadLimit > 1 ? 's' : ''} / mo
                  </div>
                )}

                {/* Strikethrough + savings pill */}
                <div style={{ minHeight: 22, marginBottom: 4 }}>
                  {orig && (
                    <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through', marginRight: 6 }}>{orig}</span>
                  )}
                  {pct && (
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#fef3c7', color: '#92400e', borderRadius: 100, padding: '2px 8px' }}>{pct}% off</span>
                  )}
                </div>

                {/* Launch price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#052e16', letterSpacing: -2, lineHeight: 1 }}>{priceMain(plan)}</span>
                  {plan.launchMonthly > 0 && <span style={{ fontSize: 13, color: '#6b7280' }}>/mo</span>}
                </div>
                <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${isPop ? 'rgba(22,163,74,0.2)' : '#e5e7eb'}` }}>
                  {plan.launchMonthly === 0 ? 'forever' : annual ? `billed ₹${plan.launchAnnual}/yr` : 'billed monthly'}
                </p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: isPop ? '#16a34a' : '#f0fdf4', border: `1.5px solid ${isPop ? '#16a34a' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 9, color: isPop ? '#fff' : '#16a34a' }}>✓</span>
                      </div>
                      <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                  {plan.soon?.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: 0.55 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#f3f4f6', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 9 }}>🚀</span>
                      </div>
                      <span style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.5 }}>{f} <span style={{ fontSize: 10, fontWeight: 700 }}>Soon</span></span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push('/upgrade')}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    background: isPop ? 'linear-gradient(135deg,#16a34a,#22c55e)' : plan.key === 'free' ? '#f3f4f6' : '#052e16',
                    color: plan.key === 'free' ? '#374151' : '#fff',
                    fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
                    border: isPop ? '1.5px solid transparent' : '1.5px solid #e5e7eb', fontFamily: FONT,
                    boxShadow: isPop ? '0 8px 24px rgba(22,163,74,0.3)' : 'none',
                  }}>
                  {plan.key === 'free' ? 'Start free' : `Choose ${plan.name}`} →
                </button>
              </div>
            )
          })}
        </div>

        {/* Trust row */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
          <div className="trust-row">
            {[
              ['🛡️', `${TRIAL_DAYS}-day free Gold trial`],
              ['🌍', 'Works worldwide'],
              ['↩️', 'Cancel anytime'],
              ['💳', 'No card needed to start'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 18 }}>Paid plans are billed through the App Store, Google Play or Razorpay. Prices in INR. Launch pricing valid until Aug 31, 2026.</p>
        </div>
      </div>
    </section>
  )
}
