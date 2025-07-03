import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requireSubscription?: boolean
  requireAdmin?: boolean
}

export const ProtectedRoute = ({ 
  children, 
  requireSubscription = false, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth()

  // Verificar si tiene suscripción activa
  const hasActiveSubscription = user?.plan && user.plan !== 'free'
  
  // Verificar si es admin
  const isAdmin = user?.role === 'admin'

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    window.location.href = '/auth/login'
    return null
  }

  // Verificar si requiere suscripción
  if (requireSubscription && !hasActiveSubscription) {
    window.location.href = '/subscription/plans'
    return null
  }

  // Verificar si requiere permisos de admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Acceso denegado</h2>
            <p className="mt-2 text-gray-600">
              No tienes permisos para acceder a esta sección
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
