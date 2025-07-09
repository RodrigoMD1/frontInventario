import { createContext, useState, useEffect, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { productAPI } from '../utils/api'

// Definimos la interfaz Product basada en la API
interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  description?: string
  cost?: number
  unit?: string
  isActive: boolean
  createdAt: string
  storeId?: string // Añadido para asociar producto con tienda
}

type ProductFormData = Omit<Product, 'id' | 'isActive' | 'createdAt'>

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: ProductFormData) => Promise<void>
  getProductById: (id: string) => Product | undefined
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  refreshProducts: () => Promise<void>
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined)

interface ProductProviderProps {
  children: ReactNode
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar productos desde la API o localStorage
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Comprobar si el backend está disponible
      try {
        // Intentar obtener productos desde la API
        const productsData = await productAPI.getProducts()
        setProducts(productsData)
  
        // Respaldo en localStorage para uso offline
        localStorage.setItem('globaloffice-products', JSON.stringify(productsData))
        
        console.log('✅ Datos cargados desde el servidor correctamente')
        return // Si llegamos aquí, todo está bien
      } catch (apiError) {
        console.error('⚠️ Error al cargar productos desde API:', apiError)
        setError('Error de conexión con el servidor. Trabajando en modo offline.')
        console.log('⚠️ Trabajando en modo offline con datos locales')
      }
      
      // Si falla la API, intentar usar datos del localStorage
      const savedProducts = localStorage.getItem('globaloffice-products')
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts))
        } catch (localError) {
          console.error('Error al cargar productos locales:', localError)
          setError('No se pudieron recuperar los datos del inventario.')
        }
      } else {
        // Productos de ejemplo si no hay conexión y no hay datos locales
        const initialProducts: Product[] = [
        {
          id: '1',
          name: 'Laptop HP Pavilion',
          price: 15000,
          stock: 5,
          category: 'Electrónicos',
          description: 'Laptop para oficina',
          cost: 12000,
          unit: 'pza',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Silla Ergonómica',
          price: 2500,
          stock: 12,
          category: 'Muebles',
          description: 'Silla de oficina con soporte lumbar',
          cost: 1800,
          unit: 'pza',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Impresora Láser',
          price: 3500,
          stock: 2,
          category: 'Electrónicos',
          description: 'Impresora multifuncional',
          cost: 2800,
          unit: 'pza',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
        setProducts(initialProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al iniciar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para refrescar productos manualmente
  const refreshProducts = async () => {
    await fetchProducts();
  };

  // Agregar un producto usando la API
  const addProduct = async (productData: ProductFormData) => {
    try {
      setLoading(true);
      console.log('🚀 ProductContext: Intentando agregar producto:', productData);
      
      // Verificar que tengamos un storeId válido
      if (!productData.storeId) {
        console.warn('⚠️ ProductContext: No se proporcionó storeId al contexto de productos');
      } else {
        console.log('✅ ProductContext: Usando storeId proporcionado:', productData.storeId);
        
        // Verificar formato UUID para el storeId
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.storeId)) {
          console.warn('⚠️ ProductContext: El storeId no tiene formato de UUID válido:', productData.storeId);
        }
      }
      
      // Validar explícitamente el storeId antes de enviar
      if (!productData.storeId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.storeId)) {
        console.error('❌ ProductContext: El storeId no es válido:', productData.storeId);
        throw new Error(`El ID de tienda proporcionado no es válido: ${productData.storeId}`);
      }

      // Crear el producto a través de la API - Mantener el storeId original sin manipulación
      console.log('📦 ProductContext: Enviando datos a la API:', JSON.stringify({
        ...productData,
        isActive: true,
        storeId: productData.storeId // Mantener el storeId exactamente como viene
      }));
      
      const response = await productAPI.createProduct({
        ...productData,
        isActive: true,
        storeId: productData.storeId // Mantener el storeId exactamente como viene
      });
      
      console.log('🎉 ProductContext: Respuesta exitosa de la API:', response);
      
      // Recargar todos los productos para obtener la lista actualizada
      await fetchProducts();
      return response; // Devolver respuesta para que el componente pueda manejarla
    } catch (err) {
      console.error('❌ ProductContext: Error al agregar producto:', err);
      
      // Mensaje específico según el tipo de error
      let errorMessage = 'No se pudo agregar el producto';
      
      if (err instanceof Error) {
        errorMessage += `: ${err.message}`;
        
        // Verificar si es un error de clave foránea
        if (err.message.includes('foreign key constraint') || 
            err.message.includes('not present in table "store"') ||
            err.message.includes('FK_32eaa54ad96b26459158464379a')) {
          
          console.error('❌❌ Error de clave foránea detectado! La storeId no existe en la tabla de tiendas.');
          console.error('🏪 storeId proporcionado:', productData.storeId);
          
          // Información detallada para debugging
          try {
            const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : {};
            console.log('👤 Usuario actual:', user);
            console.log('🔎 Verificar que el storeId sea diferente del userId');
          } catch (e) {
            console.error('Error al obtener información del usuario:', e);
          }
        }
      }
      
      setError(errorMessage);
      
      // Si falla la API, agregar localmente como respaldo con prefijo 'local-' para identificarlo
      console.log('Fallback: Agregando producto localmente');
      const newProduct: Product = {
        ...productData,
        id: `local-${uuidv4()}`,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts, newProduct];
        localStorage.setItem('globaloffice-products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
      
      // Re-throw error para que el componente pueda manejarlo
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    try {
      setLoading(true);
      
      // Actualizar producto a través de la API
      await productAPI.updateProduct(id, updatedData);
      
      // Recargar productos
      await fetchProducts();
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setError('No se pudo actualizar el producto');
      
      // Si falla la API, actualizar localmente como respaldo
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => 
          product.id === id ? { ...product, ...updatedData } : product
        );
        localStorage.setItem('globaloffice-products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      
      // Eliminar producto a través de la API (soft delete)
      await productAPI.toggleProductStatus(id);
      
      // Recargar productos
      await fetchProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('No se pudo eliminar el producto');
      
      // Si falla la API, marcar como inactivo localmente
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => 
          product.id === id ? { ...product, isActive: false } : product
        );
        localStorage.setItem('globaloffice-products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        getProductById,
        updateProduct,
        deleteProduct,
        refreshProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// El hook useProducts se ha movido a su propio archivo: useProducts.ts
