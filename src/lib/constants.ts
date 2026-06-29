// Single source of truth for the MealWarden backend base URL.
// Override at build/runtime via NEXT_PUBLIC_API_URL (e.g. for staging).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://mealwarden-backend-production.up.railway.app'
