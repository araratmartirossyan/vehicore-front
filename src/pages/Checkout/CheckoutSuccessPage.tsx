import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useUsage } from '../../hooks/useUsage'

const POLL_INTERVAL = 2000 // 2 seconds
const MAX_POLL_TIME = 20000 // 20 seconds

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refresh } = useUsage()
  const [polling, setPolling] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      return
    }

    const pollUsage = async () => {
      try {
        const overview = await refresh()

        // Stop early when credits/purchases show up (webhook delay resolved)
        const hasCredits =
          overview?.products?.some((p) => (p.remainingCredits ?? 0) > 0 || (p.purchasedCredits ?? 0) > 0) ??
          false
        const hasPurchases = (overview?.purchases?.length ?? 0) > 0

        if (hasCredits || hasPurchases) {
          setPolling(false)
          clearInterval(pollTimer)
          clearTimeout(timeoutTimer)
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }

    // Start polling immediately
    pollUsage()
    const pollTimer: ReturnType<typeof setInterval> = setInterval(pollUsage, POLL_INTERVAL)

    // Stop polling after max time
    const timeoutTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setPolling(false)
      clearInterval(pollTimer)
    }, MAX_POLL_TIME)

    return () => {
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
    }
  }, [sessionId, refresh])

  const handleGoToBilling = () => {
    navigate('/billing')
  }

  const handleGoToUsage = () => {
    navigate('/usage')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>Your payment has been processed successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {polling && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Waiting for credits to be added to your account...
              </p>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="text-xs text-muted-foreground">
                  This may take a few seconds
                </span>
              </div>
            </div>
          )}
          {!polling && (
            <p className="text-sm text-muted-foreground">
              Credits should now be available in your account. If you don't see them, please refresh the Usage page.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoToUsage} className="w-full">
              View Usage
            </Button>
            <Button onClick={handleGoToBilling} variant="outline" className="w-full">
              Back to Billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
