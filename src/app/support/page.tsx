'use client'

import LegalShell, { H2, P, UL, LI } from '@/components/LegalShell'

export default function Support() {
  return (
    <LegalShell
      title="Support"
      subtitle="We're here to help. Find answers below or reach out any time."
      lastUpdated="June 20, 2026"
    >
      <H2>Contact us</H2>
      <P>
        Email <strong>support@mealwarden.com</strong> and we&apos;ll get back to you, usually within 1–2
        business days. Please include your account email and a short description (and a screenshot if it
        helps).
      </P>

      <H2>Common questions</H2>

      <H2 >Managing your subscription</H2>
      <UL>
        <LI>New accounts include a free trial with full Gold features.</LI>
        <LI>Paid plans are billed through the App Store or Google Play. To change or cancel, open your Apple or Google account &rarr; Subscriptions &rarr; MealWarden.</LI>
        <LI>Refunds for store purchases are handled by Apple or Google under their policies.</LI>
      </UL>

      <H2>Your data</H2>
      <UL>
        <LI><strong>Export:</strong> Profile &rarr; Export data in the app.</LI>
        <LI><strong>Delete account:</strong> Profile &rarr; Delete account, or use our <a href="/delete-account" style={{ color: '#16a34a', fontWeight: 600 }}>account deletion page</a>.</LI>
        <LI><strong>Privacy:</strong> see our <a href="/privacy" style={{ color: '#16a34a', fontWeight: 600 }}>Privacy Policy</a>.</LI>
      </UL>

      <H2>Troubleshooting</H2>
      <UL>
        <LI><strong>Not getting reminders?</strong> Make sure notifications are enabled for MealWarden in your phone settings.</LI>
        <LI><strong>Login issues?</strong> Use &quot;Forgot password&quot; on the login screen, or sign in with Google/Apple using the same email.</LI>
        <LI><strong>Plan didn&apos;t sync between phone and web?</strong> Pull to refresh, and confirm you&apos;re signed in with the same account on both.</LI>
      </UL>

      <H2>Legal</H2>
      <P>
        <a href="/privacy" style={{ color: '#16a34a', fontWeight: 600 }}>Privacy Policy</a> &nbsp;·&nbsp;
        <a href="/terms" style={{ color: '#16a34a', fontWeight: 600 }}>Terms of Use</a> &nbsp;·&nbsp;
        <a href="/delete-account" style={{ color: '#16a34a', fontWeight: 600 }}>Delete Account</a>
      </P>
    </LegalShell>
  )
}
