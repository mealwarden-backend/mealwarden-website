'use client'

import { useEffect, useRef, useState } from 'react'
import ComingSoonModal from '@/components/ComingSoonModal'

const steps = [
  {
    n: '01',
    icon: '📸',
    title: 'Upload Your Diet Chart',
    desc: 'Photograph or upload your dietitian\'s plan. Our AI reads it instantly — no manual entry, no hassle, no errors.',
    color: '#f0fdf4',
    border: '#bbf7d0',
    accent: '#16a34a',
  },
  {
    n: '02',
    icon: '⚙️',
    title: 'Configure Your Guardian',
    desc: 'Set your meal times, nutrition goals, reminder style, and overnight prep tasks. Takes less than 3 minutes.',
    color: '#eff6ff',
    border: '#bfdbfe',
    accent: '#3b82f6',
  },
  {
    n: '03',
    icon: '🛡️',
    title: 'Let MealWarden Guard You',
    desc: 'Relax. Your guardian handles reminders, meal logging, grocery lists, and weekly progress reports automatically.',
    color: '#fdf4ff',
    border: '#e9d5ff',
    accent: '#a855f7',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [cs, setCs] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current
      ?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{ background: '#f9fafb', padding: '120px 48px' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 100, padding: '6px 18px', marginBottom: 20,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#3b82f6',
              letterSpacing: 1.5, textTransform: 'uppercase' as const,
            }}>
              How It Works
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
            fontSize: 52, fontWeight: 800,
            letterSpacing: -2, color: '#052e16',
            lineHeight: 1.1, marginBottom: 18,
          }}>
            Up & Running<br />
            <span className="gradient-text-green">In 3 Simple Steps</span>
          </h2>

          <p style={{
            fontSize: 17, color: '#6b7280',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.8,
          }}>
            No complicated setup. No confusion. Scan, configure, and let your guardian do the rest — forever.
          </p>
        </div>

        {/* Steps */}
        <div style={{ position: 'relative' }}>

          {/* Connector line */}
          <div style={{
            position: 'absolute',
            top: 52,
            left: 'calc(16.5% + 28px)',
            right: 'calc(16.5% + 28px)',
            height: 2,
            background: 'linear-gradient(to right, #16a34a, #3b82f6, #a855f7)',
            borderRadius: 2,
            zIndex: 0,
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28, position: 'relative', zIndex: 1,
          }}>
            {steps.map((s, i) => (
              <div key={i} className={`reveal delay-${i + 1}`}>

                {/* Circle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: s.color,
                    border: `3px solid ${s.accent}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 28,
                    position: 'relative',
                    boxShadow: `0 0 0 6px ${s.accent}18`,
                  }}>
                    {s.icon}
                    <div style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 24, height: 24, borderRadius: '50%',
                      background: s.accent,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#fff',
                      fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                    }}>
                      {i + 1}
                    </div>
                  </div>
                </div>

                {/* Card */}
                <div style={{
                  background: '#fff', borderRadius: 24,
                  padding: '32px 28px',
                  border: `1.5px solid ${s.border}`,
                  textAlign: 'center',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: s.accent,
                    letterSpacing: 2, textTransform: 'uppercase' as const,
                    marginBottom: 12,
                  }}>
                    Step {s.n}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                    fontSize: 22, fontWeight: 700, color: '#052e16',
                    marginBottom: 14, letterSpacing: -0.5,
                  }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.75 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 64 }}>
          <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 20 }}>
            Ready in under 3 minutes · No credit card required
          </p>
          <button
            className="btn-primary"
            onClick={() => setCs(true)}
            style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg,#16a34a,#22c55e)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
            }}
          >
            Get MealWarden ↗
          </button>
        </div>

      </div>

      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </section>
  )
}