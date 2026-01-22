import apiClient from '../client'
import type { BillingInfo, BillingHistoryItem } from '../types/api.d'

export const billingRepository = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    const response = await apiClient.get<BillingInfo>('/billing')
    return response.data
  },

  getBillingHistory: async (): Promise<BillingHistoryItem[]> => {
    const response = await apiClient.get<BillingHistoryItem[]>('/billing/history')
    return response.data
  },
}
