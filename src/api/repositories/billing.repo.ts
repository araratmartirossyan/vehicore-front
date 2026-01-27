import apiClient from '../client'
import { API_ENDPOINTS } from '../../utils/constants'
import type { Product, Package, CheckoutRequest, CheckoutResponse } from '../types/api.d'

export const billingRepository = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(API_ENDPOINTS.BILLING.PRODUCTS)
    return response.data
  },

  getPackages: async (): Promise<Package[]> => {
    const response = await apiClient.get<Package[]>(API_ENDPOINTS.BILLING.PACKAGES)
    return response.data
  },

  createCheckout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await apiClient.post<CheckoutResponse>(API_ENDPOINTS.BILLING.CHECKOUT, data)
    return response.data
  },
}
