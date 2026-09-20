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
5. Ejecuta `npm run dev`.

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

### Notificaciones

- `GET /clientes/:id/`
- `GET /notificaciones/:usuarioId/`
- `POST /reservas/:id/recordatorio/`

### Estadísticas

- `GET /profesional/:profesionalId/estadisticas/resumen/`
- `GET /profesional/:profesionalId/estadisticas/servicios/`
- `GET /profesional/:profesionalId/estadisticas/completadas/`
- `GET /profesional/:profesionalId/estadisticas/ingresos/`

Para endpoints protegidos usar:

`Authorization: Bearer <TOKEN>`
