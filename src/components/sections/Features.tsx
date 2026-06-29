'use client'

import { useEffect, useRef } from 'react'

const features = [
  {
    icon: '📸',
    title: 'AI Diet Plan Reader',
    desc: 'Photograph or upload your dietitian\'s plan — photo, PDF, or even handwriting. Our AI reads it and schedules your whole week in seconds.',
    color: '#fff7ed',
    border: '#fed7aa',
    accent: '#f97316',
    tag: 'AI Powered',
  },
  {
    icon: '⏰',
    title: 'Smart Meal Reminders',
    desc: 'Never miss a meal window again. Reminders fire before each meal — with snooze and one-tap logging, right from the notification.',
    color: '#eff6ff',
    border: '#bfdbfe',
    accent: '#3b82f6',
    tag: 'Automation',
  },
  {
    icon: '🍳',
    title: 'Overnight Prep Tasks',
    desc: 'Get prep alerts the night before so your mornings are stress-free and completely on-track with your diet plan.',
    color: '#fdf4ff',
    border: '#e9d5ff',
    accent: '#a855f7',
    tag: 'Productivity',
  },
  {
    icon: '📊',
    title: 'Macro & Weight Tracking',
    desc: 'Log meals, track calories & macros, and visualize your weight loss journey with beautiful, detailed analytics.',
    color: '#f0fdf4',
    border: '#bbf7d0',
    accent: '#16a34a',
    tag: 'Analytics',
  },
  {
    icon: '🛒',
    title: 'Grocery List Generator',
    desc: 'MealWarden auto-generates your weekly grocery list directly from your diet plan. Shop smarter, waste less.',
    color: '#fff1f2',
    border: '#fecdd3',
    accent: '#ef4444',
    tag: 'Smart Lists',
  },
  {
    icon: '🤖',
    title: 'Recipes, Benefits & AI Swaps',
    desc: 'Tap any meal for its full recipe, ingredients and health benefits — and on Gold, swap meals with AI suggestions that fit your macros.',
    color: '#f0f9ff',
    border: '#bae6fd',
    accent: '#0ea5e9',
    tag: 'AI Chef',
  },
  {
    icon: '🔥',
    title: 'Streaks & MealWarden Mates',
    desc: 'Build a daily logging streak, earn badges, and add MealWarden Mates to climb a friends leaderboard together. Consistency, made social.',
    color: '#fffbeb',
    border: '#fde68a',
    accent: '#E6A700',
    tag: 'Community',
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features"
      ref={sectionRef}
      className="section-pad"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 100,
          padding: '6px 18px',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 1.5, textTransform: 'uppercase' as const }}>
            Features
          </span>
        </div>

        <h2 className="section-h2" style={{
          fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 18,
        }}>
          Everything Your<br />
          <span className="gradient-text-green">Nutrition Journey Needs</span>
        </h2>

        <p style={{
          fontSize: 17,
          color: '#6b7280',
          maxWidth: 520,
          margin: '0 auto',
          lineHeight: 1.8,
        }}>
          Six powerful tools, one intelligent guardian. MealWarden adapts to your lifestyle — not the other way around.
        </p>
      </div>

      {/* Grid */}
      <div className="features-grid">
        {features.map((f, i) => (
          <div
            key={i}
            className={`reveal card-lift delay-${i + 1}`}
            style={{
              background: f.color,
              borderRadius: 24,
              padding: '36px 30px',
              border: `1.5px solid ${f.border}`,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* Tag */}
            <div style={{
              position: 'absolute',
              top: 18,
              right: 18,
              fontSize: 11,
              fontWeight: 700,
              color: f.accent,
              background: `${f.accent}18`,
              padding: '3px 10px',
              borderRadius: 100,
              border: `1px solid ${f.accent}30`,
            }}>
              {f.tag}
            </div>

            {/* Icon */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `${f.accent}18`,
              border: `1.5px solid ${f.accent}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              marginBottom: 22,
            }}>
              {f.icon}
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#052e16',
              marginBottom: 12,
              letterSpacing: -0.5,
            }}>
              {f.title}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 1.75,
            }}>
              {f.desc}
            </p>

            {/* Decorative corner circle */}
            <div style={{
              position: 'absolute',
              bottom: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `${f.accent}10`,
              pointerEvents: 'none',
            }} />
          </div>
        ))}
      </div>
    </section>
  )
}