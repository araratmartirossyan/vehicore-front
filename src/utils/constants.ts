export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://vehicore-api.dev-stage.fyi'

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/sign-up',
    LOGIN: '/api/auth/sign-in',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    // NOTE: backend uses the same route as "forgot password" with `?token=...`
    RESET_PASSWORD: '/api/auth/forgot-password',
    CONFIRM_EMAIL: '/api/auth/confirm-email',
    VERIFICATION_EMAIL: '/api/auth/verification-email',
    VALIDATE_TOKEN: '/api/token/validate',
    VALIDATE_PASSWORD: '/api/auth/validate-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  USER: {
    ME: '/api/users/me',
    BY_ID: '/api/users/:id',
  },
  BILLING: {
    PRODUCTS: '/api/billing/products',
    PACKAGES: '/api/packages',
    CHECKOUT: '/api/billing/checkout',
  },
  API_KEYS: {
    LIST: '/api/keys',
    CREATE: '/api/keys',
    DELETE: '/api/keys/:id/revoke',
  },
  USAGE: {
    OVERVIEW: '/api/usage',
  },
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const
