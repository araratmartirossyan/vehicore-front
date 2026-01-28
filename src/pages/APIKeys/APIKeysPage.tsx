import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { useApiKeys } from '../../hooks/useApiKeys'
import { useToast } from '../../components/ui/toast'
import type { CreateApiKeyResponse } from '../../api/types/api.d'
import { useI18n } from '../../i18n'

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
})

type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>

export function APIKeysPage() {
  const { apiKeys, loading, newlyCreatedKey, listApiKeys, createApiKey, deleteApiKey, clearNewlyCreatedKey } =
    useApiKeys()
  const { showToast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState<CreateApiKeyResponse | null>(null)
  const [userActionError, setUserActionError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)
  const { t } = useI18n()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
  })

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      listApiKeys()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (newlyCreatedKey) {
      setShowNewKey(newlyCreatedKey)
      setIsCreateDialogOpen(false)
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlyCreatedKey])

  const onSubmit = async (data: CreateApiKeyFormData) => {
    setUserActionError(null)
    try {
      await createApiKey({ name: data.name })
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to create API key. Please check the endpoint or try again.'
      setUserActionError(errorMessage)
      showToast({
        title: t('apiKeys.createErrorTitle') || 'Failed to create API key',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        t('apiKeys.deleteConfirm') ||
          'Are you sure you want to delete this API key? This action cannot be undone.'
      )
    ) {
      setUserActionError(null)
      try {
        await deleteApiKey(id)
        showToast({
          title: t('apiKeys.deleteSuccessTitle') || 'API key deleted',
          description: t('apiKeys.deleteSuccessDescription') || 'The API key was deleted successfully.',
        })
      } catch (err) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to delete API key. Please try again.'
        setUserActionError(errorMessage)
        showToast({
          title: t('apiKeys.deleteErrorTitle') || 'Failed to delete API key',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
  }

  const handleCopy = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedKeyId(id)
      setTimeout(() => setCopiedKeyId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t('apiKeys.never') || 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('apiKeys.title')}</h1>
          <p className="text-muted-foreground">{t('apiKeys.subtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>{t('apiKeys.createButton')}</Button>
      </div>

      {userActionError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{userActionError}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserActionError(null)}
                className="h-6 w-6 p-0"
              >
                {t('apiKeys.errorDismiss') || '×'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showNewKey && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              {t('apiKeys.createdTitle')}
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              {t('apiKeys.createdSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('apiKeys.createdLabel')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={showNewKey.apiKey}
                  readOnly
                  className="font-mono text-sm bg-background"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(showNewKey.apiKey, showNewKey.id || showNewKey._id || '')}
                >
                  {copiedKeyId === (showNewKey.id || showNewKey._id)
                    ? t('apiKeys.copied')
                    : t('apiKeys.copy')}
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewKey(null)
                clearNewlyCreatedKey()
              }}
            >
              {t('apiKeys.savedButton')}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && apiKeys.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('apiKeys.empty')}</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t('apiKeys.table.name')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t('apiKeys.table.key')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t('apiKeys.table.created')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    {t('apiKeys.table.lastUsed')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    {t('apiKeys.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => {
                  const keyId = key.id || key._id || ''
                  return (
                    <tr key={keyId} className="border-b">
                      <td className="px-4 py-3 text-sm">{key.name}</td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {key.prefix ? (
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[200px]">{key.prefix}...</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleCopy(key.prefix || '', keyId)}
                            >
                              {copiedKeyId === keyId ? t('apiKeys.copied') : t('apiKeys.copy')}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {t('apiKeys.table.hiddenKey')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(key.lastTimeUsedAt ?? key.lastUsedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(keyId)}
                          disabled={!keyId}
                        >
                          {t('apiKeys.delete')}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('apiKeys.dialog.title')}</DialogTitle>
            <DialogDescription>{t('apiKeys.dialog.description')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('apiKeys.dialog.nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('apiKeys.dialog.namePlaceholder')}
                {...register('name')}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  reset()
                }}
                disabled={loading}
              >
                {t('apiKeys.dialog.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('apiKeys.dialog.submitting') : t('apiKeys.dialog.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
