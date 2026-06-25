'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'
const GREEN     = '#16a34a'
const DARK      = '#052e16'

const GUARDIAN_META: Record<string, { name: string; emoji: string; tagline: string }> = {
  meenu: { name: 'Meenu',   emoji: '🌿', tagline: 'Your caring wellness guide' },
  maddy: { name: 'Maddy',   emoji: '⚡', tagline: 'Your tough-love trainer' },
  custom: { name: 'Your Guardian', emoji: '🛡️', tagline: 'Personalised just for you' },
}

const STARTERS = [
  'How am I doing this week?',
  'What should I eat for dinner tonight?',
  'Give me a motivational boost 💪',
  'Explain my macros to me',
  'What prep do I need to do tomorrow?',
  'Summarise my journey so far',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

// Typeout animation for assistant messages
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (idx.current >= text.length) {
        clearInterval(interval)
        onDone?.()
        return
      }
      setDisplayed(text.slice(0, ++idx.current))
    }, 12)
    return () => clearInterval(interval)
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  return <span>{displayed}</span>
}

export default function Chat() {
  const { user } = useAuth()
  const router   = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [profile, setProfile]   = useState<any>(null)
  const [typing, setTyping]     = useState(false)
  const endRef    = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!user) { router.push('/'); return }
    api.getProfile().then((p: any) => { setProfile(p?.user || p || {}) }).catch(() => {})
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const guardianKey = profile?.guardian || user?.plan || 'meenu'
  const gMeta = GUARDIAN_META[guardianKey] || GUARDIAN_META.meenu

  const send = useCallback(async (text: string) => {
    const question = text.trim()
    if (!question || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: question, id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setTyping(true)

    // Build history (last 6 messages, alternating)
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await api.askAssistant(question, guardianKey, history)
      const answer: string = res?.data?.reply || res?.reply || res?.answer || 'I had trouble answering that. Try again!'
      const assistantMsg: Message = { role: 'assistant', content: answer, id: (Date.now() + 1).toString() }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errMsg: Message = { role: 'assistant', content: "Something went wrong — please try again.", id: (Date.now() + 1).toString() }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
      setTyping(false)
    }
  }, [messages, loading, guardianKey])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  if (!user) return null

  const isEmpty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#f9fafb', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${DARK},${GREEN})`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: FONT, fontWeight: 600 }}>← Back</button>
        <div style={{ fontSize: 28 }}>{gMeta.emoji}</div>
        <div>
          <div style={{ fontFamily: FONT_SYNE, fontSize: 17, fontWeight: 800, color: '#fff' }}>{gMeta.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{gMeta.tagline}</div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>

          {/* Empty state / starters */}
          {isEmpty && (
            <div style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>{gMeta.emoji}</div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 8 }}>
                Hi, I'm {gMeta.name}!
              </div>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>
                Ask me anything about your meals, progress, nutrition, or goals. I know your plan and I'm here to help.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {STARTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{ padding: '10px 16px', borderRadius: 20, border: `1.5px solid ${GREEN}`, background: '#f0fdf4', color: GREEN, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { (e.currentTarget.style.background = GREEN); (e.currentTarget.style.color = '#fff') }}
                    onMouseLeave={e => { (e.currentTarget.style.background = '#f0fdf4'); (e.currentTarget.style.color = GREEN) }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, alignSelf: 'flex-end' }}>
                  {gMeta.emoji}
                </div>
              )}
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user' ? GREEN : '#fff',
                color: msg.role === 'user' ? '#fff' : '#111827',
                fontSize: 14.5,
                lineHeight: 1.65,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {/* Typewriter only on the latest assistant message */}
                {msg.role === 'assistant' && i === messages.length - 1 && loading === false ? (
                  <TypewriterText text={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {gMeta.emoji}
              </div>
              <div style={{ padding: '12px 18px', background: '#fff', borderRadius: '20px 20px 20px 4px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(d => (
                  <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', animation: `bounce 1.2s ease ${d * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{ borderTop: '1px solid #e5e7eb', background: '#fff', padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Ask ${gMeta.name} anything…`}
            rows={1}
            disabled={loading}
            style={{
              flex: 1, padding: '12px 14px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 14, fontSize: 14,
              fontFamily: FONT, resize: 'none',
              outline: 'none', lineHeight: 1.5,
              maxHeight: 120, overflowY: 'auto',
              background: loading ? '#f9fafb' : '#fff',
              color: '#111827',
            }}
            onFocus={e => (e.target.style.borderColor = GREEN)}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: loading || !input.trim() ? '#d1fae5' : GREEN,
              border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? '⏳' : '↑'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8, fontFamily: FONT }}>
          {gMeta.name} uses your real meal plan + progress data. Press Enter to send.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
