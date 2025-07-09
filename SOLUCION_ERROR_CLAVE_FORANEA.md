/**
 * ESTRATEGIA PARA SOLUCIONAR EL ERROR DE CLAVE FORÁNEA
 * 
 * Este documento detalla los pasos necesarios para modificar el backend y
 * solucionar el error con la clave foránea entre producto y tienda.
 */

/**
 * PROBLEMA IDENTIFICADO:
 * 
 * El error es:
 * "insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
 * "Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store""
 * 
 * Esto indica que:
 * 1. El frontend envía un storeId: "4b74cbdf-20f6-416d-97d8-5645ea4d5c3b"
 * 2. Pero el backend intenta usar: "8efc03a2-f607-4b49-9373-47dba85f86c6"
 * 3. El segundo ID no existe en la tabla "store"
 */

/**
 * POSIBLES CAUSAS:
 * 
 * 1. El controlador de productos está sobrescribiendo el storeId del DTO
 * 2. Hay un middleware que está cambiando el storeId
 * 3. El DTO está configurado para ignorar el storeId del frontend
 * 4. La relación en el modelo está configurada incorrectamente
 * 5. Hay un bug en la lógica de autenticación que afecta al storeId
 */

/**
 * PASOS PARA MODIFICAR EL BACKEND:
 * 
 * 1. Añadir logs en el ProductsController para ver qué storeId llega y qué storeId se usa
 */

// Ejemplo de modificación en products.controller.ts
/*
@Post()
create(@Body() createProductDto: CreateProductDto, @Request() req) {
  // Añadir estos logs
  console.log('📥 DTO recibido del frontend:', JSON.stringify(createProductDto));
  console.log('📥 storeId recibido:', createProductDto.storeId);
  console.log('👤 Usuario actual:', req.user);
  console.log('👤 ID del usuario:', req.user.sub);
  
  const result = this.productsService.create(createProductDto, req.user);
  
  // Log después de crear
  console.log('📤 Producto creado:', JSON.stringify(result));
  
  return result;
}
*/

/**
 * 2. Modificar el ProductsService para verificar el storeId
 */

// Ejemplo de modificación en products.service.ts
/*
async create(createProductDto: CreateProductDto, user: any) {
  // Añadir estos logs
  console.log('🔄 ProductsService: Creando producto con DTO:', JSON.stringify(createProductDto));
  console.log('🔄 ProductsService: storeId del DTO:', createProductDto.storeId);
  console.log('👤 ProductsService: Usuario:', JSON.stringify(user));
  
  // Verificar si la tienda existe antes de crear el producto
  const storeExists = await this.storesRepository.findOne({
    where: { id: createProductDto.storeId }
  });
  
  if (!storeExists) {
    console.error(`❌ La tienda con ID ${createProductDto.storeId} no existe!`);
    throw new NotFoundException(`La tienda con ID ${createProductDto.storeId} no existe`);
  }
  
  console.log('✅ Tienda verificada:', JSON.stringify(storeExists));
  
  // Continuar con la creación del producto
  const product = this.productsRepository.create({
    ...createProductDto,
    // Asegurar que se usa el storeId del DTO sin cambios
    storeId: createProductDto.storeId,
  });
  
  // Log antes de guardar
  console.log('📥 Producto a guardar:', JSON.stringify(product));
  
  const savedProduct = await this.productsRepository.save(product);
  
  // Log después de guardar
  console.log('📤 Producto guardado:', JSON.stringify(savedProduct));
  
  return savedProduct;
}
*/

/**
 * 3. Revisar el ProductEntity y verificar la relación
 */

// Ejemplo de cómo debería ser la entidad Product
/*
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
  category: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  unit: string;

  // Esta es la relación importante
  @ManyToOne(() => Store, store => store.products)
  store: Store;

  // Este es el campo que causa el error
  @Column()
  storeId: string;
}
*/

/**
 * 4. Verificar el DTO de CreateProduct
 */

// Ejemplo de cómo debería ser el DTO
/*
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  cost?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  unit?: string;

  // Este campo es el importante
  @IsUUID()
  @IsNotEmpty()
  storeId: string;
}
*/

/**
 * 5. Verificar si hay algún interceptor o pipe que esté modificando el DTO
 */

// Revisar archivos como:
// - main.ts (por ValidationPipe global)
// - app.module.ts (por interceptores globales)
// - products.module.ts (por interceptores específicos)

/**
 * SOLUCIÓN TEMPORAL PARA EL FRONTEND
 * 
 * Mientras se arregla el backend, una solución temporal es averiguar qué storeId 
 * está usando el backend y usar ese mismo ID en el frontend.
 */

// 1. Obtener el ID del usuario:
// console.log('ID de usuario:', user.id);

// 2. Verificar si este ID coincide con el storeId que causa el error:
// const storeIdUsadoPorBackend = user.id;
// console.log('storeId que podría estar usando el backend:', storeIdUsadoPorBackend);

// 3. Probar a crear un producto con este ID:
/*
const productData = {
  name: data.name,
  price: data.price,
  stock: data.stock,
  category: data.category || '',
  description: data.description || '',
  cost: data.cost,
  unit: data.unit || '',
  storeId: user.id // ¡USAR EL ID DEL USUARIO EN LUGAR DEL ID DE LA TIENDA!
};
*/
