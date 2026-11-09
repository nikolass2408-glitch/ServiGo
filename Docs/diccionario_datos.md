# Diccionario de Datos — ServiGo

## Colección: usuarios

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único del usuario |
| `username` | String | Nombre de usuario |
| `nombre` | String | Nombre del usuario |
| `apellido` | String | Apellido del usuario |
| `correo` | String | Correo electrónico |
| `telefono` | String | Número de teléfono |
| `rol` | String | Rol del usuario |
| `activo` | Boolean | Indica si la cuenta está activa |

## Colección: profesionales

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único del profesional |
| `usuario_id` | String | Usuario relacionado |
| `tipo_negocio` | String | Tipo de negocio |
| `nombre_negocio` | String | Nombre del negocio |
| `descripcion` | String | Descripción del negocio |
| `telefono` | String | Teléfono del negocio |
| `direccion` | String | Dirección del negocio |
| `imagen` | String | Imagen del negocio |
| `enlace_personalizado` | String | Enlace personalizado |
| `activo` | Boolean | Indica si está activo |

## Colección: servicios

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único del servicio |
| `profesional_id` | String | Profesional que ofrece el servicio |
| `nombre` | String | Nombre del servicio |
| `descripcion` | String | Descripción del servicio |
| `precio` | Number | Precio del servicio |
| `duracion` | Number | Duración del servicio en minutos |
| `activo` | Boolean | Indica si el servicio está disponible |

## Colección: horarios

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único del horario |
| `profesional_id` | String | Profesional relacionado |
| `dia` | String | Día de la semana |
| `hora_inicio` | String | Hora de inicio |
| `hora_fin` | String | Hora de finalización |
| `activo` | Boolean | Indica si el horario está disponible |

## Colección: empresas

| Campo | Tipo | Descripción |
|---|---|---|
| `horarioEmpresa.abierto24Horas` | Boolean | Indica si la empresa atiende las 24 horas todos los días |
| `horarioEmpresa.dias` | Array | Horario de atención semanal de la empresa |
| `horarioEmpresa.dias[].dia` | Number | Día de la semana (0 domingo, 1 lunes, …, 6 sábado) |
| `horarioEmpresa.dias[].abierto` | Boolean | Indica si la empresa abre ese día |
| `horarioEmpresa.dias[].horaInicio` | String | Hora de apertura en formato 24 horas |
| `horarioEmpresa.dias[].horaFin` | String | Hora de cierre en formato 24 horas |

El horario inicial es lunes a viernes de 08:00 a 22:00 y sábado y domingo de
08:00 a 13:00. La disponibilidad reservable debe coincidir con el horario de
atención de la empresa y con el horario individual del profesional.

## Colección: reservas

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único de la reserva |
| `profesional_id` | String | Profesional seleccionado |
| `servicio_id` | String | Servicio reservado |
| `cliente_id` | String | Cliente que realiza la reserva |
| `fecha` | String | Fecha de la reserva |
| `hora` | String | Hora de la reserva |
| `estado` | String | Estado de la reserva |
| `notas` | String | Información adicional |

### Estados de reserva

- `PENDIENTE`
- `CONFIRMADA`
- `CANCELADA`
- `COMPLETADA`
- `REPROGRAMADA`

## Colección: notificaciones

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único de la notificación |
| `usuario_id` | String | Usuario que recibe la notificación |
| `reserva_id` | String | Reserva relacionada |
| `tipo` | String | Tipo de notificación |
| `mensaje` | String | Mensaje mostrado al usuario |
| `leida` | Boolean | Indica si la notificación fue leída |