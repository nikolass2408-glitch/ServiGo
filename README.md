# ServiGo

Sistema de gestión y reserva de citas para profesionales independientes y pequeños negocios.

## Tecnologías

- Frontend: React
- Backend: Node.js + Express + TypeScript
- Base de datos: MongoDB Atlas
- ODM: Mongoose
- Autenticación: JWT
- Seguridad: bcryptjs + Helmet
- Control de versiones: Git / GitHub

## Arquitectura del backend

```text
backend/
└── src/
    ├── controllers/
    ├── data/
    ├── models/
    ├── repositories/
    ├── routes/
    ├── services/
    ├── middlewares/
    ├── config/
    ├── app.ts
    └── server.ts
```

Flujo:

`Frontend -> Routes -> Controllers -> Services -> Repositories -> Models -> MongoDB`

## Instalación

1. Entra a `backend`.
2. Ejecuta `npm install`.
3. Copia `.env.example` como `.env`.
4. Completa `MONGO_URI` y `JWT_SECRET`.
5. Para entregar enlaces de recuperación y recordatorios por correo, configura `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` y `FRONTEND_URL`.
6. Ejecuta `npm run dev`.

En desarrollo local, si SMTP no está configurado, puedes activar `PASSWORD_RESET_LOG_LINK=true` para imprimir el enlace de recuperación en la terminal. No lo actives en producción.

El backend revisa cada minuto las citas activas y genera una notificación automática al cliente una hora antes. El envío por correo requiere SMTP; la notificación dentro de ServiGo no depende de ese servicio. Configura `TZ` con la zona horaria de los profesionales (por defecto `America/Bogota`). Los logos se cargan como PNG, JPEG o WebP de hasta 5 MB. El backend los guarda en `backend/uploads`; conserva esa carpeta en un volumen persistente al desplegar, o conecta almacenamiento de objetos antes de usar instancias efímeras.

## Modo demo funcional

El frontend se ejecuta por defecto en modo demo y guarda usuarios, perfiles, servicios, horarios, bloqueos, reservas y notificaciones en el almacenamiento local del navegador. No necesita MongoDB ni sincroniza datos entre navegadores. Los recordatorios demo se actualizan mientras el panel del cliente está abierto; para procesarlos con el navegador cerrado se debe usar la API real.

1. Entra a `frontend` y ejecuta `npm install` y `npm run dev`.
2. Inicia sesión con una cuenta de demostración:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | `cliente@servigo.demo` | `Cliente123` |
| Profesional | `profesional@servigo.demo` | `ProServiGo123` |
| Administrador | `admin@servigo.demo` | `Admin1234` |

También puedes crear cuentas nuevas desde Registro. En demo se pueden cargar logos PNG, JPEG o WebP de hasta 2 MB y guardarlos con el perfil. Para borrar los datos y restaurar el estado inicial, elimina la clave `servigo_demo_data_v1` del almacenamiento local del sitio en el navegador.

Para usar la API real, configura `VITE_DEMO_MODE=false` y `VITE_API_URL` (por ejemplo `http://localhost:3000/api`) en el entorno del frontend y ejecuta el backend con MongoDB y las variables de entorno configuradas.

Para producción:

```bash
npm run build
npm start
```

## Seguridad

- Contraseñas con mínimo 8 caracteres, mayúscula, minúscula y número.
- Contraseñas almacenadas con hash bcrypt.
- JWT para autenticación.
- Middleware de autenticación.
- Middleware de autorización por roles: `ADMIN`, `PRO`, `CLI`.
- Protección de endpoints privados.
- Separación de responsabilidades por capas.

## API base

`http://localhost:3000/api/`

### Autenticación

- `POST /registro/`
- `POST /login/`
- `GET /usuarios/` — ADMIN

### Profesionales

- `GET /profesionales/`
- `POST /profesionales/`
- `POST /profesionales/imagen/` — profesional autenticado, multipart con campo `imagen`
- `GET /profesional/:profesionalId/clientes/`

### Servicios

- `GET /servicios/`
- `POST /servicios/`

### Horarios

- `GET /horarios/`
- `POST /horarios/`
- `PATCH /horarios/:id/modificar/`

### Reservas

- `POST /reservas/`
- `GET /reservas/lista/`
- `GET /reservas/historial/`
- `GET /reservas/disponibilidad/?profesional=ID&fecha=YYYY-MM-DD`
- `GET /reservas/:id/`
- `PATCH /reservas/:id/confirmar/`
- `PATCH /reservas/:id/cancelar/`
- `PATCH /reservas/:id/reprogramar/`
- `PATCH /reservas/:id/rechazar/`
- `GET /profesional/:profesionalId/clientes/:clienteId/historial/`

La base de datos crea al iniciar un índice único por minuto ocupado de cada profesional. Así evita reservas solapadas incluso si llegan solicitudes simultáneas; al cancelar o rechazar una reserva, sus minutos quedan disponibles.

### Notificaciones

- `GET /clientes/:id/`
- `GET /notificaciones/:usuarioId/`
- `POST /reservas/:id/recordatorio/`

Los recordatorios automáticos se generan una hora antes de cada cita activa y no requieren que el cliente los solicite manualmente.

### Estadísticas

- `GET /profesional/:profesionalId/estadisticas/resumen/`
- `GET /profesional/:profesionalId/estadisticas/servicios/`
- `GET /profesional/:profesionalId/estadisticas/completadas/`
- `GET /profesional/:profesionalId/estadisticas/ingresos/`

Para endpoints protegidos usar:

`Authorization: Bearer <TOKEN>`
