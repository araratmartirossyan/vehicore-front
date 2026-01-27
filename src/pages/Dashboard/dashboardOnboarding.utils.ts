import type { ApiKey } from '../../api/types/api.d'

export function getKeyUsedAt(key: ApiKey): string | null {
  const lastTimeUsedAt = key.lastTimeUsedAt
  if (typeof lastTimeUsedAt === 'string' && lastTimeUsedAt.length > 0) return lastTimeUsedAt
  if (lastTimeUsedAt === null) return null

  const lastUsedAt = key.lastUsedAt
  if (typeof lastUsedAt === 'string' && lastUsedAt.length > 0) return lastUsedAt
  return null
}

export function isApiKeyUsed(key: ApiKey): boolean {
  return getKeyUsedAt(key) !== null
}

export function getPlaintextApiKey(key: ApiKey): string {
  return key.apiKey || key.key || ''
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey) return ''
  return '••••••••••••••••••••••••••••••••••••••••'
}

