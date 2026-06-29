'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ComingSoonModal from '@/components/ComingSoonModal'

export default function Download() {
  const router = useRouter()
  const [androidOpen, setAndroidOpen] = useState(false)
  const [cs, setCs] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#f0fdf4 0%,#ffffff 50%,#f0fdf4 100%)',
      fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Back button */}
      <div style={{ padding: '24px 48px' }}>
        <div
          onClick={() => router.push('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#16a34a', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.gap = '12px')}
          onMouseLeave={e => (e.currentTarget.style.gap = '8px')}
        >
          ← Back to MealWarden.com
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px 80px', textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'linear-gradient(135deg,#16a34a,#4ade80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 24,
          boxShadow: '0 16px 48px rgba(22,163,74,0.3)',
        }}>
          🛡️
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
          fontSize: 48, fontWeight: 800,
          letterSpacing: -2, color: '#052e16',
          lineHeight: 1.1, marginBottom: 16,
        }}>
          Download MealWarden
        </h1>

        <p style={{
          fontSize: 17, color: '#6b7280',
          maxWidth: 440, lineHeight: 1.8, marginBottom: 56,
        }}>
          Your intelligent meal guardian. Available on iOS and Android. Free to download, free to start.
        </p>

        {/* Download Cards */}
        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap',
          justifyContent: 'center', width: '100%', maxWidth: 760,
        }}>

          {/* iOS Card */}
          <div style={{
            flex: 1, minWidth: 300, maxWidth: 360,
            background: '#fff', border: '1.5px solid #e5e7eb',
            borderRadius: 28, padding: '36px 32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 16,
          }}>

            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg,#111,#333)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 36,
            }}>
              🍎
            </div>

            {/* Title */}
            <div>
              <div style={{
                fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                fontSize: 22, fontWeight: 800, color: '#052e16',
                marginBottom: 6, textAlign: 'center',
              }}>
                iPhone & iPad
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 1.6 }}>
                iOS 14.0 or later required.<br />
                Compatible with iPhone, iPad and iPod touch.
              </div>
            </div>

            {/* Launching soon */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f9fafb', borderRadius: 100, padding: '6px 14px',
            }}>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>🚀 Launching soon</span>
            </div>

            {/* App Store button */}
            <div
              onClick={() => setCs(true)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 12,
                padding: '15px 24px',
                background: '#000', color: '#fff',
                borderRadius: 14, cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 500 }}>Download on the</div>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  App Store
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
              Free · In-app purchases available
            </p>
          </div>

          {/* Android Card */}
          <div style={{
            flex: 1, minWidth: 300, maxWidth: 360,
            background: '#fff', border: '1.5px solid #bbf7d0',
            borderRadius: 28, padding: '36px 32px',
            boxShadow: '0 8px 40px rgba(22,163,74,0.12)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 16,
          }}>

            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg,#16a34a,#4ade80)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 36,
            }}>
              🤖
            </div>

            {/* Title */}
            <div>
              <div style={{
                fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                fontSize: 22, fontWeight: 800, color: '#052e16',
                marginBottom: 6, textAlign: 'center',
              }}>
                Android
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 1.6 }}>
                Android 8.0 or later required.<br />
                Works on all Android phones and tablets.
              </div>
            </div>

            {/* Launching soon */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f0fdf4', borderRadius: 100, padding: '6px 14px',
            }}>
              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>🚀 Launching soon</span>
            </div>

            {/* Play Store button */}
            <div
              onClick={() => setCs(true)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 12,
                padding: '15px 24px',
                background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                color: '#fff', borderRadius: 14, cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(22,163,74,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M3.18 23.76c.3.17.64.22.98.15l13.2-7.62-2.82-2.82-11.36 10.29zM.44 1.05C.17 1.4 0 1.88 0 2.48v19.04c0 .6.17 1.08.44 1.43l.08.07 10.67-10.67v-.25L.52.98.44 1.05zM20.33 10.49l-2.94-1.7-3.15 3.15 3.15 3.15 2.96-1.71c.84-.49.84-1.28-.02-1.89zM4.16.24l13.2 7.62-2.82 2.82L3.18.39C3.52.08 3.86.07 4.16.24z"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 500 }}>Get it on</div>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  Google Play
                </div>
              </div>
            </div>

            {/* APK Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            {/* APK accordion */}
            <div style={{ width: '100%', border: '1.5px solid #bbf7d0', borderRadius: 14, overflow: 'hidden' }}>
              <button
                onClick={() => setAndroidOpen(!androidOpen)}
                style={{
                  width: '100%', padding: '13px 20px',
                  background: androidOpen ? '#f0fdf4' : '#fff',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📦</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16' }}>
                      Download APK directly
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      For devices without Play Store
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 12, color: '#16a34a',
                  display: 'inline-block',
                  transform: androidOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease',
                }}>
                  ▼
                </span>
              </button>

              {/* APK expanded */}
              {androidOpen && (
                <div style={{
                  padding: '16px 20px',
                  background: '#f0fdf4',
                  borderTop: '1px solid #bbf7d0',
                }}>
                  {/* Warning */}
                  <div style={{
                    background: '#fffbeb', border: '1px solid #fcd34d',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
                      Before installing, enable <strong>Install from unknown sources</strong> in your Android Settings → Security.
                    </p>
                  </div>

                  {/* APK details */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 14, fontSize: 12, color: '#6b7280',
                  }}>
                    <span>📱 v1.0.0</span>
                    <span>📦 ~28 MB</span>
                    <span>🤖 Android 8.0+</span>
                  </div>

                  {/* APK download button */}
                  <div
                    onClick={() => setCs(true)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                      width: '100%', padding: '12px',
                      background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                      color: '#fff', borderRadius: 10, cursor: 'pointer',
                      fontWeight: 700, fontSize: 14,
                      fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                      boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    ⬇️ Download APK File
                  </div>
                </div>
              )}
            </div>

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
              Free · In-app purchases available
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: 36, marginTop: 56,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            ['🔒', 'End-to-end encrypted'],
            ['🇮🇳', 'Made in India'],
            ['⚡', 'Setup in 3 minutes'],
            ['↩️', 'Cancel anytime'],
          ].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Coming soon note */}
        <div style={{
          marginTop: 40, padding: '16px 28px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 16, maxWidth: 480,
        }}>
          <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>
            🚀 Launching soon on the App Store and Google Play. Every new account gets a 14-day free Gold trial.
          </p>
        </div>

      </div>

      <ComingSoonModal open={cs} onClose={() => setCs(false)} />
    </div>
  )
}