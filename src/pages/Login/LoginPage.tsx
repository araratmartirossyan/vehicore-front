import { useEffect } from 'react'
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
import { loginSchema, type LoginFormData } from '../../utils/validators'
import { useToast } from '../../components/ui/toast'
import { useI18n, SUPPORTED_LANGUAGES } from '../../i18n'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, authLoading, authError } = useAuth()
  const { showToast } = useToast()
  const { t, language, setLanguage } = useI18n()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (authError) {
      showToast({ title: 'Login failed', description: authError, variant: 'destructive' })
    }
  }, [authError, showToast])

  const onSubmit = async (data: LoginFormData) => {
    await login(data)
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{t('login.title')}</CardTitle>
              <CardDescription>{t('login.subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary font-medium underline underline-offset-4 hover:text-primary/80"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? `${t('login.signIn')}...` : t('login.signIn')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('login.signupPrompt')}{' '}
            <Link to="/signup" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80">
              {t('login.signupLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
