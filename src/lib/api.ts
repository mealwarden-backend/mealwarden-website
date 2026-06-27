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

function getRefreshToken(): string {
  try {
    const s = localStorage.getItem('mw_user')
    return s ? (JSON.parse(s).refreshToken || '') : ''
  } catch { return '' }
}

// ── Silent token rotation ─────────────────────────────────────────────────────
// One refresh call in-flight at a time. All concurrent 401s share the same
// promise — mirrors the Axios interceptor in the mobile app.
let _refreshing: Promise<string> | null = null

async function refreshSession(): Promise<string> {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    const rt = getRefreshToken()
    if (!rt) throw new Error('no_refresh_token')
    const res = await fetch(`${API}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error('refresh_failed')
    const newToken: string = json?.data?.token || json?.data?.accessToken || ''
    const newRefresh: string = json?.data?.refreshToken || rt
    if (!newToken) throw new Error('no_token_in_refresh_response')
    // Patch localStorage in-place so all subsequent calls pick up the new token.
    try {
      const saved = JSON.parse(localStorage.getItem('mw_user') || '{}')
      saved.token = newToken
      saved.refreshToken = newRefresh
      localStorage.setItem('mw_user', JSON.stringify(saved))
    } catch {}
    return newToken
  })().finally(() => { _refreshing = null })
  return _refreshing
}

function forceLogout(): void {
  try {
    localStorage.removeItem('mw_user')
    localStorage.removeItem('mw_profile')
    localStorage.removeItem('mw_diet_chart')
  } catch {}
  clearCache()
  // Let the current tick finish before redirecting so callers don't get a
  // torn state if they catch the error.
  setTimeout(() => { window.location.href = '/' }, 0)
}

// _retry flag prevents infinite loops: we only attempt one refresh per request.
async function req(path: string, opts: RequestInit = {}, _retry = false): Promise<any> {
  const t = authToken()
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(opts.headers || {}),
    },
  })

  // ── 401 → attempt silent refresh, then replay once ──
  if (res.status === 401 && !_retry) {
    try {
      await refreshSession()
      return req(path, opts, true)
    } catch {
      forceLogout()
      throw new Error('Session expired. Please log in again.')
    }
  }

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
  deleteDietPlan: (id: string) => mutate(`/api/diet-plans/${id}`, { method: 'DELETE' }),
  getTodaysMeals: () => cget('/api/meals/today'),
  getWeeklyMeals: () => cget('/api/meals/weekly'),
  getTodaysLogs:  () => cget('/api/meal-logs/today'),
  toggleLog:      (payload: any) => mutate('/api/meal-logs/toggle', { method: 'POST', body: JSON.stringify(payload) }),
  getRecipe:      (mealId: string) => cget(`/api/meals/${mealId}/recipe`),
  updateMeal:     (mealId: string, payload: any) => mutate(`/api/meals/${mealId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  estimateMeal:   (mealName: string) => mutate('/api/meals/estimate', { method: 'POST', body: JSON.stringify({ mealName }) }),

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

  // Coins + badges
  getCoinStatus: () => cget('/api/coins/status'),

  // Leagues — weekly points competition
  getWeeklyLeague: () => cget('/api/leagues/weekly'),

  // Streak — MealWarden Mates (friends) + leaderboard
  friendsLeaderboard:  () => cget('/api/friends/leaderboard'),
  friendRequests:      () => cget('/api/friends/requests'),
  searchUsers:         (q: string) => req(`/api/friends/search?q=${encodeURIComponent(q)}`).then(unwrap),
  sendFriendRequest:   (userId: string) => mutate('/api/friends/request', { method: 'POST', body: JSON.stringify({ userId }) }),
  respondFriend:       (id: string, action: 'accept' | 'reject') => mutate('/api/friends/respond', { method: 'POST', body: JSON.stringify({ id, action }) }),

  // Assistant — never cached
  askAssistant: (question: string, guardian?: string, history?: any[], persona?: string) =>
    mutate('/api/assistant/ask', { method: 'POST', body: JSON.stringify({ question, guardian, history, persona }) }),

  // Coins
  // Coins
  getCoinStatus:      () => cget('/api/coins/status'),
  getCoinLedger:      () => cget('/api/coins/ledger'),
  getCoinDailyEvents: () => cget('/api/coins/daily-events'),
  streakFreeze:       () => mutate('/api/coins/streak-freeze', { method: 'POST' }),

  // Circles
  getMyCircles:         () => cget('/api/circles/mine'),
  getCircleInvites:     () => cget('/api/circles/invites'),
  createCircle:         (data: { name: string; description?: string }) => mutate('/api/circles', { method: 'POST', body: JSON.stringify(data) }),
  joinCircle:           (code: string) => mutate('/api/circles/join', { method: 'POST', body: JSON.stringify({ code }) }),
  inviteToCircle:       (circleId: string, userId: string) => mutate(`/api/circles/${circleId}/invite`, { method: 'POST', body: JSON.stringify({ userId }) }),
  respondCircleInvite:  (inviteId: string, action: 'accept' | 'reject') => mutate('/api/circles/respond', { method: 'POST', body: JSON.stringify({ inviteId, action }) }),
  getCircleLeaderboard: (circleId: string) => cget(`/api/circles/${circleId}/leaderboard`),
  leaveCircle:          (circleId: string) => mutate(`/api/circles/${circleId}/leave`, { method: 'POST' }),

  // Referral
  getReferralCode:   () => cget('/api/referral/my-code'),
  getReferralStats:  () => cget('/api/referral/stats'),
  applyReferralCode: (code: string) => mutate('/api/referral/apply', { method: 'POST', body: JSON.stringify({ code }) }),

  clearCache,
}
