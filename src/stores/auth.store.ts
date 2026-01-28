import { createStore, createEffect, sample } from 'effector'
import { authService } from '../api/services/auth.service'
import { userRepository } from '../api/repositories/user.repo'
import { STORAGE_KEYS } from '../utils/constants'
import { getStorageItem } from '../utils/helpers'
import type { User, LoginRequest, SignUpRequest, ResetPasswordRequest, ChangePasswordRequest, ApiError } from '../api/types/api.d'

// Events
export const loginFx = createEffect<LoginRequest, User>((credentials) =>
  authService.login(credentials).then((response) => response.user)
)

// Signup does NOT authenticate the user; email confirmation required.
export const signUpFx = createEffect<SignUpRequest, void>((data) =>
  authService.signUp(data).then(() => undefined)
)

export const forgotPasswordFx = createEffect<string, void>((email) =>
  authService.forgotPassword(email).then(() => undefined)
)

export const resetPasswordFx = createEffect<ResetPasswordRequest, void>((data) =>
  authService.resetPassword(data).then(() => undefined)
)

export const changePasswordFx = createEffect<ChangePasswordRequest, void>((data) =>
  authService.changePassword(data).then(() => undefined)
)

export const logoutFx = createEffect<void, void>(() => authService.logout())

export const checkAuthFx = createEffect<void, boolean>(() => {
  const token = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
  return !!token
})

export const getCurrentUserFx = createEffect<void, User>(() => userRepository.getMe())

// Stores
export const $user = createStore<User | null>(null)
export const $isAuthenticated = createStore<boolean>(false)
export const $authLoading = createStore<boolean>(false)
export const $authError = createStore<string | null>(null)

// Update stores on login
sample({
  clock: loginFx.doneData,
  fn: (user) => user,
  target: $user,
})

sample({
  clock: loginFx.done,
  fn: () => true,
  target: $isAuthenticated,
})

// Update stores on signup
sample({
  clock: signUpFx.done,
  fn: () => false,
  target: $isAuthenticated,
})

// Update stores on logout
sample({
  clock: logoutFx.done,
  fn: () => null,
  target: $user,
})

sample({
  clock: logoutFx.done,
  fn: () => false,
  target: $isAuthenticated,
})

// Handle loading states
sample({
  clock: [loginFx.pending, signUpFx.pending, logoutFx.pending, changePasswordFx.pending],
  fn: (pending) => pending,
  target: $authLoading,
})

// Handle errors
sample({
  clock: [loginFx.failData, signUpFx.failData],
  fn: (error) => {
    const e = error as Error & { response?: { data?: ApiError } }
    const apiMessage = e.response?.data?.message
    return apiMessage || e.message || 'An error occurred'
  },
  target: $authError,
})

sample({
  clock: [loginFx.done, signUpFx.done, logoutFx.done],
  fn: () => null,
  target: $authError,
})

// Initialize auth state on app start
sample({
  clock: checkAuthFx.doneData,
  fn: (hasToken) => hasToken,
  target: $isAuthenticated,
})

// When token exists on load, fetch current user so Settings/Header show name and email
sample({
  clock: checkAuthFx.doneData,
  filter: (hasToken) => hasToken === true,
  target: getCurrentUserFx,
})

sample({
  clock: getCurrentUserFx.doneData,
  fn: (user) => user,
  target: $user,
})

sample({
  clock: getCurrentUserFx.fail,
  fn: () => null,
  target: $user,
})

checkAuthFx()
