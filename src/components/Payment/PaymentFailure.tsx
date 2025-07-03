import { useSearchParams, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePayments } from '../../utils/payments'

export const PaymentFailure = () => {
  const [searchParams] = useSearchParams()
  const { processCallback } = usePayments()
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId: string | null
    errorMessage: string
  }>({
    paymentId: null,
    errorMessage: 'Hubo un problema con el pago'
  })

  useEffect(() => {
    const processFailure = async () => {
      try {
        console.log('❌ Procesando fallo de pago...')
        const result = await processCallback(searchParams)
        setPaymentInfo({
          paymentId: result.paymentId,
          errorMessage: `Pago ${result.status}: ${result.statusDetail}`
        })
      } catch {
        const errorMsg = searchParams.get('error') || 'Hubo un problema con el pago'
        setPaymentInfo({
          paymentId: searchParams.get('payment_id'),
          errorMessage: errorMsg
        })
      }
    }

    processFailure()
  }, [searchParams, processCallback])

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
            Pago No Procesado
          </h1>
          <p className="text-gray-600">
            {paymentInfo.errorMessage}
          </p>
        </div>

        {paymentInfo.paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Información del Pago</h3>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">ID de Pago:</span> {paymentInfo.paymentId}</p>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            No se han realizado cargos a tu cuenta. Puedes intentar nuevamente o contactar soporte.
          </p>
        </div>

        <div className="space-y-3">
          <NavLink
            to="/subscription/plans"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Intentar Nuevamente
          </NavLink>
          <NavLink
            to="/contacto"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Contactar Soporte
          </NavLink>
          <NavLink
            to="/dashboard"
            className="block w-full text-gray-500 py-2 px-4 rounded-md hover:text-gray-700 transition-colors"
          >
            Volver al Dashboard
          </NavLink>
        </div>
      </div>
    </div>
  )
}
