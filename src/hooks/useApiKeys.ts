import { useUnit } from 'effector-react'
import {
  $apiKeys,
  $apiKeysLoading,
  $apiKeysError,
  $newlyCreatedKey,
  listApiKeysFx,
  createApiKeyFx,
  deleteApiKeyFx,
} from '../stores/apiKeys.store'
import type { CreateApiKeyRequest } from '../api/types/api.d'

export function useApiKeys() {
  const apiKeys = useUnit($apiKeys)
  const loading = useUnit($apiKeysLoading)
  const error = useUnit($apiKeysError)
  const newlyCreatedKey = useUnit($newlyCreatedKey)

  return {
    apiKeys,
    loading,
    error,
    newlyCreatedKey,
    listApiKeys: () => listApiKeysFx(),
    createApiKey: (data: CreateApiKeyRequest) => createApiKeyFx(data),
    deleteApiKey: (id: string) => deleteApiKeyFx(id),
  }
}
