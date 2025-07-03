import { useAuth } from '../../hooks/useAuth'
import { NavLink } from 'react-router-dom'

export const Dashboard = () => {
  const { user } = useAuth()

  const getPlanName = (plan: string | null) => {
    switch (plan) {
      case 'basic': return 'Básico'
      case 'premium': return 'Premium'
      case 'free':
      default: return 'Gratuito'
    }
  }

  const hasActiveSubscription = user?.plan && user.plan !== 'free'

  const stats = [
    { name: 'Productos totales', value: user?.productsUsed?.toString() || '0', icon: '📦' },
    { name: 'Stock bajo', value: '0', icon: '⚠️' },
    { name: 'Ventas este mes', value: '$0', icon: '💰' },
    { name: 'Plan actual', value: getPlanName(user?.plan || null), icon: '👥' },
  ]

  const quickActions = [
    { name: 'Agregar Producto', href: '/products/new', icon: '➕', color: 'bg-blue-500' },
    { name: 'Ver Inventario', href: '/products', icon: '📋', color: 'bg-green-500' },
    { name: 'Reportes', href: '/reports', icon: '📊', color: 'bg-purple-500' },
    { name: 'Configuración', href: '/settings', icon: '⚙️', color: 'bg-gray-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Dashboard de GlobalOffice
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Bienvenido/a, {user?.email}
                </p>
              </div>
              {!hasActiveSubscription && (
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <NavLink
                    to="/subscription/plans"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    🚀 Mejorar Plan
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Plan Status */}              {!hasActiveSubscription && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚡</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Plan Gratuito - Funcionalidad Limitada
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Estás usando el plan gratuito. 
                      <NavLink to="/subscription/plans" className="font-medium underline">
                        Mejora tu plan
                      </NavLink> para acceder a todas las funcionalidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((item) => (
              <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {item.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <NavLink
                  key={action.name}
                  to={action.href}
                  className={`${action.color} rounded-lg p-6 text-white hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{action.icon}</span>
                    <span className="font-medium">{action.name}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">📝</span>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No hay actividad reciente</h4>
                <p className="text-gray-500 mb-4">
                  Comienza agregando productos a tu inventario
                </p>
                <NavLink
                  to="/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Agregar Primer Producto
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
