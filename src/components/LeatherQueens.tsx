import city01 from '../assets/img/city01.jpg'
import fondoIndia01 from '../assets/img/fondoIndia01.jpg'
import fondoIndia02 from '../assets/img/fondoIndia02.jpg'
import prueba01 from '../assets/img/prueba01.jpg'
import codigoimg03 from '../assets/img/codigoimg03.jpg'
import { useCart } from '../contexts/CartContext'

const productos = [
  // Carteras
  {
    nombre: 'Cartera de Cuero Premium',
    descripcion: 'Cartera artesanal de cuero genuino, costuras reforzadas y diseño elegante.',
    precio: 18999,
    imagen: city01,
    categoria: 'Carteras',
  },
  {
    nombre: 'Cartera Clásica',
    descripcion: 'Diseño clásico, cuero suave, varios compartimentos y cierre magnético.',
    precio: 15999,
    imagen: fondoIndia01,
    categoria: 'Carteras',
  },
  // Cinturones
  {
    nombre: 'Cinturón LeatherQueens',
    descripcion: 'Cinturón clásico de cuero, hebilla metálica y acabado mate.',
    precio: 7999,
    imagen: fondoIndia02,
    categoria: 'Cinturones',
  },
  {
    nombre: 'Cinturón Trenzado',
    descripcion: 'Cinturón de cuero trenzado a mano, ideal para looks casuales.',
    precio: 8999,
    imagen: codigoimg03,
    categoria: 'Cinturones',
  },
  // Billeteras
  {
    nombre: 'Billetera Slim',
    descripcion: 'Billetera compacta, ideal para llevar en el bolsillo. Cuero suave y resistente.',
    precio: 5999,
    imagen: prueba01,
    categoria: 'Billeteras',
  },
  {
    nombre: 'Billetera Clásica',
    descripcion: 'Billetera tradicional con doble costura y espacio para monedas.',
    precio: 6999,
    imagen: city01,
    categoria: 'Billeteras',
  },
  // Accesorios
  {
    nombre: 'Porta Tarjetas Executive',
    descripcion: 'Porta tarjetas de cuero con capacidad para 8 tarjetas y billetes.',
    precio: 4999,
    imagen: fondoIndia01,
    categoria: 'Accesorios',
  },
  {
    nombre: 'Llavero de Cuero',
    descripcion: 'Llavero artesanal, pequeño y elegante, ideal para regalo.',
    precio: 2999,
    imagen: fondoIndia02,
    categoria: 'Accesorios',
  },
]

const categorias = ['Carteras', 'Cinturones', 'Billeteras', 'Accesorios']

import { useState } from 'react'

export const LeatherQueens = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas')
  const { addToCart } = useCart()
  const productosFiltrados = categoriaSeleccionada === 'Todas'
    ? productos
    : productos.filter(p => p.categoria === categoriaSeleccionada)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-yellow-900 mb-2 tracking-tight">LeatherQueens</h1>
        <p className="text-center text-lg text-yellow-800 mb-10">Productos exclusivos de cuero genuino. Calidad, diseño y elegancia en cada pieza.</p>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            className={`px-4 py-2 rounded-full font-semibold border transition ${categoriaSeleccionada === 'Todas' ? 'bg-yellow-700 text-white border-yellow-700' : 'bg-white text-yellow-900 border-yellow-300 hover:bg-yellow-100'}`}
            onClick={() => setCategoriaSeleccionada('Todas')}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full font-semibold border transition ${categoriaSeleccionada === cat ? 'bg-yellow-700 text-white border-yellow-700' : 'bg-white text-yellow-900 border-yellow-300 hover:bg-yellow-100'}`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {productosFiltrados.map((prod, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <img src={prod.imagen} alt={prod.nombre} className="w-40 h-40 object-cover rounded-lg mb-4 border-2 border-yellow-200" />
              <h2 className="text-xl font-bold text-yellow-900 mb-2">{prod.nombre}</h2>
              <p className="text-gray-700 mb-2">{prod.descripcion}</p>
              <span className="text-lg font-semibold text-yellow-800 mb-4">${prod.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
              <button
                className="mt-auto px-6 py-2 bg-yellow-700 text-white rounded-lg font-semibold shadow hover:bg-yellow-800 transition"
                onClick={() => addToCart({ nombre: prod.nombre, precio: prod.precio, imagen: prod.imagen })}
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-yellow-900">
          <h3 className="text-2xl font-bold mb-2">¿Por qué elegir LeatherQueens?</h3>
          <ul className="space-y-2 text-lg">
            <li>✔️ Cuero 100% genuino y artesanal</li>
            <li>✔️ Envíos a todo el país</li>
            <li>✔️ Garantía de satisfacción</li>
            <li>✔️ Atención personalizada</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
