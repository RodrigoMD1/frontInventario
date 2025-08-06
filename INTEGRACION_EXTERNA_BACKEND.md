# Guía para Implementar Integración Externa - BACKEND

## Resumen
Para permitir que páginas externas se conecten a tu sistema de inventario, necesitas implementar estos cambios **en el backend**:

## 1. Base de Datos - Nuevas Tablas

### Tabla `api_keys`
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read_products', 'read_store_info'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0
);

CREATE INDEX idx_api_keys_store_id ON api_keys(store_id);
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
```

## 2. Middlewares de Autenticación

### Middleware para API Keys
```javascript
// middleware/apiKeyAuth.js
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API Key requerida',
        message: 'Incluye X-API-Key en los headers' 
      });
    }

    // Buscar la API key en la base de datos
    const keyRecord = await ApiKey.findOne({
      where: { 
        api_key: apiKey, 
        is_active: true 
      },
      include: ['store']
    });

    if (!keyRecord) {
      return res.status(401).json({ 
        error: 'API Key inválida',
        message: 'La API Key no existe o está revocada' 
      });
    }

    // Verificar si la key ha expirado
    if (keyRecord.expires_at && new Date() > keyRecord.expires_at) {
      return res.status(401).json({ 
        error: 'API Key expirada',
        message: 'La API Key ha expirado' 
      });
    }

    // Actualizar último uso
    await keyRecord.update({
      last_used_at: new Date(),
      usage_count: keyRecord.usage_count + 1
    });

    // Agregar información al request
    req.apiKey = keyRecord;
    req.store = keyRecord.store;
    
    next();
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = { validateApiKey };
```

## 3. Controladores Públicos

### API Keys Controller
```javascript
// controllers/apiKeysController.js
const crypto = require('crypto');

class ApiKeysController {
  // Listar API keys del usuario
  async getApiKeys(req, res) {
    try {
      const storeId = req.user.storeId; // Desde el token JWT

      const apiKeys = await ApiKey.findAll({
        where: { store_id: storeId },
        attributes: ['id', 'name', 'api_key', 'permissions', 'is_active', 'created_at', 'last_used_at', 'usage_count'],
        order: [['created_at', 'DESC']]
      });

      // Ocultar parcialmente las API keys por seguridad
      const sanitizedKeys = apiKeys.map(key => ({
        ...key.toJSON(),
        api_key: key.api_key.substring(0, 12) + '***'
      }));

      res.json(sanitizedKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Crear nueva API key
  async createApiKey(req, res) {
    try {
      const { name } = req.body;
      const storeId = req.user.storeId;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Nombre requerido',
          message: 'Debes proporcionar un nombre para la API Key'
        });
      }

      // Generar API key única
      const apiKey = 'gsk_live_' + crypto.randomBytes(32).toString('hex');

      const newApiKey = await ApiKey.create({
        store_id: storeId,
        name: name.trim(),
        api_key: apiKey,
        permissions: ['read_products', 'read_store_info']
      });

      res.status(201).json({
        id: newApiKey.id,
        name: newApiKey.name,
        api_key: apiKey, // Solo se muestra completa al crear
        permissions: newApiKey.permissions,
        created_at: newApiKey.created_at
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Revocar API key
  async revokeApiKey(req, res) {
    try {
      const { keyId } = req.params;
      const storeId = req.user.storeId;

      const apiKey = await ApiKey.findOne({
        where: { 
          id: keyId, 
          store_id: storeId 
        }
      });

      if (!apiKey) {
        return res.status(404).json({ 
          error: 'API Key no encontrada' 
        });
      }

      await apiKey.update({ is_active: false });

      res.json({ 
        message: 'API Key revocada exitosamente' 
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new ApiKeysController();
```

### Public Products Controller
```javascript
// controllers/publicProductsController.js
class PublicProductsController {
  // Obtener productos públicos
  async getProducts(req, res) {
    try {
      const storeId = req.store.id; // Desde el middleware de API key

      const products = await Product.findAll({
        where: { 
          store_id: storeId,
          is_active: true 
        },
        attributes: [
          'id', 'name', 'price', 'stock', 
          'category', 'description', 'image', 
          'unit', 'created_at'
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        store: {
          id: req.store.id,
          name: req.store.name
        },
        products: products,
        total: products.length
      });
    } catch (error) {
      console.error('Error fetching public products:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener producto específico
  async getProduct(req, res) {
    try {
      const { productId } = req.params;
      const storeId = req.store.id;

      const product = await Product.findOne({
        where: { 
          id: productId,
          store_id: storeId,
          is_active: true 
        },
        attributes: [
          'id', 'name', 'price', 'stock', 
          'category', 'description', 'image', 
          'unit', 'created_at'
        ]
      });

      if (!product) {
        return res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
      }

      res.json({
        store: {
          id: req.store.id,
          name: req.store.name
        },
        product: product
      });
    } catch (error) {
      console.error('Error fetching public product:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener información de la tienda
  async getStoreInfo(req, res) {
    try {
      res.json({
        store: {
          id: req.store.id,
          name: req.store.name,
          created_at: req.store.created_at
        },
        api_info: {
          version: '1.0',
          rate_limit: '1000 requests/hour'
        }
      });
    } catch (error) {
      console.error('Error fetching store info:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new PublicProductsController();
```

## 4. Rutas

### Rutas para Gestión de API Keys (Privadas)
```javascript
// routes/apiKeys.js
const express = require('express');
const router = express.Router();
const apiKeysController = require('../controllers/apiKeysController');
const { authenticateToken } = require('../middleware/auth'); // Tu middleware de JWT existente

// Todas estas rutas requieren autenticación JWT
router.use(authenticateToken);

router.get('/', apiKeysController.getApiKeys);
router.post('/', apiKeysController.createApiKey);
router.delete('/:keyId', apiKeysController.revokeApiKey);

module.exports = router;
```

### Rutas Públicas para Integración
```javascript
// routes/public.js
const express = require('express');
const router = express.Router();
const publicProductsController = require('../controllers/publicProductsController');
const { validateApiKey } = require('../middleware/apiKeyAuth');

// Todas estas rutas requieren API Key
router.use(validateApiKey);

router.get('/products', publicProductsController.getProducts);
router.get('/products/:productId', publicProductsController.getProduct);
router.get('/store-info', publicProductsController.getStoreInfo);

module.exports = router;
```

### Integrar en tu app principal
```javascript
// app.js o index.js
app.use('/api/keys', require('./routes/apiKeys'));
app.use('/api/public', require('./routes/public'));
```

## 5. Rate Limiting (Opcional pero Recomendado)

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const publicApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000, // máximo 1000 requests por hora por IP
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de 1000 requests por hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { publicApiLimiter };
```

## 6. Ejemplo de Uso desde Sitio Externo

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Tienda</title>
</head>
<body>
    <div id="productos"></div>

    <script>
    async function cargarProductos() {
        try {
            const response = await fetch('https://tu-backend.com/api/public/products', {
                headers: {
                    'X-API-Key': 'gsk_live_tu_api_key_aqui'
                }
            });

            const data = await response.json();
            
            const container = document.getElementById('productos');
            container.innerHTML = `
                <h2>Productos de ${data.store.name}</h2>
                <div class="productos-grid">
                    ${data.products.map(producto => `
                        <div class="producto-card">
                            <h3>${producto.name}</h3>
                            <p>Precio: $${producto.price}</p>
                            <p>Stock: ${producto.stock}</p>
                            <p>Categoría: ${producto.category}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    cargarProductos();
    </script>
</body>
</html>
```

## 7. Configuración de CORS

```javascript
// En tu app.js
const cors = require('cors');

app.use('/api/public', cors({
  origin: true, // Permitir todos los orígenes para las APIs públicas
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
```

## Resumen de lo que ya tienes en Frontend

✅ **Panel de gestión de API Keys** - Ya creado en `/integration/api-keys`  
✅ **Documentación visual** - Incluida en el componente  
✅ **Interfaz para crear/revocar keys** - Implementada (requiere backend)  

## Lo que necesitas implementar en Backend

❌ **Tabla api_keys** - Crear migración  
❌ **Middleware de autenticación por API Key** - Implementar  
❌ **Controladores públicos** - Crear  
❌ **Rutas públicas** - Configurar  
❌ **Gestión de API Keys** - Endpoints CRUD  

Una vez implementes el backend, solo necesitarás conectar el frontend cambiando los TODOs por llamadas reales a la API.
