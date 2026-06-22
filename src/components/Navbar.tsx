'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/components/LoginModal'
import BrandImg from '@/components/BrandImg'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Navbar() {
  const router                        = useRouter()
  const { user, logout }              = useAuth()
  const [scrolled, setScrolled]       = useState(false)
  const [showLogin, setShowLogin]     = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    // If not on homepage, go home first then scroll
    if (window.location.pathname !== '/') {
      router.push(`/#${id}`)
      return
    }
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }

  const navLinks = [
    
    { label: 'Features',     id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Pricing',      id: 'pricing' },
    { label: 'FAQ',          id: 'faq' },
    
]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid rgba(187,247,208,0.3)',
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        fontFamily: FONT,
      }}>

        {/* ── Logo — always goes to home ── */}
        <div
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
        >
          <BrandImg src="/logo-mark.png" fallback="🛡️" size={38} radius={11} style={{ boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }} />
          <span style={{
            fontFamily: FONT_SYNE, fontWeight: 800,
            fontSize: 21, color: '#052e16', letterSpacing: -0.5,
          }}>
            MealWarden
          </span>
        </div>

        {/* ── Nav Links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              style={{
                padding: '8px 16px', background: 'none',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: '#374151',
                cursor: 'pointer', fontFamily: FONT,
                transition: 'color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#16a34a'
                e.currentTarget.style.background = '#f0fdf4'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#374151'
                e.currentTarget.style.background = 'none'
              }}
            >
              {l.label}
            </button>
          ))}

          {/* About & Contact */}
          <button
            onClick={() => router.push('/about')}
            style={{
              padding: '8px 16px', background: 'none',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, color: '#374151',
              cursor: 'pointer', fontFamily: FONT,
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#16a34a'
              e.currentTarget.style.background = '#f0fdf4'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#374151'
              e.currentTarget.style.background = 'none'
            }}
          >
            About
          </button>
          <button
            onClick={() => router.push('/contact')}
            style={{
              padding: '8px 16px', background: 'none',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, color: '#374151',
              cursor: 'pointer', fontFamily: FONT,
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#16a34a'
              e.currentTarget.style.background = '#f0fdf4'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#374151'
              e.currentTarget.style.background = 'none'
            }}
          >
            Contact
          </button>
        </div>

        {/* ── Right Side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {user ? (
            /* Logged in — user dropdown */
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 14px 6px 8px',
                  background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                  borderRadius: 100, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#16a34a,#4ade80)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_SYNE, fontWeight: 800,
                  fontSize: 14, color: '#fff',
                }}>
                  {user.avatar}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#052e16', fontFamily: FONT }}>
                  {user.name.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: 10, color: '#16a34a',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}>
                  ▼
                </span>
              </div>

              {showDropdown && (
                <>
                  <div onClick={() => setShowDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    background: '#fff', borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    border: '1px solid #e5e7eb',
                    padding: 8, minWidth: 200, zIndex: 1000,
                  }}>
                    {/* User info */}
                    <div style={{ padding: '10px 14px', marginBottom: 4, borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16', fontFamily: FONT }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT }}>{user.email}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '2px 10px' }}>
                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, fontFamily: FONT }}>{user.plan} Plan</span>
                      </div>
                    </div>

                    {/* Menu items */}
                    {[
                      { icon: '📊', label: 'Dashboard',       onClick: () => { router.push('/dashboard'); setShowDropdown(false) } },
                      { icon: '🔥', label: 'Streak & Mates',  onClick: () => { router.push('/streak'); setShowDropdown(false) } },
                      { icon: '🥗', label: 'My Nutrition',    onClick: () => { router.push('/nutrition'); setShowDropdown(false) } },
                      { icon: '⚙️', label: 'Settings',        onClick: () => { router.push('/settings'); setShowDropdown(false) } },
                      { icon: '💎', label: 'Upgrade to Gold', onClick: () => { router.push('/upgrade'); setShowDropdown(false) } },
                    ].map(item => (
                      <div
                        key={item.label}
                        onClick={item.onClick}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10,
                          cursor: 'pointer', transition: 'background 0.15s ease',
                          fontFamily: FONT,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, fontFamily: FONT }}>{item.label}</span>
                      </div>
                    ))}

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 4, paddingTop: 4 }}>
                      <div
                        onClick={() => { logout(); setShowDropdown(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10,
                          cursor: 'pointer', transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ fontSize: 16 }}>🚪</span>
                        <span style={{ fontSize: 14, color: '#ef4444', fontWeight: 500, fontFamily: FONT }}>Logout</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Not logged in */
            <>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '9px 20px', background: 'none',
                  border: '1.5px solid #e5e7eb', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, color: '#374151',
                  cursor: 'pointer', fontFamily: FONT,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#16a34a'
                  e.currentTarget.style.color = '#16a34a'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.color = '#374151'
                }}
              >
                Log In
              </button>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, color: '#fff',
                  cursor: 'pointer', fontFamily: FONT,
                  boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.35)'
                }}
              >
                Get Started Free →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}