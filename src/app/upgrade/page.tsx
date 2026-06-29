'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TRIAL_DAYS } from '@/lib/appData'
import { api } from '@/lib/api'

const FONT   = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const GREEN  = '#16a34a'
const GOLD   = '#ca8a04'
const GOLD_S = 'rgba(202,138,4,0.10)'

const GOLD_FEATURES = [
  { icon: '🥗', label: 'AI Diet Generation',         desc: 'Personalised 7-day plans built around your goals, cuisine & schedule' },
  { icon: '📸', label: 'Unlimited Meal Scans',        desc: 'Photograph any meal — your Guardian estimates calories & macros instantly' },
  { icon: '💬', label: 'Unlimited Guardian Chat',     desc: 'Ask anything, anytime — nutrition advice, swaps, motivation' },
  { icon: '📊', label: 'Full Analytics (90 days)',    desc: 'Deep progress charts across weight, macros, streaks and habits' },
  { icon: '🛒', label: 'Smart Grocery Lists',         desc: 'AI-sorted shopping lists generated straight from your diet plan' },
  { icon: '🏆', label: 'Leagues & MealCoins',         desc: 'Compete with friends, earn coins, and climb the leaderboard' },
  { icon: '🔔', label: 'All Reminders & Prep Alerts', desc: 'Meal, water, weight and prep-task reminders — never miss a beat' },
  { icon: '📄', label: 'PDF Diet Plan Export',        desc: 'Download and share your personalised plan as a beautifully formatted PDF' },
]

export default function Upgrade() {
  const { user, loading: authLoading } = useAuth()
  const router   = useRouter()

  const [tier, setTier]           = useState('free')
  const [isTrial, setIsTrial]     = useState(false)
  const [trialDays, setTrialDays] = useState(0)
  const [loading, setLoading]     = useState(true)

  // Redeem code
  const [code, setCode]   = useState('')
  const [busy, setBusy]   = useState(false)
  const [msg, setMsg]     = useState('')
  const [msgOk, setMsgOk] = useState(false)

  // Only redirect once auth has finished loading — prevents flash-then-redirect
  useEffect(() => { if (!authLoading && !user) router.push('/') }, [authLoading, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSub = async () => {
    try {
      const d = await api.getSubscription()
      setTier(String(d?.tier || 'free'))
      setIsTrial(!!d?.isTrial)
      setTrialDays(Number(d?.trialDaysLeft || 0))
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { if (user) loadSub() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const redeem = async () => {
    if (!code.trim() || busy) return
    setBusy(true); setMsg('')
    try {
      const d = await api.activateCode(code.trim().toUpperCase())
      setMsgOk(true); setMsg(`${String(d?.tier || 'Plan').toUpperCase()} unlocked! 🎉`)
      setCode('')
      loadSub()
    } catch (e: any) {
      setMsgOk(false); setMsg(e?.message || 'That code isn\'t valid.')
    } finally { setBusy(false) }
  }

  // Show nothing while auth is resolving (prevents content flash before redirect)
  if (authLoading || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#1a0a00,#92400e,#b45309)', padding: '48px 24px 80px', textAlign: 'center' }}>
        <div onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: 14, cursor: 'pointer', marginBottom: 24, fontWeight: 500 }}>
          ← Back to Dashboard
        </div>

        {/* Crown */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 18px' }}>
          👑
        </div>
        <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: 3, marginBottom: 10 }}>GOLD MEMBERSHIP</div>
        <h1 style={{ fontFamily: FONT, fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
          {isTrial
            ? `Your trial: ${trialDays} day${trialDays === 1 ? '' : 's'} left ✨`
            : 'Membership coming soon'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, maxWidth: 540, margin: '0 auto', lineHeight: 1.65 }}>
          {isTrial
            ? `You're on your ${TRIAL_DAYS}-day Gold trial — every premium feature is unlocked, free. Enjoy it fully before membership plans go live.`
            : `Every new account starts with a ${TRIAL_DAYS}-day Gold trial. Membership plans launch soon — you'll be the first to know.`}
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: '-50px auto 0', padding: '0 24px 60px' }}>

        {/* ── Trial status card ─────────────────────────────────────────── */}
        {!loading && (
          <div style={{ background: isTrial ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : '#fff', border: `2px solid ${isTrial ? '#fcd34d' : '#e5e7eb'}`, borderRadius: 20, padding: '22px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 36 }}>{isTrial ? '⏳' : tier === 'free' ? '🆓' : '✅'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#111827', marginBottom: 4 }}>
                {isTrial ? `Gold trial — ${trialDays} day${trialDays === 1 ? '' : 's'} remaining` : `You're on the ${tier.toUpperCase()} plan`}
              </div>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                {isTrial
                  ? 'All Gold features are active. Membership plans launch soon — we\'ll notify you in-app.'
                  : 'Start your free trial in the MealWarden app to unlock all Gold features.'}
              </div>
            </div>
          </div>
        )}

        {/* ── Gold features grid ────────────────────────────────────────── */}
        <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 900, color: '#111827', marginBottom: 6 }}>
          What's included in Gold
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 22 }}>Everything below is yours during your 14-day trial.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 36 }}>
          {GOLD_FEATURES.map(f => (
            <div key={f.label} style={{ background: '#fff', border: `1.5px solid ${GOLD}33`, borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Coming soon banner ────────────────────────────────────────── */}
        <div style={{ background: GOLD_S, border: `1.5px solid ${GOLD}44`, borderRadius: 18, padding: '22px 24px', textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🚀</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: GOLD, marginBottom: 6 }}>Membership plans launching soon</div>
          <div style={{ fontSize: 14, color: '#92400e', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            We're putting the finishing touches on membership. You'll be notified in-app the moment it's live — no action needed from you.
          </div>
        </div>

        {/* ── Redeem code ───────────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#052e16', letterSpacing: 0.5, textTransform: 'uppercase' as const, marginBottom: 6 }}>Have a founding member code?</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Unlock membership access instantly below.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MWBETA, FOUNDER"
              style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: '#111827', outline: 'none', letterSpacing: 1, fontFamily: FONT }}
            />
            <button
              onClick={redeem}
              disabled={!code.trim() || busy}
              style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: 12, padding: '0 22px', fontWeight: 800, fontSize: 14, cursor: !code.trim() || busy ? 'not-allowed' : 'pointer', opacity: !code.trim() || busy ? 0.6 : 1, fontFamily: FONT }}
            >
              {busy ? '…' : 'Unlock'}
            </button>
          </div>
          {msg && <p style={{ marginTop: 12, fontSize: 13, color: msgOk ? GREEN : '#6b7280', fontWeight: msgOk ? 700 : 500 }}>{msg}</p>}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
          Every account starts with a {TRIAL_DAYS}-day free Gold trial. Membership plans will be billed via the App Store / Google Play.
        </p>
      </div>
    </div>
  )
}
