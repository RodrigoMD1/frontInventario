import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePayments } from '../../utils/payments'
import Swal from 'sweetalert2'

export const SubscriptionPlans = () => {
  const { user, updateUser } = useAuth()
  const { createPayment, plans } = usePayments()
  const [loading, setLoading] = useState(false)

  // Convertir los planes del servicio de pagos al formato del componente
  const AVAILABLE_PLANS = Object.values(plans).map(plan => ({
    ...plan,
    current: user?.plan === plan.id,
    popular: plan.id === 'basic',
    maxProducts: plan.id === 'free' ? 50 : plan.id === 'basic' ? 500 : -1
  }))

  const handlePlanSelect = async (planId: string) => {
    if (!user) return

    // No permitir cambio si ya tiene ese plan
    if (user.plan === planId) return

    const plan = AVAILABLE_PLANS.find(p => p.id === planId)
    if (!plan) return

    setLoading(true)
    try {
      // Crear el pago con MercadoPago
      const paymentResult = await createPayment(planId, user.email)
      
      if (!paymentResult.requiresPayment) {
        // Plan gratuito - cambio directo
        updateUser({ plan: planId })
        
        await Swal.fire({
          title: '¡Plan Actualizado!',
          text: `Has cambiado al plan ${plan.name}`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        })
      } else {
        // Plan de pago - mostrar opciones
        const result = await Swal.fire({
          title: `Plan ${plan.name} - $${plan.price}/mes`,
          text: '¿Cómo deseas proceder con el pago?',
          icon: 'question',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: '🌐 Ir a MercadoPago',
          denyButtonText: '💳 Simular Pago (Prueba)',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#009ee3',
          denyButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280'
        })

        if (result.isConfirmed) {
          // Redirigir a MercadoPago
          await Swal.fire({
            title: 'Redirigiendo a MercadoPago',
            text: 'Te llevaremos al sitio de pagos...',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
          })
          
          // En un caso real, redirigir a initPoint
          window.open(paymentResult.initPoint, '_blank')
          
        } else if (result.isDenied) {
          // Simular pago aprobado (solo para pruebas)
          await Swal.fire({
            title: 'Simulando Pago...',
            text: 'Procesando pago de prueba',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
          })
          
          // Actualizar usuario con el nuevo plan
          updateUser({ plan: planId })
          
          await Swal.fire({
            title: '¡Pago Exitoso! (Simulado)',
            text: `Has sido suscrito al plan ${plan.name}`,
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          })
        }
      }

    } catch (error) {
      console.error('Error en el proceso de pago:', error)
      await Swal.fire({
        title: 'Error en el Pago',
        text: error instanceof Error ? error.message : 'No se pudo procesar el pago. Inténtalo nuevamente.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Planes de Suscripción
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Elige el plan perfecto para tu inventario empresarial
          </p>
        </div>

        {/* Current Plan Status */}
        {user?.plan && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-blue-500 text-xl">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Plan Actual: {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Productos utilizados: {user.productsUsed || 0}
                    {user.plan !== 'premium' && (
                      <> / {AVAILABLE_PLANS.find(p => p.id === user.plan)?.maxProducts || 'N/A'}</>
                    )}
                  </p>
                </div>
              </div>
              {user.role === 'admin' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Administrador
                </span>
              )}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {AVAILABLE_PLANS.map((plan) => {
            const isCurrentPlan = user?.plan === plan.id
            const canSelect = !isCurrentPlan && !loading
            
            return (
              <div
                key={plan.id}
                className={`border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${
                  plan.popular ? 'border-blue-500 relative' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-500 text-white">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                  <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-base font-medium text-gray-500">/mes</span>
                  </p>
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={!canSelect || loading}
                    className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-center transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {loading ? 'Procesando...' : isCurrentPlan ? 'Plan Actual' : `Elegir ${plan.name}`}
                  </button>
                </div>
                
                <div className="pt-6 pb-8 px-6">
                  <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                    Incluye:
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="mt-2 text-gray-600">
                Sí, puedes actualizar tu plan desde tu dashboard. Los cambios se reflejan inmediatamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Qué pasa si supero el límite de productos?</h3>
              <p className="mt-2 text-gray-600">
                Te notificaremos cuando te acerques al límite y podrás actualizar tu plan para continuar agregando productos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Los datos se mantienen al cambiar de plan?</h3>
              <p className="mt-2 text-gray-600">
                Sí, toda tu información de productos, reportes e historial se mantiene al cambiar de plan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Hay soporte técnico incluido?</h3>
              <p className="mt-2 text-gray-600">
                Todos los planes incluyen soporte. Los planes pagos tienen soporte prioritario y tiempo de respuesta más rápido.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gray-900 rounded-lg">
          <div className="px-6 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                ¿Necesitas una solución personalizada?
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Contacta con nuestro equipo para empresas con necesidades específicas de inventario
              </p>
              <div className="mt-8">
                <NavLink
                  to="/contacto"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                >
                  Contactar Equipo de Ventas
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
