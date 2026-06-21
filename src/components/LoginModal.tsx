'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import BrandImg from '@/components/BrandImg'
import { api } from '@/lib/api'
import { GUARDIANS } from '@/lib/appData'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type TabType    = 'login' | 'signup'
type StatusType = 'idle' | 'loading' | 'success' | 'error'

export default function LoginModal({ isOpen, onClose }: Props) {
  const { login, register, loginWithGoogle } = useAuth()
  const [tab, setTab]               = useState<TabType>('login')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [name, setName]             = useState('')
  const [guardian, setGuardian]     = useState<'meenu' | 'maddy'>('meenu')
  const [agreed, setAgreed]         = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [status, setStatus]         = useState<StatusType>('idle')
  const [errorMsg, setErrorMsg]     = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const googleDivRef = useRef<HTMLDivElement>(null)
  const gsiInited    = useRef(false)
  const hasGoogle    = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Render Google's official sign-in button (reliable, unlike One Tap prompt()).
  // On click it returns an ID token, which we exchange with our backend.
  useEffect(() => {
    const cid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!isOpen || !cid) return
    let cancelled = false

    const render = () => {
      const g = (window as any).google
      if (cancelled || !g?.accounts?.id || !googleDivRef.current) return
      if (!gsiInited.current) {
        g.accounts.id.initialize({
          client_id: cid,
          use_fedcm_for_prompt: false,
          callback: async (resp: any) => {
            setStatus('loading'); setErrorMsg('')
            const r = await loginWithGoogle(resp.credential)
            if (r.success) {
              setStatus('success'); setSuccessMsg('✅ Signed in with Google! 🛡️')
              setTimeout(() => { onClose(); window.location.href = '/dashboard' }, 1200)
            } else { setStatus('error'); setErrorMsg(r.error || 'Google sign-in failed.') }
          },
        })
        gsiInited.current = true
      }
      googleDivRef.current.innerHTML = ''
      g.accounts.id.renderButton(googleDivRef.current, {
        type: 'standard', theme: 'outline', size: 'large',
        text: 'continue_with', shape: 'pill', logo_alignment: 'center', width: 340,
      })
    }

    if ((window as any).google?.accounts?.id) { render(); return () => { cancelled = true } }

    let s = document.getElementById('gsi-script') as HTMLScriptElement | null
    if (!s) {
      s = document.createElement('script')
      s.id = 'gsi-script'; s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true
      document.head.appendChild(s)
    }
    s.addEventListener('load', render)
    return () => { cancelled = true; s?.removeEventListener('load', render) }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (t: TabType) => {
    setTab(t)
    setEmail('')
    setPassword('')
    setName('')
    setAgreed(false)
    setShowPass(false)
    setStatus('idle')
    setErrorMsg('')
    setSuccessMsg('')
  }

  const validate = () => {
    if (!email.trim())
      return 'Please enter your email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Please enter a valid email address.'
    if (!password.trim())
      return 'Please enter your password.'
    if (password.length < 6)
      return 'Password must be at least 6 characters.'
    if (tab === 'signup' && !name.trim())
      return 'Please enter your full name.'
    if (tab === 'signup' && !agreed)
      return 'Please agree to the Terms & Privacy Policy.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setErrorMsg(err); setStatus('error'); return }

    setStatus('loading')
    setErrorMsg('')

    const displayName = tab === 'signup' ? name.trim() : email.split('@')[0]
    const em = email.trim().toLowerCase()
    const pw = password.trim()

    // AuthContext talks to the shared MealWarden backend and stores the JWT.
    const result = tab === 'signup' ? await register(displayName, em, pw) : await login(em, pw)

    if (!result.success) {
      setStatus('error')
      setErrorMsg(result.error || 'Something went wrong. Please try again.')
      return
    }

    // Save the chosen guardian for new signups (same field the app uses).
    if (tab === 'signup') { try { await api.updateProfile({ guardian }) } catch {} }

    setStatus('success')
    setSuccessMsg(`✅ Welcome${tab === 'login' ? ' back' : ''}, ${displayName.split(' ')[0]}! 🛡️`)
    setTimeout(() => {
      onClose()
      setStatus('idle')
      setSuccessMsg('')
      window.location.href = '/dashboard'
    }, 1500)
  }

  if (!isOpen) return null

  const isLoading = status === 'loading'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: `1.5px solid ${status === 'error' ? '#fca5a5' : '#e5e7eb'}`,
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: '#f9fafb',
    outline: 'none',
    fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={!isLoading ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(5,46,22,0.65)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Scroll wrapper */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 2001,
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
        onClick={e => {
          if (e.target === e.currentTarget && !isLoading) onClose()
        }}
      >
        {/* Modal box */}
        <div style={{
          width: '100%', maxWidth: 420,
          background: '#fff', borderRadius: 24,
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'heroIn 0.3s ease both',
        }}>

          {/* ── Green Header ── */}
          <div style={{
            background: 'linear-gradient(135deg,#052e16,#16a34a)',
            padding: '24px 28px 20px',
            position: 'relative',
          }}>
            {!isLoading && (
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: 0, lineHeight: 1,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}
              >×</button>
            )}

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BrandImg src="/logo-mark.png" fallback="🛡️" size={32} radius={8} />
              <span style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontWeight: 800, fontSize: 18, color: '#fff',
              }}>MealWarden</span>
            </div>

            <div style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4,
            }}>
              {tab === 'login' ? 'Welcome back 👋' : 'Join MealWarden 🛡️'}
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.65)',
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
            }}>
              {tab === 'login'
                ? 'Log in to your guardian dashboard'
                : 'Start free — no credit card needed'}
            </div>
          </div>

          {/* ── Tab Switcher ── */}
          <div style={{
            display: 'flex', background: '#f3f4f6',
            margin: '20px 28px 0',
            borderRadius: 10, padding: 4,
          }}>
            {(['login', 'signup'] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                disabled={isLoading}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  background: tab === t ? '#fff' : 'transparent',
                  border: 'none', fontWeight: 700, fontSize: 13,
                  color: tab === t ? '#052e16' : '#6b7280',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* ── Form Body ── */}
          <div style={{ padding: '20px 28px 28px' }}>

            {/* Success message */}
            {status === 'success' && (
              <div style={{
                background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                borderRadius: 10, padding: '14px 16px',
                marginBottom: 16, textAlign: 'center',
              }}>
                <p style={{
                  fontSize: 15, color: '#16a34a', fontWeight: 700,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  {successMsg}
                </p>
                <p style={{
                  fontSize: 12, color: '#6b7280', marginTop: 4,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  Redirecting to dashboard...
                </p>
              </div>
            )}

            {/* Error message */}
            {status === 'error' && errorMsg && (
              <div style={{
                background: '#fff1f2', border: '1.5px solid #fecdd3',
                borderRadius: 10, padding: '12px 16px', marginBottom: 16,
              }}>
                <p style={{
                  fontSize: 13, color: '#e11d48', fontWeight: 500,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  ⚠️ {errorMsg}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Google button — rendered by Google Identity Services */}
              {hasGoogle ? (
                <div ref={googleDivRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
              ) : (
                <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif' }}>
                  Google sign-in is being set up — please use email below for now.
                </p>
              )}

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <span style={{
                  fontSize: 12, color: '#9ca3af',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>

              {/* Name — signup only */}
              {tab === 'signup' && (
                <div>
                  <label style={{
                    fontSize: 12, fontWeight: 600, color: '#374151',
                    display: 'block', marginBottom: 5,
                    fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => {
                      setName(e.target.value)
                      setStatus('idle')
                      setErrorMsg('')
                    }}
                    disabled={isLoading || status === 'success'}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#16a34a')}
                    onBlur={e => (e.target.style.borderColor = status === 'error' ? '#fca5a5' : '#e5e7eb')}
                  />
                </div>
              )}

              {/* Guardian — signup only */}
              {tab === 'signup' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif' }}>
                    Choose your guardian
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {GUARDIANS.map(gd => {
                      const key = gd.name.toLowerCase() as 'meenu' | 'maddy'
                      const on = guardian === key
                      return (
                        <div key={gd.name} onClick={() => !isLoading && setGuardian(key)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${on ? '#16a34a' : '#e5e7eb'}`, background: on ? '#f0fdf4' : '#f9fafb', transition: 'all 0.2s ease' }}>
                          <BrandImg src={gd.img} fallback={gd.emoji} size={36} radius={10} bg="#fff" />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#052e16', fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif' }}>{gd.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>{gd.tagline}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{
                  fontSize: 12, fontWeight: 600, color: '#374151',
                  display: 'block', marginBottom: 5,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setStatus('idle')
                    setErrorMsg('')
                  }}
                  disabled={isLoading || status === 'success'}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#16a34a')}
                  onBlur={e => (e.target.style.borderColor = status === 'error' ? '#fca5a5' : '#e5e7eb')}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: 5,
                }}>
                  <label style={{
                    fontSize: 12, fontWeight: 600, color: '#374151',
                    fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  }}>
                    Password
                  </label>
                  {tab === 'login' && (
                    <span style={{
                      fontSize: 12, color: '#16a34a',
                      fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                    }}>
                      Forgot password?
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={tab === 'login' ? 'Enter your password' : 'Min. 6 characters'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      setStatus('idle')
                      setErrorMsg('')
                    }}
                    disabled={isLoading || status === 'success'}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => (e.target.style.borderColor = '#16a34a')}
                    onBlur={e => (e.target.style.borderColor = status === 'error' ? '#fca5a5' : '#e5e7eb')}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    type="button"
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 15,
                      color: '#9ca3af', padding: 0,
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Agree checkbox — signup only */}
              {tab === 'signup' && (
                <div
                  onClick={() => {
                    if (!isLoading && status !== 'success') setAgreed(!agreed)
                  }}
                  style={{
                    display: 'flex', alignItems: 'flex-start',
                    gap: 10, cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    flexShrink: 0, marginTop: 1,
                    border: `2px solid ${agreed ? '#16a34a' : '#d1d5db'}`,
                    background: agreed ? '#16a34a' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {agreed && (
                      <span style={{
                        color: '#fff', fontSize: 11,
                        fontWeight: 800, lineHeight: 1,
                      }}>✓</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, color: '#6b7280', lineHeight: 1.6,
                    fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  }}>
                    I agree to the{' '}
                    <span
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#16a34a', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Terms of Service
                    </span>
                    {' '}and{' '}
                    <span
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#16a34a', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Privacy Policy
                    </span>
                  </span>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || status === 'success'}
                style={{
                  width: '100%', padding: '13px',
                  background: isLoading
                    ? '#86efac'
                    : 'linear-gradient(135deg,#16a34a,#22c55e)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontWeight: 800, fontSize: 15,
                  cursor: isLoading || status === 'success' ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  boxShadow: isLoading ? 'none' : '0 8px 24px rgba(22,163,74,0.3)',
                  marginTop: 4, transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    {tab === 'login' ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : tab === 'login'
                  ? 'Log In to MealWarden →'
                  : 'Create Free Account →'}
              </button>
            </div>

            {/* Switch tab */}
            <p style={{
              textAlign: 'center', marginTop: 16,
              fontSize: 13, color: '#6b7280',
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
            }}>
              {tab === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <span
                onClick={() => !isLoading && switchTab(tab === 'login' ? 'signup' : 'login')}
                style={{
                  color: '#16a34a', fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {tab === 'login' ? 'Sign up free' : 'Log in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Spinner() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spinSlow 0.8s linear infinite' }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}