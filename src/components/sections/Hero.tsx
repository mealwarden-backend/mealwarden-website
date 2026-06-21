'use client'

import { useEffect, useState } from 'react'
import ComingSoonModal from '@/components/ComingSoonModal'

function HomeScreen() {
  return (
    <div style={{
      background: 'linear-gradient(160deg,#0d2b1a,#052e16)',
      height: '100%', padding: '36px 16px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Good morning 🌿</div>
          <div style={{ fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 800, color: '#fff' }}>Prasanna</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛡️</div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>Current Streak</div>
        <div style={{ fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>42 🔥</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>days consistent</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>NEXT MEAL · 10:30 AM</div>
        <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Greek Yogurt + Almonds</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>180 kcal · 15g protein</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>Daily Protein</div>
          <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 600 }}>82 / 140g</div>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '59%', background: 'linear-gradient(to right,#16a34a,#4ade80)', borderRadius: 3 }} />
        </div>
      </div>

      {[['🕐 7:00 AM', 'Oats + 3 Eggs', '✅'], ['🕙 10:30 AM', 'Yogurt + Almonds', '⏰']].map(([t, m, s]) => (
        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 10px' }}>
          <div>
            <div style={{ fontSize: 8, color: '#4ade80' }}>{t}</div>
            <div style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{m}</div>
          </div>
          <span style={{ fontSize: 14 }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

function MealScreen() {
  return (
    <div style={{ background: '#fff', height: '100%', padding: '36px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 800, color: '#052e16', marginBottom: 4 }}>Today's Meals</div>
      {[
        { time: '7:00 AM',  meal: 'Oats + Eggs',      kcal: '320 kcal', done: true },
        { time: '10:30 AM', meal: 'Greek Yogurt',      kcal: '180 kcal', done: true },
        { time: '1:00 PM',  meal: 'Chicken + Rice',    kcal: '480 kcal', done: false },
        { time: '4:00 PM',  meal: '2 Boiled Eggs',     kcal: '140 kcal', done: false },
        { time: '7:00 PM',  meal: 'Grilled Fish',      kcal: '360 kcal', done: false },
      ].map((m, i) => (
        <div key={i} style={{ background: m.done ? '#f0fdf4' : '#f9fafb', borderRadius: 10, padding: '8px 10px', border: `1px solid ${m.done ? '#bbf7d0' : '#e5e7eb'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 8, color: m.done ? '#16a34a' : '#6b7280', fontWeight: 600 }}>{m.time}</div>
            <div style={{ fontSize: 11, color: '#052e16', fontWeight: 600 }}>{m.meal}</div>
            <div style={{ fontSize: 8, color: '#9ca3af' }}>{m.kcal}</div>
          </div>
          <span style={{ fontSize: 14 }}>{m.done ? '✅' : '⭕'}</span>
        </div>
      ))}
    </div>
  )
}

function StatsScreen() {
  const bars = [65, 80, 55, 90, 75, 88, 70]
  const days  = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div style={{ background: 'linear-gradient(160deg,#eff6ff,#dbeafe)', height: '100%', padding: '36px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 800, color: '#052e16' }}>Analytics</div>
      <div style={{ background: '#fff', borderRadius: 14, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 8 }}>This Week — Protein</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: 'linear-gradient(to top,#16a34a,#4ade80)', height: `${b}%` }} />
              <div style={{ fontSize: 7, color: '#9ca3af' }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Avg Protein', val: '128g',  color: '#f0fdf4', ac: '#16a34a' },
          { label: 'Weight Lost', val: '3.2kg', color: '#eff6ff', ac: '#3b82f6' },
          { label: 'Meal Score',  val: '94%',   color: '#fdf4ff', ac: '#a855f7' },
          { label: 'Streak',      val: '42 🔥', color: '#fff7ed', ac: '#f97316' },
        ].map(s => (
          <div key={s.label} style={{ background: s.color, borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 8, color: s.ac, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', fontSize: 16, fontWeight: 800, color: '#052e16' }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhoneFrame({ children, className, shadow }: { children: React.ReactNode, className?: string, shadow?: string }) {
  return (
    <div className={className} style={{
      width: 200, height: 400, borderRadius: 36,
      background: '#0f0f0f',
      boxShadow: shadow || '0 32px 64px rgba(0,0,0,0.25)',
      overflow: 'hidden',
      border: '2px solid rgba(255,255,255,0.12)',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 60, height: 18, borderRadius: 10, background: '#0f0f0f', zIndex: 10 }} />
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [cs, setCs] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <section id="hero" style={{
      minHeight: '100vh', paddingTop: 68,
      position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(ellipse 80% 60% at 20% 0%, #dcfce7 0%, #f0fdf4 40%, #ffffff 70%)',
      display: 'flex', alignItems: 'center',
    }}>
      {/* Blobs */}
      <div className="blob-morph" style={{
        position: 'absolute', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(74,222,128,0.12), transparent 70%)',
        top: -150, right: -150, pointerEvents: 'none',
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07), transparent 70%)',
        bottom: 60, left: -60, pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '80px 48px', display: 'flex',
        gap: 60, alignItems: 'center', width: '100%',
      }}>

        {/* ── Left ── */}
        <div style={{ flex: 1 }}>

          {/* Badge */}
          <div className="hero-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ fontSize: 14 }}>🌿</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>★ World&apos;s First Diet Plan Reader</span>
            <span className="dot-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          </div>

          {/* Headline */}
          <h1 className="hero-in-d1" style={{
            fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
            fontSize: 64, fontWeight: 800,
            lineHeight: 1.05, letterSpacing: -2.5,
            color: '#052e16', marginBottom: 24,
          }}>
            Your Meals Have<br />
            <span className="gradient-text-green">A Guardian Now.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-in-d2" style={{
            fontSize: 18, color: '#4b5563',
            lineHeight: 1.8, maxWidth: 480, marginBottom: 36,
          }}>
            MealWarden tracks your diet, reminds you to eat, preps your meals overnight, and guards your nutrition goals — intelligently, 24/7. Never break your streak again.
          </p>

          {/* CTA Buttons */}
          <div className="hero-in-d3" style={{ display: 'flex', gap: 14, marginBottom: 52, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => setCs(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 30px',
                background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
              }}
            >
              <span style={{ fontSize: 20 }}>🍎</span> Download on iOS
            </button>
            <button
              className="btn-secondary"
              onClick={() => setCs(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 30px',
                background: '#fff', color: '#374151',
                border: '1.5px solid #e5e7eb', borderRadius: 12,
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              }}
            >
              <span style={{ fontSize: 20 }}>▶️</span> Get on Android
            </button>
          </div>

          {/* Stats */}
          <div className="hero-in-d4" style={{ display: 'flex', gap: 44 }}>
            {[
              ['30 days', 'Free Gold trial'],
              ['7-day', 'AI meal plans'],
              ['🌍', 'For anyone, anywhere'],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800, color: '#052e16', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 5, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Phones ── */}
        <div className="hero-in-d2" style={{ flex: 1, position: 'relative', height: 520, display: 'flex', justifyContent: 'center' }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,222,128,0.22), transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
          }} />

          {/* Phone B — left */}
          <div className="float-b" style={{ position: 'absolute', left: '0%', top: '55%', transform: 'translateY(-50%)', zIndex: 2, opacity: 0.82 }}>
            <PhoneFrame shadow="0 24px 50px rgba(0,0,0,0.18)">
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '118%', height: '118%' }}>
                <MealScreen />
              </div>
            </PhoneFrame>
          </div>

          {/* Phone A — center */}
          <div className="float-a" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 3 }}>
            <PhoneFrame shadow="0 48px 96px rgba(22,163,74,0.35)">
              <HomeScreen />
            </PhoneFrame>
          </div>

          {/* Phone C — right */}
          <div className="float-c" style={{ position: 'absolute', right: '0%', top: '45%', transform: 'translateY(-50%)', zIndex: 2, opacity: 0.82 }}>
            <PhoneFrame shadow="0 24px 50px rgba(0,0,0,0.18)">
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '118%', height: '118%' }}>
                <StatsScreen />
              </div>
            </PhoneFrame>
          </div>

          {/* Badge — Streak */}
          <div className="lift-sm" style={{
            position: 'absolute', top: '8%', right: '4%',
            background: '#fff', borderRadius: 16, padding: '10px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: 10, zIndex: 10,
          }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16' }}>42-day streak!</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Keep going, champ</div>
            </div>
          </div>

          {/* Badge — Meal logged */}
          <div className="lift-sm" style={{
            position: 'absolute', bottom: '14%', left: '2%',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 16, padding: '10px 16px',
            boxShadow: '0 8px 32px rgba(22,163,74,0.2)',
            display: 'flex', alignItems: 'center', gap: 10, zIndex: 10,
          }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16' }}>Meal logged!</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>+32g protein tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 1.5, height: 40, background: 'linear-gradient(to bottom,#16a34a,transparent)' }} />
        <div className="dot-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
      </div>

      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </section>
  )
}