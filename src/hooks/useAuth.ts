import { useUnit } from 'effector-react'
import {
  $user,
  $isAuthenticated,
  $authLoading,
  $authError,
  loginFx,
  signUpFx,
  logoutFx,
  forgotPasswordFx,
  resetPasswordFx,
  changePasswordFx,
} from '../stores/auth.store'
import type { LoginRequest, SignUpRequest, ResetPasswordRequest, ChangePasswordRequest } from '../api/types/api.d'

export function useAuth() {
  const user = useUnit($user)
  const isAuthenticated = useUnit($isAuthenticated)
  const authLoading = useUnit($authLoading)
  const authError = useUnit($authError)

  return {
    user,
    isAuthenticated,
    authLoading,
    authError,
    login: (credentials: LoginRequest) => loginFx(credentials),
    signUp: (data: SignUpRequest) => signUpFx(data),
    logout: () => logoutFx(),
    forgotPassword: (email: string) => forgotPasswordFx(email),
    resetPassword: (data: ResetPasswordRequest) => resetPasswordFx(data),
    changePassword: (data: ChangePasswordRequest) => changePasswordFx(data),
  }
}
