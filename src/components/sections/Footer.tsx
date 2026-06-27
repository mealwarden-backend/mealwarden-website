'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BrandImg from '@/components/BrandImg'
import ComingSoonModal from '@/components/ComingSoonModal'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Footer() {
  const router              = useRouter()
  const [email, setEmail]   = useState('')
  const [agreed, setAgreed] = useState(false)
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [cs, setCs] = useState(false)

  const handleSubscribe = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubStatus('error'); return
    }
    if (!agreed) { setSubStatus('error'); return }
    setSubStatus('loading')
    await new Promise(r => setTimeout(r, 1000))
    setSubStatus('success')
    setEmail(''); setAgreed(false)
    setTimeout(() => setSubStatus('idle'), 4000)
  }

  const scrollTo = (id: string) => {
    if (window.location.pathname !== '/') { router.push(`/#${id}`); return }
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }

  const productLinks = [
    { label: 'Features',      action: () => scrollTo('features') },
    { label: 'How It Works',  action: () => scrollTo('how-it-works') },
    { label: 'Pricing',       action: () => scrollTo('pricing') },
    { label: 'Get the App',   action: () => setCs(true) },
  ]

  const companyLinks = [
    { label: 'About Us',      action: () => router.push('/about') },
    { label: 'Contact Us',    action: () => router.push('/contact') },
    { label: 'Support',       action: () => router.push('/support') },
  ]

  const legalLinks = [
    { label: 'Privacy Policy',    action: () => router.push('/privacy') },
    { label: 'Terms of Use',      action: () => router.push('/terms') },
    { label: 'Delete Account',    action: () => router.push('/delete-account') },
  ]

  const supportLinks = [
    { label: 'Help Center',    action: () => router.push('/support') },
    { label: 'FAQ',            action: () => scrollTo('faq') },
    { label: 'Contact Us',     action: () => router.push('/contact') },
  ]

  return (
    <footer style={{ background: '#052e16', fontFamily: FONT }}>

      {/* ── Top Section ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 48px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 48 }}>

          {/* Brand + Newsletter */}
          <div>
            {/* Logo — clicks to home */}
            <div
              onClick={() => router.push('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', width: 'fit-content' }}
            >
              <BrandImg src="/logo-mark.png" fallback="🛡️" size={40} radius={12} />
              <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 22, color: '#fff' }}>MealWarden</span>
            </div>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 24, fontFamily: FONT }}>
              <em style={{ fontStyle: 'italic', fontSize: '0.9em', fontFamily: 'Georgia, serif' }}>One of</em> the world&apos;s first diet plan readers. Upload any plan, get smart reminders, and stay consistent — forever.
            </p>

            {/* Tagline badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, fontFamily: FONT, letterSpacing: 0.5 }}>
                🛡️ Your meals have a guardian now.
              </span>
            </div>

            {/* Newsletter */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 10, fontFamily: FONT }}>
              Get nutrition tips in your inbox
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setSubStatus('idle') }}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, fontSize: 13,
                  color: '#fff', outline: 'none', fontFamily: FONT,
                }}
                onFocus={e => (e.target.style.borderColor = '#16a34a')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <button
                onClick={handleSubscribe}
                disabled={subStatus === 'loading'}
                style={{
                  padding: '10px 16px',
                  background: subStatus === 'loading'
                    ? 'rgba(22,163,74,0.4)'
                    : 'linear-gradient(135deg,#16a34a,#22c55e)',
                  border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  cursor: subStatus === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: FONT, whiteSpace: 'nowrap',
                }}
              >
                {subStatus === 'loading' ? '...' : '→'}
              </button>
            </div>

            {/* Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 2, accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, fontFamily: FONT }}>
                I agree to receive weekly nutrition tips. No spam ever.
              </span>
            </div>

            {/* Status messages */}
            {subStatus === 'success' && (
              <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, fontFamily: FONT }}>
                ✅ Subscribed! Check your inbox.
              </div>
            )}
            {subStatus === 'error' && (
              <div style={{ fontSize: 12, color: '#f87171', fontFamily: FONT }}>
                ⚠️ Please enter a valid email and accept the terms.
              </div>
            )}
          </div>

          {/* Product */}
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20, letterSpacing: 0.5, textTransform: 'uppercase' }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {productLinks.map(l => (
                <span
                  key={l.label}
                  onClick={l.action}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: FONT, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20, letterSpacing: 0.5, textTransform: 'uppercase' }}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companyLinks.map(l => (
                <span
                  key={l.label}
                  onClick={l.action}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: FONT, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20, letterSpacing: 0.5, textTransform: 'uppercase' }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {legalLinks.map(l => (
                <span
                  key={l.label}
                  onClick={l.action}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: FONT, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20, letterSpacing: 0.5, textTransform: 'uppercase' }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {supportLinks.map(l => (
                <span
                  key={l.label}
                  onClick={l.action}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: FONT, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>

        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: FONT }}>
          © 2025 MealWarden Technologies Pvt. Ltd. · Made with ❤️ in Hyderabad 🇮🇳
        </span>

        {/* Social icons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { icon: '𝕏', href: 'https://twitter.com/mealwarden',                label: 'Twitter' },
            { icon: '📸', href: 'https://instagram.com/mealwarden',             label: 'Instagram' },
            { icon: '💼', href: 'https://linkedin.com/company/mealwarden',      label: 'LinkedIn' },
            { icon: '📺', href: 'https://youtube.com/@mealwarden',              label: 'YouTube' },
          ].map(s => (
            <div
              key={s.label}
              onClick={() => window.open(s.href, '_blank')}
              title={s.label}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 15,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(74,222,128,0.15)'
                e.currentTarget.style.borderColor = 'rgba(74,222,128,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              {s.icon}
            </div>
          ))}
        </div>

        {/* App store badges */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: '🍎 App Store' },
            { label: '🤖 Google Play' },
          ].map(b => (
            <div
              key={b.label}
              onClick={() => setCs(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, cursor: 'pointer',
                fontSize: 12, color: 'rgba(255,255,255,0.6)',
                fontWeight: 600, fontFamily: FONT,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(74,222,128,0.12)'
                e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)'
                e.currentTarget.style.color = '#4ade80'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              }}
            >
              {b.label}
            </div>
          ))}
        </div>
      </div>

      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </footer>
  )
}