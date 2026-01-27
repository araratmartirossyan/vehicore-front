import { useUnit } from 'effector-react'
import {
  $products,
  $packages,
  $billingLoading,
  $billingError,
  getProductsFx,
  getPackagesFx,
  createCheckoutFx,
} from '../stores/billing.store'
import type { CheckoutRequest } from '../api/types/api.d'

export function useBilling() {
  const products = useUnit($products)
  const packages = useUnit($packages)
  const loading = useUnit($billingLoading)
  const error = useUnit($billingError)

  return {
    products,
    packages,
    loading,
    error,
    getProducts: () => getProductsFx(),
    getPackages: () => getPackagesFx(),
    createCheckout: (data: CheckoutRequest) => createCheckoutFx(data),
  }
}
