# Despliegue de ENGRAIN

## Alcance validado

El backend se despliega como un único contenedor Node.js 20 y usa PostgreSQL administrado por Supabase. La imagen en `backend/Dockerfile` compila TypeScript, genera Prisma y ejecuta `prisma migrate deploy` antes de iniciar la API. Para la hackathon debe usarse una única réplica mientras las migraciones se ejecutan en el arranque; en un despliegue con varias réplicas, la migración debe convertirse en un job único de CI/CD.

## Variables de producción

Configurar secretos en el proveedor de hosting, nunca en Git ni en `.env.example`:

| Variable | Requisito |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Puerto asignado por el hosting (por defecto `3000`) |
| `DATABASE_URL` | URL PostgreSQL/Supabase con TLS; usar pooler de sesión cuando el hosting sea IPv4-only |
| `CORS_ORIGIN` | Lista separada por comas de orígenes exactos del frontend HTTPS |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Secretos independientes y aleatorios de 32+ caracteres |
| `ENABLE_SWAGGER` | `true` para demo, restringir o desactivar fuera de ella |
| `PUBLIC_PASSPORT_URL` | Ruta HTTPS del frontend que renderiza el pasaporte, por ejemplo `https://app.example.com/passports` |
| `PASSPORT_PUBLIC_RATE_LIMIT_WINDOW_MS`, `PASSPORT_PUBLIC_RATE_LIMIT_MAX` | Límite de enlaces públicos; predeterminado 60/15 min/IP |
| `AI_PROVIDER` | `local` para catálogo offline o `openai-compatible` |
| `AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Obligatorios sólo para proveedor de IA remoto; la clave nunca llega al cliente |

## Secuencia de despliegue

1. Configurar las variables anteriores en el entorno de producción.
2. Construir desde `backend`: `docker build -t engrain-api .`.
3. Ejecutar una instancia: `docker run --env-file .env.production -p 3000:3000 engrain-api`.
4. El contenedor ejecuta `npx prisma migrate deploy`; comprobar que termine antes de escalar.
5. Verificar `GET /api/v1/health` y `GET /docs.json` (si Swagger está habilitado).
6. Configurar el frontend para usar `https://api.example.com/api/v1`, permitir sólo su origen en `CORS_ORIGIN` y establecer `PUBLIC_PASSPORT_URL` en su ruta de lector público.
7. Ejecutar `npm run prisma:seed` sólo en la instancia demo; no cargar cuentas ficticias en una base de producción real.

## Checklist posterior

- El health check responde `200` por HTTPS.
- `prisma migrate status` informa el esquema actualizado.
- Login, autorización de vehículo, enlace público de pasaporte y revocación se prueban con cuentas demo.
- El QR abre la ruta pública del frontend, no una URL con credenciales.
- No hay `.env`, tokens, archivos de evidencia ni logs con datos personales en la imagen.

## Rollback

Las migraciones Prisma aplicadas para el MVP son aditivas. Si la aplicación falla, detener el despliegue, conservar la base de datos y volver a la imagen anterior. No ejecutar `migrate reset` ni eliminar tablas en producción. Cualquier rollback de datos requiere una migración nueva y revisada.
