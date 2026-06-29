'use client'

import { useEffect, useRef } from 'react'

const testimonials = [
  {
    name: 'Ritika S.',
    city: 'Mumbai',
    role: 'Fitness Coach',
    stars: 5,
    text: 'I\'ve tried 6 diet apps. MealWarden is the only one where I actually stick to my meals. The AI scanner saved me hours of manual entry every single week.',
    avatar: 'R',
    color: '#f0fdf4',
    border: '#bbf7d0',
    ac: '#16a34a',
  },
  {
    name: 'Arjun M.',
    city: 'Bangalore',
    role: 'Software Engineer',
    stars: 5,
    text: 'KAEL keeps me brutally accountable. Lost 8kg in 3 months with zero cheat meals. When your guardian is watching 24/7, you simply don\'t slack off.',
    avatar: 'A',
    color: '#eff6ff',
    border: '#bfdbfe',
    ac: '#3b82f6',
  },
  {
    name: 'Priya K.',
    city: 'Hyderabad',
    role: 'Working Mom',
    stars: 5,
    text: 'The WhatsApp reminders changed my life completely. It\'s like having a personal nutritionist in my pocket. My whole family is now on MealWarden.',
    avatar: 'P',
    color: '#fdf4ff',
    border: '#e9d5ff',
    ac: '#a855f7',
  },
  {
    name: 'Rahul D.',
    city: 'Delhi',
    role: 'Entrepreneur',
    stars: 5,
    text: 'Scanned my dietitian\'s 3-page handwritten chart in 10 seconds flat. Absolutely mind-blowing technology. The grocery list feature alone is worth the subscription.',
    avatar: 'R',
    color: '#fff7ed',
    border: '#fed7aa',
    ac: '#f97316',
  },
]

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '4.9 ★', label: 'App Store Rating' },
  { value: '98%', label: 'Goal Success Rate' },
  { value: '42+', label: 'Avg Streak Days' },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

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

  return (
    <section id="testimonials"
      ref={sectionRef}
      className="section-pad"
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      {/* Header */}
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: 100, padding: '6px 18px', marginBottom: 20,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ea580c', letterSpacing: 1.5, textTransform: 'uppercase' as const }}>
            ❤️ Loved By Users
          </span>
        </div>

        <h2 className="section-h2" style={{
          fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
          fontWeight: 800,
          lineHeight: 1.1, marginBottom: 18,
        }}>
          Real People,<br />
          <span className="gradient-text-warm">Real Transformations</span>
        </h2>

        <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
          Thousands of people across India have transformed their nutrition with MealWarden. Here's what they say.
        </p>
      </div>

      {/* Stats row */}
      <div className="reveal testi-stats-grid">
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: '32px 24px',
            textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              fontSize: 36,
              fontWeight: 800,
              color: '#4ade80',
              letterSpacing: -1,
              marginBottom: 6,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial cards */}
      <div className="testi-cards-grid">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`testi-card reveal delay-${i + 1}`}
            style={{
              background: t.color,
              borderRadius: 24,
              padding: '28px 24px',
              border: `1.5px solid ${t.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Stars */}
            <div style={{ display: 'flex', gap: 3 }}>
              {[...Array(t.stars)].map((_, j) => (
                <span key={j} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>
              ))}
            </div>

            {/* Quote */}
            <p style={{
              fontSize: 14,
              color: '#374151',
              lineHeight: 1.75,
              fontStyle: 'italic',
              flex: 1,
            }}>
              "{t.text}"
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: t.border }} />

            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${t.ac}, ${t.ac}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                color: '#fff',
                fontSize: 16,
                flexShrink: 0,
              }}>
                {t.avatar}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{t.role} · {t.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom social proof */}
      <div className="reveal" style={{ textAlign: 'center', marginTop: 56 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 100,
          padding: '10px 24px',
        }}>
          <div style={{ display: 'flex' }}>
            {['#16a34a', '#3b82f6', '#a855f7', '#f97316'].map((c, i) => (
              <div key={i} style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c,
                border: '2px solid #fff',
                marginLeft: i > 0 ? -8 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#fff',
                fontWeight: 700,
              }}>
                {['R', 'A', 'P', 'R'][i]}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            Join <strong style={{ color: '#052e16' }}>50,000+</strong> users already guarding their meals
          </span>
          <span style={{ fontSize: 18 }}>🛡️</span>
        </div>
      </div>
    </section>
  )
}