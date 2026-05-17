# PROTERQUIM S.A.S

Sistema empresarial de gestión de inventarios, productos, pedidos, empleados y reportes desarrollado con Angular, Node.js, Express y MongoDB.

---

# Tecnologías utilizadas

## Frontend

- Angular 17
- TypeScript
- Angular Router
- Guards
- Interceptors
- RxJS
- CSS3

## Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

---

# Funcionalidades principales

## Autenticación

- Login seguro con JWT
- Protección de rutas
- Roles y permisos
- Logout seguro
- Interceptor HTTP

## Gestión de productos

- Crear productos
- Editar productos
- Eliminar productos
- Control de stock
- Alertas de stock bajo

## Gestión de inventarios

- Control de inventario
- Estado de stock
- Categorías
- Ubicaciones
- Validaciones

## Gestión de pedidos

- Crear pedidos
- Actualizar pedidos
- Eliminar pedidos
- Seguimiento de pedidos

## Gestión de empleados

- CRUD de empleados
- Control administrativo
- Roles empresariales

## Dashboard empresarial

- Métricas generales
- Ventas totales
- Productos críticos
- Pedidos recientes

## Reportes

- Exportación PDF
- Exportación Excel
- Estadísticas empresariales

---

# Arquitectura del proyecto

```bash
PROTERQUIM-EMPLEADOS
│
├── backend-node
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   └── index.js
│
├── frontend-angular
│   ├── src/app
│   │   ├── dashboard
│   │   ├── productos
│   │   ├── inventarios
│   │   ├── empleados
│   │   ├── reportes
│   │   ├── guards
│   │   ├── interceptors
│   │   └── services
│
└── README.md
```

---

# Roles del sistema

| Rol | Acceso |
|---|---|
| Administrador | Acceso total |
| Gerente | Productos, pedidos e inventarios |
| Contador | Reportes y pedidos |
| Empleado | Inventarios |

---

# Instalación

## Backend

```bash
cd backend-node
npm install
npm run dev
```

## Frontend

```bash
cd frontend-angular
npm install
ng serve
```

---

# Variables de entorno

Crear archivo `.env` dentro de `backend-node`

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/proterquim

JWT_SECRET=proterquim_super_secreto_2025
```

---

# API Base

```bash
http://localhost:3000/api
```

---

# Estado del proyecto

Proyecto estable y funcional.

Incluye:

- JWT Authentication
- Roles empresariales
- CRUDs completos
- Dashboard conectado
- MongoDB real
- Arquitectura modular
- Angular standalone components

---

# Autor

Mario Gallo

---

# Licencia

MIT