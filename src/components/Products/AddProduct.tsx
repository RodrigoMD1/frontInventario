/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { NavLink, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../contexts/useProducts'
import { storeAPI } from '../../utils/api'
// Importar hook de solución temporal
import { useProductCreation } from '../../hooks/useProductCreation'

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor a 0'),
  category: z.string().optional(),
  description: z.string().optional(),
  cost: z.number().min(0, 'El costo debe ser mayor a 0').optional(),
  unit: z.string().optional(),
  storeId: z.string().optional() // Añadido para asociar con la tienda
})

type ProductFormData = z.infer<typeof productSchema>

export const AddProduct = () => {
  const [checkingStore, setCheckingStore] = useState(true)
  const [storeVerified, setStoreVerified] = useState(false)
  const [storeError, setStoreError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Usar el hook de creación de producto con solución temporal
  const { createProduct, loading, verifiedStoreId: hookStoreId, hasStoreId } = useProductCreation()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  })
  
  // Estado local para almacenar el ID de la tienda verificada
  const [verifiedStoreId, setVerifiedStoreId] = useState<string>('');
  
  // Al cargar el componente, verificar que el usuario tenga una tienda
  useEffect(() => {
    const verifyUserStore = async () => {
      if (user?.role === 'store') {
        try {
          setCheckingStore(true)
          const storeName = user.email ? `Tienda de ${user.email.split('@')[0]}` : 'Mi Tienda';
          console.log('🔍 Verificando tienda para el usuario...');
          const storeResult = await storeAPI.getOrCreateStore(storeName)
          
          if (storeResult.success && storeResult.store && storeResult.store.id) {
            setStoreVerified(true)
            
            // Almacenar el ID de la tienda verificada para usarlo después
            setVerifiedStoreId(storeResult.store.id);
            
            console.log('✅ Tienda verificada y almacenada:', storeResult.store.id);
            
            // Guardar en localStorage para referencia en caso de errores
            localStorage.setItem('globaloffice_verified_store_id', storeResult.store.id);
            
            if (storeResult.isNew) {
              console.log('🎉 Se ha creado una nueva tienda automáticamente');
            }
          } else {
            setStoreError(storeResult.error || 'No se encontró una tienda asociada a tu cuenta')
            console.error('❌ Error de tienda:', storeResult.error)
          }
        } catch (error) {
          console.error('❌ Error al verificar tienda:', error)
          setStoreError('Error al verificar la tienda. Por favor, intenta más tarde.')
        } finally {
          setCheckingStore(false)
        }
      } else {
        // Si es admin, no necesita tienda
        setStoreVerified(true)
        setCheckingStore(false)
      }
    }
    
    verifyUserStore()
  }, [user])

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log('📦 Enviando datos del producto:', data);
      
      // SOLUCIÓN TEMPORAL: Usar el hook de createProduct que tiene múltiples estrategias
      console.log('🚀 Usando solución temporal con hook useProductCreation');
      console.log('� ID de tienda verificado del hook:', hookStoreId);
      
      if (hookStoreId) {
        console.log('✅ Hook tiene un ID de tienda válido:', hookStoreId);
      } else {
        console.log('⚠️ Hook no tiene un ID de tienda válido, usará estrategias alternativas');
      }
      
      // Intentar con el hook de creación temporal
      const productData = {
        name: data.name,
        price: data.price,
        stock: data.stock,
        category: data.category || '',
        description: data.description || '',
        cost: data.cost,
        unit: data.unit || '',
        // No incluir storeId aquí - el hook se encargará
      };
      
      console.log('📦 Datos del producto a enviar al hook:', JSON.stringify(productData));
      
      // Crear el producto usando el hook que intentará múltiples estrategias
      const response = await createProduct(productData);
      
      // También podemos intentar usar el ID del usuario como storeId como solución
      // alternativa si todas las demás estrategias fallan
      console.log('ℹ️ ID del usuario para posible uso como storeId:', user?.id);
      
      console.log('✅ Producto agregado exitosamente:', response);
      
      await Swal.fire({
        title: '¡Producto Agregado!',
        text: 'El producto ha sido agregado exitosamente al inventario y sincronizado con la base de datos',
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });
      
      // Redirigir a la lista de productos
      navigate('/products');
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      
      // Determinar el mensaje de error
      let errorMessage = 'No se pudo agregar el producto. Intenta nuevamente.';
      let errorDetail = '';
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        
        // Detectar error específico de falta de tienda
        if (error.message.includes('foreign key constraint') || 
            error.message.includes('not present in table "store"') ||
            error.message.includes('FK_32eaa54ad96b26459158464379a')) {
          errorMessage = 'Error: No se encontró una tienda asociada a tu cuenta';
          errorDetail = 'Debes tener una tienda configurada antes de agregar productos. El backend está usando otro ID de tienda (8efc03a2-f607-4b49-9373-47dba85f86c6).';
          
          // Información adicional para debugging
          console.error('🔍 ERROR DE CLAVE FORÁNEA DETECTADO:');
          console.error('   Frontend storeId:', hookStoreId || verifiedStoreId);
          console.error('   Backend storeId (problematico):', '8efc03a2-f607-4b49-9373-47dba85f86c6');
          console.error('   ID del usuario:', user?.id);
        }
      }
      
      await Swal.fire({
        title: 'Error',
        html: errorDetail ? `${errorMessage}<br><br><small>${errorDetail}</small>` : errorMessage,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      
      // Si el error es por falta de tienda, redirigir al usuario a la página de creación de tienda
      if (errorDetail.includes('tienda')) {
        await Swal.fire({
          title: '¿Crear tienda ahora?',
          text: 'Necesitas crear una tienda antes de agregar productos. ¿Deseas hacerlo ahora?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, crear tienda',
          cancelButtonText: 'No, más tarde',
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/store/create');
          }
        });
      }
    } finally {
      // No hacer nada aquí, el estado loading es manejado por el hook
    }
  }

  const getPlanName = (plan: string | null | undefined) => {
    switch (plan) {
      case 'basic': return 'Básico'
      case 'premium': return 'Premium'
      case 'free':
      default: return 'Gratuito'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agregar Producto</h1>
              <p className="mt-2 text-gray-600">Añade un nuevo producto a tu inventario</p>
            </div>
            <NavLink 
              to="/dashboard" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Volver al Dashboard
            </NavLink>
          </div>
        </div>

        {/* Mensajes de estado de la tienda */}
        {checkingStore && (
          <div className="bg-blue-50 p-4 rounded-md mb-6 flex items-center">
            <div className="mr-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <div>
              <p className="text-blue-700">Verificando tu tienda...</p>
              <p className="text-xs text-blue-600">Esto solo tomará un momento</p>
            </div>
          </div>
        )}

        {!checkingStore && !storeVerified && storeError && (
          <div className="bg-yellow-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No tienes una tienda configurada
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{storeError}</p>
                  <button 
                    type="button" 
                    onClick={() => navigate('/store/create')}
                    className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Ir a crear tienda →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!checkingStore && storeVerified && (
          <div className="bg-green-50 p-4 rounded-md mb-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-800">Tu tienda está configurada correctamente. Puedes agregar productos.</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Overlay de estado de verificación */}
            {(checkingStore || (!storeVerified && storeError)) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                {checkingStore ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    <p className="text-blue-600">Verificando tienda...</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <svg className="h-12 w-12 text-yellow-400 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-800 font-medium">Se necesita configurar una tienda primero</p>
                    <button 
                      type="button"
                      onClick={() => navigate('/store/create')}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Configurar Tienda
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Laptop HP Pavilion"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    {...register('category')}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Muebles">Muebles</option>
                    <option value="Software">Software</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Precios y Stock */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Precios y Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de Venta *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="0.00"
                    {...register('cost', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    {...register('stock', { valueAsNumber: true })}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles Adicionales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    {...register('unit')}
                  >
                    <option value="">Seleccionar unidad</option>
                    <option value="pza">Pieza</option>
                    <option value="kg">Kilogramo</option>
                    <option value="lt">Litro</option>
                    <option value="mt">Metro</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    rows={3}
                    placeholder="Descripción del producto..."
                    {...register('description')}
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <NavLink 
                to="/dashboard" 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </NavLink>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || checkingStore || (!storeVerified && !!storeError)}
                title={(!storeVerified && storeError) ? "Necesitas configurar una tienda primero" : ""}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Guardando...
                  </>
                ) : checkingStore ? (
                  'Verificando tienda...'
                ) : (!storeVerified && storeError) ? (
                  'Configurar tienda primero'
                ) : (
                  'Agregar Producto'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Información del plan */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Plan {getPlanName(user?.plan)}:</strong> Tienes espacio para más productos en tu inventario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
