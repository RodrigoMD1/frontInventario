import { useEffect } from 'react'
import { useAuth } from './useAuth'

// Hook para proteger rutas
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login'
    }
  }, [isAuthenticated, loading])

  return { isAuthenticated, loading }
}

// Hook para verificar suscripción
export const useRequireSubscription = () => {
  const { user, loading, isAuthenticated } = useAuth()
  
  const hasActiveSubscription = user?.plan && user.plan !== 'free'
  
  useEffect(() => {
    if (!loading && isAuthenticated && !hasActiveSubscription) {
      window.location.href = '/subscription/plans'
    }
  }, [hasActiveSubscription, loading, isAuthenticated])

  return { hasSubscription: hasActiveSubscription, loading, isAuthenticated }
}

// Hook para verificar rol de admin
export const useRequireAdmin = () => {
  const { isAdmin, loading, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      window.location.href = '/dashboard'
    }
  }, [isAdmin, loading, isAuthenticated])

  return { isAdmin, loading, isAuthenticated }
}
