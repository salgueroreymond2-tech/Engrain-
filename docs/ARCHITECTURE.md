# Arquitectura

ENGRAIN usa un monolito modular. Express resuelve HTTP, cada módulo concentra su enrutador, esquemas, controlador y reglas de dominio, y Prisma aísla el acceso a PostgreSQL administrado por Supabase.

```text
Cliente React / Integración OBD2
          │ REST + Socket.IO
          ▼
Express (app.ts)
 ├─ middlewares: CORS, request-id, JWT, Zod, errores
 ├─ modules: auth, vehicles, workshops, work-orders, ...
 ├─ shared: contratos transversales y AppError
 ├─ PrismaClient
 └─ Socket.IO: canal de notificaciones por usuario
          │
   PostgreSQL / Supabase
```

## Decisiones

- **Identificadores:** CUID para todos los recursos persistidos.
- **Fechas:** ISO 8601 en UTC, serializadas por JSON como cadenas.
- **Versionado:** prefijo obligatorio `/api/v1`; una versión mayor nueva no rompe la anterior sin periodo de transición.
- **Autorización:** JWT Bearer con rol; el recurso debe verificar además la relación con su propietario o taller.
- **Manejo de fallos:** errores públicos homogéneos y no exposición de trazas ni detalles internos.
- **Tiempo real:** Socket.IO se reserva para notificaciones; la fuente de verdad sigue siendo la API REST/PostgreSQL.

## Estado del MVP

Autenticación, vehículos, grants, trazabilidad, Connect OBD2 simulado, AI, pasaporte compartible, QR y transferencia digital de demostración están implementados en el monolito. Órdenes de trabajo, carga/descarga de binarios de evidencia y notificaciones completas conservan rutas de reserva (`501`) hasta su siguiente iteración. El contrato versionado permite que el frontend integre los módulos activos sin acoplarse a Prisma.
