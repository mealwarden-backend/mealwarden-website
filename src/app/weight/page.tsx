'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Weight() {
  const { user } = useAuth()
  const router   = useRouter()
  const [stats, setStats]   = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [val, setVal]       = useState('')
  const [busy, setBusy]     = useState(false)

  const load = async () => {
    try { setStats(await api.getWeightStats()) } catch {} finally { setLoaded(true) }
  }
  useEffect(() => {
    if (!user) { router.push('/'); return }
    load()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const logWeight = async () => {
    const w = parseFloat(val)
    if (!(w >= 20 && w <= 300) || busy) return
    setBusy(true)
    try { await api.logWeight({ weightKg: w }); setVal(''); await load() }
    catch {} finally { setBusy(false) }
  }

  const logs: any[] = stats?.logs || []
  const weights = logs.map(l => l.weightKg).filter((n: any) => typeof n === 'number')
  const min = weights.length ? Math.min(...weights) : 0
  const max = weights.length ? Math.max(...weights) : 1
  const range = Math.max(1, max - min)
  // logs come newest-first; show oldest→newest in the chart
  const chrono = [...logs].reverse()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>⚖️ Weight Tracker</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Log your weight and watch your trend.</p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {/* Log form */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 22, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>Log today&apos;s weight</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingRight: 14 }}>
              <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="72.5" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '12px 14px', fontSize: 16, color: '#111827', fontFamily: FONT }} />
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>kg</span>
            </div>
            <button onClick={logWeight} disabled={busy || !(parseFloat(val) >= 20)} style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, padding: '0 24px', fontWeight: 800, fontSize: 14, cursor: busy || !(parseFloat(val) >= 20) ? 'not-allowed' : 'pointer', opacity: busy || !(parseFloat(val) >= 20) ? 0.6 : 1, fontFamily: FONT }}>{busy ? '…' : 'Log'}</button>
          </div>
        </div>

        {stats?.hasData ? (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Current', value: `${stats.currentWeight} kg`, ac: '#16a34a' },
                { label: 'Start', value: `${stats.startWeight} kg`, ac: '#3b82f6' },
                { label: 'Change', value: `${(stats.totalChange || 0) > 0 ? '+' : ''}${stats.totalChange} kg`, ac: (stats.totalChange || 0) <= 0 ? '#16a34a' : '#f97316' },
                { label: stats.bmi != null ? `BMI · ${stats.bmiCategory || ''}` : 'BMI', value: stats.bmi != null ? `${stats.bmi}` : '–', ac: '#a855f7' },
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', borderRadius: 16, padding: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 11, color: c.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{c.label}</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16' }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Trend bars */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16', marginBottom: 18 }}>Trend</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
                {chrono.map((l, i) => {
                  const h = 20 + ((l.weightKg - min) / range) * 100
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} title={`${l.weightKg} kg`}>
                      <div style={{ fontSize: 9, color: '#9ca3af' }}>{l.weightKg}</div>
                      <div style={{ width: '100%', maxWidth: 26, height: `${h}px`, borderRadius: '4px 4px 0 0', background: 'linear-gradient(to top,#16a34a,#4ade80)' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>Last {chrono.length} entries</div>
            </div>
          </>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚖️</div>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Log your first weight above to start tracking your trend.</p>
          </div>
        )}
      </div>
    </div>
  )
}
