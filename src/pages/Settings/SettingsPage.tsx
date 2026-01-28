import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { PasswordInput } from '../../components/ui/password-input'
import { Label } from '../../components/ui/label'
import { useAuth } from '../../hooks/useAuth'
import { changePasswordSchema, type ChangePasswordFormData } from '../../utils/validators'
import { useToast } from '../../components/ui/toast'
import { useI18n } from '../../i18n'

export function SettingsPage() {
  const { user, changePassword, authLoading } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const { showToast } = useToast()
  const { t } = useI18n()

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (user?._id || user?.id ? `User ${user?._id || user?.id}` : 'N/A')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError(null)
    setSuccess(false)
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      setSuccess(true)
      showToast({
        title: t('settings.passwordUpdated') || 'Password updated',
        description: t('settings.passwordUpdatedDescription') || 'Your password has been changed successfully.',
      })
      reset()
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to change password. Please check your current password and try again.'
      setError(errorMessage)
      showToast({
        title: 'Failed to change password',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div>
        <div className="flex border-b border-border mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            >
            {t('settings.tab.profile')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'password'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            >
            {t('settings.tab.password')}
          </button>
        </div>

        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profileTitle')}</CardTitle>
              <CardDescription>{t('settings.profileSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('settings.name')}</label>
                <p className="text-sm text-muted-foreground">{displayName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">{t('settings.email')}</label>
                <p className="text-sm text-muted-foreground">{user?.email || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.passwordTitle')}</CardTitle>
              <CardDescription>{t('settings.passwordSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                  Password changed successfully!
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">{t('settings.currentPassword')}</Label>
                  <PasswordInput
                    id="oldPassword"
                    placeholder="Enter your current password"
                    {...register('oldPassword')}
                    disabled={authLoading}
                  />
                  {errors.oldPassword && (
                    <p className="text-sm text-destructive">{errors.oldPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                  <PasswordInput
                    id="newPassword"
                    placeholder="Enter a strong password"
                    {...register('newPassword')}
                    disabled={authLoading}
                  />
                  <p className="text-xs text-muted-foreground">{t('settings.passwordHint')}</p>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Re-enter your new password"
                    {...register('confirmPassword')}
                    disabled={authLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={authLoading}>
                  {authLoading ? t('settings.submitting') : t('settings.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
