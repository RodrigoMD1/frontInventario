      {/* Sección de partners y empresas que confían */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Empresas que confían en GlobalOffice</h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <img src="/vite.svg" alt="Partner 1" className="h-12 w-auto grayscale opacity-70" />
            <img src="/src/assets/react.svg" alt="Partner 2" className="h-12 w-auto grayscale opacity-70" />
            <img src="/src/assets/img/codigoimg03.jpg" alt="Partner 3" className="h-12 w-auto rounded-lg object-cover grayscale opacity-70" />
            <img src="/src/assets/img/fondoIndia02.jpg" alt="Partner 4" className="h-12 w-auto rounded-lg object-cover grayscale opacity-70" />
          </div>
        </div>
      </section>

      {/* Sección de beneficios extra */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">¿Por qué elegir GlobalOffice?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center"><span className="text-blue-500 text-xl mr-2">🌎</span> Acceso desde cualquier lugar y dispositivo</li>
              <li className="flex items-center"><span className="text-blue-500 text-xl mr-2">🕒</span> Soporte técnico 24/7</li>
              <li className="flex items-center"><span className="text-blue-500 text-xl mr-2">🔗</span> Integración con MercadoPago, Google Sheets y más</li>
              <li className="flex items-center"><span className="text-blue-500 text-xl mr-2">💡</span> Actualizaciones automáticas y nuevas funciones cada mes</li>
              <li className="flex items-center"><span className="text-blue-500 text-xl mr-2">📱</span> App móvil disponible (próximamente)</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <img src={prueba01} alt="App móvil" className="rounded-xl shadow-lg w-full max-w-xs object-cover" />
          </div>
        </div>
      </section>

      {/* Sección de preguntas frecuentes */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="font-semibold text-blue-700 mb-2">¿Puedo usar GlobalOffice gratis?</h3>
              <p className="text-gray-700">Sí, puedes crear tu cuenta y comenzar a gestionar tu inventario sin costo. Hay planes premium con funciones avanzadas.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="font-semibold text-blue-700 mb-2">¿Cómo protegen mis datos?</h3>
              <p className="text-gray-700">Tus datos están cifrados y respaldados en servidores seguros. Solo tú y tus usuarios autorizados pueden acceder.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="font-semibold text-blue-700 mb-2">¿Puedo integrar mi tienda online?</h3>
              <p className="text-gray-700">Sí, GlobalOffice permite integración con sistemas externos mediante API Keys y conectores.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="font-semibold text-blue-700 mb-2">¿Tienen soporte técnico?</h3>
              <p className="text-gray-700">Nuestro equipo está disponible 24/7 para ayudarte por chat, email o teléfono.</p>
            </div>
          </div>
        </div>
      </section>

import { HeroSection } from './Layout/HeroSection'
import fondoIndia01 from '../assets/img/fondoIndia01.jpg'
import city01 from '../assets/img/city01.jpg'
import prueba01 from '../assets/img/prueba01.jpg'

export const Inicio = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <HeroSection />

      {/* Sección principal */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 py-12 gap-8">
        <div className="md:w-1/2 text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 leading-tight">Bienvenido a GlobalOffice</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">La plataforma más completa y moderna para la gestión de inventarios empresariales.</p>
          <ul className="mb-6 space-y-2">
            <li className="flex items-center text-gray-600"><span className="text-blue-500 text-xl mr-2">✔️</span> Reportes en tiempo real y estadísticas avanzadas</li>
            <li className="flex items-center text-gray-600"><span className="text-blue-500 text-xl mr-2">✔️</span> Control de stock y alertas automáticas</li>
            <li className="flex items-center text-gray-600"><span className="text-blue-500 text-xl mr-2">✔️</span> Multiusuario y multi-tienda</li>
            <li className="flex items-center text-gray-600"><span className="text-blue-500 text-xl mr-2">✔️</span> Integración con sistemas externos y pagos</li>
            <li className="flex items-center text-gray-600"><span className="text-blue-500 text-xl mr-2">✔️</span> Seguridad y respaldo en la nube</li>
          </ul>
          <a href="/auth/register" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">Comenzar ahora</a>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img src={fondoIndia01} alt="Inventario moderno" className="rounded-xl shadow-lg w-full max-w-md object-cover" />
        </div>
      </section>

      {/* Sección de características */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-lg p-6 shadow text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2 text-blue-700">Gestión de Productos</h3>
            <p className="text-gray-600">Agrega, edita y controla tus productos fácilmente. Visualiza el stock y recibe alertas automáticas.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2 text-blue-700">Reportes Inteligentes</h3>
            <p className="text-gray-600">Obtén estadísticas en tiempo real, gráficos y reportes personalizados para tomar mejores decisiones.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2 text-blue-700">Seguridad y Respaldo</h3>
            <p className="text-gray-600">Tus datos siempre protegidos y respaldados en la nube. Acceso seguro y control de usuarios.</p>
          </div>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Lo que dicen nuestros clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <img src={city01} alt="Cliente 1" className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
              <p className="text-gray-700 italic mb-2">"GlobalOffice me permitió ahorrar tiempo y dinero en la gestión de mi inventario. ¡Recomendado!"</p>
              <p className="text-blue-600 font-semibold">- Juan Pérez, PyME</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <img src={prueba01} alt="Cliente 2" className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
              <p className="text-gray-700 italic mb-2">"La integración con MercadoPago y los reportes automáticos son espectaculares. Muy fácil de usar."</p>
              <p className="text-blue-600 font-semibold">- Laura Gómez, Comercio</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <img src={fondoIndia01} alt="Cliente 3" className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
              <p className="text-gray-700 italic mb-2">"La seguridad y el soporte técnico son excelentes. Nunca perdí información y el sistema es muy rápido."</p>
              <p className="text-blue-600 font-semibold">- Carlos Ruiz, Distribuidora</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de llamada a la acción final */}
      <section className="py-12 bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para transformar tu inventario?</h2>
          <p className="text-lg text-blue-100 mb-6">Regístrate gratis y comienza a gestionar tu negocio de manera profesional.</p>
          <a href="/auth/register" className="inline-block px-8 py-4 bg-white text-blue-700 font-bold rounded-lg shadow hover:bg-blue-50 transition">Crear cuenta gratis</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-100 py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} GlobalOffice. Todos los derechos reservados.
      </footer>
    </div>
  )
}
