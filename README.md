# ENGRAIN — Driving Trust

ENGRAIN reduce la incertidumbre de la compra de vehículos usados mediante un historial digital verificable, diagnósticos OBD2 y evidencia asociada a cada intervención.

## MVP

- API REST versionada en `/api/v1`.
- Autenticación JWT y autorización basada en roles.
- Gestión inicial de usuarios y vehículos con PostgreSQL (Supabase) y Prisma.
- Módulos delimitados para talleres, órdenes, mantenimientos, evidencias, diagnósticos, IA, notificaciones y pasaportes.
- Eventos Socket.IO preparados para notificaciones en tiempo real.
- Swagger disponible en `/docs` y especificación JSON en `/docs.json`.

## Inicio rápido

1. Copia `backend/.env.example` como `backend/.env`, usa la URL PostgreSQL de Supabase en `DATABASE_URL` y ajusta los secretos JWT.
2. Instala las dependencias: `npm install`.
3. Genera el cliente de Prisma: `npm run db:generate`.
4. Crea la base de datos y aplica la migración versionada: `npm run db:migrate`.
5. Carga datos ficticios: `npm run db:seed`.
6. Inicia el servicio: `npm run dev`.

La comprobación de disponibilidad queda en `GET /api/v1/health`.

## Estructura

```text
backend/
  prisma/              esquema y migraciones PostgreSQL
  src/
    config/            entorno y configuración
    docs/              OpenAPI/Swagger
    lib/               clientes de infraestructura
    middlewares/       autenticación, validación y errores
    modules/           dominios del producto
    shared/            tipos, errores y utilidades reutilizables
```

Consulta la documentación de producto, arquitectura, datos, seguridad y contrato en [`docs/`](docs/PROJECT_CONTEXT.md).
