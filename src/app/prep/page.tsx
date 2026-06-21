'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Prep() {
  const { user } = useAuth()
  const router   = useRouter()
  const [tasks, setTasks]   = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const d = await api.getPrepToday()
        if (active) setTasks((d?.tasks || []) as any[])
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const toggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    api.completePrep(id).catch(() => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    })
  }

  const pending = tasks.filter(t => !t.isCompleted)
  const done    = tasks.filter(t => t.isCompleted)

  const Row = ({ t }: { t: any }) => (
    <div onClick={() => toggle(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: t.isCompleted ? '#f0fdf4' : '#f9fafb', border: `1px solid ${t.isCompleted ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 14, cursor: 'pointer', marginBottom: 10 }}>
      <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${t.isCompleted ? '#16a34a' : '#cbd5e1'}`, background: t.isCompleted ? '#16a34a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {t.isCompleted && <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: t.isCompleted ? '#9ca3af' : '#052e16', textDecoration: t.isCompleted ? 'line-through' : 'none' }}>{t.title}</div>
        {(t.dueBy || t.priority) && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {t.dueBy ? `⏰ ${t.dueBy}` : ''}{t.priority === 'urgent' ? '  ·  🔴 urgent' : ''}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🥣 Prep Ahead</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Tonight&apos;s soaks, marinades and make-ahead steps.</p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {tasks.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥣</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>Nothing to prep right now</div>
            <p style={{ fontSize: 14, color: '#6b7280' }}>When your plan has make-ahead steps (soaking, marinating, setting curd), they&apos;ll show up here ahead of time.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {pending.length > 0 && (
              <>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>To do ({pending.length})</div>
                {pending.map(t => <Row key={t.id} t={t} />)}
              </>
            )}
            {done.length > 0 && (
              <>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#9ca3af', margin: '16px 0 12px' }}>Done ({done.length})</div>
                {done.map(t => <Row key={t.id} t={t} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
