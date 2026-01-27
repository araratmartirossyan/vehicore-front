import { useEffect, useMemo, useRef, useState } from 'react'
import { useUsage } from './useUsage'

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseMaybeDate(value?: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseDateOnly(value?: string): Date | null {
  if (!value) return null
  const parts = value.split('-').map((p) => parseInt(p, 10))
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  if (y == null || m == null || d == null) return null
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null
  return new Date(y, m - 1, d)
}

function toDateOnlyValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export type HoveredProductCredits = {
  product: string
  segment: 'used' | 'remaining'
  used: number
  remaining: number
  total: number
  purchased: number
  x: number
  y: number
} | null

export function useUsageView() {
  const { overview, loading, error, refresh } = useUsage()
  const hasLoadedRef = useRef(false)

  const [hoveredProductCredits, setHoveredProductCredits] = useState<HoveredProductCredits>(null)

  const [from, setFrom] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return toDateInputValue(d)
  })
  const [to, setTo] = useState<string>(() => toDateInputValue(new Date()))
  const [selectedKeyId, setSelectedKeyId] = useState<string>('all')

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const keyOptions = useMemo(() => {
    const keys = overview?.keys || []
    return keys
      .map((k) => {
        const id = k.id || k._id || ''
        return {
          id,
          label: `${k.name || 'Unnamed key'}${k.prefix ? ` (${k.prefix}...)` : ''}`,
        }
      })
      .filter((k) => k.id)
  }, [overview?.keys])

  useEffect(() => {
    if (selectedKeyId === 'all' && keyOptions.length === 1) {
      setSelectedKeyId(keyOptions[0]!.id)
    }
  }, [keyOptions, selectedKeyId])

  const selectedKey = useMemo(() => {
    if (!overview?.keys?.length) return null
    if (selectedKeyId === 'all') return null
    return overview.keys.find((k) => (k.id || k._id) === selectedKeyId) || null
  }, [overview?.keys, selectedKeyId])

  const purchasesInRange = useMemo(() => {
    const fromD = parseDateOnly(from) || parseMaybeDate(from)
    const toD = parseDateOnly(to) || parseMaybeDate(to)
    if (!fromD || !toD) return overview?.purchases || []

    const end = new Date(toD)
    end.setHours(23, 59, 59, 999)

    return (overview?.purchases || [])
      .filter((p) => (selectedKeyId === 'all' ? true : (p.apiKeyId || '') === selectedKeyId))
      .filter((p) => {
        const d = parseMaybeDate(p.paidAt || p.createdAt)
        if (!d) return false
        return d >= fromD && d <= end
      })
  }, [overview, from, to, selectedKeyId])

  const purchasesChartData = useMemo(() => {
    const fromD = parseDateOnly(from)
    const toD = parseDateOnly(to)
    if (!fromD || !toD) {
      const map = new Map<string, number>()
      for (const p of purchasesInRange) {
        const d = parseMaybeDate(p.paidAt || p.createdAt)
        const credits = typeof p.creditsGranted === 'number' ? p.creditsGranted : 0
        if (!d || credits <= 0) continue
        const key = toDateInputValue(d)
        map.set(key, (map.get(key) || 0) + credits)
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, credits]) => ({ date, credits }))
    }

    const sums = new Map<string, number>()
    for (const p of purchasesInRange) {
      const d = parseMaybeDate(p.paidAt || p.createdAt)
      const credits = typeof p.creditsGranted === 'number' ? p.creditsGranted : 0
      if (!d || credits <= 0) continue
      const key = toDateOnlyValue(d)
      sums.set(key, (sums.get(key) || 0) + credits)
    }

    const out: Array<{ date: string; credits: number }> = []
    const cursor = new Date(fromD)
    cursor.setHours(0, 0, 0, 0)
    const end = new Date(toD)
    end.setHours(0, 0, 0, 0)

    while (cursor <= end) {
      const key = toDateOnlyValue(cursor)
      out.push({ date: key, credits: sums.get(key) || 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    return out
  }, [from, to, purchasesInRange])

  const totalCreditsInRange = useMemo(() => {
    return purchasesChartData.reduce((sum, d) => sum + d.credits, 0)
  }, [purchasesChartData])

  const productsForDisplay = useMemo(() => {
    const fromProducts = (overview?.products || []).map((p) => p.product).filter(Boolean) as string[]
    const fromKeyProducts = (
      selectedKey ? selectedKey.products || [] : (overview?.keys || []).flatMap((k) => k.products || [])
    )
      .map((p) => p.product)
      .filter(Boolean) as string[]
    const fromPurchases = (overview?.purchases || [])
      .filter((p) => (selectedKeyId === 'all' ? true : (p.apiKeyId || '') === selectedKeyId))
      .map((p) => p.product)
      .filter(Boolean) as string[]
    return Array.from(new Set([...fromProducts, ...fromKeyProducts, ...fromPurchases]))
  }, [overview?.products, overview?.keys, overview?.purchases, selectedKey, selectedKeyId])

  const productStats = useMemo(() => {
    const remaining = new Map<string, number>()
    const purchased = new Map<string, number>()
    const used = new Map<string, number>()
    const total = new Map<string, number>()

    const keyProducts = selectedKey ? selectedKey.products || [] : (overview?.keys || []).flatMap((k) => k.products || [])
    const hasKeyProducts = keyProducts.length > 0

    if (hasKeyProducts) {
      for (const p of keyProducts) {
        const product = p.product || ''
        if (!product) continue

        const remainingCredits = typeof p.remainingCredits === 'number' ? p.remainingCredits : 0
        const purchasedCredits = typeof p.purchasedCredits === 'number' ? p.purchasedCredits : 0
        const usedCredits = typeof p.usedCredits === 'number' ? p.usedCredits : 0
        const totalCredits = typeof p.totalCredits === 'number' ? p.totalCredits : remainingCredits + usedCredits

        if (typeof p.remainingCredits === 'number') remaining.set(product, (remaining.get(product) || 0) + remainingCredits)
        if (typeof p.purchasedCredits === 'number') purchased.set(product, (purchased.get(product) || 0) + purchasedCredits)
        if (typeof p.usedCredits === 'number') used.set(product, (used.get(product) || 0) + usedCredits)
        if (typeof p.totalCredits === 'number' || typeof p.usedCredits === 'number')
          total.set(product, (total.get(product) || 0) + totalCredits)
      }
    } else {
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
    }

    const rows = productsForDisplay.map((product) => ({
      product,
      remaining: remaining.get(product) || 0,
      purchased: purchased.get(product) || 0,
      used: used.get(product) || 0,
      total: total.get(product) || 0,
    }))

    return rows.sort((a, b) => b.purchased - a.purchased)
  }, [overview?.keys, overview?.products, overview?.purchases, productsForDisplay, selectedKey])

  const totals = useMemo(() => {
    const totalPurchasedCredits = productStats.reduce((sum, r) => sum + (r.purchased || 0), 0)
    const totalRemainingCredits = productStats.reduce((sum, r) => sum + (r.remaining || 0), 0)
    const purchasesCount = purchasesInRange.length
    const keysCount = overview?.keys?.length || 0
    return { totalPurchasedCredits, totalRemainingCredits, purchasesCount, keysCount }
  }, [productStats, purchasesInRange, overview])

  return {
    // api
    overview,
    loading,
    error,
    refresh,

    // filters/state
    from,
    to,
    setFrom,
    setTo,
    selectedKeyId,
    setSelectedKeyId,
    keyOptions,

    // derived
    productStats,
    purchasesChartData,
    totalCreditsInRange,
    totals,

    // tooltip
    hoveredProductCredits,
    setHoveredProductCredits,
  }
}

