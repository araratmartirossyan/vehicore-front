import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { user } = useAuth()
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (user?._id || user?.id ? `User ${user?._id || user?.id}` : '')
  const avatarLetter = (displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {avatarLetter}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
