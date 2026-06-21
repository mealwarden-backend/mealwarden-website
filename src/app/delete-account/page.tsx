'use client'

import { useState } from 'react'
import LegalShell, { H2, P, UL, LI } from '@/components/LegalShell'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://mealwarden-backend-production.up.railway.app'

export default function DeleteAccount() {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error' | 'noauth'>('idle')
  const [msg, setMsg] = useState('')

  const deleteNow = async () => {
    setStatus('working'); setMsg('')
    let token = ''
    try {
      const saved = localStorage.getItem('mw_user')
      if (saved) token = JSON.parse(saved)?.token || ''
    } catch {}
    if (!token) { setStatus('noauth'); return }
    try {
      const res = await fetch(`${API}/api/auth/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setStatus('error'); setMsg(d?.message || 'Could not delete the account. Please email us.')
        return
      }
      try {
        localStorage.removeItem('mw_user'); localStorage.removeItem('mw_profile'); localStorage.removeItem('mw_diet_chart')
      } catch {}
      setStatus('done')
    } catch {
      setStatus('error'); setMsg('Network error. Please email support@mealwarden.com.')
    }
  }

  return (
    <LegalShell
      title="Delete Your Account"
      subtitle="Request deletion of your MealWarden account and associated data."
      lastUpdated="June 20, 2026"
    >
      <P>
        You can delete your MealWarden account and personal data at any time. There are three ways to do
        it — choose whichever is easiest for you.
      </P>

      <H2>Option 1 — In the app (recommended)</H2>
      <UL>
        <LI>Open the MealWarden app and sign in.</LI>
        <LI>Go to <strong>Profile</strong> (or the side menu) &rarr; <strong>Delete account</strong>.</LI>
        <LI>Confirm. Your account and data are removed immediately.</LI>
      </UL>

      <H2>Option 2 — Here on the web</H2>
      <P>If you&apos;re signed in on this browser, you can delete your account right now:</P>
      <div style={{ margin: '8px 0 20px' }}>
        <button
          onClick={deleteNow}
          disabled={status === 'working' || status === 'done'}
          style={{
            padding: '13px 26px', borderRadius: 12, border: 'none', cursor: status === 'working' ? 'default' : 'pointer',
            background: status === 'done' ? '#9ca3af' : '#dc2626', color: '#fff', fontWeight: 700, fontSize: 15,
            fontFamily: 'var(--font-jakarta), Plus Jakarta Sans, sans-serif',
          }}
        >
          {status === 'working' ? 'Deleting…' : status === 'done' ? 'Account deleted' : 'Delete my account'}
        </button>
      </div>
      {status === 'done' && <P><span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Your account and data have been deleted.</span></P>}
      {status === 'noauth' && <P><span style={{ color: '#b45309' }}>You&apos;re not signed in on this browser. Please sign in first, or use Option 1 or Option 3.</span></P>}
      {status === 'error' && <P><span style={{ color: '#dc2626' }}>{msg}</span></P>}

      <H2>Option 3 — By email</H2>
      <P>
        Email <strong>support@mealwarden.com</strong> from the address on your account with the subject
        &quot;Delete my account&quot;. We will verify your request and delete your account within 30 days.
      </P>

      <H2>What gets deleted</H2>
      <P>When your account is deleted, we remove your personal data, including:</P>
      <UL>
        <LI>Your profile (name, email, phone, age, gender, height, weight and weight history).</LI>
        <LI>Your diet plans, meal logs, water intake, prep tasks and grocery lists.</LI>
        <LI>Uploaded diet documents and images, your assistant messages, and your profile photo.</LI>
        <LI>Your push-notification tokens and sign-in identifiers.</LI>
      </UL>
      <P>
        Deletion is permanent and cannot be undone. We may retain a limited set of records where the law
        requires it (for example, basic transaction or security records), and backups are purged on a
        rolling schedule. Note that subscription billing is managed by Apple or Google — cancel any active
        subscription in your App Store or Google Play account to stop future charges.
      </P>

      <H2>Questions</H2>
      <P>Contact us at <strong>support@mealwarden.com</strong>.</P>
    </LegalShell>
  )
}
