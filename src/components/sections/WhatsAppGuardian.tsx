'use client'

import { useEffect, useRef, useState } from 'react'

const waMessages = [
  { from: 'bot', text: '⏰ Time for your 1PM meal! Chicken breast + brown rice + salad. Did you eat?', time: '1:00 PM' },
  { from: 'you', text: 'Yes done! 🍽️', time: '1:02 PM' },
  { from: 'bot', text: '✅ Logged! 38g protein. You\'re at 82% of your daily goal. Next: 4PM snack — 2 boiled eggs + almonds.', time: '1:02 PM' },
  { from: 'you', text: 'Remind me at 3:50', time: '1:03 PM' },
  { from: 'bot', text: '🛡️ Reminder set for 3:50PM! You\'re on a 42-day streak. Incredible consistency — keep going!', time: '1:03 PM' },
]

export default function WhatsAppGuardian() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visibleMsgs, setVisibleMsgs] = useState(1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (visibleMsgs >= waMessages.length) return
    const t = setTimeout(() => setVisibleMsgs((v) => v + 1), 1800)
    return () => clearTimeout(t)
  }, [visibleMsgs])

  return (
    <section ref={sectionRef} style={{ padding: '0 20px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="wa-inner"
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 360, height: 360, borderRadius: '50%',
            background: 'rgba(74,222,128,0.07)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: 80,
            width: 240, height: 240, borderRadius: '50%',
            background: 'rgba(34,197,94,0.05)', pointerEvents: 'none',
          }} />

          <div className="wa-layout">

            {/* ── Left: Content ── */}
            <div className="reveal-left" style={{ flex: 1 }}>
              {/* Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(74,222,128,0.12)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: 100, padding: '6px 16px',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: 1.5, textTransform: 'uppercase' as const }}>
                    💬 WhatsApp Guardian
                  </span>
                </div>
                <div style={{
                  background: '#f59e0b', color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 12px', borderRadius: 100,
                }}>
                  GOLD
                </div>
              </div>

              <h2 className="section-h2-lg" style={{
                fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                color: '#fff', lineHeight: 1.1, marginBottom: 22,
              }}>
                Your Guardian Lives<br />
                <span style={{ color: '#4ade80' }}>In Your WhatsApp</span>
              </h2>

              <p style={{
                fontSize: 16, color: 'rgba(255,255,255,0.68)',
                lineHeight: 1.85, marginBottom: 40, maxWidth: 420,
              }}>
                No app to open. No notification to dismiss. MealWarden sends alerts, logs your meals by reply, and delivers progress updates — right inside WhatsApp.
              </p>

              {/* Features grid */}
              <div className="wa-features-grid">
                {[
                  ['⏰', 'Meal alerts on time'],
                  ['✅', 'Log meals by replying'],
                  ['📊', 'Weekly progress report'],
                  ['💪', 'Daily motivation nudge'],
                  ['🛒', 'Grocery reminders'],
                  ['🔥', 'Streak updates & badges'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(74,222,128,0.12)',
                      border: '1px solid rgba(74,222,128,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn-primary"
                style={{
                  padding: '15px 36px',
                  background: '#4ade80',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  boxShadow: '0 8px 28px rgba(74,222,128,0.4)',
                }}
              >
                Get Gold — ₹599/mo ↗
              </button>
            </div>

            {/* ── Right: WhatsApp Phone Mock ── */}
            <div className="reveal-right" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 310,
                background: '#e5ddd5',
                borderRadius: 28,
                overflow: 'hidden',
                boxShadow: '0 48px 96px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}>
                {/* WA Header */}
                <div style={{
                  background: '#075E54',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#128C7E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    🛡️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>MealWarden</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div className="dot-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Online · Your Guardian</span>
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer' }}>⋮</span>
                </div>

                {/* WA date chip */}
                <div style={{
                  textAlign: 'center', padding: '10px 0 4px',
                  background: '#ddd6ce',
                }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.12)',
                    color: '#4a4a4a',
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 12px', borderRadius: 8,
                  }}>
                    Today
                  </span>
                </div>

                {/* Messages */}
                <div style={{
                  padding: '10px 12px',
                  minHeight: 320,
                  background: '#e5ddd5',
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {waMessages.slice(0, visibleMsgs).map((m, i) => (
                    <div
                      key={i}
                      className="slide-up"
                      style={{
                        display: 'flex',
                        justifyContent: m.from === 'you' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        maxWidth: '82%',
                        background: m.from === 'you' ? '#dcf8c6' : '#fff',
                        borderRadius: m.from === 'you' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        padding: '8px 12px 6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}>
                        <p style={{ fontSize: 13, color: '#111827', lineHeight: 1.5, marginBottom: 4 }}>
                          {m.text}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10, color: '#6b7280' }}>{m.time}</span>
                          {m.from === 'you' && <span style={{ fontSize: 12, color: '#4fc3f7' }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing */}
                  {visibleMsgs < waMessages.length && visibleMsgs % 2 === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: '12px 12px 12px 2px',
                        padding: '10px 14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'flex', gap: 4, alignItems: 'center',
                      }}>
                        {[0, 1, 2].map((d) => (
                          <div key={d} className="dot-blink" style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#6b7280',
                            animationDelay: `${d * 0.25}s`,
                            display: 'inline-block',
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div style={{
                  background: '#f0f2f5',
                  padding: '10px 12px',
                  display: 'flex', gap: 10, alignItems: 'center',
                }}>
                  <div style={{
                    flex: 1, background: '#fff', borderRadius: 22,
                    padding: '9px 16px', fontSize: 13, color: '#9ca3af',
                  }}>
                    Type a message...
                  </div>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    🎤
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}  