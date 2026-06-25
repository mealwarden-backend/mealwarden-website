'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GOLD  = '#E6A700'
const GREEN = '#16a34a'
const DARK  = '#052e16'

type Member  = { id: string; name: string; username?: string; streak: number; isMe?: boolean; rank: number }
type ReqItem = { id: string; user: { id: string; name: string; username?: string } }
type Badge   = { day: number; key: string; name: string; coins: number; unlocked: boolean; daysLeft: number }
type DayCell = { date: string; adherencePct: number; logged: number; planned: number }

function AdherenceColor(pct: number) {
  if (pct >= 80) return '#16a34a'
  if (pct >= 50) return '#f59e0b'
  if (pct > 0)   return '#f97316'
  return '#e5e7eb'
}

export default function StreakPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [streak,      setStreak]      = useState<number | null>(null)
  const [board,       setBoard]       = useState<Member[]>([])
  const [friendCount, setFriendCount] = useState(0)
  const [requests,    setRequests]    = useState<ReqItem[]>([])
  const [loaded,      setLoaded]      = useState(false)

  // Coins + badges
  const [coins,       setCoins]       = useState(0)
  const [lifetimeEarned, setLifetimeEarned] = useState(0)
  const [badges,      setBadges]      = useState<Badge[]>([])
  const [justAwarded, setJustAwarded] = useState<{ name: string; coins: number }[]>([])

  // 7-day grid
  const [weekGrid, setWeekGrid] = useState<DayCell[]>([])

  // Active plans (for delete action)
  const [plans,       setPlans]       = useState<any[]>([])
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null)

  // Find Mates
  const [q,         setQ]         = useState('')
  const [results,   setResults]   = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})

  const reload = useCallback(async () => {
    const [st, lb, rq, cs, summary, plansRes] = await Promise.all([
      api.getStreak().catch(() => null),
      api.friendsLeaderboard().catch(() => null),
      api.friendRequests().catch(() => null),
      api.getCoinStatus().catch(() => null),
      api.getAnalyticsSummary('week').catch(() => null),
      api.getDietPlans().catch(() => null),
    ])
    setStreak(st?.streak ?? null)
    setBoard(lb?.leaderboard || [])
    setFriendCount(lb?.friendCount || 0)
    setRequests(rq?.requests || [])

    const cd = cs?.data || cs || {}
    setCoins(cd.mealCoins || 0)
    setLifetimeEarned(cd.lifetimeEarned || 0)
    setBadges(cd.badges || [])
    setJustAwarded(cd.justAwarded || [])

    // Build 7-day grid from daily breakdown
    const breakdown: any[] = summary?.dailyBreakdown || summary?.data?.dailyBreakdown || []
    // Fill missing days with zeros
    const today = new Date()
    const grid: DayCell[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      const found = breakdown.find((b: any) => b.date?.slice(0, 10) === iso)
      grid.push({ date: iso, adherencePct: found?.adherencePct ?? 0, logged: found?.loggedMeals ?? 0, planned: found?.plannedMeals ?? 0 })
    }
    setWeekGrid(grid)

    setPlans((plansRes?.plans || plansRes || []).filter((p: any) => p.isActive))
  }, [])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    ;(async () => { try { await reload() } finally { setLoaded(true) } })()
  }, [user, reload, router])

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return }
    let active = true
    setSearching(true)
    const id = setTimeout(async () => {
      try { const r = await api.searchUsers(q.trim()); if (active) setResults(r?.users || []) }
      catch { if (active) setResults([]) }
      finally { if (active) setSearching(false) }
    }, 350)
    return () => { active = false; clearTimeout(id) }
  }, [q])

  const add = async (id: string) => {
    try { const r = await api.sendFriendRequest(id); setStatusMap(m => ({ ...m, [id]: r?.status || 'requested' })); reload() } catch {}
  }
  const respond = async (id: string, action: 'accept' | 'reject') => {
    try { await api.respondFriend(id, action); reload() } catch {}
  }
  const share = async () => {
    const text = `I'm on a ${streak ?? 0}-day healthy-eating streak on MealWarden! 🔥`
    try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); alert('Copied to clipboard!') } } catch {}
  }
  const deletePlan = async (id: string) => {
    setDeletingId(id)
    try { await api.deleteDietPlan(id); setConfirmDel(null); reload() }
    catch {} finally { setDeletingId(null) }
  }

  if (!user || !loaded) return null

  const days      = streak ?? 0
  const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
  const earned    = badges.filter(b => b.unlocked)
  const upcoming  = badges.filter(b => !b.unlocked).slice(0, 4)
  const weekDays  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: `linear-gradient(135deg,${DARK},${GREEN})`, padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🔥 Your Streak</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Keep logging meals to earn badges, stack Meal Coins, and climb the Mates leaderboard.</p>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-32px auto 0', padding: '0 24px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Just awarded toast */}
        {justAwarded.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '1.5px solid #fbbf24', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🏅</span>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: 15, color: DARK }}>Badge{justAwarded.length > 1 ? 's' : ''} Unlocked!</div>
              <div style={{ fontSize: 13, color: '#92400e' }}>{justAwarded.map(b => `${b.name} (+${b.coins} Coins)`).join(' · ')}</div>
            </div>
          </div>
        )}

        {/* Hero + 7-day grid side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Streak hero */}
          <div style={{ ...card, textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ width: 100, height: 100, borderRadius: 56, background: '#fdf3d6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 46 }}>🔥</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 42, fontWeight: 800, color: DARK }}>{days} {days === 1 ? 'Day' : 'Days'}</div>
            <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 300, margin: '8px auto 0', lineHeight: 1.6 }}>
              {days > 0 ? `On fire, ${user?.name?.split(' ')[0] || 'there'}! Keep logging.` : `Log a meal today and your streak begins.`}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/dashboard')} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 30, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Log Next Meal</button>
              <button onClick={share} style={{ background: '#fdf3d6', color: GOLD, border: 'none', borderRadius: 30, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Share 🔗</button>
            </div>
          </div>

          {/* 7-day consistency grid */}
          <div style={{ ...card }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 16 }}>7-Day Consistency</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
              {weekGrid.map((day, i) => {
                const d = new Date(day.date + 'T12:00:00')
                const isToday = day.date === new Date().toISOString().slice(0, 10)
                const color   = AdherenceColor(day.adherencePct)
                return (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4, fontFamily: FONT }}>{weekDays[d.getDay()]}</div>
                    <div title={`${day.date}: ${day.logged}/${day.planned} meals (${day.adherencePct}%)`} style={{
                      width: '100%', aspectRatio: '1/1', borderRadius: 8,
                      background: color,
                      border: isToday ? `2px solid ${DARK}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: day.adherencePct > 0 ? '#fff' : '#9ca3af',
                      cursor: 'default', transition: 'transform 0.15s ease',
                    }}>
                      {day.adherencePct > 0 ? `${day.adherencePct}%` : '–'}
                    </div>
                    <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 3, fontFamily: FONT }}>{day.logged}/{day.planned}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              {[{ label: '≥80% Great', color: GREEN }, { label: '50–79% OK', color: '#f59e0b' }, { label: '1–49% Low', color: '#f97316' }, { label: '0% None', color: '#e5e7eb' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                  <span style={{ fontSize: 10, color: '#6b7280', fontFamily: FONT }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Coins */}
        <div style={{ ...card, background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '1.5px solid #fbbf24' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: DARK }}>🪙 Meal Coins</div>
              <div style={{ fontSize: 13, color: '#78350f', marginTop: 2 }}>Earned by logging meals and hitting streak milestones</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 30, fontWeight: 800, color: '#92400e' }}>{coins.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#a16207' }}>balance · {lifetimeEarned.toLocaleString()} earned lifetime</div>
            </div>
          </div>
          {/* Coin bar: spent vs balance */}
          {lifetimeEarned > 0 && (
            <div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round((coins / lifetimeEarned) * 100))}%`, background: GOLD, borderRadius: 6, transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: '#92400e', fontFamily: FONT }}>{Math.round((coins / lifetimeEarned) * 100)}% remaining</span>
                <span style={{ fontSize: 10, color: '#92400e', fontFamily: FONT }}>{(lifetimeEarned - coins).toLocaleString()} spent</span>
              </div>
            </div>
          )}
        </div>

        {/* Badge Carousel */}
        <div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 14 }}>🏅 Streak Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12 }}>
            {[...earned, ...upcoming].map(b => (
              <div key={b.key} style={{
                ...card, padding: '18px 14px', textAlign: 'center',
                opacity: b.unlocked ? 1 : 0.55,
                border: b.unlocked ? `2px solid ${GOLD}` : '2px solid #e5e7eb',
                background: b.unlocked ? '#fffbeb' : '#f9fafb',
                position: 'relative',
              }}>
                {b.unlocked && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, background: GOLD, color: '#fff', borderRadius: 100, padding: '2px 6px', fontWeight: 700 }}>+{b.coins}</div>}
                <div style={{ fontSize: 30, marginBottom: 6 }}>{b.unlocked ? '🏅' : '🔒'}</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 13, fontWeight: 800, color: DARK, marginBottom: 2 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: b.unlocked ? GOLD : '#9ca3af' }}>
                  {b.unlocked ? `Earned · ${b.day}d` : `${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'} left`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active plan management */}
        {plans.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: DARK, marginBottom: 12 }}>📋 Active Plans</div>
            <div style={card}>
              {plans.map((p: any, i: number) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: DARK }}>{p.name || p.dayName || `Plan ${i + 1}`}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      Active since {p.activatedAt ? new Date(p.activatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                  </div>
                  {confirmDel === p.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmDel(null)} style={{ padding: '7px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: '#6b7280' }}>Cancel</button>
                      <button onClick={() => deletePlan(p.id)} disabled={deletingId === p.id} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: '#ef4444' }}>
                        {deletingId === p.id ? 'Deleting…' : '⚠️ Confirm Delete'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(p.id)} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, color: '#ef4444' }}>
                      🗑 Delete Plan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mates leaderboard */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 1.5 }}>MEALWARDEN</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: DARK }}>Mates Leaderboard</div>
          </div>
          <div style={card}>
            {board.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 6px', borderTop: i ? '1px solid #f1f5f9' : 'none', background: m.isMe ? '#f0fdf4' : 'transparent', borderRadius: m.isMe ? 10 : 0 }}>
                <div style={{ width: 24, textAlign: 'center', fontWeight: 800, color: m.rank <= 3 ? GOLD : '#9ca3af' }}>{m.rank}</div>
                <div style={{ width: 38, height: 38, borderRadius: 20, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: GREEN }}>{(m.name || '?').charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: m.isMe ? GREEN : '#111827', fontSize: 14 }}>{m.isMe ? `${m.name} (You)` : m.name}</div>
                  {m.username && <div style={{ fontSize: 12, color: '#9ca3af' }}>@{m.username}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, color: '#111827' }}>{m.streak} <span style={{ color: GOLD }}>🔥</span></div>
              </div>
            ))}
            {friendCount === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 12px', borderTop: '1px solid #f1f5f9', marginTop: 6 }}>
                <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>Compete with your MealWarden Mates</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Add mates below and your streaks line up here.</div>
              </div>
            )}
          </div>
        </div>

        {/* Requests */}
        {requests.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: DARK, marginBottom: 10 }}>Mate Requests ({requests.length})</div>
            <div style={card}>
              {requests.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 20, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: GREEN }}>{(r.user?.name || '?').charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user?.name}</div>
                    {r.user?.username && <div style={{ fontSize: 12, color: '#9ca3af' }}>@{r.user.username}</div>}
                  </div>
                  <button onClick={() => respond(r.id, 'reject')} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>✕</button>
                  <button onClick={() => respond(r.id, 'accept')} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Accept</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Find Mates */}
        <div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: DARK, marginBottom: 10 }}>Find Mates</div>
          <div style={card}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by username, email or phone"
              style={{ width: '100%', boxSizing: 'border-box', background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 15, fontFamily: FONT, outline: 'none' }}
            />
            <div style={{ marginTop: 8 }}>
              {q.trim().length < 2 ? (
                <div style={{ color: '#9ca3af', fontSize: 13, padding: '14px 2px' }}>Type at least 2 characters (username, email or phone).</div>
              ) : searching ? (
                <div style={{ color: '#9ca3af', fontSize: 13, padding: '14px 2px' }}>Searching…</div>
              ) : results.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: 13, padding: '14px 2px' }}>No one found for "{q}".</div>
              ) : results.map(u => {
                const st = statusMap[u.id] || u.status
                const label = st === 'friends' ? 'Mates ✓' : st === 'requested' ? 'Requested' : st === 'incoming' ? 'Accept' : 'Add'
                const disabled = st === 'requested' || st === 'friends'
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 2px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 20, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: GREEN }}>{(u.name || '?').charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                      {u.username && <div style={{ fontSize: 12, color: '#9ca3af' }}>@{u.username}</div>}
                    </div>
                    <button onClick={() => !disabled && add(u.id)} disabled={disabled} style={{ background: disabled ? '#f3f4f6' : GREEN, color: disabled ? '#6b7280' : '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 700, cursor: disabled ? 'default' : 'pointer', fontFamily: FONT }}>{label}</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
