import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../hooks/useAuth'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../utils/validators'
import { useI18n } from '../../i18n'

export function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)
  const { forgotPassword, authLoading } = useAuth()
  const { t } = useI18n()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email)
      setSuccess(true)
    } catch (error) {
      // Error handled by store
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle>{t('forgotPassword.checkEmailTitle')}</CardTitle>
            <CardDescription>{t('forgotPassword.checkEmailSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('forgotPassword.checkEmailBody')}
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                {t('forgotPassword.backToLogin')}
              </Button>
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
          <CardTitle>{t('forgotPassword.title')}</CardTitle>
          <CardDescription>{t('forgotPassword.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('forgotPassword.email')}</Label>
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
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('forgotPassword.rememberPrompt')}{' '}
            <Link to="/login" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80">
              {t('login.signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
