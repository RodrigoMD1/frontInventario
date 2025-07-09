# Solución Detallada para Backend - Error de Clave Foránea en Productos

## Diagnóstico del Problema

El error específico que se está experimentando es:
```
Error: insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
Detail: Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store"
```

Este error ocurre porque el backend está intentando usar un ID específico (`8efc03a2-f607-4b49-9373-47dba85f86c6`) como `storeId` al crear productos, pero este ID no existe en la tabla `store`.

## Pasos para Solucionar el Backend

### 1. Revisar la Base de Datos

Primero, verifica la estructura actual de la base de datos para entender las relaciones existentes:

```sql
-- Verificar la tabla de tiendas
SELECT * FROM store LIMIT 10;

-- Verificar la tabla de usuarios
SELECT * FROM "user" LIMIT 10;

-- Verificar la tabla de productos
SELECT * FROM product LIMIT 10;

-- Verificar la relación usuario-tienda
SELECT u.id as user_id, u.email, s.id as store_id, s.name 
FROM "user" u 
LEFT JOIN store s ON u.id = s."userId"
LIMIT 10;
```

### 2. Corregir la Entidad Store

Asegúrate de que la entidad `Store` esté correctamente definida con una relación apropiada con `User`:

```typescript
// src/stores/entities/store.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.stores)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Product, product => product.store)
  products: Product[];
}
```

### 3. Corregir la Entidad User

Asegúrate de que la entidad `User` tenga la relación correcta con `Store`:

```typescript
// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'store' })
  role: string;

  @OneToMany(() => Store, store => store.user)
  stores: Store[];

  // Otros campos...
}
```

### 4. Corregir la Entidad Product

Asegúrate de que la entidad `Product` tenga la relación correcta con `Store`:

```typescript
// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column()
  storeId: string;

  @ManyToOne(() => Store, store => store.products)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  // Otros campos...
}
```

### 5. Corregir el DTO de Creación de Producto

Asegúrate de que el DTO incluya explícitamente el `storeId`:

```typescript
// src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsString()
  storeId: string;

  // Otros campos...
}
```

### 6. Modificar el Servicio de Productos

El servicio de productos debe respetar el `storeId` proporcionado:

```typescript
// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Store } from '../stores/entities/store.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    // Imprimir el DTO para depuración
    console.log('ProductsService.create - DTO recibido:', createProductDto);
    console.log('ProductsService.create - storeId recibido:', createProductDto.storeId);
    
    // Verificar que la tienda existe
    const store = await this.storeRepository.findOne({
      where: { id: createProductDto.storeId }
    });

    // Si no existe, intentar encontrar una tienda del usuario
    if (!store) {
      console.log(`Tienda con ID ${createProductDto.storeId} no encontrada. Buscando tiendas del usuario...`);
      
      const userStores = await this.storeRepository.find({
        where: { userId: userId },
        take: 1
      });
      
      if (userStores.length > 0) {
        console.log(`Usando tienda alternativa con ID ${userStores[0].id}`);
        createProductDto.storeId = userStores[0].id;
      } else {
        throw new NotFoundException(
          `No se encontró la tienda con ID ${createProductDto.storeId} ni otras tiendas asociadas al usuario`
        );
      }
    }
    
    // Crear el producto manteniendo el storeId del DTO
    const product = this.productRepository.create(createProductDto);
    console.log('Producto a guardar:', product);
    
    // Guardar y retornar
    return this.productRepository.save(product);
  }

  // Otros métodos...
}
```

### 7. Modificar el Controlador de Productos

Asegúrate de que el controlador pase correctamente el `storeId` al servicio:

```typescript
// src/products/products.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    // Imprimir datos para depuración
    console.log('ProductsController.create - DTO recibido:', createProductDto);
    console.log('ProductsController.create - Usuario:', req.user);
    
    // NO modificar el storeId, usarlo tal como viene del frontend
    return this.productsService.create(createProductDto, req.user.id);
  }

  // Otros endpoints...
}
```

### 8. Modificar el Servicio de Tiendas

Asegúrate de que el servicio de tiendas permita consultar por usuario y crear tiendas correctamente:

```typescript
// src/stores/stores.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { User } from '../users/entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<Store[]> {
    console.log(`Buscando tiendas para usuario con ID: ${userId}`);
    
    const stores = await this.storeRepository.find({
      where: { userId: userId }
    });
    
    console.log(`Se encontraron ${stores.length} tiendas`);
    return stores;
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    console.log('Creando tienda con datos:', createStoreDto);
    
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: createStoreDto.userId }
    });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${createStoreDto.userId} no encontrado`);
    }
    
    // Crear la tienda, mantener el ID si se proporciona
    const store = this.storeRepository.create({
      ...createStoreDto,
      id: createStoreDto.id // Si se proporciona un ID específico, usarlo
    });
    
    // Guardar y retornar
    const result = await this.storeRepository.save(store);
    console.log('Tienda guardada:', result);
    return result;
  }

  // Otros métodos...
}
```

### 9. Modificar el Controlador de Tiendas

Asegúrate de que el controlador maneje correctamente las solicitudes de tiendas:

```typescript
// src/stores/stores.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    console.log('Obteniendo tiendas para usuario:', req.user);
    return this.storesService.findByUserId(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createStoreDto: CreateStoreDto) {
    console.log('Creando tienda. Usuario:', req.user);
    console.log('Datos recibidos:', createStoreDto);
    
    // Asegurarse de que la tienda se asocie al usuario autenticado
    const storeData = {
      ...createStoreDto,
      userId: req.user.id
    };
    
    return this.storesService.create(storeData);
  }

  // Otros endpoints...
}
```

### 10. Crear un Script de Reparación para la Base de Datos

Crea un script que corrija los problemas existentes en la base de datos:

```typescript
// src/scripts/fix-database.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Iniciando corrección de la base de datos...');

    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const storeRepository = app.get<Repository<Store>>(getRepositoryToken(Store));
    const productRepository = app.get<Repository<Product>>(getRepositoryToken(Product));

    // 1. Verificar si existe la tienda problemática
    const problematicId = '8efc03a2-f607-4b49-9373-47dba85f86c6';
    let problematicStore = await storeRepository.findOne({ 
      where: { id: problematicId } 
    });

    if (!problematicStore) {
      console.log(`La tienda problemática ${problematicId} no existe. Creándola...`);
      
      // Buscar un usuario para asociar con esta tienda
      const someUser = await userRepository.findOne();
      
      if (someUser) {
        problematicStore = storeRepository.create({
          id: problematicId,
          name: 'Tienda Reparada',
          userId: someUser.id
        });
        
        await storeRepository.save(problematicStore);
        console.log('Tienda problemática creada y asociada al usuario:', someUser.email);
      } else {
        console.log('No se pudo crear la tienda problemática porque no hay usuarios');
      }
    }

    // 2. Verificar cada usuario para asegurar que tiene al menos una tienda
    const users = await userRepository.find();
    console.log(`Verificando ${users.length} usuarios...`);
    
    for (const user of users) {
      const stores = await storeRepository.find({ where: { userId: user.id } });
      
      if (stores.length === 0) {
        console.log(`Usuario ${user.email} no tiene tiendas. Creando una...`);
        
        const newStore = storeRepository.create({
          name: `Tienda de ${user.email.split('@')[0]}`,
          userId: user.id
        });
        
        await storeRepository.save(newStore);
        console.log(`Tienda creada para ${user.email} con ID: ${newStore.id}`);
      } else {
        console.log(`Usuario ${user.email} ya tiene ${stores.length} tiendas`);
      }
    }

    // 3. Verificar productos con storeIds inválidos
    const products = await productRepository.find();
    console.log(`Verificando ${products.length} productos...`);
    
    for (const product of products) {
      const store = await storeRepository.findOne({ 
        where: { id: product.storeId } 
      });
      
      if (!store) {
        console.log(`Producto ${product.id} tiene storeId inválido: ${product.storeId}`);
        
        // Buscar una tienda válida para este producto
        const validStore = await storeRepository.findOne();
        
        if (validStore) {
          console.log(`Actualizando producto ${product.id} a storeId: ${validStore.id}`);
          product.storeId = validStore.id;
          await productRepository.save(product);
        }
      }
    }

    console.log('Corrección de la base de datos completada con éxito');
  } catch (error) {
    console.error('Error al corregir la base de datos:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
```

### 11. Ejecutar el Script de Reparación

Para ejecutar el script de reparación:

1. Guarda el archivo como `src/scripts/fix-database.ts`
2. Ejecuta el script con ts-node:

```bash
npx ts-node -r tsconfig-paths/register src/scripts/fix-database.ts
```

## Verificación de la Solución

Para verificar que la solución funciona correctamente:

1. Implementa todos los cambios mencionados arriba
2. Ejecuta el script de reparación de la base de datos
3. Prueba la creación de tiendas:

```bash
curl -X POST http://localhost:3000/stores -H "Content-Type: application/json" -H "Authorization: Bearer TU_TOKEN_JWT" -d '{"name":"Mi Nueva Tienda"}'
```

4. Obtén las tiendas del usuario:

```bash
curl http://localhost:3000/stores -H "Authorization: Bearer TU_TOKEN_JWT"
```

5. Crea un producto usando el ID de tienda obtenido:

```bash
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -H "Authorization: Bearer TU_TOKEN_JWT" -d '{"name":"Producto Nuevo","price":100,"stock":10,"storeId":"ID_DE_TU_TIENDA"}'
```

Si estos pasos funcionan sin errores, la solución está implementada correctamente.

## Acciones Finales

Una vez que el backend esté corregido:

1. Elimina las soluciones temporales del frontend:
   - Quita el hook `useProductCreation.js`
   - Simplifica el componente `AddProduct.tsx`

2. Actualiza el flujo normal de creación de productos para usar directamente el endpoint `/products`

3. Asegúrate de que cada usuario nuevo automáticamente tenga una tienda asociada al registrarse
