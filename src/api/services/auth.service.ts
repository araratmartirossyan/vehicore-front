import { authRepository } from '../repositories/auth.repo'
import { STORAGE_KEYS } from '../../utils/constants'
import { setStorageItem, removeStorageItem } from '../../utils/helpers'
import type { LoginRequest, SignUpRequest, ResetPasswordRequest, ChangePasswordRequest } from '../types/api.d'

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await authRepository.login(credentials)

    // Store tokens
    if (response.accessToken) {
      setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken)
    }
    if (response.refreshToken) {
      setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
    }

    return response
  },

  signUp: async (data: SignUpRequest) => {
    const response = await authRepository.signUp(data)
    /**
     * Signup requires email confirmation before login.
     * Do NOT store tokens or mark the user as authenticated here.
     * Also clear any existing tokens to avoid accidental "logged-in" state.
     */
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)

    return response
  },

  forgotPassword: async (email: string) => {
    return await authRepository.forgotPassword({ email })
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    return await authRepository.resetPassword(data)
  },

  changePassword: async (data: ChangePasswordRequest) => {
    return await authRepository.changePassword(data)
  },

  logout: async () => {
    try {
      await authRepository.logout()
    } catch {
      // Always succeed logout client-side (backend may not support logout)
    } finally {
      // Always clear tokens even if API call fails
      removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
      removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
    }
  },
}
