# Seguridad de ServiGo

## Controles implementados

1. Contraseña mínima de 8 caracteres.
2. La contraseña exige mayúscula, minúscula y número.
3. Hash de contraseña con bcrypt.
4. JWT para autenticación.
5. Middleware de autenticación para rutas privadas.
6. Middleware de autorización por rol.
7. Roles: ADMIN, PRO y CLI.
8. Validación de propiedad sobre profesionales, servicios, horarios y reservas.
9. Protección contra acceso de un usuario a datos de otro usuario.
10. Helmet y CORS en Express.

## Flujo

Usuario -> Login -> API -> Validación -> JWT -> Endpoint protegido -> Verificación de rol -> Service -> Repository -> MongoDB

## Importante

El archivo `.env` nunca debe subirse a GitHub. Usar `.env.example` como plantilla.
