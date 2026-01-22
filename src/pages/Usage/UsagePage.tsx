import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useUsage } from '../../hooks/useUsage'

export function UsagePage() {
  const { overview, loading, error, refresh } = useUsage()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // Prevent double-fetch in React.StrictMode (dev)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatDateTime = (value?: string) => {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage</h1>
        <p className="text-muted-foreground">Your API keys, credits, and purchases</p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && !overview ? (
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current usage status from the API</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium">{overview?.status || '—'}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
                Refresh
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Remaining / purchased credits by product</CardDescription>
              </CardHeader>
              <CardContent>
                {overview?.products?.length ? (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Remaining</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Purchased</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.products.map((p, idx) => (
                          <tr key={`${p.product || 'product'}-${idx}`} className="border-b">
                            <td className="px-4 py-3 text-sm">{p.product || '—'}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              {typeof p.remainingCredits === 'number' ? p.remainingCredits : '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {typeof p.purchasedCredits === 'number' ? p.purchasedCredits : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No product usage data.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Keys linked to your account</CardDescription>
              </CardHeader>
              <CardContent>
                {overview?.keys?.length ? (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Prefix</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.keys.map((k, idx) => (
                          <tr key={`${k.id || k._id || k.prefix || 'key'}-${idx}`} className="border-b">
                            <td className="px-4 py-3 text-sm">{k.name || '—'}</td>
                            <td className="px-4 py-3 text-sm font-mono">{k.prefix || '—'}</td>
                            <td className="px-4 py-3 text-sm">{k.status || '—'}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {formatDateTime(k.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No keys found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
              <CardDescription>Credits granted per purchase</CardDescription>
            </CardHeader>
            <CardContent>
              {overview?.purchases?.length ? (
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
      )}
    </div>
  )
}
