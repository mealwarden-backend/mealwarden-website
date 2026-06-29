'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { authToken } from '@/lib/api'

const FONT = "'Inter', 'SF Pro Display', sans-serif"
const GREEN = '#16a34a'
const GREEN_SOFT = '#f0fdf4'
const GOLD = '#d97706'

const HOW_IT_WORKS = [
  { emoji: '🎁', title: 'Get your code', desc: 'Your personal referral code is shown below — unique to you.' },
  { emoji: '📲', title: 'Share it', desc: 'Send it via WhatsApp, Instagram, SMS or email — one tap.' },
  { emoji: '✅', title: 'Friend signs up', desc: 'They enter your code at registration and get 200 free coins.' },
  { emoji: '🪙', title: 'You earn 200 coins', desc: 'Coins land in your account the moment they complete signup.' },
]

export default function ReferPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [referredCount, setReferredCount] = useState(0)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [recentLedger, setRecentLedger] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const isLoggedIn = !!authToken()

  useEffect(() => {
    if (!isLoggedIn) return
    setLoading(true)
    Promise.all([api.getReferralCode(), api.getReferralStats()])
      .then(([codeRes, statsRes]) => {
        setCode(codeRes?.referralCode || '')
        setShareUrl(codeRes?.shareUrl || 'https://mealwarden.com')
        setReferredCount(statsRes?.referredCount || 0)
        setCoinsEarned(statsRes?.coinsEarned || 0)
        setRecentLedger(statsRes?.ledger || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  const shareMsg =
    `Hey! I've been using MealWarden to track my meals and build healthy habits — and it actually works! 🌿\n\n` +
    `Download MealWarden and use my code *${code}* at signup — you'll get 200 free MealCoins!\n\n👉 ${shareUrl}`

  const onCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const onShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join MealWarden — use my referral code!', text: shareMsg, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareMsg).catch(() => {})
      alert('Message copied to clipboard!')
    }
  }

  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso)
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
      if (diff === 0) return 'Today'
      if (diff === 1) return 'Yesterday'
      if (diff < 7) return `${diff} days ago`
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    } catch { return '' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafb', fontFamily: FONT, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#374151' }}>←</button>
        <span style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>Refer & Earn</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)', borderRadius: 24, padding: 32, color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎁</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Refer & Earn</div>
          <div style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.6, marginBottom: 24 }}>
            Invite friends to MealWarden.<br />
            You earn <strong style={{ color: '#86efac' }}>200 MealCoins</strong> per signup.
            They get <strong style={{ color: '#fde68a' }}>200 bonus coins</strong> to start.
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.12)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '16px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{referredCount}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Friends referred</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ flex: 1, padding: '16px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900 }}>🪙 {coinsEarned.toLocaleString()}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Coins earned</div>
            </div>
          </div>
        </div>

        {/* Your code */}
        {isLoggedIn && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1.5px dashed ${GREEN}44` }}>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 16, color: '#111827' }}>Your Referral Code</div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>Loading your code…</div>
            ) : (
              <>
                <div style={{ background: GREEN_SOFT, borderRadius: 14, padding: '18px 24px', textAlign: 'center', marginBottom: 10, border: `1px solid ${GREEN}33` }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: GREEN, letterSpacing: 8 }}>{code}</div>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
                  Share this code — your friend enters it at signup
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={onCopy} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: `1.5px solid ${GREEN}`, background: GREEN_SOFT, color: GREEN, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>
                    {copied ? '✓ Copied!' : '📋 Copy code'}
                  </button>
                  <button onClick={onShare} style={{ flex: 1.5, padding: '13px 0', borderRadius: 12, border: 'none', background: GREEN, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: FONT }}>
                    🚀 Share now
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {!isLoggedIn && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Log in to see your code</div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Sign in or create a free account to get your personal referral code.</div>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 32px', borderRadius: 14, border: 'none', background: GREEN, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>
              Sign in / Sign up
            </button>
          </div>
        )}

        {/* How it works */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 18, color: '#111827' }}>How it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < HOW_IT_WORKS.length - 1 ? 20 : 0, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36 }}>
                  <div style={{ fontSize: 28 }}>{step.emoji}</div>
                  {i < HOW_IT_WORKS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: '#e5e7eb', margin: '6px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: '#111827', marginBottom: 3 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What you earn */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 18, color: '#111827' }}>What you earn</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, background: GREEN_SOFT, borderRadius: 16, padding: 20, textAlign: 'center', border: `1.5px solid ${GREEN}33` }}>
              <div style={{ fontSize: 30 }}>🪙</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: GREEN, marginTop: 6 }}>200</div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700, marginTop: 4 }}>coins per friend<br />you refer</div>
              <div style={{ display: 'inline-block', marginTop: 8, background: GREEN, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 900 }}>YOU</div>
            </div>
            <div style={{ fontSize: 24 }}>🤝</div>
            <div style={{ flex: 1, background: '#eff6ff', borderRadius: 16, padding: 20, textAlign: 'center', border: '1.5px solid #bfdbfe' }}>
              <div style={{ fontSize: 30 }}>🪙</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#1d4ed8', marginTop: 6 }}>200</div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700, marginTop: 4 }}>bonus coins for<br />your friend</div>
              <div style={{ display: 'inline-block', marginTop: 8, background: '#1d4ed8', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 900 }}>THEM</div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        {recentLedger.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 14, color: '#111827' }}>Recent Activity</div>
            {recentLedger.map((e: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: GREEN, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{e.reason}</div>
                  <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{fmtDate(e.createdAt)}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: GREEN }}>+{e.amount}</div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 14, color: '#111827' }}>FAQ</div>
          {[
            { q: 'Is there a cap on referrals?', a: 'No cap. Refer as many friends as you like — each successful signup earns you 200 coins.' },
            { q: 'When are my coins credited?', a: 'Instantly when your friend completes registration with your code.' },
            { q: 'Can my friend apply the code after signup?', a: 'No — the referral code field is only available during the signup flow.' },
            { q: 'Do the coins expire?', a: 'No. All MealCoins, including referral coins, never expire while your account is active.' },
            { q: 'Can I use my own code?', a: 'No — a code cannot be applied to the account it belongs to.' },
          ].map((item, i) => (
            <div key={i} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
              <button onClick={() => setFaqOpen(p => p === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, textAlign: 'left', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827', lineHeight: 1.4 }}>{item.q}</span>
                <span style={{ transform: faqOpen === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: '#9ca3af', fontSize: 16, flexShrink: 0 }}>›</span>
              </button>
              {faqOpen === i && <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6, paddingBottom: 14 }}>{item.a}</div>}
            </div>
          ))}
        </div>

        {/* Conditions */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 14, color: '#111827' }}>Conditions</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#6b7280', fontSize: 13, lineHeight: 1.8 }}>
            <li>Referral coins are credited instantly on successful signup.</li>
            <li>Each person may only use one referral code — at signup only.</li>
            <li>You earn 200 coins per referred friend, with no maximum cap.</li>
            <li>Fraudulent signups or self-referral are not eligible.</li>
            <li>Referral coins cannot be exchanged for cash.</li>
            <li>MealWarden may modify or end the referral programme at any time.</li>
          </ul>
        </div>

        {/* Bottom CTA */}
        {isLoggedIn && !loading && code && (
          <button onClick={onShare} style={{ padding: '17px 0', borderRadius: 18, border: 'none', background: `linear-gradient(135deg, ${GREEN}, #15803d)`, color: '#fff', fontWeight: 900, fontSize: 16, cursor: 'pointer', fontFamily: FONT, boxShadow: `0 4px 20px ${GREEN}44` }}>
            🚀 Share your code with friends
          </button>
        )}
      </div>
    </div>
  )
}
