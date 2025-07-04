// Tipos basados en el backend real
interface User {
  id: string
  email: string
  role: 'admin' | 'store'
  isActive: boolean
  plan: string | null
  productsUsed: number
  lastLogin: Date | null
}

interface Store {
  id: string
  name: string
  isActive: boolean
  user: User
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category?: string
  description?: string
  image?: string
  cost?: number
  isActive: boolean
  unit?: string
  store: Store
}

interface Subscription {
  id: string
  status: 'active' | 'inactive' | 'cancelled'
  startDate: Date
  endDate?: Date
  store: Store
}

interface Payment {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  date: Date
  subscription: Subscription
}

// Configuración de la API
// En desarrollo usamos proxy (/api), en producción la URL completa
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3000'
)

// Helper function para hacer requests autenticados
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  // Si el token expiró, redirigir al login
  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/auth/login'
    throw new Error('Token expirado')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error en la petición')
  }

  return response.json()
}

// API endpoints según el backend real
export const authAPI = {
  // Registro simple: solo email, password, role
  register: (email: string, password: string, role: 'admin' | 'store' = 'store') => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  // Login: email y password
  login: (email: string, password: string) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
}

// Stores API - Después del registro/login
export const storeAPI = {
  // Crear tienda (requerido después del registro)
  createStore: (name: string) =>
    apiRequest('/stores', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getMyStores: () => apiRequest('/stores'),
}

// Products API
export const productAPI = {
  // Listar productos (admin: todos, store: propios)
  getProducts: () => apiRequest('/products'),
  
  // Obtener producto específico
  getProduct: (id: string) => apiRequest(`/products/${id}`),
  
  // Crear producto (solo rol 'store')
  createProduct: (productData: Omit<Product, 'id' | 'store'>) =>
    apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  // Actualizar producto completo
  updateProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'store'>>) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  // Cambiar estado activo/inactivo
  toggleProductStatus: (id: string) =>
    apiRequest(`/products/${id}/active`, {
      method: 'PATCH',
    }),

  // Eliminar producto
  deleteProduct: (id: string) =>
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),
}

// Subscriptions API
export const subscriptionAPI = {
  // Listar suscripciones
  getSubscriptions: () => apiRequest('/subscriptions'),
  
  // Obtener suscripción específica
  getSubscription: (id: string) => apiRequest(`/subscriptions/${id}`),
  
  // Crear suscripción
  createSubscription: (subscriptionData: Omit<Subscription, 'id'>) =>
    apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    }),

  // Actualizar suscripción
  updateSubscription: (id: string, subscriptionData: Partial<Omit<Subscription, 'id'>>) =>
    apiRequest(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    }),

  // Eliminar suscripción
  deleteSubscription: (id: string) =>
    apiRequest(`/subscriptions/${id}`, {
      method: 'DELETE',
    }),

  // Obtener pagos de suscripción
  getSubscriptionPayments: (id: string) => apiRequest(`/subscriptions/${id}/payments`),
}

// Payments API
export const paymentAPI = {
  // Listar pagos
  getPayments: () => apiRequest('/payments'),
  
  // Obtener pago específico
  getPayment: (id: string) => apiRequest(`/payments/${id}`),
  
  // Crear pago
  createPayment: (paymentData: Omit<Payment, 'id'>) =>
    apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // Eliminar pago
  deletePayment: (id: string) =>
    apiRequest(`/payments/${id}`, {
      method: 'DELETE',
    }),
}
