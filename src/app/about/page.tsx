'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'
import BrandImg from '@/components/BrandImg'
import ComingSoonModal from '@/components/ComingSoonModal'
import { GUARDIANS } from '@/lib/appData'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function About() {
  const router = useRouter()
  const [cs, setCs] = useState(false)

  const values = [
    { icon: '🛡️', title: 'Guardian First', desc: 'Everyone deserves a guardian that keeps them accountable — not just an app that tracks numbers.' },
    { icon: '🌍', title: 'Built for Every Plate', desc: 'Any cuisine, any schedule, any goal — wherever you are in the world, with deep support for the food you actually eat.' },
    { icon: '🤖', title: 'AI That Cares', desc: 'Our AI doesn\'t just generate data — it understands your lifestyle and adapts to your real-world constraints.' },
    { icon: '🔒', title: 'Privacy by Default', desc: 'Your nutrition data is yours. Encrypted in transit, DPDP-aligned, and never sold — ever.' },
    { icon: '💚', title: 'Results Over Revenue', desc: 'We measure success by your streaks and health outcomes, not by how many plans we sell.' },
    { icon: '🚀', title: 'Always Improving', desc: 'MealWarden ships updates constantly. Your feedback directly shapes what we build next.' },
  ]

  const story = [
    {
      icon: '😔', tint: '#f97316', kicker: 'THE FRUSTRATION',
      title: 'A diet plan stuck to the fridge',
      body: 'Prasanna had the plan, the goal, even the motivation. What he didn\'t have was anyone making sure he actually followed it. Meals got skipped on busy days. Sunday prep never happened. Two weeks in, the streak broke — again.',
    },
    {
      icon: '💡', tint: '#16a34a', kicker: 'THE SPARK',
      title: 'The problem was never the plan',
      body: 'After breaking the same promise to himself for the 47th time, it clicked: the gap was never the plan — it was living it. Apps gave him charts and numbers. None of them gave him a guardian that noticed when he slipped and nudged him before it happened.',
    },
    {
      icon: '🛡️', tint: '#1E6FD8', kicker: 'THE BUILD',
      title: 'So he built the guardian',
      body: 'MealWarden reads any diet plan — even a photo of a handwritten chart — and turns it into a day you can actually follow: reminders before every meal, overnight prep, scan-your-plate calorie checks, and a guardian who\'s in your corner every single day.',
    },
  ]

  return (
    <div style={{ background: '#fff', fontFamily: FONT }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 68, background: 'linear-gradient(135deg,#052e16 0%,#16a34a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'rgba(74,222,128,0.10)' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 88px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: 1.5 }}>OUR STORY</span>
          </div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 22 }}>
            We built the guardian<br /><span style={{ color: '#4ade80' }}>we wished we had.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            MealWarden was born from a simple, painful truth: staying consistent with your nutrition is hard to do alone. So we made sure you never have to.
          </p>
        </div>
      </section>

      {/* ── The Story ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: FONT_SYNE, fontSize: 40, fontWeight: 800, color: '#052e16', letterSpacing: -1, marginBottom: 12 }}>How MealWarden began</h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>It didn&apos;t start in a boardroom. It started with one person, one broken streak too many.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {story.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 24, padding: '28px 26px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.tint }} />
              <div style={{ width: 54, height: 54, borderRadius: 16, background: `${s.tint}18`, border: `1.5px solid ${s.tint}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: s.tint, letterSpacing: 1.2, marginBottom: 8 }}>{s.kicker}</div>
              <h3 style={{ fontFamily: FONT_SYNE, fontSize: 19, fontWeight: 800, color: '#052e16', marginBottom: 10, lineHeight: 1.25 }}>{s.title}</h3>
              <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
        <p style={{ fontFamily: FONT_SYNE, fontSize: 30, fontWeight: 800, color: '#052e16', lineHeight: 1.3, letterSpacing: -0.5 }}>
          “We don&apos;t just track your food.<br /><span className="gradient-text-green">We guard your goals.”</span>
        </p>
      </section>

      {/* ── Values ── */}
      <section style={{ background: '#f9fafb', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: FONT_SYNE, fontSize: 40, fontWeight: 800, color: '#052e16', letterSpacing: -1 }}>What we stand for</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
            {values.map(v => (
              <div key={v.title} style={{ background: '#fff', borderRadius: 20, padding: '26px 24px', border: '1.5px solid #e5e7eb' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{v.icon}</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>{v.title}</div>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guardians ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: FONT_SYNE, fontSize: 40, fontWeight: 800, color: '#052e16', letterSpacing: -1, marginBottom: 12 }}>Meet your guardians</h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Pick the one that fits you. They watch over every meal, every day.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 24 }}>
          {GUARDIANS.map(g => (
            <div key={g.name} style={{ background: g.color, border: `2px solid ${g.border}`, borderRadius: 24, padding: '28px 26px', display: 'flex', gap: 18, alignItems: 'center' }}>
              <BrandImg src={g.img} fallback={g.emoji} size={64} radius={18} bg="#fff" style={{ border: `1.5px solid ${g.ac}30` }} />
              <div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16' }}>{g.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: g.ac, marginBottom: 8 }}>{g.tagline} · {g.role}</div>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#9ca3af' }}>Chat with them today, with voice conversations coming soon. Gold members can create their own guardian.</p>
      </section>

      {/* ── Founder ── */}
      <section style={{ background: '#052e16', padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 30, color: '#fff', margin: '0 auto 18px', border: '3px solid rgba(255,255,255,0.2)' }}>PK</div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#fff' }}>Prasanna Krishna</div>
          <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, marginBottom: 16 }}>Founder</div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.85 }}>
            “I built MealWarden after failing at my own diet more times than I can count. I didn&apos;t need another tracker — I needed something that actually had my back. That&apos;s what we&apos;re building for you.”
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '88px 24px', textAlign: 'center', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 46, marginBottom: 14 }}>🛡️</div>
          <h2 style={{ fontFamily: FONT_SYNE, fontSize: 38, fontWeight: 800, color: '#052e16', letterSpacing: -1, marginBottom: 16 }}>Your guardian is ready.</h2>
          <p style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.8, marginBottom: 32 }}>Start with a 30-day free Gold trial and finally stay consistent — with someone in your corner.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setCs(true)} className="btn-primary" style={{ padding: '15px 32px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: FONT, boxShadow: '0 10px 32px rgba(22,163,74,0.35)' }}>🍎 Get MealWarden</button>
            <button onClick={() => router.push('/')} className="btn-secondary" style={{ padding: '15px 32px', background: '#fff', color: '#374151', border: '2px solid #e5e7eb', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>Explore features →</button>
          </div>
        </div>
      </section>

      <Footer />
      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </div>
  )
}
