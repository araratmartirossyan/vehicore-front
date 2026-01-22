import apiClient from '../client'
import { API_ENDPOINTS } from '../../utils/constants'
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ConfirmEmailResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/api.d'

export const authRepository = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
    return response.data
  },

  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await apiClient.post<SignUpResponse>(API_ENDPOINTS.AUTH.SIGNUP, data)
    return response.data
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    )
    return response.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const url = `${API_ENDPOINTS.AUTH.RESET_PASSWORD}?token=${encodeURIComponent(data.token)}`
    const response = await apiClient.post<ResetPasswordResponse>(url, { password: data.password })
    return response.data
  },

  confirmEmail: async (token: string): Promise<ConfirmEmailResponse> => {
    const url = `${API_ENDPOINTS.AUTH.CONFIRM_EMAIL}?token=${encodeURIComponent(token)}`
    const response = await apiClient.get<ConfirmEmailResponse>(url)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    )
    return response.data
  },

  logout: async (): Promise<void> => {
    // This backend may not expose a logout endpoint; treat logout as client-side token clear.
    return
  },
}
