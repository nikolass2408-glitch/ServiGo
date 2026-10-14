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

## Instalación y ejecución

ServiGo usa el frontend React, una API Express y MongoDB Atlas. Inicia el backend y el frontend en terminales separadas.

### 1. Configurar MongoDB Atlas

- Crea o reanuda un clúster de MongoDB Atlas.
- En **Network Access**, autoriza la IP desde la que se ejecutará el backend.
- Crea un usuario de base de datos y copia la URI de conexión del clúster.

### 2. Configurar e iniciar el backend

Desde la carpeta del proyecto:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edita `backend/.env` y configura las dos variables necesarias:

```env
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER/servigo?retryWrites=true&w=majority
JWT_SECRET=una_clave_larga_aleatoria_y_secreta
```

Reemplaza los valores de ejemplo con las credenciales y el host de tu clúster. Si la contraseña contiene caracteres especiales, codifícala para una URI. No compartas ni subas `backend/.env`; está excluido de Git.

Inicia la API:

```powershell
npm run dev
```

La API queda disponible en `http://localhost:3000/api/`. Al abrir esa dirección debe responder con el estado de la API. El servidor solo inicia después de conectarse a MongoDB.

### 3. Configurar e iniciar el frontend

En otra terminal, desde la carpeta del proyecto:

```powershell
cd frontend
npm install
```

Antes de iniciarlo, crea `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

Luego ejecuta `npm run dev` desde `frontend`.

Abre `http://localhost:5173`. Deja ambas terminales ejecutándose mientras utilizas ServiGo. Si modificas las variables `VITE_*`, reinicia Vite para que aplique los cambios.

### Configuración opcional

El backend usa por defecto el puerto `3000` y la zona horaria `America/Bogota`. Para enviar correos de confirmación, recordatorios o recuperación de contraseña, configura los datos SMTP (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` y, opcionalmente, `MAIL_FROM`) en `backend/.env`. Sin esas credenciales, el envío de correos no estará disponible.

Si el DNS del equipo no puede resolver el registro SRV de Atlas, agrega `DNS_SERVERS=1.1.1.1,8.8.8.8` a `backend/.env`. No hace falta configurarlo cuando la conexión funciona con el DNS habitual.

El backend revisa cada minuto las citas activas y genera una notificación una hora antes. Las notificaciones dentro de ServiGo no dependen del correo. Los logos admiten PNG, JPEG o WebP de hasta 5 MB; se guardan en `backend/uploads`, que debe conservarse en almacenamiento persistente al desplegar.

### Compilación

Para compilar el backend, desde `backend`:

```powershell
npm run build
npm start
```

Para compilar el frontend, desde `frontend`:

```powershell
npm run build
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
