import apiClient from '../client'
import { API_ENDPOINTS } from '../../utils/constants'
import type { UsageOverview } from '../types/api.d'

export const usageRepository = {
  getOverview: async (): Promise<UsageOverview> => {
    const response = await apiClient.get<UsageOverview>(API_ENDPOINTS.USAGE.OVERVIEW)
    return response.data
  },
}
