import { useSearchParams, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePayments } from '../../utils/payments'

interface PendingPaymentInfo {
  paymentId: string | null
  status: string | null
  statusDetail: string | null
}

export const PaymentPending = () => {
  const [searchParams] = useSearchParams()
  const { processCallback } = usePayments()
  const [paymentInfo, setPaymentInfo] = useState<PendingPaymentInfo>({
    paymentId: null,
    status: null,
    statusDetail: null
  })

  useEffect(() => {
    const processPending = async () => {
      try {
        console.log('⏳ Procesando pago pendiente...')
        const result = await processCallback(searchParams)
        setPaymentInfo({
          paymentId: result.paymentId,
          status: result.status,
          statusDetail: result.statusDetail
        })
      } catch (error) {
        console.error('Error procesando pago pendiente:', error)
        setPaymentInfo({
          paymentId: searchParams.get('payment_id'),
          status: searchParams.get('status'),
          statusDetail: null
        })
      }
    }

    processPending()
  }, [searchParams, processCallback])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pago Pendiente
          </h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado
          </p>
        </div>

        {paymentInfo.paymentId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Información del Pago</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><span className="font-medium">ID:</span> <span className="font-mono">{paymentInfo.paymentId}</span></p>
              {paymentInfo.status && <p><span className="font-medium">Estado:</span> {paymentInfo.status}</p>}
              {paymentInfo.statusDetail && <p><span className="font-medium">Detalle:</span> {paymentInfo.statusDetail}</p>}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Algunos métodos de pago pueden tomar tiempo en procesarse. 
            Te notificaremos por email cuando el pago sea confirmado.
          </p>
        </div>

        <div className="space-y-3">
          <NavLink
            to="/dashboard"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al Dashboard
          </NavLink>
          <NavLink
            to="/subscription/plans"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Ver Estado de Suscripción
          </NavLink>
          <NavLink
            to="/contacto"
            className="block w-full text-gray-500 py-2 px-4 rounded-md hover:text-gray-700 transition-colors"
          >
            Contactar Soporte
          </NavLink>
        </div>
      </div>
    </div>
  )
}
