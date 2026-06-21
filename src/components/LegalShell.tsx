'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import BrandImg from '@/components/BrandImg'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

// Shared chrome (navbar + footer) + readable document container for all legal /
// support pages, styled to match the rest of mealwarden.com.
export default function LegalShell({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string
  subtitle?: string
  lastUpdated?: string
  children: ReactNode
}) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: FONT, color: '#1f2937' }}>
      {/* ── Navbar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #f0fdf4', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <BrandImg src="/logo-mark.png" fallback="🛡️" size={36} radius={10} />
          <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 20, color: '#052e16' }}>MealWarden</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/')} style={{ padding: '8px 18px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>← Home</button>
          <button onClick={() => router.push('/support')} style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Support</button>
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#052e16 0%,#16a34a 100%)', padding: '120px 48px 56px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_SYNE, fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>{subtitle}</p>}
        {lastUpdated && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>Last updated: {lastUpdated}</p>}
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 96px', fontSize: 15.5, lineHeight: 1.8, color: '#374151' }}>
        {children}
      </div>

      {/* ── Footer ── */}
      <div style={{ background: '#052e16', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <BrandImg src="/logo-mark.png" fallback="🛡️" size={28} radius={7} />
          <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 16, color: '#fff' }}>MealWarden</span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Delete Account', '/delete-account'], ['Support', '/support']].map(([l, href]) => (
            <span key={l} onClick={() => router.push(href)} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: FONT }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Small presentational helpers shared by the legal pages.
export function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', margin: '36px 0 12px' }}>{children}</h2>
}
export function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: '0 0 14px' }}>{children}</p>
}
export function LI({ children }: { children: ReactNode }) {
  return <li style={{ margin: '0 0 8px' }}>{children}</li>
}
export function UL({ children }: { children: ReactNode }) {
  return <ul style={{ margin: '0 0 14px', paddingLeft: 22 }}>{children}</ul>
}
