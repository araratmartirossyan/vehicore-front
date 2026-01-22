import { createEffect, createStore, sample } from 'effector'
import { usageRepository } from '../api/repositories/usage.repo'
import type { UsageOverview } from '../api/types/api.d'

export const getUsageOverviewFx = createEffect<void, UsageOverview>(() => usageRepository.getOverview())

export const $usageOverview = createStore<UsageOverview | null>(null)
export const $usageLoading = createStore<boolean>(false)
export const $usageError = createStore<string | null>(null)

sample({
  clock: getUsageOverviewFx.doneData,
  target: $usageOverview,
})

sample({
  clock: getUsageOverviewFx.pending,
  target: $usageLoading,
})

sample({
  clock: getUsageOverviewFx.failData,
  fn: (error) => (error as Error).message || 'Failed to load usage',
  target: $usageError,
})

sample({
  clock: getUsageOverviewFx.done,
  fn: () => null,
  target: $usageError,
})

