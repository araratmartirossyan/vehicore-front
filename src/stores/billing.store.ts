import { createStore, createEffect, sample } from 'effector'
import { billingRepository } from '../api/repositories/billing.repo'
import type { Product, Package, CheckoutRequest, CheckoutResponse } from '../api/types/api.d'

// Effects
export const getProductsFx = createEffect<void, Product[]>(() => billingRepository.getProducts())

export const getPackagesFx = createEffect<void, Package[]>(() => billingRepository.getPackages())

export const createCheckoutFx = createEffect<CheckoutRequest, CheckoutResponse>((data) =>
  billingRepository.createCheckout(data)
)

// Stores
export const $products = createStore<Product[]>([])
export const $packages = createStore<Package[]>([])
export const $billingLoading = createStore<boolean>(false)
export const $billingError = createStore<string | null>(null)

// Update stores on success
sample({
  clock: getProductsFx.doneData,
  target: $products,
})

sample({
  clock: getPackagesFx.doneData,
  target: $packages,
})

// Handle loading states
sample({
  clock: [getProductsFx.pending, getPackagesFx.pending, createCheckoutFx.pending],
  fn: (pending) => pending,
  target: $billingLoading,
})

// Handle errors
sample({
  clock: [getProductsFx.failData, getPackagesFx.failData, createCheckoutFx.failData],
  fn: (error) => {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    return err?.response?.data?.message || err?.message || 'An error occurred'
  },
  target: $billingError,
})

sample({
  clock: [getProductsFx.done, getPackagesFx.done, createCheckoutFx.done],
  fn: () => null,
  target: $billingError,
})
