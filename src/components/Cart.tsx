import { useCart } from '../contexts/CartContext'

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
        <h2 className="text-2xl font-bold mb-4 text-yellow-900">Tu carrito está vacío</h2>
        <a href="/leatherqueens" className="text-yellow-700 underline">Ver productos</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-yellow-900 mb-6 text-center">Carrito de compras</h2>
        <ul className="divide-y divide-yellow-100 mb-6">
          {cart.map(item => (
            <li key={item.nombre} className="flex items-center py-4 gap-4">
              <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded border" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">{item.nombre}</h3>
                <span className="text-yellow-800">{item.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
              </div>
              <input
                type="number"
                min={1}
                value={item.cantidad}
                onChange={e => updateQuantity(item.nombre, Number(e.target.value))}
                className="w-16 border rounded px-2 py-1 text-center"
              />
              <button onClick={() => removeFromCart(item.nombre)} className="ml-2 text-red-600 hover:underline">Eliminar</button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-xl text-yellow-900">Total:</span>
          <span className="font-bold text-xl text-yellow-900">{total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={clearCart} className="w-full px-4 py-2 bg-yellow-200 text-yellow-900 rounded hover:bg-yellow-300">Vaciar carrito</button>
          <button className="w-full px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800">Finalizar compra</button>
        </div>
      </div>
    </div>
  )
}
