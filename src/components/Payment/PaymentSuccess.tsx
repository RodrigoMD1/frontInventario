import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePayments } from '../../utils/payments'

interface PaymentResult {
  paymentId: string
  status: string
  statusDetail: string
  isApproved: boolean
}

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { processCallback } = usePayments()
  const [loading, setLoading] = useState(true)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        console.log('🔄 Procesando callback de pago exitoso...')
        
        // Procesar el callback de MercadoPago
        const result = await processCallback(searchParams)
        setPaymentResult(result)

        if (result.isApproved) {
          console.log('✅ Pago aprobado, actualizando usuario...')
          
          // Extraer el plan del external_reference si está disponible
          const externalReference = searchParams.get('external_reference')
          if (externalReference && user) {
            const planMatch = externalReference.match(/subscription-(\w+)-/)
            if (planMatch) {
              const planId = planMatch[1]
              updateUser({ plan: planId })
              console.log(`📝 Plan actualizado a: ${planId}`)
            }
          }
        } else {
          setError('El pago no fue aprobado')
        }
      } catch (error) {
        console.error('❌ Error procesando pago exitoso:', error)
        setError('Error al procesar el resultado del pago')
      } finally {
        setLoading(false)
      }
    }

    processPaymentSuccess()
  }, [searchParams, processCallback, user, updateUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando pago...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error en el Pago
            </h1>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => navigate('/subscription/plans')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Intentar Nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu suscripción ha sido activada correctamente
          </p>
        </div>

        {paymentResult && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Detalles del Pago</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">ID de Pago:</span> {paymentResult.paymentId}</p>
              <p><span className="font-medium">Estado:</span> {paymentResult.status}</p>
              <p><span className="font-medium">Detalle:</span> {paymentResult.statusDetail}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al Dashboard
          </button>
          <NavLink
            to="/subscription/plans"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Ver Planes de Suscripción
          </NavLink>
        </div>
      </div>
    </div>
  )
}
