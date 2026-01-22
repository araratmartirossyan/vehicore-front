import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/helpers'
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Key,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Usage', href: '/usage', icon: BarChart3 },
]

export function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold">Vehicore</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
