export default function MarqueeBar() {
  const items = [
    '😔 Forgetting meal times',
    '🍕 Late-night junk cravings',
    '📋 Diet charts collecting dust',
    '😴 Skipping Sunday prep',
    '📉 Breaking streaks every 2 weeks',
    '🤷 No accountability partner',
    '⏰ Missed protein windows',
    '🛒 Grocery guesswork every week',
    '😤 Diet app fatigue',
    '🧠 No one to remind you',
  ]

  return (
    <section
      style={{
        background: '#052e16',
        padding: '20px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left fade */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
        background: 'linear-gradient(to right, #052e16, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Right fade */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
        background: 'linear-gradient(to left, #052e16, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div className="marquee-track">
        {[...Array(2)].map((_, di) => (
          <div key={di} style={{ display: 'flex', flexShrink: 0 }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  flexShrink: 0,
                }}
              >
                <span style={{
                  padding: '0 32px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.7)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                }}>
                  {item}
                </span>
                <span style={{ color: '#4ade80', fontSize: 16, flexShrink: 0 }}>✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}