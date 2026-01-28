import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { authRepository } from '../../api/repositories/auth.repo'
import { useI18n } from '../../i18n'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()
  const token = searchParams.get('token') || ''

  useEffect(() => {
    if (!token) {
      setError('No confirmation token provided')
      setLoading(false)
      return
    }

    const confirmEmail = async () => {
      try {
        await authRepository.confirmEmail(token)
        setSuccess(true)
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to confirm email. The link may have expired.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [token])

  if (loading) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle>{t('confirmEmail.loadingTitle')}</CardTitle>
            <CardDescription>{t('confirmEmail.loadingSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader>
            <CardTitle>{t('confirmEmail.successTitle')}</CardTitle>
            <CardDescription>{t('confirmEmail.successSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground pb-4">
                {t('confirmEmail.successBody')}
              </p>
            </div>
            <Link to="/login">
              <Button className="w-full">{t('confirmEmail.goToLogin')}</Button>
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
          <CardTitle>{t('confirmEmail.errorTitle')}</CardTitle>
          <CardDescription>{t('confirmEmail.errorSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-sm text-destructive">{error}</p>
          <div className="flex flex-col gap-3">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                {t('confirmEmail.goToLogin')}
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="ghost" className="w-full">
                {t('confirmEmail.signUpAgain')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
