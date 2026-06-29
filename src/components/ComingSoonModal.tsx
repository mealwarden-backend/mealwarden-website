'use client'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

// Shown when a user taps an App Store / Google Play button.
// Android APK is available now; iOS App Store is launching very soon.
export default function ComingSoonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,46,22,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400, background: '#fff', borderRadius: 24, padding: '32px 28px',
          textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.3)', fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 46, marginBottom: 10 }}>📲</div>
        <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>
          Get MealWarden
        </h3>

        {/* Android — available now */}
        <a
          href="/download"
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#f0fdf4', border: '1.5px solid #16a34a',
            borderRadius: 16, padding: '14px 18px', marginBottom: 10,
            textDecoration: 'none', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 28 }}>🤖</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>Android — Available Now</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Download APK · Google Play coming soon</div>
          </div>
          <div style={{
            background: '#16a34a', color: '#fff',
            borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700,
          }}>
            Download
          </div>
        </a>

        {/* iOS — coming soon */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#f9fafb', border: '1.5px solid #e5e7eb',
            borderRadius: 16, padding: '14px 18px', marginBottom: 20,
            opacity: 0.85,
          }}
        >
          <div style={{ fontSize: 28 }}>🍎</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#374151' }}>iOS — Launching Soon</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>App Store · We&apos;re putting on the finishing touches</div>
          </div>
          <div style={{
            background: '#e5e7eb', color: '#9ca3af',
            borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700,
          }}>
            Soon
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
          Your account syncs across Android and web instantly. iOS access follows the same login.
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff',
            fontWeight: 700, fontSize: 15, fontFamily: FONT,
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
