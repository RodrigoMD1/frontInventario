/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../contexts/useProducts'

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor a 0'),
  category: z.string().optional(),
  description: z.string().optional(),
  cost: z.number().min(0, 'El costo debe ser mayor a 0').optional(),
  unit: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export const EditProduct = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getProductById, updateProduct, loading, error } = useProducts()
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  })

  // Cargar datos del producto al iniciar
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        setProductError('ID de producto no proporcionado')
        setLoadingProduct(false)
        return
      }

      try {
        setLoadingProduct(true)
        const product = getProductById(id)
        
        if (!product) {
          setProductError('No se encontró el producto')
          return
        }

        // Prepopular el formulario con los datos del producto
        reset({
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category || '',
          description: product.description || '',
          cost: product.cost || 0,
          unit: product.unit || '',
        })
        
      } catch (error) {
        console.error('Error al cargar producto:', error)
        setProductError('Error al cargar los datos del producto')
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProductData()
  }, [id, getProductById, reset])

  const onSubmit = async (data: ProductFormData) => {
    if (!id) {
      setProductError('ID de producto no proporcionado')
      return
    }

    try {
      setSavingProduct(true)
      console.log('📦 Enviando datos actualizados del producto:', data)
      
      await updateProduct(id, {
        name: data.name,
        price: data.price,
        stock: data.stock,
        category: data.category || '',
        description: data.description || '',
        cost: data.cost,
        unit: data.unit || '',
      })
      
      console.log('✅ Producto actualizado exitosamente')
      
      await Swal.fire({
        title: '¡Producto Actualizado!',
        text: 'El producto ha sido actualizado exitosamente',
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      })
      
      // Redirigir al inventario
      navigate('/products')
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error)
      
      let errorMessage = 'No se pudo actualizar el producto. Intenta nuevamente.'
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      }
      
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      })
    } finally {
      setSavingProduct(false)
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

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del producto...</p>
        </div>
      </div>
    )
  }

  if (productError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{productError}</p>
          <button 
            onClick={() => navigate('/products')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Inventario
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
              <p className="mt-2 text-gray-600">Modifica la información del producto</p>
            </div>
            <NavLink 
              to="/products" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Volver al Inventario
            </NavLink>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    Stock *
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
                to="/products" 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </NavLink>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={savingProduct}
              >
                {savingProduct ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
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
                <strong>Plan {getPlanName(user?.plan)}:</strong> Puedes editar todos tus productos sin restricciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
