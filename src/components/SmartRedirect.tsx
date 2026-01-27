import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApiKeys } from '../hooks/useApiKeys'
import { useAuth } from '../hooks/useAuth'

export function SmartRedirect() {
  const { isAuthenticated, authLoading } = useAuth()
  const { apiKeys, loading, listApiKeys } = useApiKeys()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !hasChecked) {
      listApiKeys().finally(() => {
        setHasChecked(true)
      })
    }
  }, [isAuthenticated, hasChecked, listApiKeys])

  if (authLoading || (isAuthenticated && (loading || !hasChecked))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if any key has been used (has lastUsedAt timestamp)
  const hasAnyUsedKey = apiKeys.some((k) => !!k.lastUsedAt)

  // If user has used their key, go to Usage; otherwise, go to Dashboard (onboarding)
  return <Navigate to={hasAnyUsedKey ? '/usage' : '/dashboard'} replace />
}
