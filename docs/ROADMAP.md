# Roadmap

## Antes del 22 de noviembre de 2026

- [x] Arquitectura backend, contrato y modelo de datos.
- [x] Health check, Swagger, CORS, errores, JWT y pruebas de humo.
- [x] Crear esquema PostgreSQL, migración inicial y seeders ficticios.
- [x] Aplicar la migración y el seeder contra la instancia Supabase compartida.
- [ ] Completar flujos CRUD de órdenes, mantenimientos y evidencias.
- [ ] Integrar lectura OBD2 simulada y persistencia de diagnósticos.
- [ ] Conectar el frontend React al contrato de `/api/v1`.
- [ ] Demo del pasaporte compartible y notificación Socket.IO.

## Después del MVP

- Tokens de renovación, auditoría completa y rate limiting distribuido.
- Carga segura de archivos, análisis antivirus y URLs firmadas.
- Reglas de integridad del historial y registro de compartición del pasaporte.
- Módulo Business para agencias y analítica agregada.
