'use client'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

// Shown when a user taps an App Store / Google Play button before launch.
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
          width: '100%', maxWidth: 380, background: '#fff', borderRadius: 24, padding: '32px 28px',
          textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.3)', fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 46, marginBottom: 10 }}>🚀</div>
        <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: '#052e16', marginBottom: 10 }}>Coming soon!</h3>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
          MealWarden is launching on the App Store and Google Play shortly. We&apos;re putting on the
          finishing touches — check back very soon.
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: FONT,
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
