'use client'

// Thin client for the shared MealWarden backend. Attaches the JWT stored by
// AuthContext (localStorage 'mw_user'.token) so the website reads/writes the
// same data as the mobile app. GET responses are cached (memory + session) so
// navigating between pages — and back — is instant instead of refetching.

const API = process.env.NEXT_PUBLIC_API_URL || 'https://mealwarden-backend-production.up.railway.app'

export function authToken(): string {
  try {
    const s = localStorage.getItem('mw_user')
    return s ? (JSON.parse(s).token || '') : ''
  } catch { return '' }
}

async function req(path: string, opts: RequestInit = {}): Promise<any> {
  const t = authToken()
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`)
  return json
}

const unwrap = (j: any) => (j && typeof j === 'object' && 'data' in j ? j.data : j)

// ── Lightweight GET cache (memory + sessionStorage) ──────────────────────────
const TTL = 45_000 // 45s — fresh enough, makes back/forward navigation instant
const mem = new Map<string, { t: number; data: any }>()
const inflight = new Map<string, Promise<any>>()

function readCache(key: string): any {
  const m = mem.get(key)
  if (m && Date.now() - m.t < TTL) return m.data
  try {
    const raw = sessionStorage.getItem('mwc:' + key)
    if (raw) {
      const p = JSON.parse(raw)
      if (Date.now() - p.t < TTL) { mem.set(key, p); return p.data }
    }
  } catch {}
  return undefined
}
function writeCache(key: string, data: any) {
  const v = { t: Date.now(), data }
  mem.set(key, v)
  try { sessionStorage.setItem('mwc:' + key, JSON.stringify(v)) } catch {}
}
function clearCache() {
  mem.clear()
  try {
    Object.keys(sessionStorage).filter(k => k.startsWith('mwc:')).forEach(k => sessionStorage.removeItem(k))
  } catch {}
}

// Cached GET: returns cached data instantly when fresh; de-dupes concurrent calls.
async function cget(path: string): Promise<any> {
  const hit = readCache(path)
  if (hit !== undefined) return hit
  if (inflight.has(path)) return inflight.get(path)!
  const p = (async () => {
    try {
      const data = unwrap(await req(path))
      writeCache(path, data)
      return data
    } finally { inflight.delete(path) }
  })()
  inflight.set(path, p)
  return p
}

// Mutations invalidate the cache so the next read is fresh.
async function mutate(path: string, opts: RequestInit): Promise<any> {
  const out = unwrap(await req(path, opts))
  clearCache()
  return out
}

export const api = {
  // Profile
  getProfile:    () => cget('/api/auth/profile'),
  updateProfile: (payload: any) => mutate('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  exportData:    async () => unwrap(await req('/api/auth/export')),
  deleteAccount: async () => unwrap(await req('/api/auth/account', { method: 'DELETE' })),

  // Subscription
  getSubscription: () => cget('/api/subscription'),
  activateCode:    (promoCode: string) => mutate('/api/subscription/activate', { method: 'POST', body: JSON.stringify({ promoCode }) }),

  // Plans & meals
  getDietPlans:   () => cget('/api/diet-plans'),
  generateDiet:   (payload: any) => mutate('/api/diet-plans/generate', { method: 'POST', body: JSON.stringify(payload) }),
  activatePlan:   (id: string) => mutate(`/api/diet-plans/${id}/activate`, { method: 'PUT' }),
  getTodaysMeals: () => cget('/api/meals/today'),
  getWeeklyMeals: () => cget('/api/meals/weekly'),
  getTodaysLogs:  () => cget('/api/meal-logs/today'),
  toggleLog:      (payload: any) => mutate('/api/meal-logs/toggle', { method: 'POST', body: JSON.stringify(payload) }),
  getRecipe:      (mealId: string) => cget(`/api/meals/${mealId}/recipe`),

  // Water
  getWater: () => cget('/api/water/today'),
  setWater: (glasses: number) => mutate('/api/water', { method: 'POST', body: JSON.stringify({ glasses }) }),

  // Weight
  getWeightHistory: () => cget('/api/weight/history'),
  getWeightStats:   () => cget('/api/weight/stats'),
  logWeight:        (data: any) => mutate('/api/weight', { method: 'POST', body: JSON.stringify(data) }),

  // Prep tasks
  getPrepToday: () => cget('/api/prep-tasks/today'),
  completePrep: (id: string) => mutate(`/api/prep-tasks/${id}/complete`, { method: 'PUT' }),

  // Grocery
  getGrocery:        (refresh = false) => (refresh ? mutate('/api/grocery?refresh=1', { method: 'GET' }) : cget('/api/grocery')),
  setGroceryChecked: (keys: string[]) => mutate('/api/grocery/checked', { method: 'PUT', body: JSON.stringify({ keys }) }),

  // Analytics
  getWeeklyAnalytics:  () => cget('/api/analytics/weekly'),
  getAnalyticsSummary: (period = 'week') => cget(`/api/analytics/summary?period=${period}`),
  getStreak:           () => cget('/api/analytics/streak'),

  // Streak — MealWarden Mates (friends) + leaderboard
  friendsLeaderboard:  () => cget('/api/friends/leaderboard'),
  friendRequests:      () => cget('/api/friends/requests'),
  searchUsers:         (q: string) => req(`/api/friends/search?q=${encodeURIComponent(q)}`).then(unwrap),
  sendFriendRequest:   (userId: string) => mutate('/api/friends/request', { method: 'POST', body: JSON.stringify({ userId }) }),
  respondFriend:       (id: string, action: 'accept' | 'reject') => mutate('/api/friends/respond', { method: 'POST', body: JSON.stringify({ id, action }) }),

  // Assistant — never cached
  askAssistant: (question: string, guardian?: string, history?: any[], persona?: string) =>
    mutate('/api/assistant/ask', { method: 'POST', body: JSON.stringify({ question, guardian, history, persona }) }),

  clearCache,
}
