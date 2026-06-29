// Single source of truth for marketing content, kept in sync with the MealWarden
// app (src/screens/PaywallScreen.tsx tiers + utils/guardian.ts guardians).
// Update here and every website section stays factual.

export type Plan = {
  key: string
  name: string
  monthly: number   // INR / month
  annual: number    // INR / year
  tagline: string
  popular?: boolean
  features: string[]
  soon?: string[]   // upcoming features shown with "Coming soon" badge
}

// Mirrors PaywallScreen PLANS exactly. Annual ≈ 33% off monthly.
export const PLANS: Plan[] = [
  {
    key: 'free', name: 'Free', monthly: 0, annual: 0, tagline: 'Get started',
    features: [
      '1 active diet plan',
      '5 Guardian messages / day',
      'Basic meal reminders',
      'Water & weight tracking',
      'Daily streaks & MealWarden Mates',
      'Up to 3 recipes / week',
      'Prep task & grocery view',
      'Up to 10 mates & 1 circle',
    ],
  },
  {
    key: 'silver', name: 'Silver', monthly: 149, annual: 1199, tagline: 'For consistency',
    features: [
      'Everything in Free',
      'Ad-free experience',
      'Unlimited diet plans',
      'Full recipes & prep tasks',
      'Progress analytics',
    ],
    soon: ['WhatsApp morning digest', 'WhatsApp night reminder'],
  },
  {
    key: 'premium', name: 'Premium', monthly: 299, annual: 2399, tagline: 'Most loved', popular: true,
    features: [
      'Everything in Silver',
      'Unlimited Guardian chat',
      'Meal Scan — AI calories from a photo',
      'Smart grocery lists',
      'PDF diet plan export',
      'Priority Guardian replies',
    ],
    soon: ['Voice Guardian (5 calls / day)'],
  },
  {
    key: 'gold', name: 'Gold', monthly: 699, annual: 5499, tagline: 'Full power',
    features: [
      'Everything in Premium',
      'Wearable & step sync',
      'AI meal swaps',
      'Create your own guardian',
      'Priority support',
    ],
    soon: ['Voice Guardian — unlimited', 'Family Plan (up to 5 users)', 'Guardian memory'],
  },
]

export const TRIAL_DAYS = 14

// Real guardians from the app (Meenu & Maddy), plus the Gold custom guardian.
export const GUARDIANS = [
  {
    name: 'Meenu',
    tagline: 'Warm · Caring',
    role: 'Female guardian',
    emoji: '👩',
    img: '/guardians/meenu.png',
    color: '#f0fdf4',
    border: '#16a34a',
    ac: '#16a34a',
    desc: 'Your warm, caring guardian. Gentle reminders before every meal, encouraging notes on tough days, and recipes made beautifully simple.',
  },
  {
    name: 'Maddy',
    tagline: 'Bold · Focused',
    role: 'Male guardian',
    emoji: '👨',
    img: '/guardians/maddy.png',
    color: '#fff7ed',
    border: '#f97316',
    ac: '#ea580c',
    desc: 'Your bold, focused guardian. Direct nudges, no-nonsense plans, and a relentless drive to keep you accountable and get results.',
  },
]
