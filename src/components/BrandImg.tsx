'use client'

import { useState, CSSProperties } from 'react'

// Renders a brand image (logo / guardian portrait) with a graceful emoji
// fallback, so the site looks right even before the asset is copied into
// /public. Copy the real PNGs from the app and the image shows automatically.
export default function BrandImg({
  src,
  fallback,
  size = 38,
  radius = 11,
  bg = 'linear-gradient(135deg,#16a34a,#4ade80)',
  contain = true,
  style,
}: {
  src: string
  fallback: string
  size?: number
  radius?: number
  bg?: string
  contain?: boolean
  style?: CSSProperties
}) {
  const [err, setErr] = useState(false)

  if (err) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.5), flexShrink: 0, ...style }}>
        {fallback}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt="MealWarden"
      width={size}
      height={size}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: contain ? 'contain' : 'cover', borderRadius: radius, display: 'block', flexShrink: 0, ...style }}
    />
  )
}
