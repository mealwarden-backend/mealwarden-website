'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN     = '#16a34a'

interface Circle {
  id: string
  name: string
  description?: string
  inviteCode?: string
  memberCount?: number
  members?: any[]
  isAdmin?: boolean
}

interface Invite {
  id: string
  circle: { id: string; name: string; description?: string }
  invitedBy?: { name?: string; username?: string }
}

export default function Circles() {
  const { user } = useAuth()
  const router   = useRouter()

  const [circles, setCircles]     = useState<Circle[]>([])
  const [invites, setInvites]     = useState<Invite[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [tab, setTab]             = useState<'mine' | 'create' | 'join'>('mine')

  // Create form
  const [createName, setCreateName]   = useState('')
  const [createDesc, setCreateDesc]   = useState('')
  const [creating, setCreating]       = useState(false)
  const [createMsg, setCreateMsg]     = useState<{ type: 'ok'|'err'; text: string } | null>(null)

  // Join form
  const [joinCode, setJoinCode]   = useState('')
  const [joining, setJoining]     = useState(false)
  const [joinMsg, setJoinMsg]     = useState<{ type: 'ok'|'err'; text: string } | null>(null)

  // Leaderboard panel
  const [openLeader, setOpenLeader] = useState<string | null>(null)
  const [leaderData, setLeaderData] = useState<any[]>([])
  const [leaderLoading, setLeaderLoading] = useState(false)

  // Copied invite code
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [c, inv] = await Promise.all([
        (api as any).getMyCircles().catch(() => ({ circles: [] })),
        (api as any).getCircleInvites().catch(() => ({ invites: [] })),
      ])
      setCircles(c?.circles || c?.data || [])
      setInvites(inv?.invites || inv?.data || [])
    } catch {} finally { setLoaded(true) }
  }, [])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadData()
  }, [user]) // eslint-disable-line

  const createCircle = async () => {
    if (!createName.trim() || creating) return
    setCreating(true); setCreateMsg(null)
    try {
      await (api as any).createCircle({ name: createName.trim(), description: createDesc.trim() || undefined })
      setCreateName(''); setCreateDesc('')
      setCreateMsg({ type: 'ok', text: 'Circle created! Switching to your circles.' })
      await loadData()
      setTimeout(() => { setTab('mine'); setCreateMsg(null) }, 1500)
    } catch (e: any) {
      setCreateMsg({ type: 'err', text: e?.message || 'Failed to create circle' })
    } finally { setCreating(false) }
  }

  const joinCircle = async () => {
    if (!joinCode.trim() || joining) return
    setJoining(true); setJoinMsg(null)
    try {
      await (api as any).joinCircle(joinCode.trim().toUpperCase())
      setJoinCode('')
      setJoinMsg({ type: 'ok', text: 'Joined! Welcome to the circle.' })
      await loadData()
      setTimeout(() => { setTab('mine'); setJoinMsg(null) }, 1500)
    } catch (e: any) {
      setJoinMsg({ type: 'err', text: e?.message || 'Invalid code or already a member' })
    } finally { setJoining(false) }
  }

  const respondInvite = async (inviteId: string, action: 'accept' | 'reject') => {
    try {
      await (api as any).respondCircleInvite(inviteId, action)
      await loadData()
    } catch {}
  }

  const leaveCircle = async (circleId: string) => {
    if (!confirm('Leave this circle?')) return
    try {
      await (api as any).leaveCircle(circleId)
      await loadData()
    } catch {}
  }

  const openLeaderboard = async (circleId: string) => {
    if (openLeader === circleId) { setOpenLeader(null); return }
    setOpenLeader(circleId); setLeaderLoading(true)
    try {
      const res = await (api as any).getCircleLeaderboard(circleId)
      setLeaderData(res?.members || res?.data || [])
    } catch { setLeaderData([]) } finally { setLeaderLoading(false) }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!user || !loaded) return null

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 22px', borderRadius: 10, border: 'none', fontFamily: FONT,
    fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
    background: active ? GREEN : '#f3f4f6',
    color: active ? '#fff' : '#374151',
    boxShadow: active ? '0 4px 14px rgba(22,163,74,0.25)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 48px 56px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div onClick={() => router.push('/streak')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Streak & Mates</div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8 }}>🔵 Circles</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Accountability groups · share progress · stay consistent together</p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '-30px auto 0', padding: '0 24px 60px' }}>

        {/* Pending invites */}
        {invites.length > 0 && (
          <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#92400e', marginBottom: 12 }}>
              🎉 Circle Invites ({invites.length})
            </div>
            {invites.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid #fef3c7', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16' }}>{inv.circle.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {inv.invitedBy?.name || inv.invitedBy?.username ? `Invited by ${inv.invitedBy.name || inv.invitedBy.username}` : 'You have been invited'}
                    {inv.circle.description && ` · ${inv.circle.description}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => respondInvite(inv.id, 'accept')} style={{ padding: '8px 16px', background: GREEN, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Accept</button>
                  <button onClick={() => respondInvite(inv.id, 'reject')} style={{ padding: '8px 16px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setTab('mine')}   style={tabStyle(tab === 'mine')}>My Circles ({circles.length})</button>
          <button onClick={() => setTab('create')} style={tabStyle(tab === 'create')}>+ Create Circle</button>
          <button onClick={() => setTab('join')}   style={tabStyle(tab === 'join')}>Join with Code</button>
        </div>

        {/* My Circles tab */}
        {tab === 'mine' && (
          <>
            {circles.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔵</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 20, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>No circles yet</div>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
                  Create an accountability group with friends or join one with an invite code.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setTab('create')} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Create a Circle</button>
                  <button onClick={() => setTab('join')} style={{ padding: '12px 24px', background: '#f0fdf4', color: GREEN, border: '1.5px solid #bbf7d0', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>Join with Code</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {circles.map(c => (
                  <div key={c.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1.5px solid #e5e7eb' }}>
                    {/* Circle header */}
                    <div style={{ padding: '20px 24px', borderBottom: openLeader === c.id ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔵</div>
                            <div>
                              <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#052e16' }}>{c.name}</div>
                              {c.description && <div style={{ fontSize: 13, color: '#6b7280' }}>{c.description}</div>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                            <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 6, padding: '3px 10px' }}>👥 {c.memberCount || (c.members || []).length || 1} members</span>
                            {c.isAdmin && <span style={{ fontSize: 12, color: GREEN, background: '#f0fdf4', borderRadius: 6, padding: '3px 10px', fontWeight: 700 }}>Admin</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                          <button
                            onClick={() => openLeaderboard(c.id)}
                            style={{ padding: '8px 14px', background: openLeader === c.id ? GREEN : '#f0fdf4', color: openLeader === c.id ? '#fff' : GREEN, border: `1px solid ${openLeader === c.id ? GREEN : '#bbf7d0'}`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: FONT }}
                          >
                            🏆 {openLeader === c.id ? 'Hide' : 'Leaderboard'}
                          </button>
                          <button
                            onClick={() => leaveCircle(c.id)}
                            style={{ padding: '7px 14px', background: '#fff', color: '#ef4444', border: '1px solid #fecdd3', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: FONT }}
                          >
                            Leave
                          </button>
                        </div>
                      </div>

                      {/* Invite code */}
                      {c.inviteCode && (
                        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderRadius: 10, padding: '10px 14px', border: '1px dashed #e5e7eb' }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Invite Code</div>
                            <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', letterSpacing: 4 }}>{c.inviteCode}</div>
                          </div>
                          <button
                            onClick={() => copyCode(c.inviteCode!, c.id)}
                            style={{ marginLeft: 'auto', padding: '7px 14px', background: copiedId === c.id ? GREEN : '#fff', color: copiedId === c.id ? '#fff' : GREEN, border: `1.5px solid ${copiedId === c.id ? GREEN : '#bbf7d0'}`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s' }}
                          >
                            {copiedId === c.id ? '✓ Copied!' : '📋 Copy'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Leaderboard */}
                    {openLeader === c.id && (
                      <div style={{ padding: '0 24px 20px' }}>
                        <div style={{ fontFamily: FONT_SYNE, fontSize: 14, fontWeight: 700, color: '#374151', margin: '16px 0 10px' }}>🏆 Circle Leaderboard</div>
                        {leaderLoading ? (
                          <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 13 }}>Loading…</div>
                        ) : leaderData.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontSize: 13 }}>No data yet — start logging meals!</div>
                        ) : leaderData.map((m: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < leaderData.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                              background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#e5e7eb',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 800,
                              color: i < 3 ? '#fff' : '#6b7280',
                            }}>
                              {i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#052e16' }}>{m.name || m.username || 'Member'}</div>
                              {m.streak != null && <div style={{ fontSize: 11, color: '#9ca3af' }}>🔥 {m.streak} day streak</div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: GREEN }}>{m.coins ?? m.points ?? 0}</div>
                              <div style={{ fontSize: 10, color: '#9ca3af' }}>coins</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create tab */}
        {tab === 'create' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 520, margin: '0 auto' }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 6 }}>🔵 Create a Circle</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>Start an accountability group. Share your invite code with friends.</p>

            {createMsg && (
              <div style={{ background: createMsg.type === 'ok' ? '#f0fdf4' : '#fff1f2', border: `1.5px solid ${createMsg.type === 'ok' ? '#bbf7d0' : '#fecdd3'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: createMsg.type === 'ok' ? GREEN : '#e11d48', fontWeight: 500 }}>
                {createMsg.type === 'ok' ? '✅ ' : '⚠️ '}{createMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Circle Name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder="e.g. Morning Warriors, Office Crew"
                  maxLength={50}
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#f9fafb' }}
                  onFocus={e => (e.target.style.borderColor = GREEN)}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description (optional)</label>
                <textarea
                  value={createDesc}
                  onChange={e => setCreateDesc(e.target.value)}
                  placeholder="What's this circle about?"
                  rows={3}
                  maxLength={200}
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#f9fafb', resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = GREEN)}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <button
                onClick={createCircle}
                disabled={!createName.trim() || creating}
                style={{ padding: '14px', background: !createName.trim() || creating ? '#d1fae5' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: !createName.trim() || creating ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: !createName.trim() ? 'none' : '0 8px 24px rgba(22,163,74,0.25)', transition: 'all 0.2s' }}
              >
                {creating ? '⏳ Creating…' : '🔵 Create Circle →'}
              </button>
            </div>
          </div>
        )}

        {/* Join tab */}
        {tab === 'join' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 6 }}>🔑 Join a Circle</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>Enter the invite code shared by a circle admin.</p>

            {joinMsg && (
              <div style={{ background: joinMsg.type === 'ok' ? '#f0fdf4' : '#fff1f2', border: `1.5px solid ${joinMsg.type === 'ok' ? '#bbf7d0' : '#fecdd3'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: joinMsg.type === 'ok' ? GREEN : '#e11d48', fontWeight: 500 }}>
                {joinMsg.type === 'ok' ? '✅ ' : '⚠️ '}{joinMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Invite Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={10}
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 22, fontFamily: FONT_SYNE, fontWeight: 800, letterSpacing: 6, textAlign: 'center', outline: 'none', boxSizing: 'border-box', color: '#052e16', background: '#f9fafb' }}
                  onFocus={e => (e.target.style.borderColor = GREEN)}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
              <button
                onClick={joinCircle}
                disabled={!joinCode.trim() || joining}
                style={{ padding: '14px', background: !joinCode.trim() || joining ? '#d1fae5' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: !joinCode.trim() || joining ? 'not-allowed' : 'pointer', fontFamily: FONT, boxShadow: !joinCode.trim() ? 'none' : '0 8px 24px rgba(22,163,74,0.25)', transition: 'all 0.2s' }}
              >
                {joining ? '⏳ Joining…' : '🚀 Join Circle →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
