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
const FREEZE_COST = 500

const BADGE_META: Record<string, { emoji: string; name: string; day: number; coins: number }> = {
  scout:    { emoji: '🌟', name: 'Scout',    day: 1,   coins: 50  },
  keeper:   { emoji: '🔥', name: 'Keeper',   day: 7,   coins: 100 },
  guardian: { emoji: '⚡', name: 'Guardian', day: 14,  coins: 150 },
  warrior:  { emoji: '🛡️', name: 'Warrior',  day: 30,  coins: 250 },
  champion: { emoji: '👑', name: 'Champion', day: 90,  coins: 500 },
  elite:    { emoji: '💎', name: 'Elite',    day: 180, coins: 750 },
  legend:   { emoji: '🏆', name: 'Legend',   day: 365, coins: 1000},
}
const BADGE_ORDER = ['scout','keeper','guardian','warrior','champion','elite','legend']

const DAILY_EVENT_META: Record<string, { emoji: string; title: string; howTo: string; coins: number }> = {
  daily_plan:   { emoji: '🥗', title: 'Log All Meals',   howTo: 'Log all meals on your active plan',          coins: 10 },
  water_goal:   { emoji: '💧', title: 'Hit Water Goal',  howTo: 'Reach your glasses goal in Water tracker',   coins: 5  },
  photo_upload: { emoji: '📷', title: 'Meal Photo',      howTo: 'Use Scan tab to photograph a meal',          coins: 15 },
  perfect_week: { emoji: '🏆', title: 'Perfect Week',    howTo: 'Complete daily plan 7 days in a row',        coins: 50 },
}

const FUTURE_REWARDS = [
  { emoji: '🎨', title: 'Premium Themes',      desc: "Customize MealWarden's look" },
  { emoji: '🖼️', title: 'Profile Frames',      desc: 'Stand out in leaderboards' },
  { emoji: '🏅', title: 'Exclusive Badges',    desc: 'Rare collectibles' },
  { emoji: '🤖', title: 'AI Coach Sessions',   desc: 'Premium nutrition advice' },
  { emoji: '🥗', title: 'Premium Meal Plans',  desc: 'Exclusive expert-designed plans' },
  { emoji: '🎁', title: 'Gift Cards',          desc: 'Partner rewards' },
  { emoji: '⭐', title: 'Premium Membership',  desc: 'Redeem MealCoins for access' },
]

const FAQ_ITEMS = [
  { q: 'What are MealCoins?',                  a: "MealCoins are MealWarden's reward currency. You earn them by building healthy habits — logging meals, hitting streaks, and completing challenges." },
  { q: 'Do MealCoins expire?',                 a: 'No. Your MealCoins never expire as long as your account is active.' },
  { q: 'Can I buy MealCoins?',                 a: 'No. MealCoins can only be earned through activity inside MealWarden — they are not purchasable.' },
  { q: 'What is Streak Freeze?',               a: `Streak Freeze costs ${FREEZE_COST} MealCoins and protects your streak for the rest of today and all of tomorrow. You can only hold one freeze at a time.` },
  { q: 'How does Refer & Earn work?',          a: 'Share your code with friends. When they sign up and enter it, they get 200 MealCoins and you earn 200 instantly. No cap — invite as many as you like.' },
  { q: 'When are coins credited?',             a: 'Coins are credited automatically within seconds of completing the qualifying action.' },
  { q: 'Can MealCoins be redeemed for cash?',  a: 'No. MealCoins have no cash value and cannot be exchanged for money.' },
]

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

export default function CoinsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [coins, setCoins]         = useState<any>(null)
  const [ledger, setLedger]       = useState<any[]>([])
  const [daily, setDaily]         = useState<any[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [faqOpen, setFaqOpen]     = useState<number | null>(null)
  const [ledgerExpanded, setLedgerExpanded] = useState(false)

  // Streak Freeze
  const [freezeOpen, setFreezeOpen]     = useState(false)
  const [freezeBusy, setFreezeBusy]     = useState(false)
  const [freezeState, setFreezeState]   = useState<'idle'|'success'|'already'|'insufficient'|'error'>('idle')
  const [freezeMsg, setFreezeMsg]       = useState('')

  const load = useCallback(async () => {
    try {
      const [cs, cl, de] = await Promise.all([
        api.getCoinStatus().catch(() => null),
        api.getCoinLedger().catch(() => null),
        api.getCoinDailyEvents().catch(() => null),
      ])
      setCoins(cs || {})
      setLedger(cl?.entries || [])
      setDaily(de?.events || [])
    } catch {} finally { setLoaded(true) }
  }, [])

  useEffect(() => {
    if (!user) { router.push('/'); return }
    load()
  }, [user, load, router])

  const confirmFreeze = async () => {
    if (freezeBusy) return
    setFreezeBusy(true)
    try {
      const res = await api.streakFreeze()
      if (res?.success) {
        setFreezeState('success')
        api.clearCache()
        load()
      } else {
        const msg: string = res?.message || ''
        if (msg.toLowerCase().includes('already')) setFreezeState('already')
        else if (msg.toLowerCase().includes('need') || msg.toLowerCase().includes('insufficient')) { setFreezeState('insufficient'); setFreezeMsg(msg) }
        else { setFreezeState('error'); setFreezeMsg(msg || 'Something went wrong.') }
      }
    } catch (e: any) {
      const msg: string = e?.message || ''
      if (msg.toLowerCase().includes('already')) setFreezeState('already')
      else if (msg.toLowerCase().includes('need') || msg.toLowerCase().includes('insufficient')) { setFreezeState('insufficient'); setFreezeMsg(msg) }
      else { setFreezeState('error'); setFreezeMsg(msg || 'Something went wrong.') }
    } finally { setFreezeBusy(false) }
  }

  const openFreeze = () => { setFreezeState('idle'); setFreezeMsg(''); setFreezeOpen(true) }

  if (!user || !loaded) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: FONT }}>
      <div style={{ fontSize: 32, animation: 'spin 1.2s linear infinite' }}>🪙</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const mealCoins: number = coins?.mealCoins ?? 0
  const streak: number    = coins?.streak ?? 0
  const badges: any[]     = coins?.badges || []
  const freezeActive      = coins?.streakFreezeActive ?? false
  const freezeUntil       = coins?.streakFreezeUntil ?? null
  const lifetimeEarned: number = coins?.lifetimeEarned ?? 0
  const nextBadge         = coins?.nextBadge ?? null

  const currentBadgeKey   = badges.find((b: any) => b.unlocked && !badges.find((b2: any) => b2.unlocked && BADGE_ORDER.indexOf(b2.key) > BADGE_ORDER.indexOf(b.key)))?.key || null
  const milestoneProgress = Math.min(100, Math.round((mealCoins / 1000) * 100))

  const displayLedger = ledgerExpanded ? ledger : ledger.slice(0, 6)
  const dailyClaimed  = daily.filter((e: any) => e.claimed).length

  const card: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 16 }
  const section = (label: string) => (
    <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 }}>{label}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '40px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div onClick={() => router.push('/streak')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', marginBottom: 22, fontWeight: 500 }}>← Streak & Mates</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ fontSize: 44 }}>🪙</div>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 34, fontWeight: 800, color: '#fff' }}>Meal Coin Center</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 }}>Earn coins, protect your streak, unlock rewards</div>
            </div>
          </div>

          {/* Balance hero */}
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '20px 24px', marginTop: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginBottom: 4 }}>YOUR BALANCE</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 42, fontWeight: 800, color: '#fff' }}>{mealCoins.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>MealCoins · {lifetimeEarned.toLocaleString()} lifetime earned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginBottom: 4 }}>CURRENT STREAK</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 32, fontWeight: 800, color: GOLD }}>{streak} 🔥</div>
              {nextBadge && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{nextBadge.daysLeft}d to {nextBadge.name}</div>}
            </div>
          </div>

          {/* Milestone bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Progress to next milestone</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{mealCoins} / 1,000</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 8 }}>
              <div style={{ background: GOLD, borderRadius: 99, height: 8, width: `${milestoneProgress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 760, margin: '-32px auto 0', padding: '0 24px 80px' }}>

        {/* Daily Earners */}
        {section('EARN TODAY')}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 4 }}>Daily Earners</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>{dailyClaimed} of {daily.length || Object.keys(DAILY_EVENT_META).length} completed today</div>
          {(daily.length > 0 ? daily : Object.entries(DAILY_EVENT_META).map(([key, v]) => ({ key, ...v, claimed: false }))).map((ev: any) => {
            const meta = DAILY_EVENT_META[ev.key] || { emoji: '✨', title: ev.key, howTo: '', coins: ev.coins || 0 }
            const claimed = ev.claimed ?? false
            return (
              <div key={ev.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 26, width: 34, textAlign: 'center' }}>{meta.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: claimed ? '#9ca3af' : '#052e16', textDecoration: claimed ? 'line-through' : 'none' }}>{meta.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{meta.howTo}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: claimed ? '#9ca3af' : GOLD }}>+{ev.coins ?? meta.coins}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>🪙</span>
                  {claimed && <span style={{ background: '#f0fdf4', color: GREEN, borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>✓ Done</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Redeem — Streak Freeze */}
        {section('REDEEM')}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 16 }}>Redeem Coins</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: freezeActive ? '#f0fdf4' : '#f9fafb', border: `2px solid ${freezeActive ? GREEN : '#e5e7eb'}`, borderRadius: 16 }}>
            <div style={{ fontSize: 36 }}>🛡️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#052e16' }}>Streak Freeze</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Protect your streak for 24 hours if you miss a day</div>
              {freezeActive && freezeUntil && (
                <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, marginTop: 4 }}>
                  🟢 Active — expires {new Date(freezeUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Cost</div>
              <div style={{ fontWeight: 800, color: GOLD, fontSize: 16 }}>🪙 {FREEZE_COST}</div>
              <button
                onClick={openFreeze}
                disabled={freezeActive || mealCoins < FREEZE_COST}
                style={{ marginTop: 8, padding: '8px 14px', background: freezeActive ? '#f3f4f6' : mealCoins < FREEZE_COST ? '#f3f4f6' : GREEN, color: freezeActive || mealCoins < FREEZE_COST ? '#9ca3af' : '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: freezeActive || mealCoins < FREEZE_COST ? 'default' : 'pointer', fontFamily: FONT }}
              >
                {freezeActive ? 'Active ✓' : mealCoins < FREEZE_COST ? `Need ${FREEZE_COST - mealCoins} more` : 'Activate'}
              </button>
            </div>
          </div>

          {/* Future rewards */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', marginBottom: 12 }}>COMING SOON</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10 }}>
              {FUTURE_REWARDS.map(r => (
                <div key={r.title} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 14, padding: '14px 12px', textAlign: 'center', opacity: 0.65 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{r.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badge Journey */}
        {section('YOUR JOURNEY')}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 16 }}>Badge Journey</div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {BADGE_ORDER.map(key => {
              const meta = BADGE_META[key]
              const apiB  = badges.find((b: any) => b.key === key)
              const unlocked = apiB ? apiB.unlocked : streak >= meta.day
              const isCurrent = key === currentBadgeKey
              return (
                <div key={key} style={{ flexShrink: 0, width: 100, textAlign: 'center', padding: '14px 8px', background: isCurrent ? GREEN_SOFT : '#f9fafb', border: `2px solid ${isCurrent ? GREEN : '#e5e7eb'}`, borderRadius: 16 }}>
                  <div style={{ fontSize: 32, filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.4 }}>{meta.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isCurrent ? GREEN : unlocked ? '#052e16' : '#9ca3af', marginTop: 6 }}>{meta.name}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Day {meta.day}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? GOLD : '#9ca3af', marginTop: 4 }}>+{meta.coins} 🪙</div>
                  {isCurrent && <div style={{ fontSize: 10, background: GREEN, color: '#fff', borderRadius: 99, padding: '2px 6px', marginTop: 6, fontWeight: 700 }}>Current</div>}
                  {!unlocked && !isCurrent && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>{Math.max(0, meta.day - streak)}d left</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Coin Ledger */}
        {ledger.length > 0 && (
          <>
            {section('HISTORY')}
            <div style={card}>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 16 }}>Coin History</div>
              {displayLedger.map((entry: any, i: number) => (
                <div key={entry.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: entry.delta > 0 ? GREEN_SOFT : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {entry.delta > 0 ? '🪙' : '💸'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#052e16' }}>{entry.reason || entry.type}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{fmtDate(entry.createdAt)}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: entry.delta > 0 ? GREEN : '#ef4444' }}>
                    {entry.delta > 0 ? '+' : ''}{entry.delta} 🪙
                  </div>
                </div>
              ))}
              {ledger.length > 6 && (
                <button onClick={() => setLedgerExpanded(e => !e)} style={{ marginTop: 12, width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: '#374151' }}>
                  {ledgerExpanded ? 'Show less ▲' : `Show all ${ledger.length} transactions ▼`}
                </button>
              )}
            </div>
          </>
        )}

        {/* How to earn more */}
        {section('HOW TO EARN MORE')}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 16 }}>Earning Tips</div>
          {[
            { emoji: '✅', tip: 'Log every scheduled meal on your plan' },
            { emoji: '🔥', tip: 'Keep your streak alive — milestones give bonus coins' },
            { emoji: '💧', tip: 'Hit your daily water goal' },
            { emoji: '📷', tip: 'Photograph meals with the Scan feature' },
            { emoji: '👥', tip: 'Refer friends — 200 coins per signup, no cap' },
            { emoji: '🏆', tip: 'Complete 7 consecutive days for the Perfect Week bonus' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{item.tip}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={() => router.push('/refer')} style={{ flex: 1, padding: '12px', background: GREEN, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>🎁 Refer & Earn</button>
            <button onClick={() => router.push('/streak')} style={{ flex: 1, padding: '12px', background: GOLD_SOFT, color: '#92400e', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>🔥 View Streak</button>
          </div>
        </div>

        {/* FAQ */}
        {section('FAQ')}
        <div style={card}>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 18, fontWeight: 800, color: '#052e16', marginBottom: 12 }}>Frequently Asked</div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid #f3f4f6' : 'none' }}>
              <div onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', cursor: 'pointer' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#052e16', flex: 1, paddingRight: 12 }}>{item.q}</span>
                <span style={{ fontSize: 16, color: '#9ca3af', transition: 'transform 0.2s', transform: faqOpen === i ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>
              {faqOpen === i && (
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, paddingBottom: 14 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Streak Freeze Modal */}
      {freezeOpen && (
        <>
          <div onClick={() => { if (freezeState !== 'idle' || !freezeBusy) setFreezeOpen(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: 32, textAlign: 'center', fontFamily: FONT, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
            {freezeState === 'idle' && (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>Streak Freeze</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
                  Activating a freeze spends <strong style={{ color: GOLD }}>🪙 {FREEZE_COST} MealCoins</strong> and protects your streak until the end of tomorrow — even if you miss a day.
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 14, padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: '#6b7280' }}>Your balance</span>
                    <span style={{ fontWeight: 800, color: '#052e16' }}>🪙 {mealCoins.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: '#6b7280' }}>Cost</span>
                    <span style={{ fontWeight: 800, color: '#ef4444' }}>− 🪙 {FREEZE_COST}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#374151', fontWeight: 700 }}>After</span>
                    <span style={{ fontWeight: 800, color: GREEN }}>🪙 {(mealCoins - FREEZE_COST).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setFreezeOpen(false)} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Cancel</button>
                  <button onClick={confirmFreeze} disabled={freezeBusy} style={{ flex: 1, padding: '13px', background: freezeBusy ? '#9ca3af' : GREEN, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: freezeBusy ? 'default' : 'pointer', fontFamily: FONT }}>
                    {freezeBusy ? 'Activating…' : 'Activate Freeze'}
                  </button>
                </div>
              </>
            )}
            {freezeState === 'success' && (
              <>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🛡️✅</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: GREEN, marginBottom: 8 }}>Freeze Activated!</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Your streak is protected until the end of tomorrow.</div>
                <button onClick={() => setFreezeOpen(false)} style={{ width: '100%', padding: '13px', background: GREEN, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Done</button>
              </>
            )}
            {freezeState === 'already' && (
              <>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🛡️</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>Already Active</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>You already have an active Streak Freeze. Let it expire before activating a new one.</div>
                <button onClick={() => setFreezeOpen(false)} style={{ width: '100%', padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Got it</button>
              </>
            )}
            {(freezeState === 'insufficient' || freezeState === 'error') && (
              <>
                <div style={{ fontSize: 52, marginBottom: 12 }}>{freezeState === 'insufficient' ? '🪙' : '❌'}</div>
                <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>{freezeState === 'insufficient' ? 'Not Enough Coins' : 'Something went wrong'}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>{freezeMsg || (freezeState === 'insufficient' ? `You need ${FREEZE_COST} MealCoins to activate a Streak Freeze.` : 'Please try again.')}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setFreezeOpen(false)} style={{ flex: 1, padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Close</button>
                  {freezeState === 'error' && <button onClick={() => { setFreezeState('idle'); setFreezeMsg('') }} style={{ flex: 1, padding: '13px', background: GREEN, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Try again</button>}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
