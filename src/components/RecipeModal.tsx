'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const FONT      = 'var(--font-jakarta), Plus Jakarta Sans, sans-serif'
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif'

const cap = (s?: string | null): string => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export default function RecipeModal({ mealId, mealName, guardianName = 'Meenu', onClose }: { mealId: string; mealName: string; guardianName?: string; onClose: () => void }) {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const r = await api.getRecipe(mealId)
        if (active) setRecipe(r?.recipe || r)
      } catch (e: any) {
        if (active) setError(e?.message || 'Could not load this recipe.')
      } finally { if (active) setLoading(false) }
    })()
    return () => { active = false }
  }, [mealId])

  const ingRow = (ing: any, i: number) => (
    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 14, color: '#374151' }}>{cap(ing?.name || ing?.item) || String(ing)}</span>
      {ing?.quantity && <span style={{ fontSize: 13, color: '#9ca3af', flexShrink: 0 }}>{ing.quantity}</span>}
    </div>
  )

  const comps = (recipe?.components || []).filter((c: any) => (c?.ingredients?.length || c?.steps?.length))
  const flatIngredients = recipe?.ingredients || []
  const flatSteps = recipe?.steps || []
  const benefits = recipe?.benefits || []

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,46,22,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2001, width: '100%', maxWidth: 520, background: '#fff', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(135deg,#052e16,#16a34a)', padding: '20px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontFamily: FONT_SYNE, fontSize: 19, fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>{recipe?.title || mealName}</div>
              {recipe && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {((recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0)) > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '3px 10px' }}>⏱ {(recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0)} min</span>}
                  {recipe.servings && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '3px 10px' }}>🍽 {recipe.servings} serving</span>}
                  {recipe.difficulty && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '3px 10px' }}>🔥 {recipe.difficulty}</span>}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 24px 24px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
              <p style={{ fontSize: 14, color: '#6b7280' }}>{guardianName} is writing your recipe…</p>
            </div>
          ) : error ? (
            <p style={{ fontSize: 14, color: '#ef4444', textAlign: 'center', padding: '24px 0' }}>{error}</p>
          ) : recipe ? (
            <>
              {/* Ingredients */}
              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', marginBottom: 8 }}>🧺 Ingredients</div>
              {comps.length > 0 ? (
                comps.map((c: any, ci: number) => (
                  <div key={ci} style={{ marginBottom: 12 }}>
                    {c.title && <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>{c.title}</div>}
                    {(c.ingredients || []).map(ingRow)}
                  </div>
                ))
              ) : flatIngredients.length ? flatIngredients.map(ingRow) : <p style={{ fontSize: 13, color: '#9ca3af' }}>No ingredients listed.</p>}

              {/* Steps */}
              <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', margin: '22px 0 10px' }}>👩‍🍳 How to make it</div>
              {(() => {
                const stepGroups = comps.filter((c: any) => c.steps?.length)
                const steps: string[] = stepGroups.length === 1 ? stepGroups[0].steps : (stepGroups.length > 1 ? [] : flatSteps)
                if (stepGroups.length > 1) {
                  return stepGroups.map((c: any, ci: number) => (
                    <div key={ci} style={{ marginBottom: 12 }}>
                      {c.title && <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>{c.title}</div>}
                      {(c.steps || []).map((s: string, i: number) => <StepRow key={i} n={i + 1} text={s} />)}
                    </div>
                  ))
                }
                return steps.length ? steps.map((s, i) => <StepRow key={i} n={i + 1} text={s} />) : <p style={{ fontSize: 13, color: '#9ca3af' }}>No steps listed.</p>
              })()}

              {/* Benefits */}
              {benefits.length > 0 && (
                <>
                  <div style={{ fontFamily: FONT_SYNE, fontSize: 15, fontWeight: 800, color: '#052e16', margin: '22px 0 10px' }}>💚 Why it&apos;s good for you</div>
                  {benefits.map((b: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: '#16a34a' }}>•</span>
                      <span style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6 }}>{cap(b)}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

function StepRow({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
      <span style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.65 }}>{cap(text)}</span>
    </div>
  )
}
