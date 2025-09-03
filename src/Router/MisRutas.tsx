import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Contacto } from '../components/Contacto';
import { Inicio } from '../components/inicio';
import { Navbar } from '../components/Layout/Navbar';
import { AuthProvider } from '../contexts/AuthContext';
import { ProductProvider } from '../contexts/ProductContext';
import { CartProvider } from '../contexts/CartContext'

// Auth components
import { Login } from '../components/Auth/Login';
import { Register } from '../components/Auth/Register';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';

// Dashboard components
import { Dashboard } from '../components/Dashboard/Dashboard';

// Product components
import { AddProduct } from '../components/Products/AddProduct';
import { Inventory } from '../components/Products/Inventory';
import { EditProduct } from '../components/Products/EditProduct';

// Store components
import { CreateStore } from '../components/Stores/CreateStore';

// Subscription components
import { SubscriptionPlans } from '../components/Subscription/SubscriptionPlans';

// Payment components
import { PaymentSuccess } from '../components/Payment/PaymentSuccess';
import { PaymentFailure } from '../components/Payment/PaymentFailure';
import { PaymentPending } from '../components/Payment/PaymentPending';

// Integration components
import { ApiKeys } from '../components/Integration/ApiKeys';

// Leather Queens components
import { LeatherQueens } from '../components/LeatherQueens';

// Cart components
import { Cart } from '../components/Cart';
import { Checkout } from '../components/Checkout';
import { TrackShipment } from '../components/TrackShipment';

export const MisRutas = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <BrowserRouter>
          <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={
            <>
              <Navbar />
              <Inicio />
              <Footer />
            </>
          } />
          
          <Route path="/inicio" element={
            <>
              <Navbar />
              <Inicio />
              <Footer />
            </>
          } />
          
          <Route path="/contacto" element={
            <>
              <Navbar />
              <Contacto />
              <Footer />
            </>
          } />

          <Route path="/leatherqueens" element={
            <CartProvider>
              <Navbar />
              <LeatherQueens />
              <Footer />
            </CartProvider>
          } />

          <Route path="/cart" element={
            <CartProvider>
              <Navbar />
              <Cart />
              <Footer />
            </CartProvider>
          } />

           <Route path="/checkout" element={
              <CartProvider>
                <Navbar />
                <Checkout />
                <Footer />
              </CartProvider>
            } />

            <Route path="/seguimiento" element={
              <>
                <Navbar />
                <TrackShipment />
                <Footer />
              </>
            } />

          {/* Rutas de autenticación */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Ruta para gestionar tienda */}
          <Route path="/store/create" element={
            <ProtectedRoute>
              <CreateStore />
            </ProtectedRoute>
          } />

          {/* Rutas protegidas - Dashboard básico */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Dashboard />
              </>
            </ProtectedRoute>
          } />

          {/* Rutas de suscripción */}
          <Route path="/subscription/plans" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <SubscriptionPlans />
              </>
            </ProtectedRoute>
          } />

          {/* Rutas de pagos - MercadoPago callbacks */}
          <Route path="/payment/success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          <Route path="/payment/failure" element={
            <ProtectedRoute>
              <PaymentFailure />
            </ProtectedRoute>
          } />
          <Route path="/payment/pending" element={
            <ProtectedRoute>
              <PaymentPending />
            </ProtectedRoute>
          } />

          {/* Rutas de productos e inventario */}
          <Route path="/products" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Inventory />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/products/new" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AddProduct />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/products/edit/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <EditProduct />
              </>
            </ProtectedRoute>
          } />
          
          {/* Ruta de creación de tienda */}
          <Route path="/stores/new" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <CreateStore />
              </>
            </ProtectedRoute>
          } />
          
          {/* Ruta de reportes */}
          <Route path="/reports" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
                        <p className="mt-2 text-gray-600">Visualiza estadísticas y reportes de tu inventario</p>
                      </div>
                      <a 
                        href="/dashboard" 
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ← Volver al Dashboard
                      </a>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h2 className="text-2xl font-semibold mb-4">Módulo de Reportes</h2>
                      <p className="text-gray-600 mb-6">
                        Esta funcionalidad estará disponible próximamente.
                      </p>
                      <p className="text-sm text-gray-500">
                        Los reportes te permitirán analizar el rendimiento de tu inventario,
                        ventas y más estadísticas importantes para tu negocio.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            </ProtectedRoute>
          } />
          
          {/* Ruta de configuración */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                        <p className="mt-2 text-gray-600">Ajusta la configuración de tu cuenta</p>
                      </div>
                      <a 
                        href="/dashboard" 
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ← Volver al Dashboard
                      </a>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                      <div className="text-6xl mb-4">⚙️</div>
                      <h2 className="text-2xl font-semibold mb-4">Ajustes del Sistema</h2>
                      <p className="text-gray-600 mb-6">
                        Esta funcionalidad estará disponible próximamente.
                      </p>
                      <p className="text-sm text-gray-500">
                        Aquí podrás personalizar la configuración de tu cuenta,
                        notificaciones, y preferencias del sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            </ProtectedRoute>
          } />

          {/* Rutas de administrador */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin={true}>
              <>
                <Navbar />
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold">Panel de Administración</h1>
                  <p className="mt-2 text-lg">Gestiona usuarios y suscripciones</p>
                  <p className="mt-4 text-gray-600">Próximamente: Panel completo de administración</p>
                </div>
              </>
            </ProtectedRoute>
          } />

          {/* Rutas de integración */}
          <Route path="/integration/api-keys" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ApiKeys />
              </>
            </ProtectedRoute>
          } />

          {/* Error 404 */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h1 className="text-4xl font-bold text-red-600">Error 404</h1>
                <p className="mt-2 text-lg">La página que buscas no existe en GlobalOffice.</p>
                <p className="mt-4">
                  <a href="/inicio" className="text-blue-600 hover:underline">
                    Volver al inicio
                  </a>
                </p>
              </div>
            }
          />
        </Routes>
        </BrowserRouter>
      </ProductProvider>
    </AuthProvider>
  )
}
