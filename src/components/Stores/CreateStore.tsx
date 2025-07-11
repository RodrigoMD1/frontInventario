/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import { storeAPI } from '../../utils/api';

const storeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
});

type StoreFormData = z.infer<typeof storeSchema>;

export const CreateStore = () => {
  const [loading, setLoading] = useState(false);
  const [existingStores, setExistingStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema)
  });

  // Cargar tiendas existentes al montar el componente
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoadingStores(true);
        
        // Intenta obtener o crear una tienda si no existe
        const storeName = localStorage.getItem('user') ? 
          `Tienda de ${JSON.parse(localStorage.getItem('user') || '{}').email?.split('@')[0]}` : 
          'Mi Tienda';
        
        // Usar getOrCreateStore en lugar de getMyStores para mayor robustez
        const storeResult = await storeAPI.getOrCreateStore(storeName);
        
        if (storeResult.success) {
          // Si tenemos una tienda, necesitamos obtener su conteo de productos
          try {
            // Obtener todos los productos para contar los de la tienda
            const products = await import('../../utils/api').then(api => api.productAPI.getProducts());
            
            // Contar productos activos asociados a la tienda
            const storeProducts = Array.isArray(products) ? 
              products.filter(product => product.storeId === storeResult.store.id && product.isActive) : 
              [];
            
            console.log(`✅ Encontrados ${storeProducts.length} productos para la tienda`);
            
            // Crear una copia de la tienda con el conteo de productos
            const storeWithCount = {
              ...storeResult.store,
              productsCount: storeProducts.length
            };
            
            setExistingStores([storeWithCount]);
            setError(null);
            console.log('✅ Tienda cargada correctamente con conteo de productos:', storeWithCount);
          } catch (productsError) {
            console.error('Error al obtener productos:', productsError);
            // Si falla al obtener productos, seguimos mostrando la tienda pero sin conteo
            setExistingStores([storeResult.store]);
            setError(null);
            console.log('✅ Tienda cargada correctamente (sin conteo de productos):', storeResult.store);
          }
        } else {
          throw new Error(storeResult.error);
        }
      } catch (err) {
        console.error('Error al cargar tiendas:', err);
        setError('No se pudieron cargar las tiendas existentes');
        setExistingStores([]);
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  const onSubmit = async (data: StoreFormData) => {
    setLoading(true);
    try {
      // Intentar crear la tienda usando getOrCreateStore para mayor robustez
      const storeResult = await storeAPI.getOrCreateStore(data.name);
      
      if (!storeResult.success) {
        throw new Error(storeResult.error);
      }
      
      // Para cualquier tienda (nueva o existente) asegurarnos de que tenga el conteo de productos
      try {
        // Obtener todos los productos para contar los de la tienda
        const products = await import('../../utils/api').then(api => api.productAPI.getProducts());
        
        // Contar productos activos asociados a la tienda
        const storeProducts = Array.isArray(products) ? 
          products.filter(product => product.storeId === storeResult.store.id && product.isActive) : 
          [];
        
        // Crear una copia de la tienda con el conteo de productos
        const storeWithCount = {
          ...storeResult.store,
          productsCount: storeProducts.length
        };
        
        // Actualizar la lista de tiendas
        if (storeResult.isNew) {
          // Si es nueva, la agregamos a la lista
          setExistingStores(prev => [...prev, storeWithCount]);
          
          await Swal.fire({
            title: '¡Tienda Creada!',
            text: 'La tienda ha sido creada exitosamente. Ahora puedes agregar productos.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        } else {
          // Si ya existe, actualizamos la tienda existente con el nuevo conteo
          setExistingStores(prev => 
            prev.map(store => store.id === storeResult.store.id ? storeWithCount : store)
          );
          
          await Swal.fire({
            title: 'Tienda Existente',
            text: 'Esta tienda ya existía en tu cuenta y está activa.',
            icon: 'info',
            confirmButtonColor: '#3b82f6'
          });
        }
        
      } catch (productsError) {
        console.error('Error al obtener productos al crear tienda:', productsError);
        
        // Si hay error al obtener productos, seguir con la tienda sin conteo
        if (storeResult.isNew) {
          setExistingStores(prev => [...prev, storeResult.store]);
        }
        
        await Swal.fire({
          title: storeResult.isNew ? '¡Tienda Creada!' : 'Tienda Existente',
          text: storeResult.isNew ? 
            'La tienda ha sido creada exitosamente. Ahora puedes agregar productos.' : 
            'Esta tienda ya existía en tu cuenta y está activa.',
          icon: storeResult.isNew ? 'success' : 'info',
          confirmButtonColor: '#3b82f6'
        });
      }
      
      // Redirigir al dashboard o a la página de productos
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error al crear tienda:', error);
      
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al crear la tienda',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Tienda</h1>
              <p className="mt-2 text-gray-600">Crea o administra tu tienda para poder agregar productos</p>
            </div>
            <NavLink 
              to="/dashboard" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Volver al Dashboard
            </NavLink>
          </div>
        </div>

        {/* Panel de tiendas existentes */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tus Tiendas</h2>
          
          {isLoadingStores ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-2 text-blue-600">Cargando tiendas...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
              <p>{error}</p>
              <button 
                onClick={async () => {
                  setIsLoadingStores(true);
                  setError(null);
                  // Reintentar con getOrCreateStore
                  const storeName = localStorage.getItem('user') ? 
                    `Tienda de ${JSON.parse(localStorage.getItem('user') || '{}').email?.split('@')[0]}` : 
                    'Mi Tienda';
                  
                  try {
                    const result = await storeAPI.getOrCreateStore(storeName);
                    
                    if (result.success) {
                      try {
                        // Obtener todos los productos para contar los de la tienda
                        const products = await import('../../utils/api').then(api => api.productAPI.getProducts());
                        
                        // Contar productos activos asociados a la tienda
                        const storeProducts = Array.isArray(products) ? 
                          products.filter(product => product.storeId === result.store.id && product.isActive) : 
                          [];
                        
                        console.log(`✅ Encontrados ${storeProducts.length} productos para la tienda`);
                        
                        // Crear una copia de la tienda con el conteo de productos
                        const storeWithCount = {
                          ...result.store,
                          productsCount: storeProducts.length
                        };
                        
                        setExistingStores([storeWithCount]);
                        console.log('✅ Tienda cargada correctamente con conteo de productos:', storeWithCount);
                      } catch (productsError) {
                        console.error('Error al obtener productos:', productsError);
                        // Si falla al obtener productos, seguimos mostrando la tienda pero sin conteo
                        setExistingStores([result.store]);
                        console.log('✅ Tienda cargada correctamente (sin conteo de productos):', result.store);
                      }
                    } else {
                      setError(result.error || 'No se pudo cargar la tienda');
                      setExistingStores([]);
                    }
                  } catch (err) {
                    console.error('Error al reintentar carga de tiendas:', err);
                    setError('Error al reintentar. Por favor, intenta nuevamente más tarde.');
                    setExistingStores([]);
                  } finally {
                    setIsLoadingStores(false);
                  }
                }}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Reintentar
              </button>
            </div>
          ) : existingStores.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-700">No tienes ninguna tienda creada. Crea una para poder agregar productos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingStores.map(store => (
                    <tr key={store.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {store.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.productsCount || 0} productos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <NavLink to={`/products`} className="text-blue-600 hover:text-blue-900 mr-3">Ver productos</NavLink>
                        <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulario para crear nueva tienda */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Tienda</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Tienda *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Mi Tienda de Suministros"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </div>
                ) : (
                  'Crear Tienda'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
