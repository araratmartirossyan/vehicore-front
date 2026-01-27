import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useUsage } from '../../hooks/useUsage'

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseMaybeDate(value?: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

function buildSparklinePath(points: Array<{ x: number; y: number }>, width: number, height: number): string {
  if (points.length === 0) return ''
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const dx = maxX - minX || 1
  const dy = maxY - minY || 1
  const mapX = (x: number) => ((x - minX) / dx) * width
  const mapY = (y: number) => height - ((y - minY) / dy) * height

  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(2)} ${mapY(p.y).toFixed(2)}`)
    .join(' ')
}

export function UsagePage() {
  const { overview, loading, error, refresh } = useUsage()
  const hasLoadedRef = useRef(false)

  // date range (defaults to last 30 days)
  const [from, setFrom] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return toDateInputValue(d)
  })
  const [to, setTo] = useState<string>(() => toDateInputValue(new Date()))

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

  const productsForDisplay = useMemo(() => {
    const fromProducts = (overview?.products || []).map((p) => p.product).filter(Boolean) as string[]
    const fromPurchases = (overview?.purchases || []).map((p) => p.product).filter(Boolean) as string[]
    return Array.from(new Set([...fromProducts, ...fromPurchases]))
  }, [overview])

  const productStats = useMemo(() => {
    // remaining (from overview.products) + purchased (sum from purchases)
    const remaining = new Map<string, number>()
    const purchased = new Map<string, number>()

    for (const p of overview?.products || []) {
      const product = p.product || ''
      if (!product) continue
      if (typeof p.remainingCredits === 'number') remaining.set(product, p.remainingCredits)
      if (typeof p.purchasedCredits === 'number') purchased.set(product, p.purchasedCredits)
    }

    for (const pu of overview?.purchases || []) {
      const product = pu.product || ''
      const credits = typeof pu.creditsGranted === 'number' ? pu.creditsGranted : 0
      if (!product || credits <= 0) continue
      purchased.set(product, (purchased.get(product) || 0) + credits)
    }

    const rows = productsForDisplay.map((product) => ({
      product,
      remaining: remaining.get(product),
      purchased: purchased.get(product) || 0,
    }))

    return rows.sort((a, b) => (b.purchased || 0) - (a.purchased || 0))
  }, [overview, productsForDisplay])

  const purchasesInRange = useMemo(() => {
    const fromD = parseMaybeDate(from)
    const toD = parseMaybeDate(to)
    if (!fromD || !toD) return overview?.purchases || []

    // inclusive end date
    const end = new Date(toD)
    end.setHours(23, 59, 59, 999)

    return (overview?.purchases || []).filter((p) => {
      const d = parseMaybeDate(p.paidAt || p.createdAt)
      if (!d) return false
      return d >= fromD && d <= end
    })
  }, [overview, from, to])

  const creditsSeriesByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of purchasesInRange) {
      const d = parseMaybeDate(p.paidAt || p.createdAt)
      const credits = typeof p.creditsGranted === 'number' ? p.creditsGranted : 0
      if (!d || credits <= 0) continue
      const key = toDateInputValue(d)
      map.set(key, (map.get(key) || 0) + credits)
    }
    const keys = Array.from(map.keys()).sort()
    return keys.map((k, idx) => ({ day: k, x: idx, y: map.get(k) || 0 }))
  }, [purchasesInRange])

  const totals = useMemo(() => {
    const totalPurchasedCredits = productStats.reduce((sum, r) => sum + (r.purchased || 0), 0)
    const totalRemainingCredits = productStats.reduce((sum, r) => sum + (r.remaining || 0), 0)
    const purchasesCount = purchasesInRange.length
    const keysCount = overview?.keys?.length || 0
    return { totalPurchasedCredits, totalRemainingCredits, purchasesCount, keysCount }
  }, [productStats, purchasesInRange, overview])

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

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Charts based on purchases in the selected period</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">From</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">To</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
                  Refresh data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Purchased Credits</CardTitle>
                <CardDescription>All-time (from usage response)</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{formatNumber(totals.totalPurchasedCredits)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Remaining Credits</CardTitle>
                <CardDescription>Current (from usage response)</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{formatNumber(totals.totalRemainingCredits)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Purchases (period)</CardTitle>
                <CardDescription>{from} → {to}</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{formatNumber(totals.purchasesCount)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Keys</CardTitle>
                <CardDescription>Keys linked to your account</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{formatNumber(totals.keysCount)}</CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Credits purchased over time</CardTitle>
                <CardDescription>Sum of creditsGranted per day</CardDescription>
              </CardHeader>
              <CardContent>
                {creditsSeriesByDay.length ? (
                  <div className="rounded-md border p-3">
                    <svg width="100%" height="120" viewBox="0 0 600 120" preserveAspectRatio="none">
                      <path
                        d={buildSparklinePath(
                          creditsSeriesByDay.map((p) => ({ x: p.x, y: p.y })),
                          600,
                          110
                        )}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{creditsSeriesByDay[0]?.day}</span>
                      <span>{creditsSeriesByDay[creditsSeriesByDay.length - 1]?.day}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No purchases in selected range.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits by product</CardTitle>
                <CardDescription>Purchased (and remaining if available)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {productStats.length ? (
                  productStats.slice(0, 8).map((r) => {
                    const max = Math.max(...productStats.map((x) => x.purchased || 0), 1)
                    const pct = ((r.purchased || 0) / max) * 100
                    return (
                      <div key={r.product} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{r.product}</span>
                          <span className="text-muted-foreground">
                            purchased: {formatNumber(r.purchased || 0)}
                            {typeof r.remaining === 'number' ? ` • remaining: ${formatNumber(r.remaining)}` : ''}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded bg-muted">
                          <div className="h-2 rounded bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No product data.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* API Keys list */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Keys linked to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.keys?.length ? (
                overview.keys.map((k, idx) => (
                  <div key={`${k.id || k._id || k.prefix || 'key'}-${idx}`} className="rounded-md border px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {k.name || 'Unnamed key'}{k.prefix ? ` (${k.prefix}...)` : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status: {k.status || '—'} • Created: {formatDateTime(k.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No keys found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
