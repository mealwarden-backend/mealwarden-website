'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { CREDIT_PACKS } from '@/lib/appData'
import { api } from '@/lib/api'

const FONT = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'

interface Balance { generate: number; upload: number }
interface TxItem { id: string; type: string; creditType: string; amount: number; note?: string; createdAt: string; packType?: string }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MwCreditsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [balance, setBalance]   = useState<Balance>({ generate: 0, upload: 0 })
  const [txns, setTxns]         = useState<TxItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState<string | null>(null)
  const [flash, setFlash]       = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => { if (!authLoading && !user) router.push('/') }, [authLoading, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCredits = useCallback(async () => {
    try {
      const d = await (api as any).getMwCredits()
      setBalance(d?.balance ?? { generate: 0, upload: 0 })
      setTxns(d?.transactions ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { if (user) loadCredits() }, [user, loadCredits])

  const purchase = async (packKey: string) => {
    if (busy) return
    setBusy(packKey); setFlash(null)
    try {
      const orderRes = await (api as any).createCreditOrder(packKey)
      // TODO: open Razorpay checkout with orderRes.orderId
      // For now, proceed directly (placeholder until Razorpay is wired)
      await (api as any).purchaseMwCredits(packKey, orderRes?.orderId)
      await loadCredits()
      setFlash({ msg: 'Credits added! ✨', ok: true })
    } catch (e: any) {
      setFlash({ msg: e?.message || 'Purchase failed. Please try again.', ok: false })
    } finally { setBusy(null) }
  }

  if (authLoading || !user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: FONT }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#052e16,#065f46,#16a34a)', padding: '40px 24px 64px', textAlign: 'center' }}>
        <div onClick={() => router.push('/upgrade')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: 14, cursor: 'pointer', marginBottom: 20, fontWeight: 600 }}>
          ← Back to Plans
        </div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        <h1 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
          MealWarden Credits
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
          Top up your AI allowance. Buy extra diet generations or plan uploads whenever you need them.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '-40px auto 0', padding: '0 20px 60px' }}>

        {/* ── Balance cards ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
          {[
            { emoji: '⚡', label: 'Generate', sub: 'credits', value: balance.generate, accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
            { emoji: '📤', label: 'Upload',   sub: 'credits', value: balance.upload,   accent: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
          ].map(({ emoji, label, sub, value, accent, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 20, padding: '22px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: accent, lineHeight: 1 }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 11.5, color: '#6b7280' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── How it works ─────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '18px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 8 }}>How credits work</div>
          <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 12 }}>
            Credits top up your monthly AI allowance beyond your plan limit — each credit unlocks one extra AI action.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ fontSize: 13, color: '#374151' }}>⚡ 1 generate credit → 1 extra diet plan generation</div>
            <div style={{ fontSize: 13, color: '#374151' }}>📤 1 upload credit → 1 extra diet plan upload (OCR scan)</div>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
            Credits are valid for the current calendar month. Unused credits do not carry over.
          </div>
        </div>

        {/* Flash message */}
        {flash && (
          <div style={{ background: flash.ok ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${flash.ok ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 14, fontWeight: 600, color: flash.ok ? '#16a34a' : '#dc2626' }}>
            {flash.msg}
          </div>
        )}

        {/* ── Purchase packs ───────────────────────────────────────── */}
        <div style={{ fontSize: 17, fontWeight: 900, color: '#111827', marginBottom: 14 }}>Add credits</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 10 }}>
          {CREDIT_PACKS.map((pack) => {
            const isBundle  = 'bestValue' in pack && pack.bestValue
            const isLoading = busy === pack.key
            return (
              <div key={pack.key}
                style={{
                  background: '#fff', borderRadius: 18, padding: '18px 20px',
                  border: `${isBundle ? 2 : 1.5}px solid ${isBundle ? '#16a34a' : '#e5e7eb'}`,
                  display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: isBundle ? '0 4px 20px rgba(22,163,74,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative', overflow: 'hidden',
                }}>
                {isBundle && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 900, padding: '4px 10px', borderBottomLeftRadius: 10, letterSpacing: 0.6 }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#111827', marginBottom: 3 }}>{pack.label}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{pack.desc}</div>
                </div>
                <button
                  onClick={() => purchase(pack.key)}
                  disabled={!!busy}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none', cursor: busy ? 'wait' : 'pointer',
                    background: isBundle ? '#16a34a' : '#052e16',
                    color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: FONT,
                    minWidth: 64, opacity: busy && !isLoading ? 0.5 : 1,
                  }}>
                  {isLoading ? '…' : `₹${pack.price}`}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 36 }}>
          Payments processed securely via Razorpay.
        </p>

        {/* ── Transaction history ──────────────────────────────────── */}
        {txns.length > 0 && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#111827', marginBottom: 14 }}>History</div>
            <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              {txns.map((tx, i) => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', padding: '14px 18px',
                  borderBottom: i < txns.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div style={{ fontSize: 22, marginRight: 14 }}>
                    {tx.creditType === 'generate' ? '⚡' : '📤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                      {tx.note || (tx.type === 'purchase' ? 'Credits purchased' : 'Credits used')}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{fmtDate(tx.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tx.amount > 0 ? '#16a34a' : '#dc2626' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && txns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
            No credit transactions yet
          </div>
        )}
      </div>
    </div>
  )
}
