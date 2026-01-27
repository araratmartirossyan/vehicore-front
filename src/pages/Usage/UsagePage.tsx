import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { DateRangePicker } from '../../components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { PurchasesChart } from '../../components/usage/PurchasesChart'
import { useUsageView } from '../../hooks/useUsageView'

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function UsagePage() {
  const {
    overview,
    loading,
    error,
    refresh,
    from,
    to,
    setFrom,
    setTo,
    selectedKeyId,
    setSelectedKeyId,
    keyOptions,
    productStats,
    purchasesChartData,
    totalCreditsInRange,
    totals,
    hoveredProductCredits,
    setHoveredProductCredits,
  } = useUsageView()

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
              <CardTitle>Overview</CardTitle>
              <CardDescription>Filter by key and date range</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <DateRangePicker
                  value={{ from, to }}
                  onChange={(next) => {
                    setFrom(next.from)
                    setTo(next.to)
                  }}
                />

                <div className="min-w-[260px]">
                  <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All keys" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All keys</SelectItem>
                      {keyOptions.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Purchased Credits</CardTitle>
                <CardDescription>All-time (from usage response)</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {formatNumber(totals.totalPurchasedCredits)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Remaining Credits</CardTitle>
                <CardDescription>Current (from usage response)</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {formatNumber(totals.totalRemainingCredits)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Purchases (period)</CardTitle>
                <CardDescription>
                  {from} → {to}
                </CardDescription>
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

          <div className="grid gap-4 lg:grid-cols-2">
            <PurchasesChart data={purchasesChartData} totalCredits={totalCreditsInRange} />

            <Card>
              <CardHeader>
                <CardTitle>Credits by product</CardTitle>
                <CardDescription>Used vs remaining</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded bg-primary" />
                    Used
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded bg-emerald-500/50" />
                    Remaining
                  </span>
                  <span className="text-muted-foreground/70">Hover bar for details</span>
                </div>

                {productStats.length ? (
                  productStats.slice(0, 8).map((r) => {
                    const purchased = r.purchased || 0
                    const remaining = r.remaining || 0
                    const used = r.used ?? Math.max(0, (r.total ?? remaining) - remaining)
                    const total = r.total ?? used + remaining

                    const denom = total > 0 ? total : used + remaining || 1
                    let usedPct = (used / denom) * 100
                    let remainingPct = (remaining / denom) * 100
                    const sum = usedPct + remainingPct
                    if (sum > 100) {
                      usedPct = (usedPct / sum) * 100
                      remainingPct = (remainingPct / sum) * 100
                    }

                    const barTooltip = `Product: ${r.product}\nUsed: ${formatNumber(used)}\nRemaining: ${formatNumber(remaining)}\nTotal: ${formatNumber(total)}${
                      purchased ? `\nPurchased: ${formatNumber(purchased)}` : ''
                    }`

                    return (
                      <div key={r.product} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{r.product}</span>
                          <span className="text-muted-foreground">
                            used: {formatNumber(used)} • remaining: {formatNumber(remaining)} • total:{' '}
                            {formatNumber(total)}
                            {purchased ? ` • purchased: ${formatNumber(purchased)}` : ''}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded bg-muted">
                          <div className="flex h-2 w-full overflow-hidden rounded">
                            <div
                              className={`h-2 cursor-pointer bg-primary transition-opacity ${
                                hoveredProductCredits?.product === r.product &&
                                hoveredProductCredits.segment === 'used'
                                  ? 'opacity-100'
                                  : hoveredProductCredits?.product === r.product
                                    ? 'opacity-25'
                                    : 'opacity-100'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, usedPct))}%` }}
                              onMouseEnter={() =>
                                setHoveredProductCredits({
                                  product: r.product,
                                  segment: 'used',
                                  used,
                                  remaining,
                                  total,
                                  purchased,
                                  x: 0,
                                  y: 0,
                                })
                              }
                              onMouseMove={(e) =>
                                setHoveredProductCredits({
                                  product: r.product,
                                  segment: 'used',
                                  used,
                                  remaining,
                                  total,
                                  purchased,
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                              }
                              onMouseLeave={() => setHoveredProductCredits(null)}
                              aria-label={barTooltip}
                            />
                            <div
                              className={`h-2 cursor-pointer bg-emerald-500/50 transition-opacity ${
                                hoveredProductCredits?.product === r.product &&
                                hoveredProductCredits.segment === 'remaining'
                                  ? 'opacity-100'
                                  : hoveredProductCredits?.product === r.product
                                    ? 'opacity-25'
                                    : 'opacity-100'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, remainingPct))}%` }}
                              onMouseEnter={() =>
                                setHoveredProductCredits({
                                  product: r.product,
                                  segment: 'remaining',
                                  used,
                                  remaining,
                                  total,
                                  purchased,
                                  x: 0,
                                  y: 0,
                                })
                              }
                              onMouseMove={(e) =>
                                setHoveredProductCredits({
                                  product: r.product,
                                  segment: 'remaining',
                                  used,
                                  remaining,
                                  total,
                                  purchased,
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                              }
                              onMouseLeave={() => setHoveredProductCredits(null)}
                              aria-label={barTooltip}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No product data.</p>
                )}

                {hoveredProductCredits && (
                  <div
                    className="pointer-events-none fixed z-50 max-w-[260px] rounded-md border bg-background px-2 py-1 text-xs shadow"
                    style={{
                      left: Math.min(hoveredProductCredits.x + 12, window.innerWidth - 280),
                      top: Math.min(hoveredProductCredits.y + 12, window.innerHeight - 90),
                    }}
                  >
                    <div className="font-medium">{hoveredProductCredits.product}</div>
                    <div className="text-muted-foreground">
                      {hoveredProductCredits.segment === 'used' ? 'Used credits' : 'Remaining credits'}
                    </div>
                    <div className="mt-1">
                      {hoveredProductCredits.segment === 'used' ? (
                        <div>used: {formatNumber(hoveredProductCredits.used)}</div>
                      ) : (
                        <div>remaining: {formatNumber(hoveredProductCredits.remaining)}</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

