'use client'

import LegalShell, { H2, P, UL, LI } from '@/components/LegalShell'

export default function Terms() {
  return (
    <LegalShell
      title="Terms of Use"
      subtitle="The rules for using MealWarden. Please read them carefully."
      lastUpdated="June 20, 2026"
    >
      <P>
        These Terms of Use (&quot;Terms&quot;) govern your use of the MealWarden mobile app and the website at
        www.mealwarden.com (the &quot;Service&quot;), operated by Prasanna Krishna Challagali (&quot;MealWarden&quot;,
        &quot;we&quot;, &quot;us&quot;). By creating an account or using the Service, you agree to these Terms. If you do
        not agree, please do not use the Service.
      </P>

      <H2>1. Eligibility</H2>
      <P>
        You must be at least 13 years old (or the minimum age required in your country) to use
        MealWarden. By using the Service you confirm you meet this requirement and that the information
        you provide is accurate.
      </P>

      <H2>2. Not medical advice</H2>
      <P>
        MealWarden provides general nutrition and meal-planning information and AI-generated suggestions
        for informational and educational purposes only. It is <strong>not</strong> medical, nutritional,
        or healthcare advice and is not a substitute for consultation with a qualified doctor or
        dietitian. Always seek professional guidance before making changes to your diet, especially if
        you have a medical condition, are pregnant, or take medication. You use any suggestions at your
        own discretion and risk.
      </P>

      <H2>3. Your account</H2>
      <UL>
        <LI>You are responsible for keeping your login credentials secure and for activity under your account.</LI>
        <LI>You agree to provide accurate information and to keep it up to date.</LI>
        <LI>Notify us at support@mealwarden.com if you suspect unauthorised use of your account.</LI>
      </UL>

      <H2>4. Subscriptions, trials &amp; payments</H2>
      <UL>
        <LI>MealWarden offers a free tier and paid subscription tiers (including Gold). New accounts may receive a free trial with full features; unless cancelled, access reverts to the free tier when the trial ends.</LI>
        <LI>Paid subscriptions are sold and processed through the <strong>Apple App Store</strong> and <strong>Google Play</strong> using their in-app purchase systems. Pricing, billing period and renewal terms are shown before you purchase.</LI>
        <LI>Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel your subscription in your Apple or Google account settings.</LI>
        <LI><strong>Refunds</strong> are handled by Apple or Google according to their respective policies. We are generally unable to issue refunds directly for store purchases.</LI>
      </UL>

      <H2>5. Acceptable use</H2>
      <P>You agree not to:</P>
      <UL>
        <LI>Use the Service for any unlawful purpose or in violation of these Terms.</LI>
        <LI>Attempt to disrupt, reverse-engineer, scrape, or gain unauthorised access to the Service or its systems.</LI>
        <LI>Upload content that is illegal, infringing, or that you do not have the right to share.</LI>
        <LI>Abuse, overload or misuse AI features or other parts of the Service.</LI>
      </UL>

      <H2>6. AI-generated content</H2>
      <P>
        Parts of the Service use AI to generate plans, estimates and responses. AI output may be
        inaccurate or incomplete and is provided &quot;as is&quot;. It is labelled within the Service and should
        be reviewed with judgement; see also Section 2 (Not medical advice).
      </P>

      <H2>7. Intellectual property</H2>
      <P>
        The MealWarden name, logo, app, website and content are owned by us or our licensors. You retain
        ownership of the content you submit (such as your uploaded plans and logs); you grant us a
        limited licence to process it solely to provide the Service to you.
      </P>

      <H2>8. Termination</H2>
      <P>
        You may stop using the Service and delete your account at any time. We may suspend or terminate
        accounts that violate these Terms or that we reasonably believe pose a security or legal risk.
      </P>

      <H2>9. Disclaimers &amp; limitation of liability</H2>
      <P>
        The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. To the
        maximum extent permitted by law, MealWarden is not liable for any indirect, incidental or
        consequential damages, or for any health outcomes arising from your use of the Service. Nothing
        in these Terms excludes liability that cannot be excluded under applicable law.
      </P>

      <H2>10. Governing law</H2>
      <P>
        These Terms are governed by the laws of India, and you agree to the jurisdiction of the courts of
        India for any disputes, except where applicable law gives you the right to bring proceedings
        elsewhere.
      </P>

      <H2>11. Changes</H2>
      <P>
        We may update these Terms from time to time. Continued use of the Service after changes take
        effect means you accept the updated Terms.
      </P>

      <H2>12. Contact</H2>
      <P>Questions about these Terms: <strong>support@mealwarden.com</strong>.</P>
    </LegalShell>
  )
}
