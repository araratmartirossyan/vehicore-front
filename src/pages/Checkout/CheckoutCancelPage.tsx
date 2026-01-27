import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export function CheckoutCancelPage() {
  const navigate = useNavigate()

  const handleGoToBilling = () => {
    navigate('/billing')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Payment Cancelled</CardTitle>
          <CardDescription>Your payment was cancelled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No charges were made. You can return to the billing page to try again.
          </p>
          <Button onClick={handleGoToBilling} className="w-full">
            Back to Billing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
