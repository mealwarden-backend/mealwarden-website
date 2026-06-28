'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/components/LoginModal'
import BrandImg from '@/components/BrandImg'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

interface NotifItem {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  sentAt: string
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 60000)
    if (diff < 1)  return 'Just now'
    if (diff < 60) return diff + 'm ago'
    if (diff < 1440) return Math.floor(diff / 60) + 'h ago'
    if (diff < 10080) return Math.floor(diff / 1440) + 'd ago'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

export default function Navbar() {
  const router                           = useRouter()
  const { user, logout }                 = useAuth()
  const [scrolled, setScrolled]          = useState(false)
  const [showLogin, setShowLogin]        = useState(false)
  const [showDropdown, setShowDropdown]  = useState(false)
  const [showBell, setShowBell]          = useState(false)
  const [notifs, setNotifs]              = useState<NotifItem[]>([])
  const [unread, setUnread]              = useState(0)
  const [notifsLoaded, setNotifsLoaded]  = useState(false)
  const bellRef                          = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loadNotifs = useCallback(async () => {
    try {
      const res = await (api as any).getNotifications()
      const data: NotifItem[] = res?.data || []
      setNotifs(data)
      setUnread(res?.unreadCount ?? data.filter((n: NotifItem) => !n.isRead).length)
    } catch {}
    setNotifsLoaded(true)
  }, [])

  useEffect(() => {
    if (user) loadNotifs()
  }, [user, loadNotifs])

  const openBell = () => {
    setShowBell(v => {
      if (!v) loadNotifs()
      return !v
    })
    setShowDropdown(false)
  }

  const markAllRead = async () => {
    try {
      await (api as any).markAllNotificationsRead()
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnread(0)
    } catch {}
  }

  const scrollTo = (id: string) => {
    if (window.location.pathname !== '/') { router.push('/#' + id); return }
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }

  const navLinks = [
    { label: 'Features',     id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Pricing',      id: 'pricing' },
    { label: 'FAQ',          id: 'faq' },
  ]

  const navBtnStyle: React.CSSProperties = {
    padding: '8px 16px', background: 'none', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, color: '#374151',
    cursor: 'pointer', fontFamily: FONT, transition: 'color 0.2s ease, background 0.2s ease',
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid rgba(187,247,208,0.3)',
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s ease', fontFamily: FONT,
      }}>
        {/* Logo */}
        <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <BrandImg src="/logo-mark.png" fallback="🛡️" size={38} radius={11} style={{ boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }} />
          <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 21, color: '#052e16', letterSpacing: -0.5 }}>MealWarden</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => router.push('/')} style={navBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.background = '#f0fdf4' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'none' }}>
            🏠 Home
          </button>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)} style={navBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.background = '#f0fdf4' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'none' }}>
              {l.label}
            </button>
          ))}
          <button onClick={() => router.push('/about')} style={navBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.background = '#f0fdf4' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'none' }}>
            About
          </button>
          <button onClick={() => router.push('/contact')} style={navBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.background = '#f0fdf4' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'none' }}>
            Contact
          </button>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              {/* Bell */}
              <div ref={bellRef} style={{ position: 'relative' }}>
                <div onClick={openBell} style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: showBell ? '#f0fdf4' : 'rgba(0,0,0,0.04)',
                  border: '1.5px solid ' + (showBell ? '#bbf7d0' : '#e5e7eb'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease',
                }}>
                  <span style={{ fontSize: 18 }}>🔔</span>
                  {unread > 0 && (
                    <div style={{
                      position: 'absolute', top: -5, right: -5,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#ef4444', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: '#fff',
                    }}>
                      {unread > 9 ? '9+' : unread}
                    </div>
                  )}
                </div>

                {showBell && (
                  <>
                    <div onClick={() => setShowBell(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      width: 360, maxHeight: 480, background: '#fff', borderRadius: 18,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.14)', border: '1px solid #e5e7eb',
                      zIndex: 1001, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    }}>
                      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16' }}>
                          Notifications
                          {unread > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#fff1f2', borderRadius: 100, padding: '2px 8px', marginLeft: 6 }}>
                              {unread} new
                            </span>
                          )}
                        </div>
                        {unread > 0 && (
                          <span onClick={markAllRead} style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                            Mark all read
                          </span>
                        )}
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        {!notifsLoaded ? (
                          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
                        ) : notifs.length === 0 ? (
                          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                            <div style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT }}>No notifications yet</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, fontFamily: FONT }}>Your reminders and updates will appear here</div>
                          </div>
                        ) : notifs.map(n => (
                          <div key={n.id} style={{
                            padding: '12px 20px', borderBottom: '1px solid #f9fafb',
                            background: n.isRead ? '#fff' : '#f0fdf4',
                            display: 'flex', gap: 12, alignItems: 'flex-start',
                          }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'transparent' : '#16a34a', flexShrink: 0, marginTop: 6 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16', fontFamily: FONT, lineHeight: 1.4 }}>{n.title}</div>
                              <div style={{ fontSize: 12, color: '#6b7280', fontFamily: FONT, lineHeight: 1.5, marginTop: 2, whiteSpace: 'pre-line' }}>{n.body}</div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontFamily: FONT }}>{fmtTime(n.sentAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dropdown */}
              <div style={{ position: 'relative' }}>
                <div onClick={() => { setShowDropdown(!showDropdown); setShowBell(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 14px 6px 8px', background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0', borderRadius: 100, cursor: 'pointer',
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#16a34a,#4ade80)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 14, color: '#fff',
                  }}>
                    {user.avatar}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#052e16', fontFamily: FONT }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: 10, color: '#16a34a' }}>▼</span>
                </div>

                {showDropdown && (
                  <>
                    <div onClick={() => setShowDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      background: '#fff', borderRadius: 16,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
                      padding: 8, minWidth: 200, zIndex: 1000,
                    }}>
                      <div style={{ padding: '10px 14px', marginBottom: 4, borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16', fontFamily: FONT }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT }}>{user.email}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '2px 10px' }}>
                          <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, fontFamily: FONT }}>{user.plan} Plan</span>
                        </div>
                      </div>
                      {[
                        { icon: '📊', label: 'Dashboard',       path: '/dashboard' },
                        { icon: '🔥', label: 'Streak & Mates',  path: '/streak' },
                        { icon: '🔵', label: 'Circles',         path: '/circles' },
                        { icon: '🏆', label: 'Leagues',         path: '/leagues' },
                        { icon: '🪙', label: 'Coin Center',     path: '/coins' },
                        { icon: '🥗', label: 'My Nutrition',    path: '/nutrition' },
                        { icon: '⚙️', label: 'Settings',        path: '/settings' },
                        { icon: '💎', label: 'Upgrade to Gold', path: '/upgrade' },
                      ].map(item => (
                        <div key={item.label} onClick={() => { router.push(item.path); setShowDropdown(false) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span style={{ fontSize: 16 }}>{item.icon}</span>
                          <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, fontFamily: FONT }}>{item.label}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 4, paddingTop: 4 }}>
                        <div onClick={() => { logout(); setShowDropdown(false) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span style={{ fontSize: 16 }}>🚪</span>
                          <span style={{ fontSize: 14, color: '#ef4444', fontWeight: 500, fontFamily: FONT }}>Logout</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setShowLogin(true)} style={{
                padding: '9px 20px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: FONT,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151' }}>
                Log In
              </button>
              <button onClick={() => setShowLogin(true)} style={{
                padding: '9px 20px', background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff',
                cursor: 'pointer', fontFamily: FONT, boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.35)' }}>
                Get Started Free →
              </button>
            </>
          )}
        </div>
      </nav>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}
