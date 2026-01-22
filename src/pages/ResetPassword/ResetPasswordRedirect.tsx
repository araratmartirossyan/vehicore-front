import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function ResetPasswordRedirect() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token') || ''
    const target = token ? `/reset-password?token=${encodeURIComponent(token)}` : '/reset-password'
    navigate(target, { replace: true })
  }, [navigate, searchParams])

  return null
}

