import { useState } from 'react'
import { useCart } from '../contexts/CartContext'

export const Checkout = () => {
  const { cart, clearCart } = useCart()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [form, setForm] = useState({ nombre: '', email: '', direccion: '', telefono: '' })
  const [pedidoId, setPedidoId] = useState<string>('')

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simular generación de pedido y "envío"
    const id = 'LQ-' + Math.floor(Math.random() * 1000000)
    setPedidoId(id)
    setStep('success')
    clearCart()
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
        <h2 className="text-2xl font-bold mb-4 text-yellow-900">¡Pedido realizado con éxito!</h2>
        <p className="mb-2">Tu número de pedido es <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{pedidoId}</span></p>
        <p className="mb-6">Te enviaremos un email con el seguimiento cuando tu pedido sea despachado.</p>
        <a href="/leatherqueens" className="text-yellow-700 underline">Volver a la tienda</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-yellow-900 mb-6 text-center">Finalizar compra</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="nombre" required placeholder="Nombre completo" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          <input name="email" type="email" required placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          <input name="direccion" required placeholder="Dirección de entrega" value={form.direccion} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          <input name="telefono" required placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          <div className="flex justify-between items-center mt-4">
            <span className="font-bold text-yellow-900">Total:</span>
            <span className="font-bold text-yellow-900">{total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 mt-4">Confirmar pedido</button>
        </form>
      </div>
    </div>
  )
}
