# Progreso — Núcleo de confianza vehicular

Actualizado: 20 de noviembre de 2026.

## Entregado

- Registro de vehículo por VIN único, placa, características, propiedad histórica y grants temporales por usuario, organización o taller.
- Fuentes explícitas: `OBD2_DEVICE`, `WORKSHOP_RECORDED`, `EVIDENCE_BACKED`, `OWNER_DECLARED` y `SIMULATED`.
- Timeline de `VehicleEvent` ordenada por fecha, autor, organización, origen, evidencia e integridad.
- Historial de kilometraje con detección de lectura inferior previa que solicita revisión neutral; no asigna fraude ni culpa.
- Mantenimientos con evidencia SHA-256, estado de identidad/evidencia/integridad separado, hash de contenido y hash de finalización.
- Los registros finalizados no se actualizan: la corrección genera una nueva versión enlazada a la anterior y agrega un evento auditable.
- Auditoría para registro, grants, kilometraje, mantenimiento, finalización y correcciones.
- 11 pruebas unitarias aprobadas: JWT/sesión, autorización e aislamiento, hash determinista y detección neutral de kilometraje, además de health/Swagger/CORS/errores.

## Límites explícitos

- Un hash prueba integridad de los datos/hashes declarados; no prueba que el mantenimiento ocurrió.
- `HASH_VERIFIED` sólo se asignará cuando una integración de almacenamiento recalcule el hash desde el binario; el endpoint actual marca evidencia recibida como `AVAILABLE`.
- La verificación de identidad y la disponibilidad de evidencia son campos independientes de la integridad criptográfica.

## Operación de Supabase completada

- Migración `20261121004656_init_postgresql` aplicada a Supabase.
- Seeder ficticio cargado con cuentas, organizaciones, taller, grant y vehículo demo.
- Prueba de integración aprobada: propietario y mecánico autorizado ven el vehículo; el agente sin grant recibe `404`.
