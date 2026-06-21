'use client'

import { useEffect, useRef, useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    desc: 'Perfect to get started with MealWarden',
    color: '#fff',
    border: '#e5e7eb',
    highlight: false,
    ctaLabel: 'Start Free',
    ctaBg: '#f3f4f6',
    ctaColor: '#374151',
    ctaBorder: '#e5e7eb',
    features: [
      '5 meal reminders per day',
      'Basic weight tracking',
      'Manual grocery list',
      'Community access',
      '1 diet chart upload',
      'Standard support',
    ],
  },
  {
    name: 'Premium',
    price: 299,
    period: 'month',
    desc: 'For people serious about their nutrition',
    color: '#f0fdf4',
    border: '#16a34a',
    highlight: true,
    ctaLabel: 'Get Premium',
    ctaBg: 'linear-gradient(135deg,#16a34a,#22c55e)',
    ctaColor: '#fff',
    ctaBorder: 'transparent',
    features: [
      'Unlimited meal reminders',
      'AI diet chart scanner',
      'Full macro & calorie tracking',
      'AI recipe suggestions',
      'Advanced weight analytics',
      'Prep task automation',
      'Priority email support',
    ],
  },
  {
    name: 'Gold ✦',
    price: 599,
    period: 'month',
    desc: 'The complete guardian experience',
    color: '#fffbeb',
    border: '#f59e0b',
    highlight: false,
    ctaLabel: 'Go Gold',
    ctaBg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    ctaColor: '#fff',
    ctaBorder: 'transparent',
    features: [
      'Everything in Premium',
      'WhatsApp Guardian alerts',
      'AI Voice Guardian (ARIA / KAEL)',
      'Real-time meal logging via chat',
      'Custom meal plan builder',
      'Weekly AI nutrition check-ins',
      'Earliest feature access',
    ],
  },
]

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const [annual, setAnnual] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const getPrice = (base: number) => {
    if (base === 0) return '₹0'
    return annual ? `₹${Math.round(base * 0.8)}` : `₹${base}`
  }

  return (
    <section
      ref={sectionRef}
      style={{ background: '#f9fafb', padding: '120px 48px' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 100, padding: '6px 18px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 1.5, textTransform: 'uppercase' as const }}>
              Pricing
            </span>
          </div>

          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800,
            letterSpacing: -2, color: '#052e16', lineHeight: 1.1, marginBottom: 18,
          }}>
            Start Free.<br />
            <span className="gradient-text-green">Upgrade When Ready.</span>
          </h2>

          <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.8 }}>
            No hidden fees. No surprise charges. Cancel anytime. Your guardian works for you.
          </p>

          {/* Billing toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#e5e7eb',
            borderRadius: 100,
            padding: 4,
          }}>
            {['Monthly', 'Annual (Save 20%)'].map((label, i) => (
              <button
                key={label}
                onClick={() => setAnnual(i === 1)}
                style={{
                  padding: '9px 22px',
                  borderRadius: 100,
                  background: (i === 1) === annual ? '#fff' : 'transparent',
                  color: (i === 1) === annual ? '#052e16' : '#6b7280',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.3s ease',
                  boxShadow: (i === 1) === annual ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`price-card reveal delay-${i + 1}`}
              style={{
                background: plan.color,
                borderRadius: 28,
                padding: '40px 32px',
                border: `2px solid ${plan.border}`,
                position: 'relative',
                boxShadow: plan.highlight
                  ? '0 20px 60px rgba(22,163,74,0.18)'
                  : '0 4px 24px rgba(0,0,0,0.05)',
              }}
            >
              {/* Most popular badge */}
              {plan.highlight && (
                <div style={{
                  position: 'absolute',
                  top: -15,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '5px 20px',
                  borderRadius: 100,
                  whiteSpace: 'nowrap' as const,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
                }}>
                  ✦ MOST POPULAR
                </div>
              )}

              {/* Plan name */}
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: plan.highlight ? '#16a34a' : '#6b7280',
                marginBottom: 8,
                letterSpacing: 0.5,
              }}>
                {plan.name}
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 48,
                  fontWeight: 800,
                  color: '#052e16',
                  letterSpacing: -2,
                  lineHeight: 1,
                }}>
                  {getPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
                    /{plan.period}
                  </span>
                )}
              </div>

              {/* Annual savings badge */}
              {annual && plan.price > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  borderRadius: 100,
                  padding: '3px 10px',
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                    You save ₹{Math.round(plan.price * 0.2 * 12)}/year
                  </span>
                </div>
              )}

              <p style={{
                fontSize: 13,
                color: '#6b7280',
                marginBottom: 28,
                paddingBottom: 28,
                borderBottom: '1px solid #e5e7eb',
                lineHeight: 1.6,
              }}>
                {plan.desc}
              </p>

              {/* Features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: plan.highlight ? '#16a34a' : '#f0fdf4',
                      border: `1.5px solid ${plan.highlight ? '#16a34a' : '#bbf7d0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      <span style={{ fontSize: 11, color: plan.highlight ? '#fff' : '#16a34a' }}>✓</span>
                    </div>
                    <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: 12,
                  background: plan.ctaBg,
                  color: plan.ctaColor,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  border: `1.5px solid ${plan.ctaBorder}`,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: plan.highlight ? '0 8px 24px rgba(22,163,74,0.3)' : 'none',
                }}
              >
                {plan.ctaLabel} →
              </button>
            </div>
          ))}
        </div>

        {/* Bottom trust row */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              ['🔒', 'End-to-end encrypted'],
              ['🇮🇳', 'Made in India'],
              ['↩️', 'Cancel anytime'],
              ['💳', 'No credit card for Free plan'],
              ['⚡', 'Instant activation'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}