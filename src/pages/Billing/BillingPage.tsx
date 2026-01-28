import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { useBilling } from '../../hooks/useBilling'
import { useApiKeys } from '../../hooks/useApiKeys'
import { useUsage } from '../../hooks/useUsage'
import { CreateApiKeyModal } from '../../components/billing/CreateApiKeyModal'
import { useToast } from '../../components/ui/toast'
import type { Package } from '../../api/types/api.d'
import { useI18n } from '../../i18n'

export function BillingPage() {
  const { products, packages, loading, getProducts, getPackages, createCheckout } = useBilling()
  const { apiKeys, listApiKeys } = useApiKeys()
  const { overview, loading: usageLoading, error: usageError, refresh: refreshUsage } = useUsage()
  const { showToast } = useToast()
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('')
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'packages' | 'purchases'>('packages')
  const hasLoadedRef = useRef(false)
  const { t } = useI18n()

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      getProducts()
      getPackages()
      listApiKeys()
      refreshUsage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Auto-select first API key if available and none selected
    if (apiKeys.length > 0 && !selectedApiKeyId) {
      const firstKey = apiKeys[0]
      if (firstKey) {
        const keyId = firstKey.id || firstKey._id || ''
        if (keyId) {
          setSelectedApiKeyId(keyId)
        }
      }
    }
  }, [apiKeys, selectedApiKeyId])

  const handleBuyPackage = async (pkg: Package) => {
    if (!selectedApiKeyId) {
      setCheckoutError(t('billing.selectApiKeyError') || 'Please select an API key first')
      showToast({
        title: t('billing.selectApiKeyErrorTitle') || 'Select an API key',
        description:
          t('billing.selectApiKeyErrorDescription') ||
          'Please choose an API key before purchasing a package.',
        variant: 'destructive',
      })
      return
    }

    setCheckoutError(null)
    try {
      const response = await createCheckout({
        packageId: pkg.id || pkg._id || '',
        apiKeyId: selectedApiKeyId,
      })
      // Redirect to Stripe checkout
      window.location.href = response.url
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        (t('billing.checkoutErrorDefault') as string) ||
        'Unable to create checkout session. Please try again.'
      setCheckoutError(errorMessage)
      showToast({
        title: t('billing.checkoutErrorTitle') || 'Checkout failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleCreateKeySuccess = () => {
    listApiKeys()
  }

  const formatPrice = (priceCents: number, currency: string) => {
    const amount = priceCents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const formatDateTime = (value?: string) => {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString()
  }

  // Visible (non-disabled) packages
  const visiblePackages = packages.filter((pkg) => pkg.active !== false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('billing.title')}</h1>
        <p className="text-muted-foreground">{t('billing.subtitle')}</p>
      </div>

      {/* Tabs for packages and purchases */}
      <div>
        <div className="flex border-b border-border mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'packages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            >
            {t('billing.tab.packages')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'purchases'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            >
            {t('billing.tab.purchases')}
          </button>
        </div>

        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-stretch">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{t('billing.supportedProductsTitle')}</CardTitle>
                  <CardDescription>{t('billing.supportedProductsSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {products.length ? (
                    <div className="flex flex-wrap gap-2">
                      {products
                        .filter((p) => p.active !== false)
                        .map((p) => (
                          <span
                            key={p.id || p._id || p.slug}
                            className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
                          >
                            {p.name || p.slug}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('billing.noProducts')}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{t('billing.selectApiKeyTitle')}</CardTitle>
                  <CardDescription>{t('billing.selectApiKeySubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {checkoutError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {checkoutError}
                    </div>
                  )}
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[220px] flex-1 space-y-2">
                      <Label htmlFor="apiKey">{t('billing.selectApiKeyLabel')}</Label>
                      <select
                        id="apiKey"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedApiKeyId}
                        onChange={(e) => setSelectedApiKeyId(e.target.value)}
                        disabled={apiKeys.length === 0}
                      >
                        {apiKeys.length === 0 ? (
                          <option value="">{t('billing.noApiKeysOption')}</option>
                        ) : (
                          <>
                            <option value="">{t('billing.selectApiKeyPlaceholder')}</option>
                            {apiKeys.map((key) => {
                              const keyId = key.id || key._id || ''
                              const label = key.prefix ? `${key.name} (${key.prefix}...)` : key.name
                              return (
                                <option key={keyId} value={keyId}>
                                  {label}
                                </option>
                              )
                            })}
                          </>
                        )}
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateKeyModalOpen(true)}
                      className="shrink-0"
                    >
                      {t('billing.createNewKey')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {loading && packages.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            ) : visiblePackages.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-sm text-muted-foreground">
                    {t('billing.noPackages')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('billing.creditPackagesTitle')}</CardTitle>
                  <CardDescription>{t('billing.creditPackagesSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visiblePackages.map((pkg) => (
                      <Card key={pkg.id || pkg._id} className="flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{pkg.name}</CardTitle>
                          {pkg.product && (
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {pkg.product}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                          <p className="text-2xl font-bold">
                            {formatPrice(pkg.priceCents, pkg.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pkg.credits.toLocaleString()} {t('billing.creditsLabel')}
                          </p>
                          <Button
                            className="mt-auto w-full"
                            onClick={() => handleBuyPackage(pkg)}
                            disabled={!selectedApiKeyId || loading}
                          >
                            {t('billing.buyNow')}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{t('billing.purchasesTitle')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('billing.purchasesSubtitle')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshUsage()}
                disabled={usageLoading}
              >
                {t('billing.refreshPurchases')}
              </Button>
            </div>

            {usageError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-destructive">{usageError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {usageLoading && !overview ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : overview?.purchases?.length ? (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        {t('billing.purchasesTable.product')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        {t('billing.purchasesTable.credits')}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        {t('billing.purchasesTable.paidAt')}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        {t('billing.purchasesTable.apiKey')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.purchases.map((p, idx) => (
                      <tr
                        key={`${p.id || p._id || p.packageId || 'purchase'}-${idx}`}
                        className="border-b"
                      >
                        <td className="px-4 py-3 text-sm">{p.product || '—'}</td>
                        <td className="px-4 py-3 text-right text-sm">
                          {typeof p.creditsGranted === 'number' ? p.creditsGranted : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDateTime(p.paidAt || p.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{p.apiKeyId || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('billing.noPurchases')}</p>
            )}
          </div>
        )}
      </div>

      <CreateApiKeyModal
        open={isCreateKeyModalOpen}
        onOpenChange={setIsCreateKeyModalOpen}
        onSuccess={handleCreateKeySuccess}
      />
    </div>
  )
}
