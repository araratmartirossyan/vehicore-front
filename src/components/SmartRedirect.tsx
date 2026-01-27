import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function SmartRedirect() {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Dashboard now has 2 states:
  // 1) onboarding (first time / never-used key)
  // 2) usage dashboard (when used at least once)
  // So we always land on /dashboard and let it decide what to render.
  return <Navigate to="/dashboard" replace />
}
