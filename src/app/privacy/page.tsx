'use client'

import LegalShell, { H2, P, UL, LI } from '@/components/LegalShell'

export default function PrivacyPolicy() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="How MealWarden collects, uses, stores and protects your information."
      lastUpdated="June 20, 2026"
    >
      <P>
        This Privacy Policy explains how MealWarden (&quot;MealWarden&quot;, &quot;we&quot;, &quot;us&quot;), operated by
        Prasanna Krishna Challagali, handles your personal data when you use the MealWarden mobile
        application and the website at www.mealwarden.com (together, the &quot;Service&quot;). By using the
        Service you agree to this Policy.
      </P>
      <P>
        MealWarden is a nutrition and meal-planning service. Some of the information you provide is
        health-related and is treated as sensitive personal data. We only collect what we need to run
        the Service, and we never sell your personal data.
      </P>

      <H2>1. Who is responsible for your data</H2>
      <P>
        The data controller is Prasanna Krishna Challagali (operating as MealWarden). For any privacy
        question or to exercise your rights, contact us at <strong>support@mealwarden.com</strong>.
      </P>

      <H2>2. Information we collect</H2>
      <UL>
        <LI><strong>Account information:</strong> name, email address, phone number, and password (stored only as a secure hash). If you sign in with Google or Apple, we receive your name and email from that provider.</LI>
        <LI><strong>Profile &amp; health information:</strong> age, gender, height, weight and weight history, dietary preferences and restrictions, activity level, and health goals you enter.</LI>
        <LI><strong>Content you provide:</strong> diet plans you upload (photos, PDFs or documents), meals you log, water intake, prep tasks, grocery lists, and messages you send to the in-app assistant.</LI>
        <LI><strong>Device &amp; usage information:</strong> device type, app version, a push-notification token, and basic technical logs (including IP address) needed to operate and secure the Service.</LI>
        <LI><strong>Purchase information:</strong> your subscription status and entitlements. Payments are processed by Apple or Google; we do not receive or store your card details.</LI>
        <LI><strong>Social connections (MealWarden Mates):</strong> if you choose to connect with other users, we store those connections and pending requests. Your name, username, profile photo and streak become visible to the Mates you connect with.</LI>
      </UL>

      <H2>3. How we use your information</H2>
      <UL>
        <LI>To create and manage your account and authenticate you across the app and website.</LI>
        <LI>To generate, parse, schedule and personalise your meal plans, reminders and nutrition insights.</LI>
        <LI>To send meal reminders and service notifications you have enabled.</LI>
        <LI>To provide customer support and respond to your requests.</LI>
        <LI>To keep the Service secure, prevent abuse, and comply with legal obligations.</LI>
      </UL>

      <H2>4. AI processing &amp; third-party services</H2>
      <P>
        Some features (diet generation, reading uploaded plans, macro estimation and the in-app
        assistant) use third-party artificial-intelligence providers. To deliver these features, the
        relevant text or image you submit is sent to <strong>OpenAI</strong> for processing. AI-generated
        content is labelled in the app and is provided for general informational purposes only.
      </P>
      <P>We share data with the following processors strictly to operate the Service:</P>
      <UL>
        <LI><strong>OpenAI</strong> — AI diet generation, plan parsing and the assistant.</LI>
        <LI><strong>Google Firebase</strong> — push notifications, Google sign-in verification, and phone-number (OTP) verification.</LI>
        <LI><strong>Apple &amp; Google</strong> — sign-in and in-app subscription processing.</LI>
        <LI><strong>Railway</strong> — secure cloud hosting of our backend and database.</LI>
        <LI>An SMS provider for delivering one-time verification codes, where applicable.</LI>
      </UL>
      <P>We do not sell your personal data or use it for third-party advertising.</P>

      <P>
        <strong>MealWarden Mates (optional social features):</strong> Mates is opt-in. When you add Mates,
        your name, username, profile photo and streak are shared with the users you connect with on a
        shared leaderboard. Other users can find you by your username, and by your email or phone number
        unless you turn that off in Settings. You can remove a Mate at any time, which stops you both
        appearing on each other&apos;s leaderboard. We do not share your health data, meals or plans with
        other users.
      </P>

      <H2>5. Legal basis &amp; consent</H2>
      <P>
        Where required (including under the EU GDPR and India&apos;s Digital Personal Data Protection Act,
        2023), we process your data on the basis of your consent and to perform our contract with you.
        Because some data is health-related, we ask for your consent before processing it and before any
        data is sent to AI providers. You can withdraw consent at any time by deleting your account.
      </P>

      <H2>6. Data retention</H2>
      <P>
        We keep your personal data while your account is active. When you delete your account, we delete
        your personal data from our systems, except where we must retain limited records to meet legal,
        tax or security obligations. Backups are purged on a rolling basis.
      </P>

      <H2>7. Your rights</H2>
      <P>You can, at any time:</P>
      <UL>
        <LI><strong>Access &amp; export</strong> your data from within the app (Profile &rarr; Export data).</LI>
        <LI><strong>Correct</strong> your profile information in the app.</LI>
        <LI><strong>Delete</strong> your account and associated data from the app (Profile &rarr; Delete account) or via our <a href="/delete-account" style={{ color: '#16a34a', fontWeight: 600 }}>account deletion page</a>.</LI>
        <LI><strong>Withdraw consent</strong> or raise a concern by emailing support@mealwarden.com.</LI>
      </UL>
      <P>
        For users in India, you may contact our Grievance Officer at support@mealwarden.com. We aim to
        acknowledge requests promptly and resolve them within the timelines required by applicable law.
      </P>

      <H2>8. Security</H2>
      <P>
        Data is encrypted in transit (HTTPS/TLS). Passwords are hashed, access is restricted, and we
        apply rate limiting and standard safeguards on our backend. No system is perfectly secure, but
        we work to protect your information and will notify you and the relevant authority of a breach as
        required by law.
      </P>

      <H2>9. Children</H2>
      <P>
        MealWarden is not directed to children under 13 (or the minimum age in your country, such as 16
        in parts of the EU). We do not knowingly collect data from children. If you believe a child has
        provided us data, contact us and we will delete it.
      </P>

      <H2>10. International transfers</H2>
      <P>
        Your data may be processed on servers located outside your country (including by our processors
        listed above). Where required, we rely on appropriate safeguards for such transfers.
      </P>

      <H2>11. Changes to this Policy</H2>
      <P>
        We may update this Policy from time to time. We will post the updated version here and change the
        &quot;Last updated&quot; date. Significant changes will be communicated in the app.
      </P>

      <H2>12. Contact</H2>
      <P>
        Questions about this Policy or your data: <strong>support@mealwarden.com</strong>.
      </P>
    </LegalShell>
  )
}
