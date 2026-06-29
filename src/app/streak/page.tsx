'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN      = '#16a34a'
const GREEN_SOFT = '#f0fdf4'
const GOLD       = '#E6A700'
const GOLD_SOFT  = '#fdf3d6'

const DOW  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const BADGE_META: Record<string, { emoji: string; name: string; day: number }> = {
  scout:    { emoji: '🌟', name: 'Scout',    day: 1   },
  keeper:   { emoji: '🔥', name: 'Keeper',   day: 7   },
  guardian: { emoji: '⚡', name: 'Guardian', day: 14  },
  warrior:  { emoji: '🛡️', name: 'Warrior',  day: 30  },
  champion: { emoji: '👑', name: 'Champion', day: 90  },
  elite:    { emoji: '💎', name: 'Elite',    day: 180 },
  legend:   { emoji: '🏆', name: 'Legend',   day: 365 },
}
const BADGE_ORDER = ['scout','keeper','guardian','warrior','champion','elite','legend']

type Member = { id: string; name: string; username?: string; streak: number; isMe?: boolean; rank: number; avatarUrl?: string }
type ReqItem = { id: string; user: { id: string; name: string; username?: string } }
type Circle  = { id: string; name: string; code: string; memberCount: number }
type CInvite = { id: string; circle: { id: string; name: string } }

function Avatar({ name, avatarUrl, size = 40 }: { name?: string; avatarUrl?: string; size?: number }) {
  if (avatarUrl) return <img src={avatarUrl} style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover' }} alt="" />
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: GREEN_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: GREEN, fontSize: size * 0.4 }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

export default function StreakPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [loaded, setLoaded]         = useState(false)
  const [streak, setStreak]         = useState<number>(0)
  const [mealCoins, setMealCoins]   = useState<number>(0)
  const [badges, setBadges]         = useState<any[]>([])
  const [daily, setDaily]           = useState<any[]>([])
  const [consistency, setConsistency] = useState<number>(0)
  const [nextBadge, setNextBadge]   = useState<any>(null)

  // Mates
  const [board, setBoard]           = useState<Member[]>([])
  const [friendCount, setFriendCount] = useState(0)
  const [requests, setRequests]     = useState<ReqItem[]>([])
  const [q, setQ]                   = useState('')
  const [results, setResults]       = useState<any[]>([])
  const [searching, setSearching]   = useState(false)
  const [statusMap, setStatusMap]   = useState<Record<string,string>>({})

  // Circles
  const [circles, setCircles]         = useState<Circle[]>([])
  const [circleInvites, setCircleInvites] = useState<CInvite[]>([])
  const [activeCircle, setActiveCircle] = useState<string>('mates')
  const [circleBoard, setCircleBoard]   = useState<Member[]>([])
  const [circleBusy, setCircleBusy]     = useState(false)

  // Circle modals
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [joinOpen, setJoinOpen]     = useState(false)
  const [joinCode, setJoinCode]     = useState('')
  const [joinBusy, setJoinBusy]     = useState(false)
  const [circleMsg, setCircleMsg]   = useState('')

  const reload = useCallback(async () => {
    const [st, cs, an, lb, rq, ci, cir] = await Promise.all([
      api.getStreak().catch(() => null),
      api.getCoinStatus().catch(() => null),
      api.getAnalyticsSummary('week').catch(() => null),
      api.friendsLeaderboard().catch(() => null),
      api.friendRequests().catch(() => null),
      api.getCircleInvites().catch(() => null),
      api.getMyCircles().catch(() => null),
    ])
    setStreak(st?.streak ?? cs?.streak ?? 0)
    setMealCoins(cs?.mealCoins ?? 0)
    setBadges(cs?.badges || [])
    setNextBadge(cs?.nextBadge ?? null)
    setConsistency(an?.summary?.adherencePct ?? an?.summary?.consistency ?? 0)
    setDaily(an?.dailyBreakdown || [])
    setBoard(lb?.leaderboard || [])
    setFriendCount(lb?.friendCount || 0)
    setRequests(rq?.requests || [])
    setCircleInvites(ci?.invites || [])
    setCircles(cir?.circles || [])
  }, [])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    ;(async () => { try { await reload() } finally { setLoaded(true) } })()
  }, [user, reload, router])

  // Switch circle leaderboard
  useEffect(() => {
    if (activeCircle === 'mates') { setCircleBoard([]); return }
    setCircleBusy(true)
    api.getCircleLeaderboard(activeCircle).catch(() => null).then(r => {
      setCircleBoard(r?.members || [])
    }).finally(() => setCircleBusy(false))
  }, [activeCircle])

  // Mate search
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return }
    let alive = true
    setSearching(true)
    const t = setTimeout(async () => {
      try { const r = await api.searchUsers(q.trim()); if (alive) setResults(r?.users || []) }
      catch { if (alive) setResults([]) }
      finally { if (alive) setSearching(false) }
    }, 350)
    return () => { alive = false; clearTimeout(t) }
  }, [q])

  const addFriend = async (id: string) => {
    try { const r = await api.sendFriendRequest(id); setStatusMap(m => ({ ...m, [id]: r?.status || 'requested' })); reload() } catch {}
  }
  const respondFriend = async (id: string, action: 'accept' | 'reject') => {
    try { await api.respondFriend(id, action); reload() } catch {}
  }
  const respondCircle = async (inviteId: string, action: 'accept' | 'reject') => {
    try { await api.respondCircleInvite(inviteId, action); reload() } catch {}
  }
  const doCreateCircle = async () => {
    if (!createName.trim() || createBusy) return
    setCreateBusy(true); setCircleMsg('')
    try { await api.createCircle({ name: createName.trim() }); setCreateOpen(false); setCreateName(''); reload() }
    catch (e: any) { setCircleMsg(e?.message || 'Failed to create circle.') }
    finally { setCreateBusy(false) }
  }
  const doJoinCircle = async () => {
    if (!joinCode.trim() || joinBusy) return
    setJoinBusy(true); setCircleMsg('')
    try { await api.joinCircle(joinCode.trim().toUpperCase()); setJoinOpen(false); setJoinCode(''); reload() }
    catch (e: any) { setCircleMsg(e?.message || 'Invalid code or already a member.') }
    finally { setJoinBusy(false) }
  }

  const share = async () => {
    const text = `I'm on a ${streak}-day healthy-eating streak on MealWarden! 🔥`
    try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); alert('Copied!') } } catch {}
  }

  if (!user || !loaded) return null

  const currentBadgeKey = (() => {
    for (let i = BADGE_ORDER.length - 1; i >= 0; i--) {
      const key = BADGE_ORDER[i]
      const b = badges.find(x => x.key === key)
      if (b?.unlocked || streak >= (BADGE_META[key]?.day || 999)) return key
    }
    return null
  })()

  const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
  const renderLeaderboardRows = (list: Member[]) => list.map((m, i) => (
    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 6px', borderTop: i ? '1px solid #f1f5f9' : 'none', background: m.isMe ? GREEN_SOFT : 'transparent', borderRadius: m.isMe ? 10 : 0 }}>
      <div style={{ width: 24, textAlign: 'center', fontWeight: 800, color: m.rank <= 3 ? GOLD : '#9ca3af' }}>{m.rank}</div>
      <Avatar name={m.name} avatarUrl={m.avatarUrl} size={40} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: m.isMe ? GREEN : '#111827', fontSize: 14 }}>{m.isMe ? `${m.name} (You)` : m.name}</div>
        {m.username && <div style={{ fontSize: 12, color: '#9ca3af' }}>@{m.username}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, color: '#111827' }}>{m.streak} <span style={{ color: GOLD }}>🔥</span></div>
    </div>
  ))

  const displayBoard = activeCircle === 'mates' ? board : circleBoard

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Dashboard</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🔥 Streak & Mates</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Keep logging meals to build momentum — and climb the Mates leaderboard.</p>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '-32px auto 0', padding: '0 24px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* MealCoins bar */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#052e16', borderRadius: 18, padding: '16px 22px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1 }}>YOUR MEAL COINS</div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 2 }}>🪙 {mealCoins.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => router.push('/coins')} style={{ padding: '9px 16px', background: GOLD, color: '#052e16', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>How to earn</button>
            <button onClick={() => router.push('/coins')} style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Rewards →</button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ ...card, textAlign: 'center', padding: '34px 24px' }}>
          <div style={{ width: 110, height: 110, borderRadius: 60, background: GOLD_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 52 }}>🔥</div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 44, fontWeight: 800, color: '#0a220e' }}>{streak} {streak === 1 ? 'Day' : 'Days'}</div>
          <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 460, margin: '8px auto 0', lineHeight: 1.6 }}>
            {streak > 0 ? `You're on fire, ${user?.name?.split(' ')[0] || 'there'}! Keep logging your meals to keep the momentum.` : `Log a meal today and your streak begins.`}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard')} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 30, padding: '12px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Log Next Meal</button>
            <button onClick={share} style={{ background: GOLD_SOFT, color: GOLD, border: 'none', borderRadius: 30, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Share</button>
          </div>
        </div>

        {/* This Week grid */}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#0a220e', marginBottom: 14 }}>This Week</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DOW.map((lbl, i) => {
              const day = daily.find((x: any) => x.dow === i)
              const logged = !!(day && day.logged > 0)
              const active = !!(day && day.active)
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 6 }}>{lbl[0]}</div>
                  <div style={{ width: '100%', paddingBottom: '100%', borderRadius: 8, position: 'relative',
                    background: logged ? GREEN : active ? '#fee2e2' : '#f3f4f6' }}>
                    {logged && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 900 }}>✓</div>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>STREAK</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16' }}>{streak} <span style={{ fontSize: 14, color: '#9ca3af' }}>days</span></div>
            </div>
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>CONSISTENCY</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16' }}>{consistency}<span style={{ fontSize: 14, color: '#9ca3af' }}>%</span></div>
            </div>
          </div>
        </div>

        {/* Badge journey */}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#0a220e', marginBottom: 14 }}>Your Journey</div>
          {nextBadge && (
            <div style={{ background: GREEN, color: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, fontSize: 13.5 }}>
                {streak === 0 ? `Start today — a 1-day streak earns your first badge!` : `${nextBadge.daysLeft} more day${nextBadge.daysLeft === 1 ? '' : 's'} to unlock ${nextBadge.name}!`}
              </div>
              <div style={{ fontSize: 22 }}>⭐</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {BADGE_ORDER.map(key => {
              const meta = BADGE_META[key]
              const apiB = badges.find((b: any) => b.key === key)
              const unlocked = apiB ? apiB.unlocked : streak >= meta.day
              const isCurrent = key === currentBadgeKey
              return (
                <div key={key} style={{ flexShrink: 0, width: 90, textAlign: 'center', padding: '12px 8px', background: isCurrent ? GREEN_SOFT : '#f9fafb', border: `2px solid ${isCurrent ? GREEN : '#e5e7eb'}`, borderRadius: 14 }}>
                  <div style={{ fontSize: 28, filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.35 }}>{meta.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: isCurrent ? GREEN : unlocked ? '#052e16' : '#9ca3af', marginTop: 5 }}>{meta.name}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Day {meta.day}</div>
                  {!unlocked && !isCurrent && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>{Math.max(0, meta.day - streak)}d left</div>}
                  {isCurrent && <div style={{ fontSize: 10, background: GREEN, color: '#fff', borderRadius: 99, padding: '2px 6px', marginTop: 4, fontWeight: 700 }}>Now</div>}
                </div>
              )
            })}
          </div>
          <button onClick={() => router.push('/coins')} style={{ marginTop: 12, width: '100%', padding: '11px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>🪙 View Coin Center & Rewards →</button>
        </div>

        {/* Circles */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 1.5 }}>MEALWARDEN</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#0a220e' }}>Circles & Mates</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setCreateOpen(true); setCircleMsg('') }} style={{ padding: '9px 14px', background: GREEN, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>+ Create Circle</button>
              <button onClick={() => { setJoinOpen(true); setCircleMsg('') }} style={{ padding: '9px 14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Join Circle</button>
            </div>
          </div>

          {/* Circle invites */}
          {circleInvites.length > 0 && (
            <div style={{ ...card, marginBottom: 12, border: `1.5px solid ${GREEN}33` }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#052e16', marginBottom: 10 }}>Circle Invites ({circleInvites.length})</div>
              {circleInvites.map((inv, i) => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>📍 {inv.circle?.name}</div>
                  <button onClick={() => respondCircle(inv.id, 'reject')} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '7px 11px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>✕</button>
                  <button onClick={() => respondCircle(inv.id, 'accept')} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 20, padding: '7px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Join</button>
                </div>
              ))}
            </div>
          )}

          {/* Board selector tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
            <button onClick={() => setActiveCircle('mates')} style={{ padding: '8px 16px', border: `2px solid ${activeCircle === 'mates' ? GREEN : '#e5e7eb'}`, background: activeCircle === 'mates' ? GREEN_SOFT : '#fff', color: activeCircle === 'mates' ? GREEN : '#374151', borderRadius: 99, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}>👥 Mates</button>
            {circles.map(c => (
              <button key={c.id} onClick={() => setActiveCircle(c.id)} style={{ padding: '8px 16px', border: `2px solid ${activeCircle === c.id ? GREEN : '#e5e7eb'}`, background: activeCircle === c.id ? GREEN_SOFT : '#fff', color: activeCircle === c.id ? GREEN : '#374151', borderRadius: 99, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' }}>📍 {c.name}</button>
            ))}
          </div>

          <div style={card}>
            {circleBusy ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>Loading…</div>
            ) : displayBoard.length > 0 ? renderLeaderboardRows(displayBoard) : (
              <div style={{ textAlign: 'center', padding: '20px 12px' }}>
                <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                  {activeCircle === 'mates' ? 'Compete with your MealWarden Mates' : 'No members yet'}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  {activeCircle === 'mates' ? 'Find mates below and your streaks line up here.' : 'Share your circle code to invite members.'}
                </div>
                {activeCircle !== 'mates' && (
                  <div style={{ marginTop: 10, background: '#f9fafb', borderRadius: 10, padding: '10px 14px', display: 'inline-block' }}>
                    Code: <strong>{circles.find(c => c.id === activeCircle)?.code || '—'}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mate Requests */}
        {requests.length > 0 && (
          <div>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#0a220e', marginBottom: 10 }}>Mate Requests ({requests.length})</div>
            <div style={card}>
              {requests.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', borderTop: i ? '1px solid #f1f5f9' : 'none' }}>
                  <Avatar name={r.user?.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user?.name}</div>
                    {r.user?.username && <div style={{ fontSize: 12, color: '#9ca3af' }}>@{r.user.username}</div>}
                  </div>
                  <button onClick={() => respondFriend(r.id, 'reject')} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>✕</button>
                  <button onClick={() => respondFriend(r.id, 'accept')} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Accept</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Find Mates */}
        <div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#0a220e', marginBottom: 10 }}>Find Mates</div>
          <div style={card}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by username, email or phone"
              style={{ width: '100%', boxSizing: 'border-box', background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 15, fontFamily: FONT, outline: 'none' }} />
            <div style={{ marginTop: 8 }}>
              {q.trim().length < 2 ? (
                <div style={{ color: '#9ca3af', fontSize: 13, padding: '14px 2px' }}>Type at least 2 characters.</div>
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
                    <Avatar name={u.name} avatarUrl={u.avatarUrl} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                      {u.username && <div style={{ fontSize: 12, color: '#9ca3af' }}>@{u.username}</div>}
                    </div>
                    <button onClick={() => !disabled && addFriend(u.id)} disabled={disabled} style={{ background: disabled ? '#f3f4f6' : GREEN, color: disabled ? '#6b7280' : '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 700, cursor: disabled ? 'default' : 'pointer', fontFamily: FONT }}>{label}</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Circle Modal */}
      {createOpen && (
        <>
          <div onClick={() => setCreateOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, width: '100%', maxWidth: 400, background: '#fff', borderRadius: 24, padding: 28, fontFamily: FONT }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 16 }}>📍 Create a Circle</div>
            <input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Circle name (e.g. Family, Office, Gym buds)" maxLength={40}
              style={{ width: '100%', boxSizing: 'border-box', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: FONT, outline: 'none', marginBottom: 12 }} />
            {circleMsg && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{circleMsg}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCreateOpen(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
              <button onClick={doCreateCircle} disabled={createBusy || !createName.trim()} style={{ flex: 1, padding: '12px', background: createBusy || !createName.trim() ? '#9ca3af' : GREEN, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{createBusy ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </>
      )}

      {/* Join Circle Modal */}
      {joinOpen && (
        <>
          <div onClick={() => setJoinOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, width: '100%', maxWidth: 400, background: '#fff', borderRadius: 24, padding: 28, fontFamily: FONT }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 16 }}>🔑 Join a Circle</div>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Enter circle code" maxLength={12}
              style={{ width: '100%', boxSizing: 'border-box', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: FONT, outline: 'none', textTransform: 'uppercase', marginBottom: 12 }} />
            {circleMsg && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{circleMsg}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setJoinOpen(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
              <button onClick={doJoinCircle} disabled={joinBusy || !joinCode.trim()} style={{ flex: 1, padding: '12px', background: joinBusy || !joinCode.trim() ? '#9ca3af' : GREEN, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>{joinBusy ? 'Joining…' : 'Join'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
