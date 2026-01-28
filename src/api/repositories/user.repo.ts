import apiClient from '../client'
import { API_ENDPOINTS } from '../../utils/constants'
import type { User } from '../types/api.d'

export const userRepository = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.USER.ME)
    return response.data
  },
}
