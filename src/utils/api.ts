/* eslint-disable @typescript-eslint/no-unused-vars */
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
  store?: Store
  storeId?: string // ID de la tienda para crear/editar productos
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
import { useLocation } from 'react-router-dom'

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

  try {
    console.log(`🔄 API Request: ${endpoint}`, { method: options.method || 'GET' });
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Si el token expiró, redirigir al login SOLO si no estamos ya en login/register
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/auth/login') && !currentPath.startsWith('/auth/register')) {
        window.location.href = '/auth/login'
      }
      throw new Error('Token expirado')
    }

    if (!response.ok) {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.clone().json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch (_) {
        try {
          // Si no es JSON, intentar como texto
          errorMessage = await response.clone().text();
        } catch (_) {
          // Si todo falla, quedarse con el mensaje HTTP
        }
      }
      
      console.error(`❌ Error API ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    return response.json()
  } catch (error) {
    console.error(`❌ Error en apiRequest ${endpoint}:`, error);
    throw error;
  }
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
  
  // Verificar si el usuario tiene tienda y obtener la primera
  getOrCreateStore: async (defaultName?: string) => {
    try {
      console.log('🔍 Verificando tiendas del usuario...')
      let stores = [];
      
      try {
        // Intentar obtener tiendas existentes
        stores = await apiRequest('/stores')
        console.log('📋 Tiendas obtenidas del backend:', stores);
        
        // Si el usuario ya tiene tiendas, usar la primera
        if (Array.isArray(stores) && stores.length > 0) {
          // Verificar que la tienda tenga un ID válido
          const firstStore = stores[0];
          
          if (firstStore && firstStore.id) {
            console.log('✅ Tienda encontrada con ID:', firstStore.id);
            return { success: true, store: firstStore, isNew: false };
          } else {
            console.warn('⚠️ Se encontró una tienda pero no tiene un ID válido:', firstStore);
            // Continuaremos intentando crear una nueva tienda
          }
        } else {
          console.log('ℹ️ El usuario no tiene tiendas configuradas');
        }
      } catch (storeError) {
        // Si hay un error 404, lo más probable es que no tenga tiendas aún
        // o que el endpoint no esté implementado correctamente
        console.warn('⚠️ No se encontraron tiendas o el endpoint falló:', storeError);
        // Continuamos con la creación de la tienda
      }
      
      // Si no tiene tiendas y proporcionó un nombre, crear una
      if (defaultName) {
        console.log('🏪 Creando tienda nueva:', defaultName);
        
        try {
          // Intentar crear la tienda
          const newStore = await apiRequest('/stores', {
            method: 'POST',
            body: JSON.stringify({ 
              name: defaultName.trim() || 'Mi Tienda'  // Asegurar que el nombre no esté vacío
            }),
          });
          
          // Verificar que la respuesta tenga un ID válido
          if (newStore && newStore.id) {
            console.log('✅ Tienda creada exitosamente con ID:', newStore.id);
            return { success: true, store: newStore, isNew: true };
          } else {
            console.error('❌ La API devolvió una tienda sin ID válido:', newStore);
            throw new Error('La respuesta del servidor no incluye un ID de tienda válido');
          }
        } catch (createError) {
          console.error('❌ Error al crear tienda:', createError);
          
          // Verificar si el error es por tienda duplicada
          const errorMessage = createError instanceof Error ? createError.message : String(createError);
          
          if (errorMessage.includes('duplicate') || 
              errorMessage.includes('already exists') ||
              errorMessage.includes('unique constraint')) {
            
            console.log('ℹ️ La tienda ya existe, intentando recuperarla...');
            
            // Si la tienda ya existe pero no la pudimos obtener antes, hacer otro intento
            try {
              const retryStores = await apiRequest('/stores');
              
              if (Array.isArray(retryStores) && retryStores.length > 0) {
                const existingStore = retryStores[0];
                
                if (existingStore && existingStore.id) {
                  console.log('✅ Se recuperó tienda existente con ID:', existingStore.id);
                  return { success: true, store: existingStore, isNew: false };
                } else {
                  throw new Error('Se encontró la tienda pero no tiene un ID válido');
                }
              } else {
                throw new Error('No se encontraron tiendas después del intento de creación');
              }
            } catch (retryError) {
              console.error('❌ Error al intentar recuperar tiendas existentes:', retryError);
              
              // Si la API de listar tiendas no funciona bien, intentar una última solución
              // usando el ID del usuario como base para un ID de tienda ficticio
              try {
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
                
                if (user && user.id) {
                  console.warn('⚠️ ATENCIÓN: Usando una tienda inferida basada en el ID del usuario');
                  
                  // Crear una "tienda" local con el ID del usuario
                  const inferredStore = {
                    id: user.id, // NOTA: Esto es una solución temporal, el backend rechazará este ID si no es válido
                    name: defaultName || 'Mi Tienda',
                    isActive: true
                  };
                  
                  return { 
                    success: true, 
                    store: inferredStore,
                    isNew: false, 
                    warning: 'Esta es una tienda inferida. Por favor, contacta con soporte si tienes problemas.'
                  };
                }
              } catch (userError) {
                console.error('❌ Error al intentar inferir tienda desde usuario:', userError);
              }
              
              // Si todo falla, reenviar el error de creación
              throw new Error(`No se pudo crear ni recuperar una tienda: ${errorMessage}`);
            }
          }
          
          // Si no es un error de duplicado o no pudimos recuperar la tienda, lanzar el error original
          throw createError;
        }
      }
      
      // Si no tiene tiendas y no proporcionó nombre
      return { 
        success: false, 
        error: 'No tienes tiendas configuradas y no se proporcionó un nombre para crear una nueva'
      };
    } catch (error) {
      console.error('❌ Error al verificar/crear tienda:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido al verificar/crear tienda'
      };
    }
  }
}

// Products API
export const productAPI = {
  // Listar productos (admin: todos, store: propios)
  getProducts: () => apiRequest('/products'),
  
  // Obtener producto específico
  getProduct: (id: string) => apiRequest(`/products/${id}`),
  
  // Crear producto (solo rol 'store')
  createProduct: async (productData: Omit<Product, 'id' | 'store'>) => {
    try {
      // Importante: Crear una nueva copia del objeto para evitar manipulaciones externas
      const productDataCopy = JSON.parse(JSON.stringify(productData));
      // Reemplazamos productData con la copia para trabajar con ella
      productData = productDataCopy;
      console.log('🔄 Objeto de producto clonado para evitar referencias compartidas');
      console.log('📦 Datos iniciales del producto:', productData);
      
      // IMPORTANTE: Si ya viene un storeId válido, lo respetamos completamente
      if (productData.storeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.storeId)) {
        console.log('✅ USANDO EL STOREID PROPORCIONADO SIN MODIFICAR:', productData.storeId);
        // No hacemos nada, respetamos el storeId que viene
      } else {
        // Solo si no hay storeId válido intentamos obtener uno
        console.warn('⚠️ No se proporcionó storeId válido para el producto, intentando obtener una tienda');
        
        try {
          // Intentar obtener tiendas existentes primero
          console.log('🏪 Intentando obtener tiendas del usuario...');
          let validStore;
          
          try {
            const userStores = await apiRequest('/stores');
            console.log('🏪 Tiendas encontradas:', userStores);
            
            if (Array.isArray(userStores) && userStores.length > 0) {
              // Usar la primera tienda disponible
              validStore = userStores[0];
              console.log('✅ Se utilizará la primera tienda disponible:', validStore);
            }
          } catch (storesError) {
            console.error('❌ Error al obtener tiendas:', storesError);
            console.log('🔄 Intentando crear una tienda automáticamente...');
          }
          
          // Si no se encontraron tiendas, crear una nueva
          if (!validStore) {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
            if (user && user.email) {
              const storeName = `Tienda de ${user.email.split('@')[0]}`;
              console.log('🏪 Creando tienda automáticamente:', storeName);
              
              const storeResult = await storeAPI.getOrCreateStore(storeName);
              
              if (storeResult.success && storeResult.store) {
                validStore = storeResult.store;
                console.log('✅ Tienda creada/obtenida exitosamente:', validStore);
              } else {
                console.error('❌ No se pudo crear/obtener tienda:', storeResult.error);
              }
            }
          }
          
          // Asignar el ID de la tienda validada
          if (validStore && validStore.id) {
            productData.storeId = validStore.id;
            console.log('✅ Se asignó tienda al producto:', validStore.id);
          } else {
            throw new Error('No se pudo obtener o crear una tienda válida');
          }
        } catch (storeError) {
          console.error('❌ Error al obtener/crear tienda para producto:', storeError);
          throw new Error('No se pudo asociar el producto a una tienda. Por favor, verifica que tengas una tienda configurada.');
        }
      }
      
      // Verificación final del storeId
      if (!productData.storeId) {
        throw new Error('No se pudo determinar la tienda para este producto');
      }
      
      // Validar explícitamente el formato del UUID del storeId
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.storeId)) {
        console.error('❌❌ ERROR CRÍTICO: El storeId final no tiene formato UUID válido:', productData.storeId);
        throw new Error(`ID de tienda inválido: ${productData.storeId}`);
      }
      
      // Crear una copia explícita para la petición con el storeId correcto
      const dataToSend = {
        ...productData,
        // NO manipular el storeId, solo enviarlo tal cual está
        storeId: productData.storeId
      };
      
      console.log('🚀 Datos finales a enviar al backend:', JSON.stringify(dataToSend));
      console.log('🔍 Verificación final - storeId enviado:', dataToSend.storeId);
      
      // Agregar un mensaje especial para tracking
      console.log('📢 TRACKER: Enviando producto con storeId:', dataToSend.storeId);
      
      return await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
      });
    } catch (error: unknown) {
      console.error('❌ Error al crear producto:', error);
      // Re-lanzar el error para que pueda ser manejado por el contexto
      throw error;
    }
  },

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
