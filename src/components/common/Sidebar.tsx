import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/helpers'
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Key,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n'

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)

  const navigation = [
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.billing'), href: '/billing', icon: CreditCard },
    { name: t('sidebar.apiKeys'), href: '/api-keys', icon: Key },
    { name: t('sidebar.usage'), href: '/usage', icon: BarChart3 },
  ]

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    (user?._id || user?.id ? `User ${user?._id || user?.id}` : '')
  const avatarLetter = (displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        'relative flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Floating collapse/expand button centered on header edge */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute right-[-10px] top-8 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow-md hover:bg-accent hover:text-accent-foreground focus:outline-none transform -translate-y-1/2"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            V
          </div>
          {!collapsed && <h1 className="text-base font-bold truncate">Vehicore</h1>}
        </div>
      </div>
      <nav className={cn('flex-1 space-y-1 py-4', collapsed ? 'px-2' : 'px-3')}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-3">
        {user && (
          <div className={cn('flex items-center mb-3', collapsed ? 'justify-center' : 'gap-3')}>
            <div
              className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold"
              title={displayName || user.email || ''}
            >
              {avatarLetter}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
          </div>
        )}
        {/* Settings shortcut between user block and logout, styled like Logout */}
        <Link
          to="/settings"
          title={collapsed ? t('sidebar.settings') : undefined}
          className={cn(
            'mb-2 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
            collapsed ? 'justify-center px-0' : 'justify-start gap-3'
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>{t('sidebar.settings')}</span>}
        </Link>

        <Button
          variant="ghost"
          className={cn(
            'w-full gap-3 text-sm font-medium',
            collapsed ? 'justify-center px-0' : 'justify-start'
          )}
          onClick={() => logout()}
          title={collapsed ? t('sidebar.logout') : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>{t('sidebar.logout')}</span>}
        </Button>
      </div>
    </div>
  )
}
