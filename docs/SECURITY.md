# Seguridad

## Controles incluidos

- Contraseñas con hash `bcrypt` (coste 12); nunca se devuelven por API.
- JWT de acceso de vida corta y secreto independiente para renovación futura.
- Validación de payload, parámetros y consultas con Zod.
- `helmet`, CORS explícito por variable de entorno y límites de JSON.
- Respuestas de error sin pila, credenciales ni detalles internos.
- Autorización por rol y, para recursos sensibles, verificación de pertenencia/propiedad.
- Socket.IO autentica el token antes de unir al usuario a su canal privado.

## Reglas operativas

- Usar secretos aleatorios de al menos 32 caracteres para producción y rotarlos ante exposición.
- Configurar `CORS_ORIGIN` con dominios concretos; nunca usar `*` junto con credenciales.
- Servir siempre detrás de HTTPS en producción y fijar `NODE_ENV=production`.
- Tratar VIN, placas, evidencias, ubicación y diagnósticos como datos sensibles.
- Guardar evidencias en almacenamiento privado firmado; en la BD sólo guardar metadatos y URLs con vencimiento. Esto queda pendiente de la integración de almacenamiento.
- Registrar auditoría de accesos al pasaporte, cambios de propiedad y descarga de evidencia antes de producción.

## Límites del MVP

No se implementan todavía refresh tokens persistentes, MFA, limitación de tasa distribuida ni análisis antivirus de archivos. Son requisitos previos para una salida productiva, no para la demostración controlada de hackathon.
