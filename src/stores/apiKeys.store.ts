import { createStore, createEffect, sample } from 'effector'
import { apiKeysRepository } from '../api/repositories/apiKeys.repo'
import type { ApiKey, CreateApiKeyRequest } from '../api/types/api.d'

function isRevoked(key: ApiKey): boolean {
  // Try to be compatible with whatever the backend returns
  if (key.active === false) return true
  if (key.revoked === true) return true
  if (key.isRevoked === true) return true
  if (typeof key.revokedAt === 'string' && key.revokedAt.length > 0) return true
  if (typeof key.status === 'string' && key.status.toLowerCase() === 'revoked') return true
  return false
}

// Effects
export const listApiKeysFx = createEffect<void, ApiKey[]>(() => apiKeysRepository.list())

export const createApiKeyFx = createEffect<CreateApiKeyRequest, ApiKey>((data) =>
  apiKeysRepository.create(data)
)

export const deleteApiKeyFx = createEffect<string, string>((id) =>
  apiKeysRepository.delete(id).then(() => id)
)

// Stores
export const $apiKeys = createStore<ApiKey[]>([])
export const $apiKeysLoading = createStore<boolean>(false)
export const $apiKeysError = createStore<string | null>(null)
export const $newlyCreatedKey = createStore<ApiKey | null>(null)

// Update stores on list success
sample({
  clock: listApiKeysFx.doneData,
  fn: (keys) => keys.filter((k) => !isRevoked(k)),
  target: $apiKeys,
})

// Update stores on create success
sample({
  clock: createApiKeyFx.doneData,
  fn: (newKey) => newKey,
  target: $newlyCreatedKey,
})

sample({
  clock: createApiKeyFx.done,
  source: $apiKeys,
  fn: (keys, { result }) => [result, ...keys],
  target: $apiKeys,
})

// Update stores on delete success
sample({
  clock: deleteApiKeyFx.doneData,
  source: $apiKeys,
  fn: (keys, deletedId) =>
    keys.filter((key) => (key.id || key._id) !== deletedId),
  target: $apiKeys,
})

// Handle loading states
sample({
  clock: [listApiKeysFx.pending, createApiKeyFx.pending, deleteApiKeyFx.pending],
  fn: (pending) => pending,
  target: $apiKeysLoading,
})

// Handle errors
sample({
  clock: [listApiKeysFx.failData, createApiKeyFx.failData, deleteApiKeyFx.failData],
  fn: (error) => (error as Error).message || 'An error occurred',
  target: $apiKeysError,
})

sample({
  clock: [listApiKeysFx.done, createApiKeyFx.done, deleteApiKeyFx.done],
  fn: () => null,
  target: $apiKeysError,
})

// Clear newly created key after a delay
sample({
  clock: createApiKeyFx.done,
  fn: () => null,
  target: $newlyCreatedKey,
})
