# SEGURIDAD_SERVIGO

## 1. Objetivo de seguridad

ServiGo debe proteger cuentas, datos de usuarios, profesionales,
servicios, horarios, reservas y notificaciones. Se aplican
autenticación, autorización, mínimo privilegio y denegación por defecto.

## 2. Autenticación

### Registro

Validar datos, comprobar unicidad del correo, generar un hash seguro de
la contraseña y nunca guardar la contraseña en texto plano. El rol ADMIN
no debe poder elegirse libremente en el registro público.

### Login

Validar credenciales por HTTPS. Si son correctas y la cuenta está
activa, emitir tokens. Los errores de credenciales deben ser genéricos.

### Contraseñas

Preferir Argon2id. Como alternativa, bcrypt con configuración adecuada.
No usar MD5, SHA-1 o SHA-256 directamente para almacenar contraseñas. No
registrar contraseñas en logs.

### JWT

Propuesta: access token de corta duración y refresh token de mayor
duración. El access token se envía como `Authorization: Bearer <token>`.

Claims propuestos: - `sub`: ID del usuario. - `role`: CLI, PRO o
ADMIN. - `iss`: `servigo-api`. - `aud`: `servigo-client`. - `iat`:
emisión. - `exp`: expiración. - `jti`: identificador único del token.

No incluir contraseñas, hashes, secretos ni datos sensibles
innecesarios.

### Expiración, renovación y logout

Propuesta inicial: access token de 15 minutos y refresh token de 7 días,
ajustables por el equipo. Usar rotación/revocación de refresh tokens. Al
cerrar sesión, eliminar el token del cliente y revocar la sesión/refresh
token. Si se necesita revocación inmediata del access token, usar `jti`
y una estrategia de revocación hasta su expiración.

## 3. Roles y permisos

### CLI

Puede registrarse, iniciar sesión, consultar profesionales, servicios y
disponibilidad, crear reservas propias, consultar sus reservas y
modificarlas/cancelarlas según las reglas del negocio.

No puede administrar usuarios, servicios u horarios de profesionales ni
funciones administrativas.

### PRO

Puede iniciar sesión, gestionar su perfil profesional, sus servicios,
sus horarios, sus reservas y sus estadísticas.

No puede modificar recursos de otro profesional ni acceder a funciones
de ADMIN.

### ADMIN

Puede gestionar usuarios y profesionales, supervisar reservas, gestionar
información general, activar/desactivar cuentas y consultar estadísticas
administrativas.

## 4. Protección de APIs

El siguiente catálogo es una **propuesta basada en las funcionalidades
de ServiGo** y debe compararse con las rutas reales del backend de
Nicolás.

  ----------------------------------------------------------------------------------------------
  Endpoint propuesto                      Método             Acceso            Rol
  --------------------------------------- ------------------ ----------------- -----------------
  `/api/v1/auth/register`                 POST               Público           CLI/PRO

  `/api/v1/auth/login`                    POST               Público           Todos

  `/api/v1/auth/refresh`                  POST               Refresh token     Todos

  `/api/v1/auth/logout`                   POST               Auth              Todos

  `/api/v1/profesionales`                 GET                Público           Todos

  `/api/v1/profesionales/:id`             GET                Público           Todos

  `/api/v1/profesionales/:id/servicios`   GET                Público           Todos

  `/api/v1/profesionales/:id/horarios`    GET                Público           Todos

  `/api/v1/usuarios/me`                   GET/PATCH          Auth              Todos

  `/api/v1/reservas`                      POST               Auth              CLI

  `/api/v1/reservas`                      GET                Auth              CLI/PRO

  `/api/v1/reservas/:id`                  GET/PATCH/DELETE   Auth              CLI/PRO/ADMIN
                                                                               según relación

  `/api/v1/profesional/perfil`            GET/PATCH          Auth              PRO

  `/api/v1/profesional/servicios`         GET/POST           Auth              PRO

  `/api/v1/profesional/servicios/:id`     PATCH/DELETE       Auth              PRO propietario

  `/api/v1/profesional/horarios`          GET/POST           Auth              PRO

  `/api/v1/profesional/horarios/:id`      PATCH/DELETE       Auth              PRO propietario

  `/api/v1/profesional/reservas`          GET                Auth              PRO

  `/api/v1/profesional/estadisticas`      GET                Auth              PRO

  `/api/v1/admin/usuarios`                GET                Auth              ADMIN

  `/api/v1/admin/usuarios/:id`            PATCH              Auth              ADMIN

  `/api/v1/admin/profesionales`           GET                Auth              ADMIN

  `/api/v1/admin/profesionales/:id`       PATCH              Auth              ADMIN

  `/api/v1/admin/reservas`                GET                Auth              ADMIN

  `/api/v1/admin/estadisticas`            GET                Auth              ADMIN
  ----------------------------------------------------------------------------------------------

Toda ruta privada debe validar token, firma, `iss`, `aud`, `exp` y,
cuando corresponda, `nbf`; después debe verificar cuenta activa, rol y
propiedad/relación con el recurso.

## 5. Seguridad de datos

No devolver contraseñas, hashes, refresh tokens, secretos JWT, claves
privadas, credenciales de MongoDB ni variables de entorno. Validar
tipos, formatos, longitudes, fechas, horarios, precios, estados e
identificadores en el servidor.

Usar HTTPS en producción. Guardar secretos en variables de entorno y
nunca subirlos a GitHub.

## 6. Reglas de acceso

-   CLI no puede modificar otro usuario.
-   CLI no puede crear servicios.
-   CLI no puede modificar servicios u horarios de un PRO.
-   PRO no puede modificar recursos de otro PRO.
-   PRO no puede acceder a ADMIN.
-   Usuario sin token no puede usar endpoints privados.
-   Token inválido o expirado debe rechazarse.
-   Usuario inactivo debe ser rechazado.
-   La autorización se comprueba en el servidor, no solo en el frontend.

## 7. Seguridad de reservas

Al crear una reserva, el servidor debe obtener el cliente desde `sub`
del JWT y no confiar en un `cliente_id` enviado por el cliente. Debe
comprobar profesional, servicio, fecha, horario, disponibilidad y
ausencia de una reserva conflictiva.

Un CLI solo opera sus reservas. Un PRO solo opera reservas de su
negocio. Antes de cada modificación/cancelación se verifica la relación
con el recurso.

## 8. Manejo de errores

-   `401 Unauthorized`: token ausente, inválido, expirado o credenciales
    de login incorrectas.
-   `403 Forbidden`: usuario autenticado pero sin permiso.

Los mensajes no deben revelar información sensible.

## 9. Diagrama de autenticación

``` mermaid
flowchart LR
A[Usuario] --> B[Login] --> C[API] --> D[Validar credenciales]
D -->|Correctas| E[Generar JWT]
D -->|Incorrectas| F[401]
E --> G[Cliente almacena token]
G --> H[Endpoint protegido]
H --> I[Validar JWT]
I -->|Inválido| J[401]
I -->|Válido| K[Verificar rol y permisos]
K -->|Sin permiso| L[403]
K -->|Permitido| M[Ejecutar operación]
M --> N[Respuesta]
```

## 10. Diagrama de reserva

``` mermaid
flowchart LR
A[Cliente] --> B[Solicitud de reserva] --> C[Validar JWT]
C -->|Inválido| D[401]
C -->|Válido| E[Identificar CLI] --> F[Validar permisos]
F -->|Sin permiso| G[403]
F -->|Permitido| H[Validar profesional y servicio] --> I[Validar fecha y horario]
I --> J[Verificar disponibilidad]
J -->|No disponible| K[Rechazar]
J -->|Disponible| L[Crear reserva] --> M[Respuesta]
```

## 11. Matriz de permisos

  Función                                    CLI   PRO       ADMIN
  ----------------------------------------- ----- ----- ----------------
  Registrarse                                ✅    ✅         ---
  Iniciar sesión                             ✅    ✅          ✅
  Cerrar sesión                              ✅    ✅          ✅
  Renovar sesión                             ✅    ✅          ✅
  Ver profesionales                          ✅    ✅          ✅
  Ver servicios                              ✅    ✅          ✅
  Ver horarios/disponibilidad                ✅    ✅          ✅
  Gestionar perfil propio                    ✅    ✅          ✅
  Crear reserva                              ✅    ❌    Según política
  Ver reservas propias                       ✅    ✅          ✅
  Modificar/cancelar propias                 ✅    ❌    Según política
  Gestionar reservas del negocio             ❌    ✅          ✅
  Gestionar perfil profesional               ❌    ✅          ✅
  Crear/editar/eliminar servicios propios    ❌    ✅          ✅
  Gestionar horarios propios                 ❌    ✅          ✅
  Ver estadísticas propias                   ❌    ✅          ✅
  Gestionar usuarios                         ❌    ❌          ✅
  Gestionar profesionales                    ❌    ❌          ✅
  Supervisar reservas globales               ❌    ❌          ✅
  Estadísticas administrativas               ❌    ❌          ✅

## 12. Propuesta de integración

Sin modificar el backend actual, la integración posterior puede usar un
middleware `requireAuth`, seguido de autorización por rol y autorización
por recurso. Ejemplo conceptual:

`requireAuth -> requireRole("PRO") -> comprobar propietario -> controlador`

El rol por sí solo no basta: un PRO debe poder modificar únicamente
recursos que pertenezcan a su propio negocio.

## 13. Casos de prueba

-   Login correcto: acceso permitido.
-   Login incorrecto: 401.
-   Token ausente/inválido/expirado: 401.
-   CLI crea servicio: 403.
-   PRO accede a administración: 403.
-   CLI A modifica reserva de CLI B: 403.
-   PRO A modifica servicio de PRO B: 403.
-   PRO A modifica su propio servicio: permitido.
-   Reserva de horario disponible: permitido.
-   Reserva de horario ocupado: rechazada.
-   Servicio que no pertenece al profesional: rechazada.

## 14. Recomendaciones

1.  HTTPS en producción.
2.  Argon2id para contraseñas cuando esté disponible.
3.  Access tokens JWT de corta duración.
4.  Refresh tokens con rotación/revocación.
5.  Validar `iss`, `aud` y `exp`.
6.  No aceptar JWT con algoritmo `none`.
7.  Autorización en backend.
8.  Mínimo privilegio y deny-by-default.
9.  Verificación de propiedad de recursos.
10. Validación de todas las entradas.
11. No devolver hashes, tokens o secretos.
12. No subir secretos a GitHub.
13. Rate limiting para login y endpoints sensibles.
14. Mantener dependencias actualizadas.
15. Registrar eventos de seguridad sin credenciales.

## 15. Fuentes

-   OWASP Authorization Cheat Sheet:
    https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
-   OWASP Password Storage Cheat Sheet:
    https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
-   OWASP REST Security Cheat Sheet:
    https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
-   OWASP JSON Web Token Cheat Sheet:
    https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html
-   RFC 7519 --- JSON Web Token:
    https://www.rfc-editor.org/rfc/rfc7519.html

## 16. Estado

Esta es la propuesta de seguridad de ServiGo. No modifica el backend.
Antes de implementar, Nicolás debe comparar el catálogo propuesto con
las rutas reales del backend y confirmar los nombres definitivos.
