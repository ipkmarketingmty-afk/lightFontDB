# BlackVault Inventory

Sistema de gestión de inventario con Next.js 14+ y PostgreSQL externo.

## Características

- **Conexión Dinámica a PostgreSQL**: Sistema de login que permite conectarse a cualquier base de datos PostgreSQL proporcionando credenciales
- **Gestión de Imágenes BYTEA**: Las imágenes se almacenan como datos binarios directamente en PostgreSQL y se convierten automáticamente a Base64
- **CRUD Completo**: Crear, leer, actualizar y eliminar productos con nombre, descripción, precio, stock, estado e imagen
- **Estado de Productos**: Cada producto tiene un estado (activo/inactivo) con indicadores visuales en verde/rojo
- **Diseño Limpio**: Interfaz moderna con fondo blanco (#F8F9FA), detalles en azul marino (#003366), y elementos claros
- **Inicialización y Migración**: Botones para crear la tabla `products` y migrar esquemas existentes agregando el campo `status`

## Stack Tecnológico

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- PostgreSQL (conexión con pg/node-postgres)
- Cookies httpOnly para sesiones seguras

## Estructura del Proyecto

```
/app
  /api
    /auth
      /login - API para autenticación y conexión a BD
      /logout - API para cerrar sesión
    /products
      /[id] - API para editar/eliminar productos individuales
      /init-table - API para crear tabla products
      /migrate-status - API para agregar columna status a tablas existentes
      route.ts - API para listar/crear productos
  /inventory - Página principal del inventario
  layout.tsx - Layout raíz
  page.tsx - Página de login
  globals.css - Estilos globales
/components
  LoginForm.tsx - Formulario de conexión a BD
  InventoryClient.tsx - Cliente del inventario
  ProductCard.tsx - Tarjeta de producto
  ProductModal.tsx - Modal de edición
  AddProductModal.tsx - Modal de creación
/lib
  db.ts - Utilidades de conexión a PostgreSQL
```

## Despliegue con Docker

El proyecto incluye un Dockerfile multi-stage optimizado para producción con Next.js standalone output.

### Build y Ejecución

```bash
docker build -t blackvault-inventory .
docker run -p 5000:5000 blackvault-inventory
```

### Despliegue en Easypanel

1. Sube el código a tu repositorio Git
2. Crea una nueva aplicación en Easypanel
3. Conecta tu repositorio
4. Easypanel detectará automáticamente el Dockerfile
5. La aplicación estará disponible en el puerto 5000

## Variables de Entorno

### Requeridas

- `SESSION_SECRET`: Clave secreta para firmar tokens de sesión con HMAC-SHA256. Debe ser un string aleatorio y seguro (mínimo 32 caracteres).

### Opcionales

Las credenciales de la base de datos se proporcionan en tiempo de ejecución a través del formulario de login y se almacenan de forma segura en el servidor.

## Esquema de Base de Datos

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'activo',
  image BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migración de Esquemas Existentes

Si tienes una base de datos existente sin la columna `status`, usa el botón "Migrar Estado" en la interfaz para agregar automáticamente la columna a tu tabla.

## Uso

1. Accede a la aplicación
2. Ingresa las credenciales de tu base de datos PostgreSQL
3. Si la tabla no existe, haz clic en "Crear Tabla"
4. Si tienes una tabla existente sin la columna `status`, haz clic en "Migrar Estado"
5. Comienza a gestionar tu inventario con estados activo/inactivo

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en http://localhost:5000

## Características de Seguridad

- **Encriptación AES-256-GCM**: Las credenciales de BD se encriptan con AES-256-GCM antes de almacenarse en cookies
- **Derivación de Clave Scrypt**: La clave de encriptación se deriva de SESSION_SECRET usando Scrypt
- **Cookies HttpOnly**: Cookies de sesión inaccesibles desde JavaScript del navegador
- **Autenticación de Integridad**: GCM proporciona autenticación integrada del mensaje cifrado
- **IV Aleatorio**: Cada sesión usa un vector de inicialización único generado criptográficamente
- **Persistencia sin Estado**: Las sesiones sobreviven a reinicios del servidor sin servicios adicionales
- **Validación de Conexión**: Se prueba la conexión antes de crear la sesión
- **Límite de Imágenes**: Máximo 5MB por imagen para prevenir ataques de recursos
- **SQL Injection Protection**: Queries parametrizadas en todas las operaciones de BD
- **Fallo Seguro**: La aplicación no inicia si SESSION_SECRET no está configurado
