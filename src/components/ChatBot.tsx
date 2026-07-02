'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface Message {
  from: 'bot' | 'user'
  text: string
  time: string
}

const getTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

const BOT_RESPONSES: Record<string, string> = {
  // Greetings
  'hi':       'Hey there! 👋 I\'m the MealWarden Assistant. Ask me anything about MealWarden — pricing, features, how it works, and more!',
  'hello':    'Hello! 🛡️ Welcome to MealWarden support. How can I help you today?',
  'hey':      'Hey! 👋 I\'m here to help. What would you like to know about MealWarden?',
  'good morning': 'Good morning! ☀️ How can I help you today?',
  'good evening': 'Good evening! 🌙 What can I help you with?',

  // Pricing
  'free':     'Every new account starts with a **14-day free Gold trial** — all features unlocked, no card needed. After that you can stay on a functional Free plan or upgrade. 🎉',
  'price':    '✦ MealWarden membership plans are coming soon! Right now every account starts with a **14-day Gold trial** — all features unlocked, no card needed. 🎉',
  'pricing':  '✦ Membership plans are launching soon. Every new account gets a **14-day Gold trial** with all features free — no credit card required!',
  'premium':  '✨ MealWarden\'s Gold plan includes AI Diet Generation, unlimited Meal Scans, unlimited Guardian Chat, 90-day analytics, Smart Grocery Lists, Leagues & MealCoins, and more. Start with your **14-day free trial** today!',
  'gold':     '✦ **Gold** is MealWarden\'s full-featured plan — personalised diet plans, AI meal scans, unlimited Guardian chat, deep analytics, grocery lists, and leagues. Membership pricing coming soon — enjoy your **free 14-day trial** now!',
  'silver':   '✨ MealWarden membership tiers are launching soon. For now every account is on a full **14-day Gold trial** — all premium features, completely free!',
  'cost':     '✦ Membership plans are coming soon! Every account starts with a free 14-day Gold trial — no card, no commitment.',
  'discount': 'Membership plans (including annual discounts) are launching soon. Stay tuned — you\'ll be the first to know! 🎉',
  'cancel':   'You can cancel anytime — no questions asked, no penalties. Your access continues until the end of your billing period.',

  // Features
  'features':     'MealWarden has 6 core features:\n📸 AI Diet Chart Scanner\n⏰ Smart Meal Reminders\n🍳 Overnight Prep Tasks\n📊 Macro & Weight Tracking\n🛒 Grocery List Generator\n🤖 AI Recipe Engine',
  'reminder':     '⏰ MealWarden sends smart reminders before each meal — with snooze and one-tap logging right from the notification.',
  'scanner':      '📸 Photograph or upload your dietitian\'s plan — photo, PDF or even handwriting. Our AI reads it and schedules your week in seconds.',
  'ai':           '🤖 MealWarden uses AI to read your diet plan, generate 7-day plans, estimate calories from a meal photo, and power your Ask-Meenu assistant.',
  'recipe':       '🍳 The AI Recipe Engine suggests personalized recipes that match your macro goals and taste preferences. Available on Premium and Gold plans.',
  'grocery':      '🛒 MealWarden auto-generates your weekly grocery list from your diet plan. Shop smarter, waste less!',
  'macro':        '📊 Track calories, protein, carbs, and fats. MealWarden logs your meals and shows beautiful analytics for your progress.',
  'weight':       '⚖️ Log your weight daily and MealWarden tracks your progress with charts, streaks, and weekly reports.',
  'streak':       '🔥 MealWarden tracks your consistency streak — how many days in a row you\'ve followed your meal plan. Keep it going!',

  // Guardians
  'meenu':    '👩 **Meenu** is your warm, caring guardian — gentle reminders, encouraging notes, and recipes made simple.',
  'maddy':    '👨 **Maddy** is your bold, focused guardian — direct nudges, no-nonsense plans, and real accountability.',
  'voice':    '🎙️ Your guardian supports **voice replies** in the MealWarden app — tap the speaker icon on any message to hear their response read aloud. On the web you can also enable the speaker button in this chat.',
  'guardian': 'Your guardian watches over your nutrition every day — reminders, recipes and nutrition help. Pick warm **Meenu** or focused **Maddy**; Gold members can create their own.',

  // Technical
  'android':  '🤖 MealWarden is available on Android via the Google Play Store. Search for MealWarden and install it directly!',
  'ios':      '🍎 MealWarden is available on iOS via the Apple App Store. Requires iOS 14.0 or later.',
  'download': '📲 Download MealWarden from:\n🍎 iOS → App Store\n🤖 Android → Google Play Store\n\nVisit mealwarden.com/download to get started!',
  'install':  '📲 You can install MealWarden from the App Store (iOS) or Google Play Store (Android).',
  'platform': 'MealWarden works on iOS and Android (launching soon), and on the web at mealwarden.com — your account and data stay in sync across all of them.',

  // Privacy & Security
  'privacy':  '🔒 Your data is end-to-end encrypted and DPDP Act 2023 compliant. We never sell your data to anyone, ever.',
  'security': '🔒 MealWarden uses enterprise-grade encryption for all your nutrition data. We are fully DPDP Act 2023 compliant.',
  'safe':     '🔒 Absolutely safe! Your data is encrypted, never sold, and stored on enterprise-grade infrastructure.',
  'data':     '🔒 Your nutrition data is encrypted and private. We never share or sell your data. You can delete your account anytime.',

  // Support
  'support':  '💬 Need help? You can:\n• Chat with us here\n• Email us at support@mealwarden.com\n• We respond within 2 hours!',
  'help':     'I\'m here to help! 🛡️ You can ask me about:\n• Pricing & plans\n• Features\n• WhatsApp Guardian\n• ARIA & KAEL\n• Download & install\n• Privacy & security',
  'contact':  '📧 Contact us at support@mealwarden.com. We usually respond within 2 hours!',
  'email':    '📧 You can reach us at support@mealwarden.com. We\'re here to help!',
  'refund':   '↩️ We offer a hassle-free cancellation — cancel anytime and you keep access until end of billing period. Contact support for refund queries.',

  // About
  'about':    '🛡️ MealWarden is one of the world\'s first diet plan readers. Upload any diet plan and your AI guardian reads it, schedules your week, sends smart reminders, scans meals, and keeps you consistent.',
  'mealwarden': '🛡️ MealWarden is your intelligent meal guardian. We read your diet plan, send smart reminders, scan meals with AI, and keep you accountable 24/7!',
  'india':    '🌍 MealWarden works for anyone, anywhere — any cuisine, any goal. We\'re proudly made by a team in India 🇮🇳, building for the whole world.',

  // Default
  'thanks':   'You\'re welcome! 🙏 Feel free to ask anything else about MealWarden!',
  'thank you': 'My pleasure! 😊 Is there anything else I can help you with?',
  'bye':      'Goodbye! 👋 Stay consistent with your meals and let MealWarden guard your nutrition journey! 🛡️',
}

const SUGGESTIONS = [
  'What is MealWarden?',
  'Show me pricing',
  'Who are Meenu and Maddy?',
  'How does the diet plan reader work?',
  'Is MealWarden free?',
  'How do I get the app?',
]

function getBotResponse(input: string): string {
  const lower = input.toLowerCase().trim()

  // Check for exact or partial matches
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return response
  }

  // Fallback
  return 'Great question! 🤔 I\'m not sure about that specific topic. For detailed help, please email us at support@mealwarden.com or ask about:\n\n• Pricing & plans\n• Features\n• WhatsApp Guardian\n• Download & install\n• Privacy & security'
}

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const { user } = useAuth()
  const [messages, setMessages]   = useState<Message[]>([
    {
      from: 'bot',
      text: 'Hi! 👋 I\'m the MealWarden Assistant. Ask me anything about our features, pricing, or how MealWarden works!',
      time: getTime(),
    }
  ])
  const [input, setInput]         = useState('')
  const [typing, setTyping]       = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const utterRef                    = useRef<SpeechSynthesisUtterance | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const plain = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n/g, ' ')
    const utt = new SpeechSynthesisUtterance(plain)
    utt.rate = 1.05; utt.pitch = 1.1; utt.volume = 1
    utterRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = { from: 'user', text: text.trim(), time: getTime() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Logged-in users get the real AI guardian (same backend as the app).
    if (user) {
      api.askAssistant(text.trim())
        .then((res: any) => {
          const answer = res?.answer || res?.reply || 'Sorry, I couldn\'t reach your guardian just now. Please try again.'
          setMessages(prev => [...prev, { from: 'bot', text: answer, time: getTime() }])
          if (ttsEnabled) speak(answer)
        })
        .catch(() => {
          setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, I couldn\'t reach your guardian just now. Please try again.', time: getTime() }])
        })
        .finally(() => setTyping(false))
      return
    }

    // Logged-out visitors get the quick FAQ assistant.
    setTimeout(() => {
      const reply = getBotResponse(text)
      setMessages(prev => [...prev, { from: 'bot', text: reply, time: getTime() }])
      if (ttsEnabled) speak(reply)
      setTyping(false)
    }, 900 + Math.random() * 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(5,46,22,0.4)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Chat window */}
      <div style={{
        position: 'fixed',
        bottom: 24, right: 24,
        zIndex: 3001,
        width: 380, height: 580,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'heroIn 0.3s ease both',
        border: '1px solid #e5e7eb',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#052e16,#16a34a)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20,
          }}>🛡️</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              fontWeight: 700, color: '#fff', fontSize: 15,
            }}>
              MealWarden Assistant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#4ade80',
                animation: 'dotBlink 1.4s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Online · Replies instantly
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: 0, lineHeight: 1,
            }}
          >×</button>
          <button
            onClick={() => { setTtsEnabled(v => !v); if (ttsEnabled && window.speechSynthesis) window.speechSynthesis.cancel() }}
            title={ttsEnabled ? 'Mute voice' : 'Enable voice replies'}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: ttsEnabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: ttsEnabled ? '#16a34a' : '#fff', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, lineHeight: 1, marginLeft: 4,
            }}
          >🔊</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px', background: '#f9fafb',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
                gap: 8, alignItems: 'flex-end',
                animation: 'slideUp 0.3s ease both',
              }}
            >
              {m.from === 'bot' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#dcfce7', border: '1.5px solid #16a34a',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, flexShrink: 0,
                }}>
                  🛡️
                </div>
              )}

              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  background: m.from === 'user' ? '#16a34a' : '#fff',
                  color: m.from === 'user' ? '#fff' : '#111827',
                  borderRadius: m.from === 'user'
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  fontSize: 13.5, lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  whiteSpace: 'pre-line',
                }}>
                  {m.text}
                </div>
                <div style={{
                  fontSize: 10, color: '#9ca3af', marginTop: 4,
                  textAlign: m.from === 'user' ? 'right' : 'left',
                }}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#dcfce7', border: '1.5px solid #16a34a',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 13,
              }}>🛡️</div>
              <div style={{
                background: '#fff', borderRadius: '18px 18px 18px 4px',
                padding: '12px 16px',
                display: 'flex', gap: 5, alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}>
                {[0, 1, 2].map(d => (
                  <div key={d} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#16a34a',
                    animation: 'dotBlink 1.2s ease-in-out infinite',
                    animationDelay: `${d * 0.25}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length <= 2 && (
          <div style={{
            padding: '10px 14px',
            background: '#fff',
            borderTop: '1px solid #f0fdf4',
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  padding: '5px 12px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 100, fontSize: 11,
                  color: '#16a34a', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#16a34a'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f0fdf4'
                  e.currentTarget.style.color = '#16a34a'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          background: '#fff',
          borderTop: '1px solid #f3f4f6',
          display: 'flex', gap: 10, alignItems: 'center',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, padding: '10px 16px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 22, fontSize: 13,
              color: '#111827', outline: 'none',
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              background: '#f9fafb',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => (e.target.style.borderColor = '#16a34a')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                : '#e5e7eb',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 16,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}