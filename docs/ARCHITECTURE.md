# Arquitectura

ENGRAIN usa un monolito modular. Express resuelve HTTP, cada módulo concentra su enrutador, esquemas, controlador y reglas de dominio, y Prisma aísla el acceso a MySQL.

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
        MySQL
```

## Decisiones

- **Identificadores:** CUID para todos los recursos persistidos.
- **Fechas:** ISO 8601 en UTC, serializadas por JSON como cadenas.
- **Versionado:** prefijo obligatorio `/api/v1`; una versión mayor nueva no rompe la anterior sin periodo de transición.
- **Autorización:** JWT Bearer con rol; el recurso debe verificar además la relación con su propietario o taller.
- **Manejo de fallos:** errores públicos homogéneos y no exposición de trazas ni detalles internos.
- **Tiempo real:** Socket.IO se reserva para notificaciones; la fuente de verdad sigue siendo la API REST/MySQL.

## Estado del MVP

Autenticación y vehículos tienen implementación base. Los módulos de negocio restantes exponen rutas de reserva (`501`) de forma intencional hasta implementar sus flujos sobre el esquema Prisma; sus contratos ya están fijados para permitir que el frontend avance sin ambigüedad.
