# Modelo de Base de Datos — ServiGo

## Descripción

ServiGo utiliza MongoDB como sistema de base de datos para gestionar usuarios, profesionales, servicios, horarios, reservas y notificaciones.

La base de datos se encuentra alojada en MongoDB Atlas y puede administrarse visualmente mediante MongoDB Compass.

## Colecciones

La base de datos `servigo` contiene las siguientes colecciones:

- usuarios
- profesionales
- servicios
- horarios
- reservas
- notificaciones

## Relación entre las colecciones

```text
USUARIOS
   │
   ├── PROFESIONALES
   │       │
   │       ├── SERVICIOS
   │       │
   │       └── HORARIOS
   │
   └── RESERVAS
           │
           ├── PROFESIONALES
           ├── SERVICIOS
           └── USUARIOS

RESERVAS
   │
   └── NOTIFICACIONES