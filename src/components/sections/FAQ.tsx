'use client'

import { useEffect, useRef, useState } from 'react'
import ChatBot from '@/components/ChatBot'

const faqs = [
  {
    q: 'Is MealWarden free to use?',
    a: 'Every new account starts with a 14-day free Gold trial — all features unlocked, no credit card needed. After the trial you can continue on a functional Free plan or upgrade to a paid plan.',
  },
  {
    q: 'How does the AI diet chart scanner work?',
    a: 'Photograph or upload your dietitian\'s chart — a photo, PDF, or even handwriting. Our AI reads it, extracts your full meal plan, and schedules it for you automatically in seconds.',
  },
  {
    q: 'Can MealWarden create a plan if I don\'t have one?',
    a: 'Yes. Answer a few quick questions about your body, goals and food preferences, and your guardian generates a personalised 7-day plan instantly — built around your cuisine, goals and routine.',
  },
  {
    q: 'Who are Meenu and Maddy?',
    a: 'They\'re your AI guardians. Meenu is warm and caring; Maddy is bold and focused. You can chat with them today for reminders, recipes and nutrition help. The app also supports voice replies from your guardian. Gold members can create their own custom guardian.',
  },
  {
    q: 'Is my nutrition data safe and private?',
    a: 'Yes. Your data is encrypted in transit, you can export or delete it anytime, and we are built to comply with India\'s DPDP Act 2023. We never sell your data.',
  },
  {
    q: 'What can I track in MealWarden?',
    a: 'Meals and macros, water intake, weight and step trends, prep tasks, and your grocery list — plus reminders before every meal and progress analytics to keep your streak alive.',
  },
  {
    q: 'Which platforms is MealWarden on?',
    a: 'iOS and Android apps are launching soon. In the meantime you can use MealWarden on the web at mealwarden.com — your account and data stay in sync across web and the app.',
  },
  {
    q: 'How do subscriptions and cancellation work?',
    a: 'Paid plans are billed through the App Store or Google Play and renew automatically. You can cancel anytime from your Apple or Google account and keep access until the end of the billing period.',
  },
]

export default function FAQ() {
  const sectionRef              = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [chatOpen, setChatOpen]   = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    sectionRef.current
      ?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section
        id="faq"
        ref={sectionRef}
        className="section-pad"
        style={{ background: '#f9fafb' }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>

          {/* Header */}
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 100, padding: '6px 18px', marginBottom: 20,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#16a34a',
                letterSpacing: 1.5, textTransform: 'uppercase' as const,
              }}>
                FAQ
              </span>
            </div>

            <h2 className="section-h2" style={{
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              fontWeight: 800, lineHeight: 1.1, marginBottom: 18,
            }}>
              Got Questions?<br />
              <span className="gradient-text-green">We've Got Answers.</span>
            </h2>

            <p style={{
              fontSize: 17, color: '#6b7280',
              maxWidth: 440, margin: '0 auto', lineHeight: 1.8,
            }}>
              Everything you need to know about MealWarden. Can't find what you're looking for? Chat with us.
            </p>
          </div>

          {/* FAQ items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`reveal delay-${Math.min(i + 1, 6)}`}
                style={{
                  background: '#fff',
                  border: `1.5px solid ${openIndex === i ? '#16a34a' : '#e5e7eb'}`,
                  borderRadius: 18, overflow: 'hidden',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: openIndex === i
                    ? '0 4px 24px rgba(22,163,74,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  style={{
                    width: '100%', padding: '22px 26px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', cursor: 'pointer',
                    background: 'transparent', border: 'none',
                    textAlign: 'left' as const, gap: 16,
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                    fontSize: 16, fontWeight: 700, color: '#052e16',
                    flex: 1, lineHeight: 1.4,
                  }}>
                    {faq.q}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: openIndex === i ? '#16a34a' : '#f3f4f6',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.3s ease',
                    fontSize: 18, fontWeight: 700,
                    color: openIndex === i ? '#fff' : '#6b7280',
                    transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>
                    +
                  </div>
                </button>

                <div className={`faq-body ${openIndex === i ? 'open' : ''}`}>
                  <p style={{
                    padding: '0 26px 22px',
                    fontSize: 15, color: '#6b7280', lineHeight: 1.8,
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="reveal" style={{ textAlign: 'center', marginTop: 56 }}>
            <div style={{
              background: '#fff', border: '1.5px solid #e5e7eb',
              borderRadius: 20, padding: '28px 40px',
              display: 'flex', alignItems: 'center',
              gap: 24, justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 36 }}>💬</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  fontSize: 18, fontWeight: 700, color: '#052e16', marginBottom: 6,
                }}>
                  Still have questions?
                </div>
                <p style={{ fontSize: 14, color: '#6b7280' }}>
                  Our AI assistant is here to help instantly.
                </p>
              </div>
              <button
                onClick={() => setChatOpen(true)}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
                  whiteSpace: 'nowrap' as const, flexShrink: 0,
                  boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
                }}
              >
                Chat With Us →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ChatBot */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}