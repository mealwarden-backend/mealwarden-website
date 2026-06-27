'use client'

import LegalShell, { H2, P, UL, LI } from '@/components/LegalShell'

export default function PrivacyPolicy() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="How MealWarden collects, uses, stores, and protects your information."
      lastUpdated="20 June 2026"
    >
      <P>
        This Privacy Policy explains how MealWarden (&quot;MealWarden&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), operated by
        Prasanna Krishna Challagali, handles your personal information when you use the MealWarden mobile
        application and the website at www.mealwarden.com (together, the &quot;Service&quot;). By creating an account
        or using the Service, you agree to this Privacy Policy.
      </P>
      <P>
        MealWarden is a nutrition and meal-planning service. Some of the information you provide is
        health-related and is treated as <strong>sensitive personal data</strong> under India&apos;s Digital Personal
        Data Protection Act, 2023 (&quot;DPDP Act&quot;) and, where applicable, the EU General Data Protection
        Regulation (&quot;GDPR&quot;). We collect only the information we genuinely need to operate the Service,
        and we <strong>never sell your personal data</strong>.
      </P>

      <H2>1. Who Is Responsible for Your Data</H2>
      <P>
        The data controller is <strong>Prasanna Krishna Challagali</strong>, operating as MealWarden (India).
        For any privacy question, to exercise your rights, or to reach our Grievance Officer under the
        DPDP Act, please contact us at{' '}
        <strong>
          <a href="mailto:support@mealwarden.com" style={{ color: '#16a34a' }}>support@mealwarden.com</a>
        </strong>.
      </P>

      <H2>2. Information We Collect</H2>
      <P><strong>Information you provide directly:</strong></P>
      <UL>
        <LI>
          <strong>Account details:</strong> your name, email address, phone number, and password (stored
          only as a secure cryptographic hash). If you sign in with Google or Apple, we receive your name
          and email address from that provider.
        </LI>
        <LI>
          <strong>Profile and health information:</strong> your age, gender, height, weight and weight
          history, dietary preferences and restrictions, activity level, food allergies, health goals, and
          any health conditions you choose to disclose.
        </LI>
        <LI>
          <strong>Content you create or upload:</strong> diet plans (photos, PDFs, or documents), meals
          you log, daily water intake, prep tasks, grocery lists, and messages you send to the in-app AI
          assistant.
        </LI>
        <LI>
          <strong>Free-form notes:</strong> any additional text you enter to personalise your plans or
          communicate preferences to the Service.
        </LI>
      </UL>
      <P><strong>Information collected automatically:</strong></P>
      <UL>
        <LI>
          <strong>Device and technical data:</strong> device type, operating system, app version,
          push-notification token, basic diagnostic and crash logs, and IP address — used solely to
          operate and secure the Service.
        </LI>
        <LI>
          <strong>Time zone:</strong> collected to schedule meal reminders at the correct local time.
        </LI>
        <LI>
          <strong>Subscription status:</strong> your current plan tier and entitlements. Payments are
          processed by Apple or Google; we do not receive or store your card or payment details.
        </LI>
      </UL>
      <P>
        We do <strong>not</strong> collect your precise GPS location, and we do <strong>not</strong> use
        third-party advertising trackers.
      </P>

      <H2>3. How We Use Your Information</H2>
      <UL>
        <LI>To create and manage your account and authenticate you securely across the app and website.</LI>
        <LI>To generate, parse, schedule, and personalise your meal plans, reminders, and nutrition insights.</LI>
        <LI>To process photos and documents you upload and to estimate the nutritional content of meals you scan.</LI>
        <LI>To send meal reminders and service notifications that you have enabled.</LI>
        <LI>To provide customer support and respond to your requests and queries.</LI>
        <LI>To keep the Service secure, prevent abuse, detect fraud, and comply with applicable legal obligations.</LI>
        <LI>To send you product updates or tips, if you have opted in to marketing communications.</LI>
      </UL>
      <P>
        Because health data is involved, we rely on your <strong>explicit consent</strong> where required
        by applicable law. You may withdraw that consent at any time by deleting your account or by
        emailing us at support@mealwarden.com.
      </P>

      <H2>4. AI Processing and Third-Party Services</H2>
      <P>
        Several features of MealWarden — including diet plan generation, uploaded-plan parsing, meal
        scanning, macro estimation, and the in-app AI assistant — are powered by artificial intelligence.
        To deliver these features, the relevant text or images you submit are transmitted to{' '}
        <strong>OpenAI</strong> for processing. All AI-generated content is clearly labelled within the
        Service and is provided for <strong>general informational and educational purposes only</strong>.
        It does not constitute medical or nutritional advice.
      </P>
      <P>We share your data with the following processors strictly to operate the Service:</P>
      <UL>
        <LI><strong>OpenAI</strong> — AI diet generation, plan parsing, meal scanning, and the in-app assistant.</LI>
        <LI><strong>Google Firebase</strong> — push notifications, Google Sign-In verification, and phone-number (OTP) authentication.</LI>
        <LI><strong>Apple</strong> — Sign-In with Apple and in-app subscription processing.</LI>
        <LI><strong>Railway</strong> — secure cloud hosting of our backend application and database.</LI>
        <LI><strong>Upstash (Redis)</strong> — short-lived caching for session and one-time code management.</LI>
        <LI>An SMS or email provider for delivering one-time verification codes and transactional messages.</LI>
      </UL>
      <P>
        We do <strong>not</strong> sell your personal data or use it for third-party advertising of any kind.
      </P>

      <H2>5. Refer &amp; Earn Programme</H2>
      <P>
        If you participate in the Refer &amp; Earn programme, we collect and store:
      </P>
      <UL>
        <LI>
          <strong>Your referral code</strong> — a unique code generated for your account and used to
          credit you when someone signs up with it.
        </LI>
        <LI>
          <strong>The code you used at registration</strong> (if any) — stored to verify referral
          eligibility and to prevent duplicate rewards.
        </LI>
      </UL>
      <P>
        This data is used solely to operate the referral programme and to credit MealCoins to eligible
        users. We do not share referral identifiers with any third party. Participation in the programme
        is optional.
      </P>

      <H2>5a. MealWarden Mates (Social Features)</H2>
      <P>
        If you use the MealWarden Mates feature, your name, username, profile photo, and streak count
        will be visible to the Mates you are connected with on a shared leaderboard. Other users may
        search for you by username and — unless you disable this in Settings — by the email address or
        phone number on your account. You may remove a Mate at any time, which removes you from each
        other&apos;s leaderboard immediately. The Mates feature is entirely optional.
      </P>

      <H2>6. Legal Basis and Consent</H2>
      <P>
        Where required (including under the DPDP Act and the EU GDPR), we process your personal data on
        the basis of your consent and the performance of our contract with you. Because some data is
        health-related, we ask for your explicit consent before processing it and before any data is
        transmitted to AI providers. You can withdraw your consent at any time by deleting your account.
      </P>

      <H2>7. Data Retention</H2>
      <P>
        We retain your personal data for as long as your account is active and as necessary to provide
        the Service. When you delete your account, we delete your personal data from our active systems.
        Certain limited records may be retained for a reasonable period to meet legal, tax, security, or
        dispute-resolution obligations. Backups are purged on a rolling schedule. Uploaded photos and
        documents are retained only for as long as necessary to build and operate your active plan.
      </P>

      <H2>8. Your Rights</H2>
      <P>
        Depending on where you are located, you have the following rights in relation to your personal data:
      </P>
      <UL>
        <LI>
          <strong>Access and export:</strong> request a copy of the data we hold about you, or export it
          directly from within the app (Profile &rarr; Export Data).
        </LI>
        <LI>
          <strong>Correction:</strong> update inaccurate or incomplete data in the app (Profile &rarr; Edit).
        </LI>
        <LI>
          <strong>Deletion:</strong> delete your account and all associated data from within the app
          (Profile &rarr; Delete Account) or via our{' '}
          <a href="/delete-account" style={{ color: '#16a34a', fontWeight: 600 }}>account deletion page</a>,
          or by emailing us at support@mealwarden.com.
        </LI>
        <LI>
          <strong>Withdraw consent:</strong> withdraw any consent you have given at any time without
          affecting the lawfulness of processing based on consent before its withdrawal.
        </LI>
        <LI>
          <strong>Object or restrict:</strong> in certain circumstances, object to or ask us to restrict
          the processing of your personal data.
        </LI>
        <LI>
          <strong>Lodge a complaint:</strong> contact your national or state data protection authority
          if you believe we have not handled your data lawfully.
        </LI>
      </UL>
      <P>
        To exercise any of these rights, use the in-app controls or contact us at{' '}
        <strong>support@mealwarden.com</strong>. We will respond within the timelines required by
        applicable law (typically 30 days or fewer).
      </P>

      <H2>9. Security</H2>
      <P>
        We implement appropriate technical and organisational measures to protect your personal data
        against unauthorised access, disclosure, alteration, and destruction. These include encryption
        of data in transit using HTTPS/TLS, bcrypt hashing of all passwords, restricted access to
        personal data on a need-to-know basis, and rate-limiting and standard backend safeguards. No
        system is perfectly secure. In the event of a qualifying data breach, we will notify you and
        the relevant supervisory authority as required by applicable law.
      </P>

      <H2>10. Children</H2>
      <P>
        MealWarden is intended for users who are <strong>18 years of age or older</strong>. We do not
        knowingly collect personal data from anyone under 18. If you believe a child has provided us
        with personal data, please contact us at support@mealwarden.com and we will delete it promptly.
      </P>

      <H2>11. International Data Transfers</H2>
      <P>
        Your data may be processed on servers located outside your country of residence, including by
        the third-party processors listed in Section 4 (for example, in the United States or the European
        Union). Where such transfers occur, we ensure that appropriate safeguards are in place to protect
        your personal data in accordance with applicable data protection law, including standard
        contractual clauses or equivalent mechanisms where required.
      </P>

      <H2>12. Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Last
        updated&quot; date at the top of this page. Material changes that affect your rights or how we
        handle sensitive personal data will be communicated to you in the app or by email before they
        take effect. Continued use of the Service after any update constitutes your acceptance of the
        revised Policy.
      </P>

      <H2>13. Contact</H2>
      <P>
        If you have any questions about this Privacy Policy, wish to exercise your rights, or need to
        reach our Grievance Officer, please contact us:
      </P>
      <P>
        <strong>Prasanna Krishna Challagali</strong>, operating as MealWarden<br />
        Email: <strong><a href="mailto:support@mealwarden.com" style={{ color: '#16a34a' }}>support@mealwarden.com</a></strong><br />
        Website: <strong>www.mealwarden.com</strong>
      </P>
    </LegalShell>
  )
}
