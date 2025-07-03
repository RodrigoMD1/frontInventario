// Servicio de pagos con MercadoPago

// Configuración de MercadoPago
const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// URLs de callback
const SUCCESS_URL = import.meta.env.VITE_PAYMENT_SUCCESS_URL || 'http://localhost:5173/payment/success'
const FAILURE_URL = import.meta.env.VITE_PAYMENT_FAILURE_URL || 'http://localhost:5173/payment/failure'
const PENDING_URL = import.meta.env.VITE_PAYMENT_PENDING_URL || 'http://localhost:5173/payment/pending'

// Tipos para respuestas de MercadoPago
export interface PaymentPreference {
  id: string
  init_point: string
  sandbox_init_point?: string
}

export interface CreatePaymentResponse {
  planId: string
  requiresPayment: boolean
  preferenceId?: string
  initPoint?: string
}

export interface PaymentStatus {
  id: string
  status: 'approved' | 'pending' | 'rejected'
  status_detail: string
}

// Tipos para los planes de suscripción
export interface PlanInfo {
  id: string
  name: string
  price: number
  description: string
  features: string[]
}

// Información de los planes (debe coincidir con el backend)
export const SUBSCRIPTION_PLANS: Record<string, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    description: 'Plan básico para comenzar',
    features: ['Hasta 50 productos', 'Dashboard básico', 'Reportes básicos']
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    price: 29,
    description: 'Para pequeñas empresas',
    features: ['Hasta 500 productos', 'Dashboard completo', 'Reportes avanzados', 'Soporte prioritario']
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 59,
    description: 'Para empresas en crecimiento',
    features: ['Productos ilimitados', 'API completa', 'Integraciones avanzadas', 'Soporte 24/7']
  }
}

// Clase para manejar pagos con MercadoPago
export class PaymentService {
  constructor() {
    // Verificar que las credenciales estén configuradas
    if (!MP_PUBLIC_KEY || MP_PUBLIC_KEY.includes('TEST-a3c7d4b2')) {
      console.warn('⚠️ MercadoPago: Usando credenciales de ejemplo. Configura tus credenciales reales en .env')
    }
  }

  // Crear preferencia de pago para una suscripción
  async createSubscriptionPayment(planId: string, userEmail: string): Promise<CreatePaymentResponse> {
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      throw new Error('Plan no encontrado')
    }

    if (plan.price === 0) {
      // Plan gratuito - no requiere pago
      return { planId, requiresPayment: false }
    }

    try {
      console.log(`💰 Creando pago para usuario: ${userEmail}, Plan: ${plan.name}`)
      
      // Crear la preferencia de pago
      const preference = await this.createPreference(plan, userEmail)
      
      return {
        planId,
        requiresPayment: true,
        preferenceId: preference.id,
        initPoint: preference.sandbox_init_point || preference.init_point
      }
    } catch (error) {
      console.error('❌ Error creando pago:', error)
      throw new Error('Error al crear el pago. Inténtalo nuevamente.')
    }
  }

  // Crear preferencia en MercadoPago
  private async createPreference(plan: PlanInfo, userEmail: string): Promise<PaymentPreference> {
    // En desarrollo, crearemos la preferencia usando fetch directamente
    // En un entorno real, esto debería hacerse en el backend por seguridad
    
    const accessToken = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken || accessToken.includes('TEST-1234567890')) {
      // Simulación para cuando no hay credenciales reales
      console.log('🔄 Simulando creación de preferencia (credenciales de ejemplo)')
      return {
        id: `TEST-PREFERENCE-${Date.now()}`,
        init_point: `${SUCCESS_URL}?payment_id=TEST-${Date.now()}&status=approved&collection_status=approved`,
        sandbox_init_point: `${SUCCESS_URL}?payment_id=TEST-${Date.now()}&status=approved&collection_status=approved`
      }
    }

    const preferenceData = {
      items: [
        {
          title: `Suscripción ${plan.name} - GlobalOffice`,
          description: plan.description,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: plan.price
        }
      ],
      payer: {
        email: userEmail
      },
      back_urls: {
        success: SUCCESS_URL,
        failure: FAILURE_URL,
        pending: PENDING_URL
      },
      auto_return: 'approved',
      external_reference: `subscription-${plan.id}-${Date.now()}`,
      notification_url: `${API_BASE}/payments/webhook`, // Para webhooks
      statement_descriptor: 'GlobalOffice'
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Error de MercadoPago:', error)
      throw new Error('Error al crear la preferencia de pago')
    }

    const preference = await response.json()
    console.log('✅ Preferencia creada:', preference.id)
    
    return preference
  }

  // Verificar estado de un pago
  async verifyPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      console.log('🔍 Verificando pago:', paymentId)
      
      const accessToken = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN
      
      if (!accessToken || accessToken.includes('TEST-1234567890') || paymentId.startsWith('TEST-')) {
        // Simulación para desarrollo
        console.log('🔄 Simulando verificación de pago')
        return {
          id: paymentId,
          status: 'approved',
          status_detail: 'accredited'
        }
      }

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al verificar el pago')
      }

      const payment = await response.json()
      
      return {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail
      }
    } catch (error) {
      console.error('❌ Error verificando pago:', error)
      throw error
    }
  }

  // Procesar callback de pago
  async processPaymentCallback(searchParams: URLSearchParams) {
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const collectionStatus = searchParams.get('collection_status')
    
    console.log('📨 Callback de pago recibido:', { paymentId, status, collectionStatus })
    
    if (!paymentId) {
      throw new Error('ID de pago no encontrado')
    }

    // Verificar el estado del pago
    const paymentStatus = await this.verifyPaymentStatus(paymentId)
    
    return {
      paymentId,
      status: paymentStatus.status,
      statusDetail: paymentStatus.status_detail,
      isApproved: paymentStatus.status === 'approved'
    }
  }
}

// Instancia singleton del servicio de pagos
export const paymentService = new PaymentService()

// Hook personalizado para usar el servicio de pagos
export const usePayments = () => {
  return {
    paymentService,
    plans: SUBSCRIPTION_PLANS,
    createPayment: (planId: string, userEmail: string) => 
      paymentService.createSubscriptionPayment(planId, userEmail),
    verifyPayment: (paymentId: string) => 
      paymentService.verifyPaymentStatus(paymentId),
    processCallback: (searchParams: URLSearchParams) =>
      paymentService.processPaymentCallback(searchParams)
  }
}
