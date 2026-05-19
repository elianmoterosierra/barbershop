# ✂️ Classic Barbershop

Aplicación web completa para una barbería premium. Incluye landing page con sistema de reservas de citas, autenticación de usuarios (registro/login con JWT), sistema de calificaciones y panel administrativo.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (Web Components) |
| **Backend** | Node.js + Express v5 |
| **Base de datos** | Microsoft SQL Server (via `mssql` + `msnodesqlv8`) |
| **Autenticación** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| **Integraciones** | n8n (Webhooks para notificaciones de registros y citas) |

---

## 📁 Estructura del proyecto

```
barbershop/
├── .env                        # Variables de entorno
├── db.js                       # Conexión a SQL Server (singleton)
├── server.js                   # Entrada del servidor Express
├── package.json
│
└── proyect/
    ├── controllers/
    │   ├── authController.js       # Lógica de registro y login + Webhook n8n
    │   ├── citasController.js      # Gestión de citas + Calificaciones + Webhook n8n
    │   ├── cortesController.js     # CRUD de servicios/cortes
    │   └── usersAdminController.js # Gestión de usuarios y roles
    │
    ├── models/
    │   ├── userModel.js            # Consultas tabla Users
    │   ├── citasModel.js           # Consultas tabla Citas y Calificaciones
    │   └── cortesModel.js          # Consultas tabla Cortes
    │
    ├── routers/
    │   ├── authRoutes.js           # Rutas /api/registro y /api/login
    │   ├── citasRoutes.js          # Rutas /api/citas/*
    │   ├── cortesRoutes.js         # Rutas /api/cortes/*
    │   └── usersRoutes.js          # Rutas /api/usuarios/*
    │
    └── public/
        ├── css/
        │   ├── global.css          # Diseño global, header, footer y animaciones
        │   └── ...                 # Estilos por sección
        │
        ├── js/
        │   ├── admin-panel-component.js # Panel unificado para administración
        │   ├── mis-citas-component.js   # Historial y calificación de citas
        │   ├── perfil-component.js      # Modal de usuario y login
        │   └── reserva-component.js     # Sistema de agendamiento
        │
        └── src/
            └── index.html               # SPA / Punto de entrada frontend
```

---

## 🔌 API Endpoints

### 🔐 Autenticación (`/api`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/registro` | Crear cuenta nueva | ❌ |
| `POST` | `/api/login` | Iniciar sesión | ❌ |

### 📅 Citas (`/api/citas`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/agendar` | Crear nueva cita | ✅ Cliente |
| `GET` | `/miscitas` | Resumen de citas | ✅ Cliente |
| `GET` | `/mis-citas` | Listado detallado | ✅ Cliente |
| `POST` | `/:id/calificar` | Calificar cita terminada | ✅ Cliente |
| `GET` | `/barbero/:nombre` | Ver reseñas de un barbero | ❌ |
| `GET` | `/admin/todas` | Listar todas las citas | 🛡️ Admin |
| `PUT` | `/admin/:id/estado` | Cambiar estado de cita | 🛡️ Admin |

### ✂️ Servicios y Cortes (`/api/cortes`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/cortes` | Listar servicios | ❌ |
| `POST` | `/cortes` | Crear servicio | 🛡️ Admin |
| `PUT` | `/cortes/:id` | Editar servicio | 🛡️ Admin |
| `DELETE` | `/cortes/:id` | Eliminar servicio | 🛡️ Admin |

---

## 🤖 Integraciones Externas (n8n)
El sistema envía notificaciones automáticas a **n8n** en los siguientes eventos:
1.  **Nuevo Registro:** Notifica al webhook de bienvenida para correos automatizados.
2.  **Nueva Cita:** Envía todos los detalles de la reserva (cliente, barbero, servicio) para gestión externa.

---

## 🛡️ Roles y Seguridad
*   **Cliente:** Puede agendar, ver sus propias citas y calificar barberos.
*   **Admin:** Tiene acceso al panel de control para gestionar servicios, cambiar roles de usuarios y actualizar estados de citas.
*   **Hashing:** Las contraseñas se protegen con `bcryptjs`.
*   **Tokens:** Sesiones seguras con JWT (duración 24h).

---

## ⚙️ Instalación

1.  **Dependencias:** `npm install`
2.  **Base de Datos:** Importar `toda mi base de datos.sql` en SQL Server.
3.  **Variables de Entorno:** Configurar `.env` con las credenciales de DB y `JWT_SECRET`.
4.  **Ejecutar:** `npm run dev` para desarrollo o `npm start` para producción.
e desarrollo

- El frontend usa **Web Components nativos** (sin frameworks)
- El componente `perfil-component.js` maneja login, registro y perfil de usuario en un solo modal
- El componente `reserva-component.js` maneja el formulario de citas con llamada a la API
- Las animaciones de scroll usan `IntersectionObserver` nativo
