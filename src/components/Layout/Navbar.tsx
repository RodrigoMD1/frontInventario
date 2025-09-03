import { NavLink } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> 
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="z-20 p-2 mt-3 text-xl bg-white shadow menu menu-sm dropdown-content rounded-box w-52">
            <li><NavLink to="/inicio">Inicio</NavLink></li>
            {isAuthenticated && (
              <li>
                <a>Inventario</a>
                <ul className="p-2 ">
                  <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                  <li><NavLink to="/products">Productos</NavLink></li>
                </ul>
              </li>
            )}
            <li><NavLink to="/contacto">Contacto</NavLink></li>
            <li tabIndex={0}>
              <a className="justify-between">
                LeatherQueens <span className="ml-1">▼</span>
              </a>
              <ul className="p-2 bg-white z-30 text-black">
                <li><NavLink to="/leatherqueens">Tienda</NavLink></li>
                <li><NavLink to="/cart">🛒 Carrito</NavLink></li>
                <li><NavLink to="/checkout">Finalizar compra</NavLink></li>
                <li><NavLink to="/seguimiento">Seguimiento</NavLink></li>
              </ul>
            </li>
          </ul>
        </div>
        <NavLink to="/inicio" className="btn btn-ghost text-xl">GlobalOffice</NavLink>
      </div>
      
      <div className="z-20 hidden navbar-center lg:flex">
        <ul className="px-1 text-xl menu menu-horizontal">
          <li><NavLink to="/inicio">Inicio</NavLink></li>
          {isAuthenticated && (
            <li>
              <details>
                <summary>Inventario</summary>
                <ul className="p-2 bg-gray ">
                  <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                  <li><NavLink to="/products">Productos</NavLink></li>
                </ul>
              </details>
            </li>
          )}
          <li><NavLink to="/contacto">Contacto</NavLink></li>
          <li tabIndex={0}>
            <details>
              <summary>LeatherQueens <span className="ml-1">▼</span></summary>
              <ul className="p-2 bg-white z-30 text-black">
                <li><NavLink to="/leatherqueens">Tienda</NavLink></li>
                <li><NavLink to="/cart">🛒 Carrito</NavLink></li>
                <li><NavLink to="/checkout">Finalizar compra</NavLink></li>
                <li><NavLink to="/seguimiento">Seguimiento</NavLink></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      
      <div className="navbar-end">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost rounded-btn">
              <div className="flex items-center space-x-2">
                <div className="avatar placeholder">
                  <div className="bg-blue-500 text-white rounded-full w-8">
                    <span className="text-xs">{user?.email?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <span className="hidden md:block">{user?.email}</span>
              </div>
            </div>
            <ul tabIndex={0} className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
              <li className="menu-title">
                <span>{user?.email}</span>
              </li>
              <li><NavLink to="/dashboard">Mi Dashboard</NavLink></li>
              <li><NavLink to="/subscription/plans">Planes de Suscripción</NavLink></li>
              {user?.plan === 'free' && (
                <li><NavLink to="/subscription/plans" className="text-blue-600">Mejorar Plan</NavLink></li>
              )}
              {user?.role === 'admin' && (
                <li><NavLink to="/admin">Panel Admin</NavLink></li>
              )}
              <li><hr /></li>
              <li><button onClick={logout}>Cerrar Sesión</button></li>
            </ul>
          </div>
        ) : (
          <div className="space-x-2">
            <NavLink to="/auth/login" className="btn btn-ghost">Iniciar Sesión</NavLink>
            <NavLink to="/auth/register" className="btn btn-primary">Registrarse</NavLink>
          </div>
        )}
      </div>
    </div>
  )
}
