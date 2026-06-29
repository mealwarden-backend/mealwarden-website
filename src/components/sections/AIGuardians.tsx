'use client'

import { useEffect, useRef, useState } from 'react'
import { GUARDIANS } from '@/lib/appData'
import BrandImg from '@/components/BrandImg'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

const messages = [
  { from: 'meenu', text: 'Good morning! 🌿 It\'s 7 AM — time for your first meal: oats with 3 boiled eggs. Shall I log it once you\'re done?' },
  { from: 'you',   text: 'Yes, just finished it ✅' },
  { from: 'meenu', text: 'Lovely! Logged — 48g protein, 320 kcal. Your next meal is at 10:30 AM: Greek yogurt + almonds. 💚' },
  { from: 'you',   text: 'Remind me 15 minutes before please' },
  { from: 'meenu', text: 'Done — reminder set for 10:15 AM. 🛡️ You\'re doing beautifully, keep it up!' },
]

export default function AIGuardians() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visibleMessages, setVisibleMessages] = useState(1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (visibleMessages >= messages.length) return
    const timer = setTimeout(() => setVisibleMessages((v) => v + 1), 1800)
    return () => clearTimeout(timer)
  }, [visibleMessages])

  return (
    <section ref={sectionRef} className="section-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="guardians-layout">

        {/* ── Left ── */}
        <div className="reveal-left" style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 1.5, textTransform: 'uppercase' }}>🛡️ Your Guardian</span>
          </div>

          <h2 className="section-h2-lg" style={{ fontFamily: FONT, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Meet Meenu<br /><span className="gradient-text-green">& Maddy.</span>
          </h2>

          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.85, marginBottom: 24, maxWidth: 440 }}>
            Pick the guardian that fits you. They watch over every meal, send gentle (or firm) reminders,
            answer your nutrition questions, and keep your streak alive — every single day. Chat with your
            guardian today — text and voice, powered by your guardian's personality.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
            {GUARDIANS.map((g) => (
              <div key={g.name} className="lift-sm" style={{ background: g.color, border: `2px solid ${g.border}`, borderRadius: 20, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <BrandImg src={g.img} fallback={g.emoji} size={48} radius={14} bg={`${g.ac}20`} style={{ border: `1.5px solid ${g.ac}40` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#052e16' }}>{g.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: g.ac, background: `${g.ac}15`, padding: '2px 10px', borderRadius: 100 }}>{g.tagline} · {g.role}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '8px 16px' }}>
              <span style={{ fontSize: 14 }}>💬</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>Text assistant — available now</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '8px 16px' }}>
              <span style={{ fontSize: 14 }}>🎙️</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>Voice replies — available in app</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 100, padding: '8px 16px' }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>Gold: create your own guardian</span>
            </div>
          </div>
        </div>

        {/* ── Right: Chat Demo ── */}
        <div className="reveal-right" style={{ flex: 1, minWidth: 320, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 420, maxWidth: '100%', background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.12)', border: '1px solid #f0fdf4' }}>
            <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <BrandImg src="/guardians/meenu.png" fallback="👩" size={44} radius={22} bg="rgba(255,255,255,0.18)" style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, color: '#fff', fontSize: 17 }}>Ask Meenu</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="dot-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Your meal guardian</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', minHeight: 300, background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.slice(0, visibleMessages).map((m, i) => (
                <div key={i} className="slide-up" style={{ display: 'flex', justifyContent: m.from === 'you' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
                  {m.from === 'meenu' && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dcfce7', border: '1.5px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👩</div>
                  )}
                  <div style={{ maxWidth: '78%', background: m.from === 'you' ? '#16a34a' : '#fff', color: m.from === 'you' ? '#fff' : '#111827', borderRadius: m.from === 'you' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '11px 15px', fontSize: 13.5, lineHeight: 1.55, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                    {m.text}
                  </div>
                </div>
              ))}

              {visibleMessages < messages.length && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dcfce7', border: '1.5px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👩</div>
                  <div style={{ background: '#fff', borderRadius: '18px 18px 18px 4px', padding: '11px 18px', display: 'flex', gap: 5, alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                    {[0, 1, 2].map((d) => (
                      <div key={d} className="dot-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animationDelay: `${d * 0.25}s`, display: 'inline-block' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', background: '#fff', borderTop: '1px solid #f0fdf4', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, background: '#f9fafb', borderRadius: 22, padding: '10px 18px', fontSize: 13, color: '#9ca3af', border: '1px solid #e5e7eb' }}>Ask Meenu anything…</div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', boxShadow: '0 4px 12px rgba(22,163,74,0.35)' }}>↑</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
