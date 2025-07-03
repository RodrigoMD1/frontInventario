
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Contacto } from '../components/Contacto';
import { Inicio } from '../components/inicio';
import { Navbar } from '../components/Layout/Navbar';
import { AuthProvider } from '../contexts/AuthContext';

// Auth components
import { Login } from '../components/Auth/Login';
import { Register } from '../components/Auth/Register';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';

// Dashboard components
import { Dashboard } from '../components/Dashboard/Dashboard';

// Subscription components
import { SubscriptionPlans } from '../components/Subscription/SubscriptionPlans';

// Payment components
import { PaymentSuccess } from '../components/Payment/PaymentSuccess';
import { PaymentFailure } from '../components/Payment/PaymentFailure';
import { PaymentPending } from '../components/Payment/PaymentPending';

export const MisRutas = () => {
  return (
    <AuthProvider>
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

          {/* Rutas de autenticación */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

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

          {/* Rutas que requieren suscripción */}
          <Route path="/products" element={
            <ProtectedRoute requireSubscription={true}>
              <>
                <Navbar />
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold">Gestión de Productos</h1>
                  <p className="mt-2 text-lg">Administra tu inventario</p>
                  <p className="mt-4 text-gray-600">Próximamente: Sistema completo de productos</p>
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
    </AuthProvider>
  )
}
