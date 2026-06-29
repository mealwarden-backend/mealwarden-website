'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const bmiColor = (b: number) => b < 18.5 ? '#3b82f6' : b < 25 ? '#16a34a' : b < 30 ? '#f97316' : '#ef4444'
const bmiLabel = (b: number) => b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy' : b < 30 ? 'Overweight' : 'Obese'

function LineChart({ logs }: { logs: any[] }) {
  if (logs.length < 2) return null
  const W = 700, H = 160, PL = 44, PR = 16, PT = 16, PB = 36
  const iw = W - PL - PR, ih = H - PT - PB
  const vals = logs.map((l: any) => l.weightKg)
  const minV = Math.min(...vals), maxV = Math.max(...vals)
  const range = Math.max(maxV - minV, 0.5)
  const tx = (i: number) => PL + (i / (logs.length - 1)) * iw
  const ty = (v: number) => PT + ih - ((v - minV) / range) * ih
  const pts = logs.map((l: any, i: number) => `${tx(i)},${ty(l.weightKg)}`).join(' ')
  const fill = `${tx(0)},${PT + ih} ${pts} ${tx(logs.length - 1)},${PT + ih}`
  const step = Math.max(1, Math.floor(logs.length / 5))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = PT + ih * (1 - t)
        return <g key={i}>
          <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#f1f5f9" strokeWidth={1} />
          <text x={PL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{(minV + range * t).toFixed(1)}</text>
        </g>
      })}
      <polygon points={fill} fill="url(#lg)" />
      <polyline points={pts} fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinejoin="round" />
      {logs.map((l: any, i: number) => (
        <circle key={i} cx={tx(i)} cy={ty(l.weightKg)} r={3.5} fill="#16a34a" stroke="#fff" strokeWidth={1.5}>
          <title>{l.weightKg} kg{l.notes ? ` · ${l.notes}` : ''}</title>
        </circle>
      ))}
      {logs.filter((_: any, i: number) => i % step === 0 || i === logs.length - 1).map((l: any, _: any, __: any, i = logs.findIndex((x: any) => x === l)) => (
        <text key={i} x={tx(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
          {new Date(l.date || l.loggedAt || '').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </text>
      ))}
    </svg>
  )
}

export default function Weight() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [val, setVal] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    try { setStats(await api.getWeightStats()) } catch {} finally { setLoaded(true) }
  }
  useEffect(() => { if (!user) { router.push('/'); return } load() }, [user]) // eslint-disable-line

  if (!user || !loaded) return null

  const logWeight = async () => {
    const w = parseFloat(val)
    if (!(w >= 20 && w <= 300)) { setErr('Enter a valid weight between 20 and 300 kg'); return }
    if (busy) return
    setBusy(true); setErr('')
    try { await api.logWeight({ weightKg: w, notes: notes.trim() || undefined }); setVal(''); setNotes(''); await load() }
    catch (e: any) { setErr(e?.message || 'Failed to log weight') }
    finally { setBusy(false) }
  }

  const logs: any[] = stats?.logs || []
  const chrono = [...logs].reverse()
  const bmi = stats?.bmi
  const change = stats?.totalChange

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
          <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>Log today&apos;s weight</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: err ? 8 : 0, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, paddingRight: 14, flexShrink: 0 }}>
              <input type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && logWeight()} placeholder="72.5" style={{ background: 'transparent', border: 'none', outline: 'none', padding: '12px 14px', fontSize: 16, color: '#111827', fontFamily: FONT, width: 90 }} />
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>kg</span>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note (optional, e.g. after workout)" style={{ flex: 1, minWidth: 160, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#111827', outline: 'none', fontFamily: FONT }} />
            <button onClick={logWeight} disabled={busy || !(parseFloat(val) >= 20)} style={{ flexShrink: 0, background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, padding: '0 22px', fontWeight: 800, fontSize: 14, cursor: (busy || !(parseFloat(val) >= 20)) ? 'not-allowed' : 'pointer', opacity: (busy || !(parseFloat(val) >= 20)) ? 0.6 : 1, fontFamily: FONT, height: 46 }}>{busy ? '…' : 'Log'}</button>
          </div>
          {!!err && <div style={{ fontSize: 13, color: '#ef4444' }}>{err}</div>}
        </div>

        {stats?.hasData ? (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Current', value: `${stats.currentWeight} kg`, ac: '#16a34a' },
                { label: 'Start',   value: `${stats.startWeight} kg`,   ac: '#3b82f6' },
                { label: 'Change',  value: `${(change || 0) > 0 ? '+' : ''}${change ?? 0} kg`, ac: (change || 0) <= 0 ? '#16a34a' : '#f97316' },
                ...(stats.goalWeight ? [{ label: 'Goal', value: `${stats.goalWeight} kg`, ac: '#a855f7' }] : []),
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 11, color: c.ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>{c.label}</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16' }}>{c.value}</div>
                </div>
              ))}
              {bmi != null && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 11, color: bmiColor(bmi), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>BMI</div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: bmiColor(bmi) }}>{bmi}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: bmiColor(bmi), marginTop: 3 }}>{bmiLabel(bmi)}</div>
                </div>
              )}
            </div>

            {/* Line chart */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px 14px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>Trend · {chrono.length} entries</div>
              <LineChart logs={chrono} />
            </div>

            {/* Recent entries */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>Recent entries</div>
              {logs.slice(0, 10).map((l: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < Math.min(logs.length, 10) - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>{new Date(l.date || l.loggedAt || '').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    {!!l.notes && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{l.notes}</div>}
                  </div>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#052e16' }}>{l.weightKg} <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT, fontWeight: 600 }}>kg</span></div>
                </div>
              ))}
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
