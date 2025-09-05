# Finance API

API REST para gestión de finanzas personales, desarrollada en TypeScript con Node.js y Express.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular con separación clara de responsabilidades:

- `controllers/`: Maneja las peticiones HTTP y respuestas
- `models/`: Define la estructura de datos y operaciones con la base de datos
- `routes/`: Define las rutas de la API
- `middleware/`: Contiene middlewares para autenticación y validación
- `types/`: Define interfaces y tipos TypeScript
- `config/`: Configuración de la aplicación y base de datos
- `utils/`: Funciones de utilidad

## Funcionalidades Principales

### Gestión de Categorías
- Crear, listar, actualizar y eliminar categorías
- Filtrado por tipo (ingreso/gasto)
- Protección de categorías del sistema

### Gestión de Transacciones
- Crear, listar, actualizar y eliminar transacciones
- Filtrado por fecha, categoría y tipo
- Asociación con categorías existentes

## Requisitos

- Node.js 14+
- MySQL 5.7+
- Acceso al sistema de autenticación

## Configuración

1. Clonar el repositorio
2. Instalar dependencias con `npm install`
3. Crear archivo `.env` basado en `.env.example`
4. Inicializar base de datos con el esquema `schema.sql`
5. Iniciar servidor con `npm run dev`

## Endpoints API

### Categorías

- `POST /api/v1/categories` - Crear categoría
- `GET /api/v1/categories` - Listar categorías (filtro opcional: ?type=income|expense)
- `PUT /api/v1/categories/:id` - Actualizar categoría
- `DELETE /api/v1/categories/:id` - Eliminar categoría

### Transacciones

- `POST /api/v1/transactions` - Crear transacción
- `GET /api/v1/transactions` - Listar transacciones (filtros opcionales: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&categoryId=1&type=income|expense)
  - Ahora cada transacción incluye:
    - `paymentsCount`: cantidad de pagos registrados
    - `pendingAmount`: saldo pendiente (amount_total - suma de pagos)
    - `statusColor`: color asociado al estado, será 'green' si el estado es 'Pagado' o 'Paid'
- `GET /api/v1/transactions/:id`