'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

export default function Grocery() {
  const { user } = useAuth()
  const router   = useRouter()

  const [data, setData]       = useState<any>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    let active = true
    ;(async () => {
      try {
        const d = await api.getGrocery()
        if (!active) return
        setData(d)
        setChecked(new Set<string>((d?.checkedKeys as string[]) || []))
      } catch {} finally { if (active) setLoaded(true) }
    })()
    return () => { active = false }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !loaded) return null

  const categories: any[] = data?.categories || []
  const totalItems = categories.reduce((s, c) => s + (c.items?.length || 0), 0)
  const doneItems  = checked.size

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      api.setGroceryChecked([...next]).catch(() => {})
      return next
    })
  }

  const catName = (c: any) => c.name || c.category || c.title || 'Items'

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🛒 Grocery List</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
            {data?.hasPlan ? `From your active plan${data?.planName ? ` · ${data.planName}` : ''}` : 'Your weekly shopping list'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {!data?.hasPlan || categories.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '56px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 10 }}>No grocery list yet</div>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
              Activate a diet plan and MealWarden builds your weekly grocery list automatically, sorted by aisle.
            </p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Go to Dashboard →</button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '18px 22px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#052e16', fontFamily: FONT_SYNE }}>{doneItems} of {totalItems} items</span>
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>{totalItems ? Math.round((doneItems / totalItems) * 100) : 0}%</span>
              </div>
              <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalItems ? (doneItems / totalItems) * 100 : 0}%`, background: 'linear-gradient(to right,#16a34a,#4ade80)', borderRadius: 6, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Categories */}
            {categories.map((c, ci) => (
              <div key={ci} style={{ background: '#fff', borderRadius: 18, padding: '18px 22px', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>{catName(c)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(c.items || []).map((it: any, ii: number) => {
                    const key = `${ci}-${ii}`
                    const on = checked.has(key)
                    return (
                      <div key={ii} onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: on ? '#f0fdf4' : '#f9fafb', border: `1px solid ${on ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 12, cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${on ? '#16a34a' : '#cbd5e1'}`, background: on ? '#16a34a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {on && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                        </div>
                        <span style={{ flex: 1, fontSize: 14, color: on ? '#9ca3af' : '#374151', textDecoration: on ? 'line-through' : 'none' }}>{it.item || it.name}</span>
                        {!!it.quantity && <span style={{ fontSize: 12.5, color: '#9ca3af' }}>{it.quantity}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
