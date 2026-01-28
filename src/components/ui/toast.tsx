import { createContext, useCallback, useContext, useState, ReactNode, useEffect } from 'react'
import { cn } from '../../utils/helpers'
import { Card } from './card'

type ToastVariant = 'default' | 'destructive'

export interface Toast {
  id: number
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!toasts.length) return
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismissToast(toast.id)
      }, 5000)
    )
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [toasts, dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3 px-4">
        {toasts.map((toast) => (
          <Card
            key={toast.id}
            className={cn(
              'w-full min-w-[260px] max-w-md shadow-lg border rounded-lg bg-card',
              toast.variant === 'destructive'
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border'
            )}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background/60"
              >
                ×
              </button>
            </div>
          </Card>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
