# Seguridad

## Controles incluidos

- Contraseñas con hash `bcrypt` (coste 12); nunca se devuelven por API.
- JWT de acceso de vida corta, refresh token rotatorio y sesión persistida con hash SHA-256 revocable.
- Validación de payload, parámetros y consultas con Zod.
- `helmet`, CORS explícito por variable de entorno y límites de JSON.
- Respuestas de error sin pila, credenciales ni detalles internos.
- Autorización por rol, membresía activa de organización, propiedad vigente y grants explícitos de vehículo.
- Rate limiting en registro, login y refresh por IP/ruta con respuesta de error uniforme `429`.
- `AuditLog` para registro, login, logout, creación/edición de vehículo, grants y vistas de pasaporte público.
- Socket.IO autentica el token antes de unir al usuario a su canal privado.
- Los enlaces de pasaporte usan tokens aleatorios URL-safe de 256 bits, expiración obligatoria, revocación auditada y rate limiting público por IP. La vista pública filtra identidad de propietarios, grants, snapshots, claves de almacenamiento y binarios de evidencia.
- La aceptación de una transferencia digital revoca grants y enlaces de pasaporte activos del dueño anterior; la transferencia no reemplaza un trámite legal.

## Reglas operativas

- Usar secretos aleatorios de al menos 32 caracteres para producción y rotarlos ante exposición.
- Configurar `CORS_ORIGIN` con dominios concretos; nunca usar `*` junto con credenciales.
- Servir siempre detrás de HTTPS en producción y fijar `NODE_ENV=production`.
- Tratar VIN, placas, evidencias, ubicación y diagnósticos como datos sensibles.
- Guardar evidencias en almacenamiento privado firmado; en la BD sólo guardar metadatos y URLs con vencimiento. Esto queda pendiente de la integración de almacenamiento.
- Registrar auditoría de accesos al pasaporte, cambios de propiedad y descarga de evidencia antes de producción.
- Un taller no debe consultar vehículos por organización sin resolver un grant activo y no expirado para ese taller/organización.
- Configurar `PUBLIC_PASSPORT_URL` como URL HTTPS del frontend; el backend rechaza `localhost` cuando `NODE_ENV=production`.

## Límites del MVP

No se implementan todavía MFA, limitación de tasa distribuida ni análisis antivirus de archivos. El rate limiter actual es intencionalmente en memoria y debe migrar a Redis u otro almacén compartido antes de escalar horizontalmente.

## Dependencias auditadas

El 20 de noviembre de 2026 se ejecutó `npm audit --omit=dev --json` desde `backend/`.

- Zod se actualizó a `4.6.7`, eliminando el hallazgo de denegación de servicio asociado a Zod 3.
- Persisten **4 hallazgos altos** encadenados al CLI `prisma@6.19.3` (`@prisma/config`, `deepmerge-ts` y `effect`). La corrección disponible requiere migrar a `prisma@7.10.1`, un cambio mayor que debe probar generación, migraciones y conexión PostgreSQL en una tarea dedicada.
- No ejecutar `npm audit fix --force` durante la hackathon: podría alterar la configuración de Prisma y bloquear el flujo de datos. Antes de producción, la migración a Prisma 7 o superior es obligatoria.
