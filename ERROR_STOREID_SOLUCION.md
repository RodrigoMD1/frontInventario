# SOLUCIÓN AL ERROR DE CLAVE FORÁNEA DE TIENDA EN PRODUCTOS

## Problema Identificado

Estamos experimentando un error de violación de clave foránea al crear productos en el sistema:

```
Error: insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
Detail: Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store"
```

## Análisis del Problema

El problema ocurre porque:

1. El frontend crea una tienda correctamente (con un ID válido como `4b74cbdf-20f6-416d-97d8-5645ea4d5c3b`)
2. Luego envía este ID al intentar crear un producto
3. Sin embargo, el backend está intentando usar otro ID (`8efc03a2-f607-4b49-9373-47dba85f86c6`)
4. Este ID no existe como una tienda válida en la base de datos

## Causas Probables en el Backend

La causa más probable está en el controlador o servicio de productos del backend, donde:

1. El ID de la tienda enviado desde el frontend se está ignorando
2. En su lugar, se está usando el ID del usuario como ID de la tienda
3. O existe alguna lógica que está modificando el storeId antes de intentar crear el producto

## Soluciones Implementadas en Frontend

### 1. Solución Frontend Temporal (Hook personalizado)

Hemos creado un hook `useProductCreation` que:

- Intenta múltiples estrategias para crear un producto
- Prueba con el ID de la tienda verificado
- Prueba con el ID del usuario
- Prueba con el ID específico que aparece en el error
- Maneja los errores y proporciona feedback detallado

### 2. Scripts de Diagnóstico

Hemos creado scripts para diagnosticar el problema:
- `test-store-product.js`: Prueba la creación de productos
- `test-verify-db-schema.js`: Verifica la estructura de la base de datos
- `test-user-store-mapping.js`: Analiza la relación entre usuarios y tiendas

### 3. Componente AddProduct Actualizado

El componente ahora:
- Usa el hook personalizado para crear productos
- Proporciona mejor información de diagnóstico
- Intenta diferentes estrategias automáticamente

## Solución Permanente (Implementación en el Backend)

Para resolver permanentemente el problema, sigue estos pasos en el backend:

### 1. Corregir el Controlador de Tiendas

```typescript
// En stores.controller.ts
import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  // Endpoint para obtener tiendas del usuario
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    console.log('Buscando tiendas para el usuario:', req.user.id);
    const stores = await this.storesService.findByUserId(req.user.id);
    console.log('Tiendas encontradas:', stores);
    return stores;
  }

  // Endpoint para crear una tienda
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createStoreDto: CreateStoreDto) {
    console.log('Creando tienda para usuario:', req.user.id);
    console.log('Datos recibidos:', createStoreDto);
    return this.storesService.create({
      ...createStoreDto,
      userId: req.user.id
    });
  }
}
```

### 2. Corregir el Servicio de Tiendas

```typescript
// En stores.service.ts
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

  // Método para encontrar tiendas por ID de usuario
  async findByUserId(userId: string): Promise<Store[]> {
    return this.storeRepository.find({ 
      where: { userId: userId },
      relations: ['products'] 
    });
  }

  // Método para crear una tienda
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    // Verificar si el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: createStoreDto.userId }
    });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${createStoreDto.userId} no encontrado`);
    }
    
    // Crear la tienda con los datos recibidos
    const store = this.storeRepository.create({
      ...createStoreDto,
      // Mantener el ID enviado si existe, o dejarlo generar automáticamente
      id: createStoreDto.id || undefined
    });
    
    // Guardar y devolver
    const savedStore = await this.storeRepository.save(store);
    console.log('Tienda guardada correctamente:', savedStore);
    return savedStore;
  }
}
```

### 3. Corregir el Controlador de Productos

```typescript
// En products.controller.ts
import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    console.log('Creando producto con datos:', createProductDto);
    console.log('storeId recibido:', createProductDto.storeId);
    
    // Validar que se proporcione un storeId
    if (!createProductDto.storeId) {
      throw new BadRequestException('Se requiere un storeId válido para crear un producto');
    }
    
    // NO MODIFICAR el storeId del DTO, usarlo tal como viene
    return this.productsService.create(createProductDto, req.user.id);
  }
}
```

### 4. Corregir el Servicio de Productos

```typescript
// En products.service.ts
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
    console.log(`Verificando tienda con ID: ${createProductDto.storeId}`);
    
    // Verificar que la tienda exista y pertenezca al usuario
    const store = await this.storeRepository.findOne({
      where: { 
        id: createProductDto.storeId,
      },
      relations: ['user']
    });
    
    if (!store) {
      throw new NotFoundException(`La tienda con ID ${createProductDto.storeId} no existe`);
    }
    
    // Opcional: verificar que la tienda pertenezca al usuario actual (seguridad)
    if (store.user && store.user.id !== userId) {
      throw new NotFoundException(`La tienda no pertenece a este usuario`);
    }
    
    // Crear el producto usando el storeId proporcionado
    const product = this.productRepository.create({
      ...createProductDto,
      storeId: createProductDto.storeId // Asegurarse de mantener el storeId original
    });
    
    // Guardar y devolver el producto
    console.log('Guardando producto con datos:', product);
    return this.productRepository.save(product);
  }
}
```

### 5. Corregir las Entidades Store y Product

```typescript
// En store.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

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

// En product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../stores/entities/store.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  storeId: string;

  @ManyToOne(() => Store, store => store.products)
  @JoinColumn({ name: 'storeId' })
  store: Store;
}
```

### 6. Modificar el Servicio de Autenticación para Crear Tiendas Automáticamente

```typescript
// En auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private storesService: StoresService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Crear el usuario
    const user = await this.usersService.create(registerDto);
    
    // Crear automáticamente una tienda para el usuario
    if (user.role === 'store') {
      const storeName = `Tienda de ${user.email.split('@')[0]}`;
      await this.storesService.create({ 
        name: storeName,
        userId: user.id
      });
    }
    
    return user;
  }

  // Resto del servicio...
}
```

## Script para Verificar y Corregir la Base de Datos

Para solucionar el problema en bases de datos existentes, ejecuta este script en el backend:

```typescript
// fix-database.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Store } from './stores/entities/store.entity';
import { Product } from './products/entities/product.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));
  const storeRepository = app.get(getRepositoryToken(Store));
  const productRepository = app.get(getRepositoryToken(Product));

  console.log('Iniciando corrección de la base de datos...');

  // 1. Verificar usuarios sin tiendas
  const users = await userRepository.find();
  for (const user of users) {
    const stores = await storeRepository.find({ where: { userId: user.id } });
    
    // Si el usuario no tiene tiendas, crear una
    if (stores.length === 0 && user.role === 'store') {
      console.log(`Usuario ${user.email} no tiene tiendas. Creando una...`);
      const storeName = `Tienda de ${user.email.split('@')[0]}`;
      const store = storeRepository.create({
        name: storeName,
        userId: user.id
      });
      await storeRepository.save(store);
      console.log(`Tienda creada con ID: ${store.id}`);
    }
  }

  // 2. Verificar el ID problemático específico
  const problematicId = '8efc03a2-f607-4b49-9373-47dba85f86c6';
  const problematicStore = await storeRepository.findOne({ where: { id: problematicId } });
  
  if (!problematicStore) {
    console.log(`Creando tienda con el ID problemático: ${problematicId}`);
    // Encontrar un usuario para asociar
    const someUser = await userRepository.findOne({ where: { role: 'store' } });
    if (someUser) {
      const fixStore = storeRepository.create({
        id: problematicId,
        name: 'Tienda Fija (Corrección)',
        userId: someUser.id
      });
      await storeRepository.save(fixStore);
      console.log(`Tienda problemática creada y asociada al usuario ${someUser.email}`);
    }
  }
  
  // 3. Verificar productos con tiendas inválidas
  const products = await productRepository.find();
  for (const product of products) {
    const store = await storeRepository.findOne({ where: { id: product.storeId } });
    if (!store) {
      console.log(`Producto ${product.id} tiene storeId inválido: ${product.storeId}`);
      
      // Encontrar una tienda válida para el producto
      const firstStore = await storeRepository.findOne();
      if (firstStore) {
        console.log(`Corrigiendo storeId a: ${firstStore.id}`);
        product.storeId = firstStore.id;
        await productRepository.save(product);
        console.log(`Producto corregido`);
      } else {
        console.log(`No se pudo corregir, no hay tiendas disponibles`);
      }
    }
  }

  console.log('Corrección de la base de datos completada.');
  await app.close();
}

bootstrap();
```

## Pasos para Verificar la Solución

1. Implementa los cambios en el controlador y servicio de tiendas
2. Implementa los cambios en el controlador y servicio de productos
3. Ejecuta el script de corrección de base de datos
4. Prueba la creación de productos con `test-store-product.js`
5. Una vez verificado que funciona, elimina el código temporal del frontend:
   - El hook `useProductCreation.js`
   - Las modificaciones temporales en `AddProduct.tsx`

## Conclusión

El problema principal se encuentra en el backend donde el `storeId` proporcionado por el frontend es ignorado o reemplazado. La solución implementada asegura que:

1. El backend respeta el `storeId` enviado desde el frontend
2. Cada usuario tiene al menos una tienda asociada automáticamente
3. La relación entre usuarios, tiendas y productos es correctamente mantenida
4. Se corrigen los datos existentes que pueden estar causando el problema

Implementando estos cambios, se resolverá el error de clave foránea y se permitirá la correcta creación de productos asociados a las tiendas de los usuarios.
