# Solución para el Error de Clave Foránea en Productos

## Problema detectado

Se está produciendo un error de clave foránea al intentar crear productos. El error específico es:

```
QueryFailedError: insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store".
```

Este error indica que el ID de la tienda (`storeId`) que se está enviando al crear un producto no existe en la tabla de tiendas del backend.

## Diagnóstico

1. El frontend intenta utilizar el ID del usuario como ID de tienda cuando no puede obtener una tienda válida
2. Las peticiones `GET /api/stores` y `POST /api/stores` no están funcionando correctamente
3. El proxy de Vite está configurado, pero los endpoints de tiendas no están respondiendo

## Solución en el backend

Para solucionar este problema, es necesario modificar el backend para asegurarse de que:

1. El endpoint `/stores` responda correctamente a las solicitudes GET y POST
2. El usuario tenga una tienda asociada automáticamente al registrarse o iniciar sesión

### Pasos para solucionar en el backend (NestJS)

1. **Verificar el controlador de tiendas**:

```typescript
// En stores.controller.ts
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    const userId = req.user.id;
    return this.storesService.findByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createStoreDto: CreateStoreDto) {
    const userId = req.user.id;
    return this.storesService.create(createStoreDto, userId);
  }
}
```

2. **Verificar el servicio de tiendas**:

```typescript
// En stores.service.ts
@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<Store[]> {
    return this.storesRepository.find({ where: { user: { id: userId } } });
  }

  async create(createStoreDto: CreateStoreDto, userId: string): Promise<Store> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const store = this.storesRepository.create({
      ...createStoreDto,
      user,
    });

    return this.storesRepository.save(store);
  }
}
```

3. **Verificar la entidad de Store**:

```typescript
// En store.entity.ts
@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, user => user.stores)
  user: User;

  @OneToMany(() => Product, product => product.store)
  products: Product[];
}
```

4. **Asegúrate de que la relación en Product incluye el storeId**:

```typescript
// En product.entity.ts
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // ... otros campos
  
  @ManyToOne(() => Store, store => store.products)
  @JoinColumn({ name: 'storeId' })
  store: Store;
  
  @Column()
  storeId: string;
}
```

### Verificación de Autenticación y Middleware

Asegúrate de que el middleware de autenticación funciona correctamente y pasa el userId en la solicitud:

```typescript
// En jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
```

### Solución para Crear Tienda al Registrar Usuario

Modifica el servicio de autenticación para crear automáticamente una tienda para el usuario cuando se registra:

```typescript
// En auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private storesService: StoresService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Crea el usuario
    const user = await this.usersService.create(registerDto);
    
    // Crea una tienda por defecto para el usuario
    const storeName = `Tienda de ${user.firstName || user.email}`;
    await this.storesService.create({ name: storeName }, user.id);
    
    return this.login(user);
  }
}
```

## Validación en el Backend

Es importante validar en el backend que el storeId pertenece al usuario actual antes de permitir la creación de productos:

```typescript
// En products.service.ts
async create(createProductDto: CreateProductDto, userId: string) {
  // Verificar que la tienda pertenece al usuario
  const store = await this.storesRepository.findOne({
    where: { 
      id: createProductDto.storeId,
      user: { id: userId }
    },
    relations: ['user']
  });

  if (!store) {
    throw new ForbiddenException(`Store not found or does not belong to the current user`);
  }

  const product = this.productsRepository.create({
    ...createProductDto,
    store
  });

  return this.productsRepository.save(product);
}
```

## Logs para Depuración

Agrega logs en el backend para identificar problemas:

```typescript
// En el controlador o servicio relevante
@Post()
async create(@Request() req, @Body() createDto: CreateDto) {
  this.logger.debug(`Request user: ${JSON.stringify(req.user)}`);
  this.logger.debug(`Request body: ${JSON.stringify(createDto)}`);
  
  try {
    const result = await this.service.create(createDto, req.user.id);
    this.logger.debug(`Created successfully: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    this.logger.error(`Error creating: ${error.message}`, error.stack);
    throw error;
  }
}
```

Implementa estas soluciones en el backend para resolver el problema de la clave foránea.
