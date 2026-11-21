# Procedencia y lectura responsable de datos externos

Cada consulta conserva en `VehicleExternalQuery` la placa normalizada, solicitante, proveedores elegidos, método, fecha y resultado. Cada fila en `VehicleExternalRecord` conserva proveedor, tipo, URL/referencia, payload, vigencia, estado e indicador `isSimulated`. `ExternalVerificationLog` y `AuditLog` registran las acciones.

Una fuente puede ser:

- `AUTHORIZED_API`: sólo para una interfaz expresamente autorizada por el proveedor.
- `MANUAL_PORTAL`: instrucción para que una persona autorizada consulte el sitio oficial; no significa que ENGRAIN haya obtenido datos.
- `MANUAL_DOCUMENT`: metadatos del documento y digest SHA-256 entregado por usuario/taller autorizado. La API no recibe binarios en este MVP.
- `MOCK`: datos ficticios de hackathon; siempre se devuelven con `isSimulated: true`.

La existencia, integridad de hash o disponibilidad de un documento no certifica que un trámite, inspección o reparación ocurrió realmente. La interfaz debe mostrar proveedor, fecha, método y limitaciones junto a cualquier resultado.
