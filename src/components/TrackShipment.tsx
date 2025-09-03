import { useState } from 'react'

export const TrackShipment = () => {
  const [pedidoId, setPedidoId] = useState('')
  const [tracking, setTracking] = useState<null | { status: string; fecha: string }>(null)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    // Simulación de estados de envío
    if (!pedidoId.startsWith('LQ-')) {
      setError('El número de pedido no es válido.')
      setTracking(null)
      return
    }
    // Simular estados aleatorios
    const estados = [
      { status: 'Procesando pedido', fecha: 'Hoy' },
      { status: 'En preparación', fecha: 'Hoy' },
      { status: 'Enviado', fecha: 'Mañana' },
      { status: 'En camino', fecha: 'Pasado mañana' },
      { status: 'Entregado', fecha: 'En 3 días' },
    ]
    const idx = Math.min(pedidoId.length % estados.length, estados.length - 1)
    setTracking(estados[idx])
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4 text-center">Seguimiento de envío</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Número de pedido (ej: LQ-123456)"
            value={pedidoId}
            onChange={e => setPedidoId(e.target.value)}
            required
          />
          <button type="submit" className="w-full px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800">Buscar</button>
        </form>
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        {tracking && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-yellow-900">Estado: {tracking.status}</p>
            <p className="text-yellow-700">Fecha estimada: {tracking.fecha}</p>
          </div>
        )}
      </div>
    </div>
  )
}
