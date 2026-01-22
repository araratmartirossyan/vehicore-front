// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface SignUpRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'client' | 'admin' | 'manager' | string
}

export interface SignUpResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  success: boolean
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ResetPasswordResponse {
  message: string
  success: boolean
}

export interface ConfirmEmailResponse {
  message: string
  success: boolean
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
  success: boolean
}

// User types
export interface User {
  id?: string
  _id?: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

// API Error types
export interface ApiError {
  message: string
  statusCode?: number
  errors?: Record<string, string[]>
}

// Billing types
export interface BillingInfo {
  plan: string
  status: string
  nextBillingDate?: string
}

export interface BillingHistoryItem {
  id: string
  amount: number
  date: string
  status: string
}

// API Key types
export interface ApiKey {
  id?: string
  _id?: string
  name: string
  key: string
  createdAt: string
  lastUsedAt?: string
  // Some APIs keep revoked keys in list responses; these fields help us hide them in UI.
  revoked?: boolean
  isRevoked?: boolean
  revokedAt?: string
  status?: string
  active?: boolean
}

export interface CreateApiKeyRequest {
  name: string
}

// Usage types
export interface UsageStats {
  totalRequests: number
  period: string
  limit?: number
}

export interface UsageHistoryItem {
  date: string
  requests: number
}

// Usage overview (Postman: GET /api/usage)
// Keep fields optional to stay compatible with backend changes.
export interface UsageOverview {
  status?: string
  keys?: Array<{
    id?: string
    _id?: string
    name?: string
    prefix?: string
    createdAt?: string
    status?: string
  }>
  products?: Array<{
    product?: string
    remainingCredits?: number
    purchasedCredits?: number
  }>
  purchases?: Array<{
    id?: string
    _id?: string
    apiKeyId?: string
    createdAt?: string
    paidAt?: string
    creditsGranted?: number
    packageId?: string
    product?: string
  }>
}
