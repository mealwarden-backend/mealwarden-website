'use client'

import { useEffect, useRef, useState } from 'react'
import { PLANS, TRIAL_DAYS } from '@/lib/appData'
import ComingSoonModal from '@/components/ComingSoonModal'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const [annual, setAnnual] = useState(true)
  const [cs, setCs] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const priceMain = (p: typeof PLANS[number]) => {
    if (p.monthly === 0) return '₹0'
    return annual ? `₹${Math.round(p.annual / 12)}` : `₹${p.monthly}`
  }
  const priceSub = (p: typeof PLANS[number]) => {
    if (p.monthly === 0) return 'forever'
    return annual ? `/mo · billed ₹${p.annual}/yr` : '/month'
  }

  return (
    <section id="pricing" ref={sectionRef} style={{ background: '#f9fafb', padding: '120px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 1.5, textTransform: 'uppercase' }}>Pricing</span>
          </div>
          <h2 style={{ fontFamily: FONT, fontSize: 52, fontWeight: 800, letterSpacing: -2, color: '#052e16', lineHeight: 1.1, marginBottom: 18 }}>
            Start Free.<br /><span className="gradient-text-green">Upgrade When Ready.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 520, margin: '0 auto 18px', lineHeight: 1.8 }}>
            Every new account starts with a <strong>{TRIAL_DAYS}-day free Gold trial</strong> — all features unlocked, no card needed.
          </p>

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
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {PLANS.map((plan) => (
            <div key={plan.key} className="price-card reveal"
              style={{
                background: plan.popular ? '#f0fdf4' : '#fff', borderRadius: 24, padding: '34px 26px',
                border: `2px solid ${plan.popular ? '#16a34a' : '#e5e7eb'}`, position: 'relative',
                boxShadow: plan.popular ? '0 20px 60px rgba(22,163,74,0.18)' : '0 4px 24px rgba(0,0,0,0.05)',
              }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 20px', borderRadius: 100, whiteSpace: 'nowrap', fontFamily: FONT, boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
                  ★ MOST POPULAR
                </div>
              )}

              <div style={{ fontSize: 13, fontWeight: 700, color: plan.popular ? '#16a34a' : '#6b7280', marginBottom: 8, letterSpacing: 0.5 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{plan.tagline}</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 42, fontWeight: 800, color: '#052e16', letterSpacing: -2, lineHeight: 1 }}>{priceMain(plan)}</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #e5e7eb' }}>{priceSub(plan)}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.popular ? '#16a34a' : '#f0fdf4', border: `1.5px solid ${plan.popular ? '#16a34a' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 10, color: plan.popular ? '#fff' : '#16a34a' }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary" onClick={() => setCs(true)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: plan.popular ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#f3f4f6',
                  color: plan.popular ? '#fff' : '#374151',
                  fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
                  border: plan.popular ? '1.5px solid transparent' : '1.5px solid #e5e7eb', fontFamily: FONT,
                  boxShadow: plan.popular ? '0 8px 24px rgba(22,163,74,0.3)' : 'none',
                }}>
                {plan.key === 'free' ? 'Start free' : `Choose ${plan.name}`} →
              </button>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
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
          <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 18 }}>Paid plans are billed through the App Store and Google Play. Prices in INR.</p>
        </div>
      </div>

      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </section>
  )
}
