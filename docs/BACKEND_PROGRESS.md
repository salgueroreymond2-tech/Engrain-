# Progreso del backend

## Informacion externa de vehiculos (actualizacion 20 de noviembre de 2026)

La migracion `20261121220000_external_vehicle_data` se aplico a Supabase y el seeder registra proveedores. El modulo tiene adaptadores desacoplados, consultas auditables por vehiculo o placa, normalizacion segura, adjuntos manuales con SHA-256, cifrado de secretos preparado y rate limit. Ningun portal de Hacienda, INS, DEKRA, COSEVI o Registro se automatiza: se requiere API/convenio verificable. El unico resultado automatico es `MOCK`, restringido a `SUPER_ADMIN`, y todos sus registros dicen `isSimulated: true`.

Fecha de actualización: 20 de noviembre de 2026.

| Área | Estado | Nota |
| --- | --- | --- |
| Base TypeScript/Express | Listo | Configuración estricta y comandos de desarrollo/compilación. |
| Entorno y Prisma/PostgreSQL | Listo | Migración PostgreSQL aplicada y datos ficticios cargados en Supabase mediante Session pooler. |
| Errores, CORS y Swagger | Listo | Health check verificable sin base de datos. |
| Autenticación JWT | Listo para MVP | Hash bcrypt, access/refresh JWT, sesiones revocables, rotación y rate limiting. |
| Aislamiento de vehículos | Listo para MVP | Titularidad histórica, grants a usuario/organización/taller y política de no revelación. |
| Talleres y operaciones | Parcial | Organización, taller autorizado y timeline disponibles; CRUD operativo de órdenes/mantenimientos queda siguiente iteración. |
| Socket.IO | Preparado | Canal privado de notificaciones autenticado. |
| Dependencias | Riesgo registrado | Zod actualizado a 4.6.7; quedan 4 hallazgos altos del CLI Prisma 6, a resolver con migración mayor. |
| Núcleo de confianza | Listo para MVP | Timeline, fuentes, hashes, finalización inmutable, correcciones versionadas e inconsistencias de kilometraje neutrales. |
| Engrain Connect (OBD2) | Listo para MVP | Arquitectura `ObdProvider` desacoplada, simulador de cuatro escenarios, mediciones originales/unidades/fechas, DTCs, hashes y eventos. Sólo lectura; ningún adaptador físico se declara operativo. |
| Engrain AI | Listo para MVP | `AIProvider` configurable, catálogo local de DTCs como fallback, respuestas estructuradas con registros de respaldo y límites explícitos. Nunca modifica ni certifica registros. |
| Engrain Passport | Listo para MVP | Historial público filtrado, evidencia sólo como metadatos/hash, cobertura, gaps, alertas, token aleatorio de 256 bits, QR, expiración, revocación y rate limiting. |
| Transferencia digital | Listo para demo | Cambio de titularidad dentro de ENGRAIN con aceptación por correo, auditoría y revocación de grants/pasaportes; no reemplaza el trámite legal. |
| Pruebas | Aprobadas | 15 unitarias y 4 integraciones Supabase: aislamiento, OBD2/IA, pasaporte/QR/revocación/expiración y transferencia digital. Ver `docs/TEST_REPORT.md`. |

## Resultado inicial esperado

Se ejecutaron el 20 de noviembre de 2026:

```text
Prisma schema / Supabase migration  up to date
Test Files                         8 passed (8)
Tests                              19 passed (19)
```

También se ejecutaron correctamente `prisma generate`, `npm run build`, el chequeo TypeScript del seeder, `prisma migrate deploy` y `npm run prisma:seed` contra Supabase. La prueba de integración autentica cuentas ficticias, confirma que sólo el taller con grant ve el vehículo, persiste diagnósticos simulados y valida la serie de mediciones y las referencias del asistente.

## Engrain Connect y Engrain AI

Se aplicó la migración `20261121190000_engrain_connect_ai` a Supabase. Añade `DiagnosticMeasurement`, metadatos del proveedor, señalización `isSimulated`, verificación explícita de hardware físico y auditoría `AI_ANALYSIS_REQUESTED`. El seeder idempotente carga mediciones ficticias para el vehículo demo. El proveedor activo se controla con `AI_PROVIDER=local` (predeterminado) u `openai-compatible`; las credenciales de IA son exclusivas del servidor y no se exponen al frontend.
