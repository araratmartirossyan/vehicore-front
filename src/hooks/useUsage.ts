import { useUnit } from 'effector-react'
import { $usageError, $usageLoading, $usageOverview, getUsageOverviewFx } from '../stores/usage.store'

export function useUsage() {
  const overview = useUnit($usageOverview)
  const loading = useUnit($usageLoading)
  const error = useUnit($usageError)

  return {
    overview,
    loading,
    error,
    refresh: () => getUsageOverviewFx(),
  }
}

