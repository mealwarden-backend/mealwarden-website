'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const CAT_ICONS: Record<string,string> = {
  protein:'🍗',dairy:'🥛',vegetables:'🥦',fruits:'🍎',grains:'🌾',
  nuts:'🌰',seeds:'🫘',oils:'🫙',spices:'🧂',beverages:'☕',
  condiments:'🍯',legumes:'🫘',lentils:'🫘',fish:'🐟',eggs:'🥚',
  bakery:'🍞',frozen:'🧊',snacks:'🍪',supplements:'💊',other:'🛒',
}
const catIcon = (name: string) => {
  const n = name.toLowerCase()
  for (const [k, v] of Object.entries(CAT_ICONS)) { if (n.includes(k)) return v }
  return '🛒'
}

export default function Grocery() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    try {
      const d = await api.getGrocery(refresh)
      setData(d)
      setChecked(new Set<string>((d?.checkedKeys as string[]) || []))
    } catch {} finally { setLoaded(true); setRefreshing(false) }
  }

  useEffect(() => { if (!user) { router.push('/'); return } load() }, [user]) // eslint-disable-line

  if (!user || !loaded) return null

  const categories: any[] = data?.categories || []
  const totalItems = categories.reduce((s: number, c: any) => s + (c.items?.length || 0), 0)
  const pct = totalItems ? Math.round((checked.size / totalItems) * 100) : 0

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
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🛒 Grocery List</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: 0 }}>{data?.hasPlan ? `From your active plan${data?.planName ? ` · ${data.planName}` : ''}` : 'Your weekly shopping list'}</p>
            </div>
            <button onClick={() => load(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '10px 18px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: refreshing ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: refreshing ? 0.7 : 1 }}>
              ⟳ {refreshing ? 'Refreshing…' : 'Refresh List'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        {!data?.hasPlan || categories.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '56px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 10 }}>No grocery list yet</div>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 400, margin: '0 auto 24px' }}>Activate a diet plan and MealWarden builds your weekly grocery list automatically.</p>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Go to Dashboard →</button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 22px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#052e16', fontFamily: FONT_SYNE }}>{checked.size} of {totalItems} items</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: pct === 100 ? '#16a34a' : '#6b7280' }}>{pct}%{pct === 100 ? ' 🎉' : ''}</span>
              </div>
              <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right,#16a34a,#4ade80)', borderRadius: 6, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Categories */}
            {categories.map((c: any, ci: number) => {
              const name = catName(c)
              const items: any[] = c.items || []
              const catDone = items.filter((_: any, ii: number) => checked.has(`${ci}-${ii}`)).length
              return (
                <div key={ci} style={{ background: '#fff', borderRadius: 18, marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 22 }}>{catIcon(name)}</span>
                    <span style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', flex: 1 }}>{name}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{catDone}/{items.length}</span>
                  </div>
                  <div style={{ padding: '8px 16px 12px' }}>
                    {items.map((it: any, ii: number) => {
                      const key = `${ci}-${ii}`
                      const on = checked.has(key)
                      const qty = it.quantity || it.qty || ''
                      const unit = it.unit || it.quantityUnit || ''
                      return (
                        <div key={ii} onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', borderBottom: ii < items.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer' }}>
                          <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${on ? '#16a34a' : '#cbd5e1'}`, background: on ? '#16a34a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {on && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                          </div>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: on ? 500 : 600, color: on ? '#9ca3af' : '#374151', textDecoration: on ? 'line-through' : 'none' }}>{it.item || it.name}</span>
                          {(qty || unit) && <span style={{ fontSize: 12.5, color: on ? '#d1d5db' : '#6b7280', fontWeight: 600, flexShrink: 0 }}>{qty}{unit ? ' ' + unit : ''}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
