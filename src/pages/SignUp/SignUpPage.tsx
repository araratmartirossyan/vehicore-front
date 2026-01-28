import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { PasswordInput } from '../../components/ui/password-input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../hooks/useAuth'
import { signUpSchema, type SignUpFormData } from '../../utils/validators'
import { useI18n } from '../../i18n'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, isAuthenticated, authLoading, authError } = useAuth()
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const { t } = useI18n()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  useEffect(() => {
    if (isAuthenticated && !showEmailConfirmation) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, showEmailConfirmation])

  const onSubmit = async (data: SignUpFormData) => {
    const { confirmPassword, ...rest } = data
    void confirmPassword
    try {
      await signUp({
        ...rest,
        role: 'client',
      })
      // Show email confirmation message instead of redirecting
      setShowEmailConfirmation(true)
      reset()
    } catch (error) {
      // Error handled by store
    }
  }

  if (showEmailConfirmation) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle>{t('signup.checkEmailTitle')}</CardTitle>
            <CardDescription>{t('signup.checkEmailSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('signup.checkEmailBody')}</p>
            <div className="flex flex-col gap-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  {t('signup.goToLogin')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowEmailConfirmation(false)}
              >
                {t('signup.backToSignup')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>{t('signup.title')}</CardTitle>
          <CardDescription>{t('signup.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {authError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('signup.firstName')}</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('signup.lastName')}</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <PasswordInput
                id="password"
                placeholder="Enter a strong password"
                {...register('password')}
              />
              <p className="text-xs text-muted-foreground">{t('signup.passwordHint')}</p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Re-enter your password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? t('signup.submitting') : t('signup.submit')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('signup.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80">
              {t('signup.signInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
