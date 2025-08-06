import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import Swal from 'sweetalert2'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  expiresAt?: string
  lastUsed?: string
}

export const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  useEffect(() => {
    // TODO: Implementar cuando el backend esté listo
    // fetchApiKeys()
    setLoading(false)
    
    // Datos de ejemplo para mostrar la interfaz
    setApiKeys([
      {
        id: '1',
        name: 'Mi Sitio Web',
        key: 'gsk_live_abc123***',
        permissions: ['read_products', 'read_store_info'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        lastUsed: '2024-01-20T14:30:00Z'
      }
    ])
  }, [])

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      await Swal.fire({
        title: 'Error',
        text: 'Debes proporcionar un nombre para la API Key',
        icon: 'error'
      })
      return
    }

    try {
      // TODO: Implementar llamada al backend
      // const newKey = await apiRequest('/api/keys', {
      //   method: 'POST',
      //   body: JSON.stringify({ name: newKeyName })
      // })

      // Simular generación de API key
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `gsk_live_${Math.random().toString(36).substring(2, 15)}`,
        permissions: ['read_products', 'read_store_info'],
        isActive: true,
        createdAt: new Date().toISOString()
      }

      setApiKeys(prev => [...prev, newKey])
      setNewKeyName('')
      setShowCreateForm(false)

      await Swal.fire({
        title: '¡API Key Creada!',
        html: `
          <p>Tu nueva API Key ha sido generada:</p>
          <div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; font-family: monospace; font-size: 14px; word-break: break-all;">
            ${newKey.key}
          </div>
          <p style="color: #e74c3c; font-size: 12px;">⚠️ Guarda esta clave en un lugar seguro. No podrás verla nuevamente.</p>
        `,
        icon: 'success'
      })
    } catch (error) {
      console.error('Error creating API key:', error)
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la API Key',
        icon: 'error'
      })
    }
  }

  const revokeApiKey = async (keyId: string, keyName: string) => {
    const result = await Swal.fire({
      title: '¿Revocar API Key?',
      text: `¿Estás seguro de que deseas revocar la API Key "${keyName}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, revocar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        // TODO: Implementar llamada al backend
        // await apiRequest(`/api/keys/${keyId}`, { method: 'DELETE' })

        setApiKeys(prev => prev.filter(key => key.id !== keyId))

        await Swal.fire({
          title: 'API Key Revocada',
          text: 'La API Key ha sido revocada exitosamente',
          icon: 'success'
        })
      } catch (error) {
        console.error('Error revoking API key:', error)
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo revocar la API Key',
          icon: 'error'
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
              <p className="mt-2 text-gray-600">Gestiona el acceso externo a tu inventario</p>
            </div>
            <NavLink 
              to="/dashboard" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Volver al Dashboard
            </NavLink>
          </div>
        </div>

        {/* Información sobre la integración */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">¿Cómo usar las API Keys?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Las API Keys te permiten conectar sitios web externos a tu inventario. Ejemplo de uso:</p>
                <div className="mt-3 bg-blue-100 p-3 rounded font-mono text-xs">
                  {`// JavaScript para mostrar productos en tu sitio web
fetch('${window.location.origin}/api/public/products/tu-tienda-id', {
  headers: {
    'X-API-Key': 'tu-api-key-aqui'
  }
})
.then(response => response.json())
.then(products => {
  // Mostrar productos en tu sitio
});`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para crear nueva API Key */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Nueva API Key
          </button>
        </div>

        {/* Formulario para crear API Key */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva API Key</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la aplicación *
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Ej: Mi Sitio Web, Tienda Online, etc."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={generateApiKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Generar API Key
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de API Keys */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Tus API Keys ({apiKeys.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <p className="text-gray-500">No tienes API Keys creadas</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Crear primera API Key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último uso</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                        <div className="text-sm text-gray-500">Creada el {new Date(apiKey.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {apiKey.key}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {apiKey.isActive ? 'Activa' : 'Revocada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {apiKey.isActive && (
                          <button
                            onClick={() => revokeApiKey(apiKey.id, apiKey.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revocar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Documentación de la API */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documentación de la API</h3>
          <div className="prose max-w-none">
            <h4 className="text-md font-medium text-gray-900">Endpoints disponibles:</h4>
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-mono text-sm text-blue-600">GET /api/public/products</div>
                <p className="text-sm text-gray-600 mt-1">Obtiene todos los productos de tu tienda</p>
                <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
                  Headers: X-API-Key: tu-api-key
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-mono text-sm text-blue-600">GET /api/public/products/:id</div>
                <p className="text-sm text-gray-600 mt-1">Obtiene un producto específico</p>
                <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
                  Headers: X-API-Key: tu-api-key
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-mono text-sm text-blue-600">GET /api/public/store-info</div>
                <p className="text-sm text-gray-600 mt-1">Obtiene información básica de tu tienda</p>
                <div className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
                  Headers: X-API-Key: tu-api-key
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta funcionalidad requiere cambios en el backend que aún no están implementados. 
                Esta interfaz te permite preparar y visualizar cómo funcionará la integración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
