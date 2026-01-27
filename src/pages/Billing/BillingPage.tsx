import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { useBilling } from '../../hooks/useBilling'
import { useApiKeys } from '../../hooks/useApiKeys'
import { useUsage } from '../../hooks/useUsage'
import { CreateApiKeyModal } from '../../components/billing/CreateApiKeyModal'
import type { Package } from '../../api/types/api.d'

export function BillingPage() {
  const { products, packages, loading, getProducts, getPackages, createCheckout } = useBilling()
  const { apiKeys, listApiKeys } = useApiKeys()
  const { overview, loading: usageLoading, error: usageError, refresh: refreshUsage } = useUsage()
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('')
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

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
      setCheckoutError('Please select an API key first')
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
        'Unable to create checkout session. Please try again.'
      setCheckoutError(errorMessage)
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

  // Group packages by product
  const packagesByProduct = packages.reduce((acc, pkg) => {
    const product = pkg.product || 'other'
    if (!acc[product]) {
      acc[product] = []
    }
    acc[product].push(pkg)
    return acc
  }, {} as Record<string, Package[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Purchase credits for your API keys</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Products</CardTitle>
          <CardDescription>Products currently available for purchase</CardDescription>
        </CardHeader>
        <CardContent>
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
            <p className="text-sm text-muted-foreground">No products available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select API Key</CardTitle>
          <CardDescription>
            Choose which API key to attach the purchased package to, or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkoutError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {checkoutError}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <select
                id="apiKey"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedApiKeyId}
                onChange={(e) => setSelectedApiKeyId(e.target.value)}
                disabled={apiKeys.length === 0}
              >
                {apiKeys.length === 0 ? (
                  <option value="">No API keys available</option>
                ) : (
                  <>
                    <option value="">Select an API key</option>
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
              className="mt-6"
            >
              Create New Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && packages.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">No packages available</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(packagesByProduct).map(([product, productPackages]) => (
          <Card key={product}>
            <CardHeader>
              <CardTitle className="capitalize">{product.replace('-', ' ')} Packages</CardTitle>
              <CardDescription>Available credit packages for {product}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productPackages
                  .filter((pkg) => pkg.active !== false)
                  .map((pkg) => (
                    <div
                      key={pkg.id || pkg._id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="text-2xl font-bold">
                          {formatPrice(pkg.priceCents, pkg.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pkg.credits.toLocaleString()} credits
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleBuyPackage(pkg)}
                        disabled={!selectedApiKeyId || loading}
                      >
                        Buy Now
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <CreateApiKeyModal
        open={isCreateKeyModalOpen}
        onOpenChange={setIsCreateKeyModalOpen}
        onSuccess={handleCreateKeySuccess}
      />

      <Card>
        <CardHeader>
          <CardTitle>Purchases</CardTitle>
          <CardDescription>Purchase history from `/api/usage`</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {usageError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {usageError}
            </div>
          )}
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={() => refreshUsage()} disabled={usageLoading}>
              Refresh purchases
            </Button>
          </div>
          {usageLoading && !overview ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : overview?.purchases?.length ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Credits</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Paid At</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">API Key</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.purchases.map((p, idx) => (
                    <tr key={`${p.id || p._id || p.packageId || 'purchase'}-${idx}`} className="border-b">
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
            <p className="text-sm text-muted-foreground">No purchases found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
