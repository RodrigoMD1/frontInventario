import { HeroSection } from './Layout/HeroSection'

export const Inicio = () => {
  return (
    <div>

      

      <HeroSection />

      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold">Bienvenido a GlobalOffice</h1>
        <p className="mt-2 text-lg">Tu solución integral para el manejo de inventarios empresariales.</p>
        <p>Gestiona tu inventario de forma inteligente con nuestra plataforma cloud. Accede a reportes en tiempo real, controla stock, configura alertas automáticas y mantén tu negocio siempre organizado. Ideal para pequeñas, medianas y grandes empresas que buscan optimizar sus procesos de inventario.</p>
      </div>
    </div>
  )
}
