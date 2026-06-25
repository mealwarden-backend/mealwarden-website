'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const iconFor = (title: string): string => {
  const t = title.toLowerCase()
  if (t.includes('almond') || t.includes('cashew') || t.includes('walnut')) return '🌰'
  if (t.includes('paneer') || t.includes('tofu') || t.includes('cheese')) return '🧀'
  if (t.includes('chicken') || t.includes('mutton') || t.includes('meat')) return '🍗'
  if (t.includes('fish') || t.includes('prawn')) return '🐟'
  if (t.includes('egg')) return '🥚'
  if (t.includes('marinate') || t.includes('marinade')) return '🍢'
  if (t.includes('sprout')) return '🌱'
  if (t.includes('curd') || t.includes('dahi') || t.includes('yogurt') || t.includes('milk')) return '🥛'
  if (t.includes('dal') || t.includes('lentil') || t.includes('chana') || t.includes('bean')) return '🫘'
  if (t.includes('oats') || t.includes('ragi') || t.includes('idli') || t.includes('dosa')) return '🥣'
  if (t.includes('rice') || t.includes('quinoa')) return '🍚'
  if (t.includes('lemon') || t.includes('lime') || t.includes('juice')) return '🍋'
  if (t.includes('veg') || t.includes('chop') || t.includes('cut')) return '🥗'
  return '🍽️'
}

const dueLabel = (iso: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (d.getTime() <= Date.now() + 60000) return 'Do it now'
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `By ${h}:${m} ${ap}`
}

const GUARDIANS: Record<string, { name: string; emoji: string; tip: string }> = {
  meenu: { name: 'Meenu', emoji: '🧕', tip: 'Prep ahead so every meal nourishes you fully.' },
  maddy: { name: 'Maddy', emoji: '👨‍⚕️', tip: 'Smart prep = better macros and less last-minute stress.' },
}

export default function Prep() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [guardian, setGuardian] = useState('meenu')

  useEffect(() => {
    if (!user) { router.push('/'); return }
    try { const g = localStorage.getItem('mw_guardian'); if (g) setGuardian(g) } catch {}
    let active = true
    ;(async () => {
      try { const d = await api.getPrepToday(); if (active) setTasks((d?.tasks || []) as any[]) }
      catch {} finally { if (active) setLoaded(true) }
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
  const g = GUARDIANS[guardian] || GUARDIANS.meenu

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
        {/* Guardian banner */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', marginBottom: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{g.emoji}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{g.name} says</div>
            <div style={{ fontSize: 13.5, color: '#374151' }}>{g.tip}</div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥣</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>Nothing to prep right now</div>
            <p style={{ fontSize: 14, color: '#6b7280' }}>When your plan has make-ahead steps (soaking, marinating, setting curd), they&apos;ll show up here.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px 20px 10px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {pending.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16' }}>To do</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', borderRadius: 8, padding: '2px 9px' }}>{pending.length}</span>
                </div>
                {pending.map(t => <PrepRow key={t.id} task={t} onToggle={toggle} />)}
              </>
            )}
            {done.length > 0 && (
              <>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#9ca3af', margin: '16px 0 12px' }}>Done ({done.length})</div>
                {done.map(t => <PrepRow key={t.id} task={t} onToggle={toggle} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PrepRow({ task, onToggle }: { task: any; onToggle: (id: string) => void }) {
  const isUrgent  = !task.isCompleted && task.priority === 'urgent'
  const isOverdue = !task.isCompleted && task.dueBy && new Date(task.dueBy).getTime() < Date.now()
  const due = task.dueLabel || (task.dueBy ? dueLabel(task.dueBy) : '')
  const icon = iconFor(task.title)

  const bg     = task.isCompleted ? '#f0fdf4' : isOverdue ? '#fef2f2' : isUrgent ? '#fff7ed' : '#fff'
  const border = task.isCompleted ? '#bbf7d0' : isOverdue ? '#fecaca' : isUrgent ? '#fed7aa' : '#e5e7eb'
  const dueCol = isOverdue ? '#ef4444' : isUrgent ? '#f97316' : '#6b7280'

  return (
    <div onClick={() => onToggle(task.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '15px 18px', background: bg, border: `1.5px solid ${border}`, borderRadius: 16, cursor: 'pointer', marginBottom: 10 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: task.isCompleted ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: task.isCompleted ? '#9ca3af' : '#052e16', textDecoration: task.isCompleted ? 'line-through' : 'none', marginBottom: 3 }}>{task.title}</div>
        {!!task.description && !task.isCompleted && (
          <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 6, lineHeight: 1.5 }}>{task.description}</div>
        )}
        {!task.isCompleted && (due || isOverdue || isUrgent) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {!!due && <span style={{ fontSize: 11.5, fontWeight: 700, color: dueCol }}>⏰ {due}</span>}
            {isOverdue && <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', background: '#fef2f2', borderRadius: 8, padding: '2px 8px' }}>🔴 Overdue</span>}
            {isUrgent && !isOverdue && <span style={{ fontSize: 11, fontWeight: 800, color: '#f97316', background: '#fff7ed', borderRadius: 8, padding: '2px 8px' }}>🟠 Urgent</span>}
            {!!(task as any).readyFor && <span style={{ fontSize: 11, color: '#9ca3af' }}>ready for {(task as any).readyFor}</span>}
          </div>
        )}
      </div>
      <div style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${task.isCompleted ? '#16a34a' : '#cbd5e1'}`, background: task.isCompleted ? '#16a34a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 6 }}>
        {task.isCompleted && <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>✓</span>}
      </div>
    </div>
  )
}
