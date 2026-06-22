'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GOLD = '#E6A700'
const GREEN = '#16a34a'

type Member = { id: string; name: string; username?: string; streak: number; isMe?: boolean; rank: number }
type ReqItem = { id: string; user: { id: string; name: string; username?: string } }

export default function StreakPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [streak, setStreak] = useState<number | null>(null)
  const [board, setBoard] = useState<Member[]>([])
  const [friendCount, setFriendCount] = useState(0)
  const [requests, setRequests] = useState<ReqItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Find Mates
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [statusMap, setStatusMap] = useState<Record<string, string>>({})

  const reload = useCallback(async () => {
    const [st, lb, rq] = await Promise.all([
      api.getStreak().catch(() => null),
      api.friendsLeaderboard().catch(() => null),
      api.friendRequests().catch(() => null),
    ])
    setStreak(st?.streak ?? null)
    setBoard(lb?.leaderboard || [])
    setFriendCount(lb?.friendCount || 0)
    setRequests(rq?.requests || [])
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

  if (!user || !loaded) return null
  const days = streak ?? 0
  const nextBadge = days < 7 ? 7 : days < 14 ? 14 : days < 30 ? 30 : days < 100 ? 100 : null

  const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Back to Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🔥 Your Streak</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Keep logging meals to build momentum — and climb the Mates leaderboard.</p>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-32px auto 0', padding: '0 24px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Hero */}
        <div style={{ ...card, textAlign: 'center', padding: '34px 24px' }}>
          <div style={{ width: 110, height: 110, borderRadius: 60, background: '#fdf3d6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 52 }}>🔥</div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 44, fontWeight: 800, color: '#0a220e' }}>{days} {days === 1 ? 'Day' : 'Days'}</div>
          <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 460, margin: '8px auto 0', lineHeight: 1.6 }}>
            {days > 0 ? `You're on fire, ${user?.name?.split(' ')[0] || 'there'}! Keep logging your meals to keep the momentum.` : `Log a meal today and your streak begins.`}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard')} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 30, padding: '12px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Log Next Meal</button>
            <button onClick={share} style={{ background: '#fdf3d6', color: GOLD, border: 'none', borderRadius: 30, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Share</button>
          </div>
        </div>

        {/* Rewards */}
        {nextBadge && (
          <div style={{ ...card, background: GREEN, color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Unlock Rewards</div>
              <div style={{ fontSize: 13.5, opacity: 0.92 }}>{days === 0 ? `Start today — a ${nextBadge}-day streak earns your first badge!` : `Keep your streak ${nextBadge - days} more day${nextBadge - days === 1 ? '' : 's'} to earn the ${nextBadge}-day badge!`}</div>
            </div>
            <div style={{ width: 54, height: 54, borderRadius: 30, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⭐</div>
          </div>
        )}

        {/* Mates leaderboard */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 1.5 }}>MEALWARDEN</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#0a220e' }}>Mates Leaderboard</div>
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
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Add mates below and your streaks line up here. Cheer each other on and climb the board.</div>
              </div>
            )}
          </div>
        </div>

        {/* Requests */}
        {requests.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#0a220e', marginBottom: 10 }}>Mate Requests ({requests.length})</div>
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
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#0a220e', marginBottom: 10 }}>Find Mates</div>
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
                <div style={{ color: '#9ca3af', fontSize: 13, padding: '14px 2px' }}>No one found for “{q}”.</div>
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
