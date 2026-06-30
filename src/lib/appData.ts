// Single source of truth for marketing content, kept in sync with the MealWarden
// app (src/screens/PaywallScreen.tsx tiers + utils/guardian.ts guardians).
// Update here and every website section stays factual.

export type Plan = {
  key: string
  name: string
  emoji: string
  tagline: string
  // Original (full) prices
  originalMonthly: number
  originalAnnual: number
  // Launch offer prices (valid until Aug 31 2026)
  launchMonthly: number
  launchAnnual: number
  // Convenience aliases (used by legacy components — equals launchMonthly/launchAnnual)
  monthly: number
  annual: number
  // Monthly AI limits
  genLimit: number       // diet generations / month
  uploadLimit: number    // plan uploads / month
  popular?: boolean
  features: string[]
  soon?: string[]        // upcoming features shown with "Coming soon" badge
}

// Mirrors PaywallScreen PLANS exactly.
// Launch offer valid until August 31, 2026.
export const PLANS: Plan[] = [
  {
    key: 'free', name: 'Free', emoji: '🌱', tagline: 'Get started',
    originalMonthly: 0,   launchMonthly: 0,
    originalAnnual:  0,   launchAnnual:  0,
    monthly: 0, annual: 0,
    genLimit: 1, uploadLimit: 1,
    features: [
      '1 diet generation / month',
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
    key: 'silver', name: 'Silver', emoji: '🥈', tagline: 'For consistency',
    originalMonthly: 199, launchMonthly: 149,
    originalAnnual: 2388, launchAnnual: 1199,
    monthly: 149, annual: 1199,
    genLimit: 3, uploadLimit: 2,
    features: [
      '3 diet generations + 2 uploads / month',
      'Everything in Free',
      'Ad-free experience',
      'Full recipes & prep tasks',
      'Progress analytics',
    ],
    soon: ['WhatsApp morning digest', 'WhatsApp night reminder'],
  },
  {
    key: 'premium', name: 'Premium', emoji: '💎', tagline: 'Most loved', popular: true,
    originalMonthly: 349, launchMonthly: 249,
    originalAnnual: 4188, launchAnnual: 1999,
    monthly: 249, annual: 1999,
    genLimit: 5, uploadLimit: 5,
    features: [
      '5 diet generations + 5 uploads / month',
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
    key: 'gold', name: 'Gold', emoji: '👑', tagline: 'Full power',
    originalMonthly: 749, launchMonthly: 599,
    originalAnnual: 8988, launchAnnual: 4799,
    monthly: 599, annual: 4799,
    genLimit: 10, uploadLimit: 10,
    features: [
      '10 diet generations + 10 uploads / month',
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

// Launch offer end date — keep in sync with PaywallScreen.tsx
export const LAUNCH_END = new Date('2026-08-31T23:59:59+05:30')

export function launchDaysLeft(): number {
  const diff = LAUNCH_END.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

// Credit packs — keep in sync with mwCredits.controller.ts
export const CREDIT_PACKS = [
  { key: 'single_gen',    label: '1 Diet Generation',        desc: '⚡ Adds 1 extra generate credit',         price: 49  },
  { key: 'single_upload', label: '1 Plan Upload',            desc: '📤 Adds 1 extra upload credit',           price: 69  },
  { key: 'bundle',        label: '2 Generations + 1 Upload', desc: '⚡⚡ + 📤  Best value bundle',            price: 99, bestValue: true },
] as const

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
