

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
          className="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 className="text-5xl font-bold">¡Bienvenido a GlobalOffice!</h1>
          <p className="py-6">
            La plataforma líder en gestión de inventarios para tu negocio. Controla, organiza y optimiza 
            todos los productos de tu tienda desde un solo lugar. Con GlobalOffice, administrar tu inventario 
            nunca fue tan fácil y eficiente.
          </p>
          {isAuthenticated ? (
            <NavLink to="/dashboard" className="btn btn-primary">Ir al Dashboard</NavLink>
          ) : (
            <NavLink to="/auth/register" className="btn btn-primary">Comenzar Ahora</NavLink>
          )}
        </div>
      </div>
    </div>
  )
}
