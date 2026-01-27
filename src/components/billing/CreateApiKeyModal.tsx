import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useApiKeys } from '../../hooks/useApiKeys'

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
})

type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>

interface CreateApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateApiKeyModal({ open, onOpenChange, onSuccess }: CreateApiKeyModalProps) {
  const { createApiKey, newlyCreatedKey, loading, clearNewlyCreatedKey } = useApiKeys()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
  })

  useEffect(() => {
    if (newlyCreatedKey && newlyCreatedKey.apiKey) {
      // Key was created successfully
      reset()
    }
  }, [newlyCreatedKey, reset])

  useEffect(() => {
    if (!open) {
      reset()
      setError(null)
      setCopied(false)
    }
  }, [open, reset])

  const onSubmit = async (data: CreateApiKeyFormData) => {
    setError(null)
    try {
      await createApiKey({ name: data.name })
      onSuccess?.()
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to create API key. Please try again.'
      setError(errorMessage)
    }
  }

  const handleCopy = async () => {
    if (newlyCreatedKey?.apiKey) {
      try {
        await navigator.clipboard.writeText(newlyCreatedKey.apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleClose = () => {
    // IMPORTANT: clear plaintext key from memory immediately
    clearNewlyCreatedKey()
    onOpenChange(false)
  }

  // Show the created key
  if (newlyCreatedKey && newlyCreatedKey.apiKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your API key has been created. Please copy it now - you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newlyCreatedKey.apiKey}
                  readOnly
                  className="font-mono text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
              <strong>Important:</strong> Store this key securely. You won't be able to retrieve it again.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              I've saved my key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Show the creation form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to use with VehiCore services. Give it a descriptive name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Key Name</Label>
            <Input
              id="name"
              placeholder="e.g., Production Key, Development Key"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
