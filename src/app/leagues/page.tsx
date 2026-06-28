'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN     = '#16a34a'

const LEAGUE_TIERS = [
  { name: 'Bronze',   icon: '🥉', color: '#cd7f32', bg: '#fdf6f0', next: 'Silver',   desc: 'Rank top 25% to promote' },
  { name: 'Silver',   icon: '🥈', color: '#94a3b8', bg: '#f8fafc', next: 'Gold',     desc: 'Rank top 25% to promote' },
  { name: 'Gold',     icon: '🥇', color: '#d97706', bg: '#fffbeb', next: 'Diamond',  desc: 'Rank top 25% to promote' },
  { name: 'Diamond',  icon: '💎', color: '#3b82f6', bg: '#eff6ff', next: 'Legend',   desc: 'Rank top 10% to promote' },
  { name: 'Legend',   icon: '👑', color: '#a855f7', bg: '#faf5ff', next: null,       desc: 'The highest league' },
]

export default function Leagues() {
  const { user } = useAuth()
  const router   = useRouter()

  const [leagueData, setLeagueData] = useState<any>(null)
  const [loaded, setLoaded]         = useState(false)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    ;(async () => {
      try {
        const res = await (api as any).getWeeklyLeague()
        setLeagueData(res)
      } catch {} finally { setLoaded(true) }
    })()
  }, [user]) // eslint-disable-line

  if (!user || !loaded) return null

  const standings: any[]     = leagueData?.standings || leagueData?.data || []
  const myEntry: any | null  = leagueData?.myEntry || standings.find((s: any) => s.isYou)
  const leagueName: string   = leagueData?.league || leagueData?.leagueName || 'Bronze'
  const weekLabel: string    = leagueData?.weekLabel || leagueData?.week || 'This week'
  const endsIn: string       = leagueData?.endsIn   || ''
  const tier = LEAGUE_TIERS.find(t => t.name.toLowerCase() === leagueName.toLowerCase()) || LEAGUE_TIERS[0]

  const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

  const getRankColor = (rank: number, total: number) => {
    const pct = rank / total
    if (pct <= 0.10) return '#a855f7'  // top 10% — promote zone
    if (pct <= 0.25) return GREEN       // top 25% — promote zone
    if (pct >= 0.75) return '#ef4444'  // bottom 25% — relegation zone
    return '#374151'
  }

  const isPromote = (rank: number, total: number) => total > 0 && rank / total <= 0.25
  const isRelegate = (rank: number, total: number) => total > 0 && rank / total >= 0.75

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg,#052e16,${tier.color}88)`, padding: '40px 48px 60px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div onClick={() => router.push('/streak')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Streak & Mates</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 52 }}>{tier.icon}</div>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{tier.name} League</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{weekLabel}{endsIn ? ` · Resets in ${endsIn}` : ''}</p>
            </div>
          </div>

          {/* My rank card */}
          {myEntry && (
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 32, fontWeight: 900, color: '#fff' }}>#{myEntry.rank || '–'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1 }}>My Rank</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 28, fontWeight: 900, color: '#fde68a' }}>🪙 {myEntry.coins ?? myEntry.points ?? 0}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1 }}>Coins this week</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 28, fontWeight: 900, color: '#86efac' }}>🔥 {myEntry.streak ?? 0}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1 }}>Streak</div>
              </div>
              {isPromote(myEntry.rank, standings.length) && (
                <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: 100, padding: '6px 14px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>↑ Promotion zone{tier.next ? ` → ${tier.next}` : ''}</span>
                </div>
              )}
              {isRelegate(myEntry.rank, standings.length) && (
                <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 100, padding: '6px 14px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>↓ Relegation zone</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '-20px auto 0', padding: '0 24px 60px' }}>

        {/* League tier ladder */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>League Tiers</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LEAGUE_TIERS.map((t, i) => (
              <div key={t.name} style={{
                flex: '1 1 80px', minWidth: 80,
                background: t.name.toLowerCase() === leagueName.toLowerCase() ? t.bg : '#f9fafb',
                border: `2px solid ${t.name.toLowerCase() === leagueName.toLowerCase() ? t.color : '#e5e7eb'}`,
                borderRadius: 14, padding: '12px 10px', textAlign: 'center',
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 24 }}>{t.icon}</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 12, fontWeight: 800, color: t.color, marginTop: 4 }}>{t.name}</div>
                {t.name.toLowerCase() === leagueName.toLowerCase() && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: t.color, borderRadius: 4, padding: '1px 6px', marginTop: 4, display: 'inline-block' }}>YOU</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Standings table */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#052e16' }}>
              {tier.icon} {tier.name} League Standings
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{standings.length} players</div>
          </div>

          {standings.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🏆</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>No standings yet</div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
                League standings refresh each week. Keep logging meals to earn coins and climb the ranks!
              </p>
            </div>
          ) : (
            <>
              {/* Zone legend */}
              <div style={{ padding: '10px 24px', background: '#fafafa', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { color: GREEN, label: `Top 25% → Promote${tier.next ? ` to ${tier.next}` : ''}` },
                  { color: '#6b7280', label: 'Safe zone' },
                  { color: '#ef4444', label: 'Bottom 25% → Relegated' },
                ].map(k => (
                  <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b7280' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: k.color }} />
                    {k.label}
                  </div>
                ))}
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 80px', padding: '10px 24px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                {['Rank', 'Player', 'Streak', 'Coins', 'Adherence'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: h === 'Player' ? 'left' : 'center' }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {standings.map((s: any, i: number) => {
                const rank  = s.rank ?? i + 1
                const total = standings.length
                const mine  = s.isYou || s.userId === myEntry?.userId
                const promote = isPromote(rank, total)
                const relegate = isRelegate(rank, total)

                return (
                  <div
                    key={i}
                    style={{
                      display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 80px',
                      padding: '12px 24px',
                      borderBottom: i < standings.length - 1 ? '1px solid #f9fafb' : 'none',
                      background: mine ? '#f0fdf4' : promote ? '#f0fdf422' : relegate ? '#fff1f2' : '#fff',
                      borderLeft: mine ? `3px solid ${GREEN}` : promote ? `3px solid ${GREEN}44` : relegate ? '3px solid #fecdd3' : '3px solid transparent',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {MEDAL[rank] ? (
                        <span style={{ fontSize: 20 }}>{MEDAL[rank]}</span>
                      ) : (
                        <span style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: getRankColor(rank, total) }}>#{rank}</span>
                      )}
                    </div>

                    {/* Player */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `linear-gradient(135deg,${tier.color},${tier.color}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>
                        {(s.name || s.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: mine ? 800 : 600, color: '#052e16' }}>
                          {s.name || s.username || 'Player'}
                          {mine && <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, background: '#f0fdf4', borderRadius: 4, padding: '1px 6px', marginLeft: 6 }}>You</span>}
                        </div>
                        {promote && !mine && <div style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>↑ Promotion zone</div>}
                        {relegate && !mine && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>↓ Relegation zone</div>}
                      </div>
                    </div>

                    {/* Streak */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>🔥 {s.streak ?? 0}</span>
                    </div>

                    {/* Coins */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: FONT_SYNE, fontSize: 14, fontWeight: 800, color: '#d97706' }}>🪙 {s.coins ?? s.points ?? 0}</span>
                    </div>

                    {/* Adherence */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.adherencePct != null ? (
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.adherencePct >= 80 ? GREEN : s.adherencePct >= 50 ? '#f97316' : '#ef4444' }}>
                          {s.adherencePct}%
                        </span>
                      ) : <span style={{ fontSize: 13, color: '#9ca3af' }}>–</span>}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* How leagues work */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, marginTop: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 16, fontWeight: 800, color: '#052e16', marginBottom: 14 }}>How Leagues Work</div>
          {[
            { icon: '🪙', title: 'Earn coins weekly', desc: 'Log meals, hit streaks, complete prep tasks, and stay hydrated — each action earns MealCoins.' },
            { icon: '↑', title: 'Top 25% promote', desc: 'Finish the week in the top quarter of your league and you rise to the next tier.' },
            { icon: '↓', title: 'Bottom 25% relegate', desc: 'Finish in the bottom quarter and you drop to the tier below. Keep logging to stay safe.' },
            { icon: '🔄', title: 'Resets every Monday', desc: 'Coin counts reset weekly so everyone starts fresh — consistency beats one-time surges.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#052e16', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
