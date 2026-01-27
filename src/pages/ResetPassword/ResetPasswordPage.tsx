import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { PasswordInput } from '../../components/ui/password-input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../hooks/useAuth'
import { resetPasswordSchema, type ResetPasswordFormData } from '../../utils/validators'

export function ResetPasswordPage() {
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resetPassword, authLoading } = useAuth()
  const token = searchParams.get('token') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  })

  // Set token from URL if available
  if (token) {
    setValue('token', token)
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({ token: data.token, password: data.newPassword })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      // Error handled by store
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle>Password reset successful</CardTitle>
            <CardDescription>Your password has been updated</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You can now sign in with your new password.
            </p>
            <Link to="/login">
              <Button className="w-full">Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!token && (
              <div className="space-y-2">
                <Label htmlFor="token">Reset Token</Label>
                <Input
                  id="token"
                  placeholder="Paste your reset token here"
                  {...register('token')}
                />
                {errors.token && (
                  <p className="text-sm text-destructive">{errors.token.message}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                placeholder="Enter a strong password"
                {...register('newPassword')}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters and include uppercase, lowercase, number, and
                special character
              </p>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Re-enter your new password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
