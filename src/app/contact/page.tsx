'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Contact() {
  const router = useRouter()
  const [form, setForm]     = useState({ name: '', email: '', subject: '', category: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const categories = [
    { icon: '🐛', label: 'Bug Report' },
    { icon: '💡', label: 'Feature Request' },
    { icon: '💳', label: 'Billing & Plans' },
    { icon: '🔒', label: 'Privacy & Data' },
    { icon: '🤖', label: 'AI & Diet Chart' },
    { icon: '💬', label: 'General Enquiry' },
  ]

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus('error')
      return
    }
    setStatus('loading')
    // Simulate sending — wire to Resend later
    await new Promise(r => setTimeout(r, 1500))
    setStatus('success')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #e5e7eb', borderRadius: 12,
    fontSize: 14, color: '#111827', background: '#f9fafb',
    outline: 'none', fontFamily: FONT, boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: FONT }}>

      {/* ── Navbar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #f0fdf4', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
          <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 20, color: '#052e16' }}>MealWarden</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/')} style={{ padding: '8px 18px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>← Home</button>
          <button onClick={() => router.push('/about')} style={{ padding: '8px 18px', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>About Us</button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '140px 48px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: FONT }}>Get In Touch</span>
          </div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }}>
            We're Here to Help 💬
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, fontFamily: FONT }}>
            Got a question, feedback, or just want to say hello? Our team responds within 2 hours during business hours.
          </p>
        </div>
      </div>

      {/* ── Contact cards ── */}
      <div style={{ maxWidth: 1100, margin: '-40px auto 0', padding: '0 48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 60 }}>
          {[
            { icon: '📧', title: 'Email Us',         value: 'support@mealwarden.com',   sub: 'Response within 2 hours',      color: '#f0fdf4', ac: '#16a34a', href: 'mailto:support@mealwarden.com' },
            { icon: '💬', title: 'WhatsApp Support',  value: 'Gold members get priority', sub: 'Enabled after plan activation', color: '#fff7ed', ac: '#f97316', href: 'mailto:support@mealwarden.com' },
            { icon: '🐦', title: 'Twitter / X',       value: '@MealWarden',               sub: 'Quick replies & updates',      color: '#eff6ff', ac: '#3b82f6', href: 'https://twitter.com/mealwarden' },
          ].map(c => (
            <div key={c.title} onClick={() => window.open(c.href, '_blank')} style={{ background: c.color, borderRadius: 20, padding: '28px 24px', border: '1.5px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 700, color: '#052e16', marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.ac, marginBottom: 4, fontFamily: FONT }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Contact Form ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* Left — Form */}
          <div style={{ background: '#fff', borderRadius: 28, padding: 36, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1.5px solid #e5e7eb' }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 24, fontWeight: 800, color: '#052e16', marginBottom: 6 }}>Send Us a Message</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, fontFamily: FONT }}>Fill out the form and we'll get back to you within 2 hours.</p>

            {/* Success */}
            {status === 'success' && (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '20px', marginBottom: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 4 }}>Message Sent!</div>
                <p style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT }}>We'll reply to <strong>{form.email}</strong> within 2 hours.</p>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#e11d48', fontWeight: 500, fontFamily: FONT }}>⚠️ Please fill in your name, email and message.</p>
              </div>
            )}

            {status !== 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Full Name',      key: 'name',  placeholder: 'Your full name',    type: 'text' },
                    { label: 'Email Address',  key: 'email', placeholder: 'you@email.com',      type: 'email' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setStatus('idle') }} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                  ))}
                </div>

                {/* Category */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8, fontFamily: FONT }}>Category</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {categories.map(c => (
                      <div key={c.label} onClick={() => setForm({ ...form, category: c.label })} style={{ padding: '8px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${form.category === c.label ? '#16a34a' : '#e5e7eb'}`, background: form.category === c.label ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>{c.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: form.category === c.label ? '#16a34a' : '#6b7280', fontFamily: FONT, lineHeight: 1.3 }}>{c.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>Subject</label>
                  <input type="text" placeholder="What's this about?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>Message</label>
                  <textarea
                    placeholder="Tell us everything — we're listening..."
                    value={form.message}
                    onChange={e => { setForm({ ...form, message: e.target.value }); setStatus('idle') }}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                    onFocus={e => (e.target.style.borderColor = '#16a34a')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  style={{ padding: '14px', background: status === 'loading' ? '#86efac' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: status === 'loading' ? 'none' : '0 8px 24px rgba(22,163,74,0.3)', transition: 'all 0.3s ease' }}
                >
                  {status === 'loading' ? '⏳ Sending...' : '📨 Send Message →'}
                </button>
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Response time */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '24px' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>⚡ Response Times</div>
              {[
                { label: 'Email Support',        time: '< 2 hours',  note: 'Business hours (9AM–8PM IST)', color: '#16a34a' },
                { label: 'WhatsApp (Gold Plan)', time: '< 30 mins',  note: 'Priority support, on request', color: '#f97316' },
                { label: 'Twitter / X',          time: '< 4 hours',  note: 'Public questions & feedback',  color: '#3b82f6' },
                { label: 'In-App Chat',          time: 'Instant',    note: 'AI-powered responses 24/7',    color: '#a855f7' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#052e16', fontFamily: FONT }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>{r.note}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: FONT, flexShrink: 0 }}>{r.time}</div>
                </div>
              ))}
            </div>

            {/* FAQ shortcut */}
            <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 20, padding: '24px' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 10 }}>💡 Before You Write</div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, fontFamily: FONT }}>
                Your answer might already be in our FAQ. Check it first — it's faster!
              </p>
              <button onClick={() => router.push('/#faq')} style={{ padding: '10px 20px', background: '#fff', color: '#d97706', border: '1.5px solid #fcd34d', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>
                View FAQ →
              </button>
            </div>

            {/* Office info */}
            <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '24px' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 16 }}>📍 Office</div>
              {[
                { icon: '🏢', label: 'Address',        value: 'Hyderabad, Telangana, India 🇮🇳' },
                { icon: '🕐', label: 'Business Hours', value: 'Mon–Sat · 9:00 AM – 8:00 PM IST' },
                { icon: '📧', label: 'General',        value: 'hello@mealwarden.com' },
                { icon: '⚖️', label: 'Legal',          value: 'legal@mealwarden.com' },
              ].map(o => (
                <div key={o.label} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{o.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: FONT }}>{o.label}</div>
                    <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginTop: 2, fontFamily: FONT }}>{o.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Simple Footer ── */}
      <div style={{ background: '#052e16', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#16a34a,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛡️</div>
          <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 16, color: '#fff' }}>MealWarden</span>
        </div>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: FONT }}>© 2025 MealWarden. Made with ❤️ in India 🇮🇳</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Home', 'About', 'Download'].map(l => (
            <span key={l} onClick={() => router.push(l === 'Home' ? '/' : `/${l.toLowerCase()}`)} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: FONT }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
