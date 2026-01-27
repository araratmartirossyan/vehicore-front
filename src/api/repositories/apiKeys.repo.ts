import apiClient from '../client'
import { API_ENDPOINTS } from '../../utils/constants'
import type { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from '../types/api.d'

export const apiKeysRepository = {
  list: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get<ApiKey[]>(API_ENDPOINTS.API_KEYS.LIST)
    return response.data
  },

  create: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    const response = await apiClient.post<CreateApiKeyResponse>(API_ENDPOINTS.API_KEYS.CREATE, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    const url = API_ENDPOINTS.API_KEYS.DELETE.replace(':id', id)
    await apiClient.post(url)
  },
}
