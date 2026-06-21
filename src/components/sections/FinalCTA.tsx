'use client'

import { useEffect, useRef, useState } from 'react'
import ComingSoonModal from '@/components/ComingSoonModal'

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const [cs, setCs] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current
      ?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} style={{ padding: '0 48px 120px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="reveal"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)',
            border: '1.5px solid #bbf7d0',
            borderRadius: 40, padding: '100px 60px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Blobs */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', border: '1px solid #bbf7d0',
              borderRadius: 100, padding: '7px 18px', marginBottom: 32,
              boxShadow: '0 4px 16px rgba(22,163,74,0.12)',
            }}>
              <span style={{ fontSize: 16 }}>🛡️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Your Guardian is Ready & Waiting</span>
              <span className="dot-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              fontSize: 60, fontWeight: 800,
              letterSpacing: -2.5, color: '#052e16',
              lineHeight: 1.05, marginBottom: 24,
            }}>
              Stop Breaking<br />
              Your Diet Goals.<br />
              <span className="gradient-text-green">Let MealWarden Guard.</span>
            </h2>

            <p style={{
              fontSize: 18, color: '#4b5563',
              maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.8,
            }}>
              Build the nutrition habit that finally sticks — reminders, AI meal plans, and a guardian in your corner. Free to start, no credit card required.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              <button
                className="btn-primary"
                onClick={() => setCs(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '17px 36px',
                  background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontWeight: 800, fontSize: 16, cursor: 'pointer',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  boxShadow: '0 12px 36px rgba(22,163,74,0.4)',
                }}
              >
                <span style={{ fontSize: 24 }}>🍎</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500, marginBottom: 1 }}>Download on</div>
                  <div>App Store</div>
                </div>
              </button>

              <button
                className="btn-secondary"
                onClick={() => setCs(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '17px 36px',
                  background: '#fff', color: '#374151',
                  border: '2px solid #e5e7eb', borderRadius: 14,
                  fontWeight: 800, fontSize: 16, cursor: 'pointer',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ fontSize: 24 }}>▶️</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, marginBottom: 1 }}>Get it on</div>
                  <div>Google Play</div>
                </div>
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
              {[
                ['🔒', 'End-to-end encrypted'],
                ['🇮🇳', 'Made in India'],
                ['⚡', 'Setup in 3 minutes'],
                ['↩️', 'Cancel anytime'],
              ].map(([icon, text]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </section>
  )
}