# Solución al Error de Clave Foránea en Productos

## Problema Identificado

Se ha detectado un error en el proceso de creación de productos, donde el backend arroja:

```
QueryFailedError: insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store".
```

Este error indica que al crear un producto, el `storeId` proporcionado no existe realmente en la tabla `store` de la base de datos, aunque en el frontend parece estar creándose correctamente.

## Causas Probables

1. **Desincronización entre frontend y backend**: El frontend parece recibir respuestas exitosas al crear tiendas, pero estas no se están persistiendo realmente en la base de datos.

2. **Problemas con los IDs de tienda**: El backend podría estar cambiando los IDs de tienda proporcionados por el frontend, o ignorando la creación de tiendas completamente.

3. **Relación usuario-tienda**: La relación entre usuarios y tiendas podría no estar configurada correctamente en el backend, causando que las tiendas se creen sin asociarse al usuario.

## Solución en el Backend

### 1. Verificar la creación de tiendas

```typescript
// En el StoreController o StoreService del backend
async createStore(createStoreDto: CreateStoreDto) {
  console.log('Datos recibidos para crear tienda:', createStoreDto);
  
  // Verificar que el usuario existe
  const user = await this.userRepository.findOne({where: {id: createStoreDto.userId}});
  if (!user) {
    console.error(`Usuario con ID ${createStoreDto.userId} no encontrado`);
    throw new NotFoundException(`Usuario no encontrado`);
  }
  
  // Crear la tienda conservando el ID enviado desde el frontend
  const store = this.storeRepository.create({
    ...createStoreDto,
    id: createStoreDto.id // Importante: mantener el ID enviado desde el frontend
  });
  
  // Guardar y verificar
  const savedStore = await this.storeRepository.save(store);
  console.log('Tienda guardada con éxito:', savedStore);
  
  return savedStore;
}
```

### 2. Modificar la entidad Store si es necesario

Revisar la entidad `Store` para asegurar que permite la recepción de IDs desde el frontend:

```typescript
@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Otros campos...

  @ManyToOne(() => User, user => user.stores)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Product, product => product.store)
  products: Product[];
}
```

### 3. Verificar la asociación usuario-tienda

```typescript
// En el UserService
async findUserStores(userId: string) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['stores']
  });
  
  if (!user) {
    throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
  }
  
  console.log(`Tiendas del usuario ${userId}:`, user.stores);
  return user.stores;
}
```

### 4. Revisar el middleware de autenticación

Asegurarse que el middleware de autenticación está pasando correctamente el userId a los endpoints protegidos:

```typescript
// En el AuthMiddleware
async use(req: Request, res: Response, next: Function) {
  try {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    
    const payload = await this.jwtService.verifyAsync(token);
    req['user'] = payload;
    console.log('Usuario autenticado:', payload);
    
    next();
  } catch (error) {
    throw new UnauthorizedException('Token inválido');
  }
}
```

## Verificación de la Solución

1. Después de implementar los cambios, ejecutar el siguiente script para verificar la creación de tiendas:

```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{"name":"Tienda de Prueba", "userId":"ID_DEL_USUARIO"}'
```

2. Verificar en la base de datos que la tienda se ha creado correctamente:

```sql
SELECT * FROM store WHERE name = 'Tienda de Prueba';
```

3. Intentar crear un producto utilizando el storeId de la tienda recién creada.

## Conclusión

El problema principal parece estar en la gestión de IDs y la persistencia de tiendas en el backend. Una vez corregido este problema, la creación de productos debería funcionar correctamente.

Mientras tanto, en el frontend se puede implementar un sistema de almacenamiento local temporal para productos hasta que se resuelva el problema del backend.
