import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKeys } from '../../hooks/useApiKeys'
import { API_BASE_URL } from '../../utils/constants'
import { DashboardOnboarding } from './DashboardOnboarding'
import { getPlaintextApiKey, isApiKeyUsed } from './dashboardOnboarding.utils'
import { UsagePage } from '../Usage/UsagePage'

export function DashboardPage() {
  const navigate = useNavigate()
  const { apiKeys, loading, listApiKeys, newlyCreatedKey } = useApiKeys()
  const hasLoadedRef = useRef(false)

  const firstNeverUsedKey = useMemo(() => {
    return apiKeys.find((k) => !isApiKeyUsed(k)) || null
  }, [apiKeys])

  const shouldShowOnboarding = useMemo(() => {
    // Requirement: show onboarding if there is a key that has never been used
    if (loading) return true
    if (apiKeys.length === 0) return true
    return firstNeverUsedKey !== null
  }, [apiKeys.length, firstNeverUsedKey, loading])

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      listApiKeys()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiKeyToShow =
    (firstNeverUsedKey ? getPlaintextApiKey(firstNeverUsedKey) : '') || newlyCreatedKey?.apiKey || ''

  if (shouldShowOnboarding) {
    return (
      <DashboardOnboarding
        apiKey={apiKeyToShow}
        apiBaseUrl={API_BASE_URL}
        onNavigateToApiKeys={() => navigate('/api-keys')}
        onNavigateToBilling={() => navigate('/billing')}
      />
    )
  }

  // Dashboard "state 2": render usage inside Dashboard route (no redirect).
  return <UsagePage />
}
