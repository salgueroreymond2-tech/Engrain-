# Contrato de API — ENGRAIN v1

Base URL: `http://localhost:3000/api/v1`. Todas las fechas son ISO 8601 UTC y todos los IDs internos son CUID. Swagger: `/docs`; especificación JSON: `/docs.json`.

## Sobre de respuesta y seguridad

Una respuesta correcta tiene `{ "success": true, "data": { ... } }`. Un error tiene `{ "success": false, "error": { "code", "message", "details?" }, "meta": { "requestId" } }`.

Salvo donde se indique **público**, las rutas requieren `Authorization: Bearer <accessToken>`. El token está ligado a una sesión activa; revocar la sesión invalida sus access tokens. Las rutas `/auth/register`, `/auth/login` y `/auth/refresh` aceptan como máximo 10 intentos por IP y ruta cada 15 minutos por defecto (`429 RATE_LIMITED`).

| Código | Significado |
| --- | --- |
| `401` | Token, credencial o sesión inválidos (`INVALID_TOKEN`, `SESSION_REVOKED`). |
| `403` | El rol o permiso no permite la acción (`FORBIDDEN`). |
| `404` | Recurso inexistente o no visible para evitar filtrar datos privados. |
| `409` | Duplicado, como email o VIN (`RESOURCE_CONFLICT`). |
| `422` | Validación Zod fallida; revisar `error.details`. |
| `429` | Límite de autenticación alcanzado. |
| `501` | Módulo contratado aún no habilitado en el MVP. |

## Roles

`SUPER_ADMIN`, `WORKSHOP_ADMIN`, `MECHANIC`, `VEHICLE_OWNER`, `DEALERSHIP_ADMIN` y `SALES_AGENT` son los únicos valores admitidos. Además del rol global, los usuarios de organización necesitan una `OrganizationMember` activa; ningún rol de taller recibe acceso a un vehículo sin un `VehicleAccessGrant` vigente.

## Autenticación y sesiones

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `POST /auth/register` | Público, rate limited | `name`, `email`, `password` (8–128) | `201`, `409`, `422`, `429` |
| `POST /auth/login` | Público, rate limited | `email`, `password` | `200`, `401`, `422`, `429` |
| `POST /auth/refresh` | Público, rate limited | `refreshToken` | `200`, `401`, `429` |
| `GET /auth/me` | Sesión activa | — | `200`, `401` |
| `GET /auth/sessions` | Sesión activa | — | `200`, `401` |
| `DELETE /auth/sessions/:id` | Dueño de sesión | CUID `id` | `204`, `401`, `404` |

Registro, login y refresh retornan:

```json
{
  "success": true,
  "data": {
    "user": { "id": "cuid", "name": "Olivia Owner", "email": "owner@engrain.test", "role": "VEHICLE_OWNER" },
    "sessionId": "cuid",
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "refreshExpiresAt": "2026-11-27T00:00:00.000Z"
  }
}
```

## Transferencia digital de propiedad (MVP)

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `POST /vehicles/:id/transfers` | Dueño actual o `SUPER_ADMIN` | `{ "recipientEmail": "...", "expiresAt?": "ISO" }`; por defecto 7 días, máximo 30 | `201`, `403`, `404`, `422` |
| `POST /transfers/:id/accept` | Sesión de la cuenta invitada por correo | CUID `id` | `200`, `404`, `409` |

Al aceptar, se cierra la titularidad actual en ENGRAIN, se crea la nueva, se registra auditoría/evento y se revocan grants de acceso y enlaces de pasaporte activos para proteger al nuevo dueño. La API siempre devuelve el aviso: **la transferencia digital no sustituye ningún traspaso legal, registral, notarial ni contractual del vehículo**.

El cliente nunca registra ni pone tokens en URL. El refresh token rota al usarse y sólo su hash SHA-256 se persiste.

## Organizaciones y talleres

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `GET /organizations/me` | Sesión activa | — | `200`, `401` |
| `POST /organizations` | Sesión activa | `name`, `type` (`WORKSHOP`/`DEALERSHIP`), `taxId?`, `email?`, `phone?`, `address?` | `201`, `409`, `422` |
| `POST /workshops` | `WORKSHOP_ADMIN` de la organización o `SUPER_ADMIN` | `organizationId`, `name`, `phone?`, `address?` | `201`, `403`, `404`, `409` |
| `GET /workshops/:id/vehicles` | Miembro activo del taller o `SUPER_ADMIN` | CUID `id` | `200`, `404` |

Crear una organización incorpora al solicitante como `WORKSHOP_ADMIN` o `DEALERSHIP_ADMIN`. Un taller se vincula uno-a-uno con una organización `WORKSHOP`.

## Vehículos, propiedad y grants

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `GET /vehicles` | Sesión activa | — | `200`, `401` |
| `POST /vehicles` | Sesión activa | `vin`, `plate?`, `make`, `model`, `year`, `mileageKm?`, `dataSource?`, `registeredOrganizationId?` | `201`, `409`, `422` |
| `GET /vehicles/:id` | Dueño actual, grant activo o `SUPER_ADMIN` | CUID `id` | `200`, `404` |
| `PATCH /vehicles/:id` | Dueño / grant `MANAGE` / super admin | Campos editables excepto VIN | `200`, `403`, `404`, `422` |
| `DELETE /vehicles/:id` | Dueño / grant `MANAGE` / super admin | CUID `id` | `204`, `403`, `404` |
| `POST /vehicles/:id/access-grants` | Dueño / `MANAGE` / super admin | exactamente uno de `granteeUserId`, `organizationId`, `workshopId`; `permission` (`VIEW`, `SERVICE`, `MANAGE`), `expiresAt?` | `201`, `403`, `404`, `422` |
| `GET /vehicles/:id/timeline` | Dueño o grant activo | CUID `id` | `200`, `404` |

Ejemplo de registro:

```json
{
  "vin": "1HGCM82633A004352",
  "plate": "DEMO-001",
  "make": "Honda",
  "model": "Accord",
  "year": 2020,
  "mileageKm": 72450,
  "dataSource": "MANUAL"
}
```

VIN es único global y se normaliza a mayúsculas. Crear un vehículo también crea un `VehicleOwnership` actual. Archivar no borra mantenimientos, diagnósticos ni el historial de propiedad. La timeline sólo devuelve `MaintenanceRecords`, `DiagnosticScans`/DTCs y `VehicleMileageLogs` que pertenecen al vehículo autorizado.

Un grant de taller se resuelve contra la organización del taller y una membresía activa; ser mecánico en otro taller no da acceso. Esta regla es la frontera de aislamiento entre organizaciones.

## Núcleo de confianza y timeline

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `GET /vehicles/:id/ownerships` | Dueño o grant activo | CUID `id` | `200`, `404` |
| `GET /vehicles/:id/events` | Dueño o grant activo | CUID `id` | `200`, `404` |
| `POST /vehicles/:id/mileage-logs` | Dueño o grant `SERVICE`/`MANAGE` | `mileageKm`, `recordedAt?`, `recordSource`, `identityStatus?`, `organizationId?` | `201`, `403`, `422` |
| `POST /vehicles/:id/maintenance-records` | Dueño o grant `SERVICE`/`MANAGE` | mantenimiento, fuente, organización/taller y evidencias opcionales | `201`, `403`, `422` |
| `POST /maintenance-records/:id/finalize` | Dueño o grant `SERVICE`/`MANAGE` | — | `200`, `404`, `409` |
| `POST /maintenance-records/:id/corrections` | Dueño o grant `SERVICE`/`MANAGE` | `correctionReason` y campos reemplazados | `201`, `404`, `409`, `422` |

`recordSource` acepta exclusivamente `OBD2_DEVICE`, `WORKSHOP_RECORDED`, `EVIDENCE_BACKED`, `OWNER_DECLARED` o `SIMULATED`. Los registros de taller requieren organización y taller válidos; sólo `SUPER_ADMIN` puede generar registros `SIMULATED`.

Una evidencia declara `{ storageKey, fileName, mimeType, sizeBytes, sha256, type }`. `sha256` es obligatorio y debe ser un digest hexadecimal SHA-256 de 64 caracteres. La API almacena metadatos, no binarios.

Finalizar un mantenimiento calcula `contentHash` y `finalizedHash`, conserva autor/organización/fuente/evidencias y bloquea la modificación ordinaria. Una corrección no toca el registro finalizado: inserta una versión nueva con `supersedesId`, número de versión mayor y motivo obligatorio. Integridad, evidencia y verificación de identidad se exponen separadamente y no constituyen prueba de ocurrencia física del servicio.

Cuando una lectura nueva es inferior a una lectura previa del mismo vehículo, se crea el evento `MILEAGE_INCONSISTENCY_DETECTED` con un mensaje de revisión. Nunca se etiqueta a una persona como fraudulenta.

## Engrain Connect — OBD2 de sólo lectura

Las lecturas OBD2 son estrictamente de **sólo lectura**: la API no programa ECUs, borra DTCs ni controla componentes. Los registros conservan `rawValue`, `normalizedValue`, `unit`, `capturedAt`, `recordSource`, proveedor y payload original. `isSimulated: true` y `recordSource: "SIMULATED"` aparecen tanto en la base de datos como en las respuestas de demostración; no representan una conexión física. `physicalConnectionVerified` sólo puede ser `true` tras validar un adaptador de hardware compatible; el MVP no expone una ruta para conexiones físicas.

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `GET /vehicles/:id/diagnostics` | Dueño o grant activo | CUID `id` | `200`, `404` |
| `POST /vehicles/:id/diagnostics/simulations` | `SUPER_ADMIN` con acceso al vehículo | `{ "scenario": "healthy"\|"misfire"\|"catalyst"\|"cooling" }` | `201`, `403`, `404`, `422` |
| `GET /diagnostics/:id` | Dueño o grant activo del vehículo del scan | CUID `id` | `200`, `404` |
| `GET /diagnostics/:id/measurements` | Dueño o grant activo | CUID `id` | `200`, `404` |
| `GET /vehicles/:id/diagnostics/measurements` | Dueño o grant activo | `metric` snake_case obligatorio; `from?`, `to?` ISO 8601, `limit?` 1–1000 | `200`, `404`, `422` |

Escenarios del simulador incluyen VIN, DTCs, RPM, temperatura de refrigerante, velocidad, nivel/ajuste de combustible, sensores, voltaje y monitores. Por ejemplo, `misfire` registra `P0300`. Un diagnóstico finalizado incluye hashes de contenido y finalización, su evento `DIAGNOSTIC_RECORDED` y `AuditLog`; no se ofrece una actualización ni eliminación ordinaria.

Ejemplo de lectura simulada:

```json
{
  "success": true,
  "data": {
    "diagnostic": {
      "id": "cuid",
      "recordSource": "SIMULATED",
      "isSimulated": true,
      "physicalConnectionVerified": false,
      "providerKey": "simulated-obd",
      "troubleCodes": [{ "code": "P0300", "severity": "WARNING" }],
      "measurements": [{ "metric": "engine_rpm", "rawValue": "920", "normalizedValue": 920, "unit": "rpm" }]
    }
  }
}
```

Para gráficos, el frontend usa la serie de mediciones y debe etiquetar o filtrar el punto mediante `scan.isSimulated`. Para alertas, usa `troubleCodes[].severity`; no convierte una alerta en diagnóstico mecánico concluyente.

## Engrain AI — asistente de historial autorizado

| Método y ruta | Acceso | Propósito / parámetros | Respuestas |
| --- | --- | --- | --- |
| `GET /assistant/vehicles/:id/dtc-interpretation` | Dueño o grant activo | `scanId?`; interpreta DTCs | `200`, `404`, `422` |
| `GET /assistant/vehicles/:id/diagnostic-explanation` | Dueño o grant activo | `scanId?`; explicación sencilla | `200`, `404`, `422` |
| `GET /assistant/vehicles/:id/maintenance-analysis` | Dueño o grant activo | historial de mantenimientos | `200`, `404` |
| `GET /assistant/vehicles/:id/recommendations` | Dueño o grant activo | revisiones según intervalos disponibles | `200`, `404` |
| `GET /assistant/vehicles/:id/inconsistencies` | Dueño o grant activo | señales neutrales para revisión | `200`, `404` |
| `POST /assistant/vehicles/:id/questions` | Dueño o grant activo | `{ "question": "...", "scanId?": "cuid" }` | `200`, `404`, `422` |

Todas las respuestas tienen `{ provider, fallbackUsed, simulatedDataIncluded, response, supportingRecords, limitations }`. `supportingRecords` enumera los IDs y fechas de scans, DTCs, mantenimientos, intervalos y kilometrajes que respaldan la salida. El proveedor por defecto es el catálogo local; si se configura un proveedor compatible y no está disponible, la respuesta vuelve al catálogo local (`fallbackUsed: true`). La IA nunca modifica registros, certifica reparaciones ni garantiza el estado mecánico. A un proveedor remoto sólo se le entrega historial técnico autorizado, sin propietarios, sesiones ni grants.

## Pasaportes compartibles

| Método y ruta | Acceso | Body / parámetros | Respuestas |
| --- | --- | --- | --- |
| `POST /passports` | Dueño / `MANAGE` / super admin | `vehicleId`, `expiresAt?` (por defecto 7 días), `snapshot?` privado | `201`, `403`, `404`, `422` |
| `GET /passports/:id` | Dueño / `MANAGE` / super admin | CUID `id` | `200`, `404` |
| `GET /passports/:id/qr` | Dueño / `MANAGE` / super admin | CUID `id` | `200`, `404`, `409` |
| `POST /passports/:id/revoke` | Dueño / `MANAGE` / super admin | CUID `id` | `200`, `404` |
| `GET /passports/public/:publicToken` | Público; token compartible activo, no revocado y no expirado | token aleatorio URL-safe | `200`, `404`, `429` |

Al crear un enlace, el backend genera un token aleatorio de 256 bits, URL-safe y único. El token vence obligatoriamente (7 días si no se indica `expiresAt`), puede revocarse de inmediato y nunca se deriva del VIN ni de datos de usuario. El QR se crea en memoria y contiene `publicUrl`; no se almacena como evidencia ni archivo.

La respuesta pública no requiere JWT y contiene el VIN enmascarado, marca/modelo/año, kilometraje, mantenimientos/reparaciones finalizados o completados, diagnósticos y DTCs, kilometraje histórico, talleres por nombre, alertas neutrales, metadatos de evidencia con SHA-256, indicadores de cobertura y períodos sin datos técnicos. `isSimulated: true` se conserva para diagnósticos demo. No expone propietarios actuales o anteriores, usuarios, correos, teléfonos, grants, `snapshot`, `storageKey`, URLs de archivos, binarios ni datos de organización sensibles. Cada consulta pública válida crea `AuditLog` `PASSPORT_VIEWED`; los intentos públicos se limitan por IP.

Ejemplo de respuesta pública resumida:

```json
{
  "success": true,
  "data": {
    "passport": {
      "publicToken": "token-aleatorio-url-safe",
      "expiresAt": "2026-11-27T00:00:00.000Z",
      "vehicle": { "vinMasked": "1HG***********352", "make": "Honda", "model": "Accord", "year": 2020, "mileageKm": 72450 },
      "alerts": [{ "type": "DIAGNOSTIC_TROUBLE_CODE", "severity": "WARNING" }],
      "coverage": { "technicalRecordCount": 5, "informationGaps": [] }
    }
  }
}
```

## Información vehicular externa (consulta responsable)

Prefijo: `/api/v1`. Este módulo no automatiza sitios web públicos, CAPTCHA ni flujos que no estén expresamente autorizados. Las placas se reciben como `{ "category"?, "code"?, "number" }`, se convierten a mayúsculas y se normalizan sin espacios ni guiones; el formato conserva los componentes separados cuando se proporcionan. Todas las fechas devueltas son ISO 8601 UTC.

| Método y ruta | Permiso | Entrada | Respuestas |
| --- | --- | --- | --- |
| `GET /external-providers` | Sesión activa | — | `200`, `401` |
| `GET /vehicles/:id/external-queries` | Dueño, grant `MANAGE` o `SUPER_ADMIN` | CUID `id` | `200`, `404` |
| `POST /vehicles/:id/external-queries` | Dueño, grant `MANAGE` o `SUPER_ADMIN` | `{ providers?, mode? }`; el vehículo debe tener placa | `201`, `403`, `404`, `422`, `429` |
| `POST /external-queries/plate` | Sólo `SUPER_ADMIN` | `{ plate, providers?, mode? }` | `201`, `403`, `422`, `429` |
| `GET /external-queries/:id` | Solicitante original, dueño/`MANAGE` del vehículo o super admin | CUID `id` | `200`, `404` |
| `POST /external-queries/:id/retry` | Mismo permiso de lectura de la consulta | CUID `id` | `201`, `404`, `409`, `429` |
| `POST /external-queries/:id/documents` | Mismo permiso de lectura de la consulta | Metadatos y SHA-256 de un documento manual | `201`, `404`, `422` |

`providers` acepta `HACIENDA`, `INS`, `DEKRA`, `COSEVI`, `REGISTRO_NACIONAL` y, exclusivamente para demo, `MOCK`. `MANUAL_DOCUMENT` se genera con la ruta de documentos, no se consulta. `mode` es `MANUAL` por defecto o `SIMULATED`; sólo `SUPER_ADMIN` puede elegir `SIMULATED`, y ese modo sólo admite `MOCK`. Las consultas son rate-limited a 20 por usuario autenticado por hora en este MVP (`429 RATE_LIMITED`).

Ejemplo de consulta manual desde un vehículo autorizado:

```json
POST /api/v1/vehicles/clx.../external-queries
{
  "providers": ["HACIENDA", "INS", "DEKRA"],
  "mode": "MANUAL"
}
```

```json
{
  "success": true,
  "data": {
    "query": {
      "id": "cuid",
      "normalizedPlate": "DEMO001",
      "status": "MANUAL_REQUIRED",
      "queryMethod": "MANUAL_PORTAL",
      "records": [{
        "recordType": "DOCUMENT",
        "method": "MANUAL_PORTAL",
        "status": "MANUAL_REQUIRED",
        "isSimulated": false,
        "data": { "instructions": "Open the official provider portal..." }
      }]
    }
  }
}
```

Ejemplo de simulación explícita (solamente super admin):

```json
POST /api/v1/external-queries/plate
{
  "plate": { "category": "AUTOMOVIL", "code": "A", "number": "123456" },
  "providers": ["MOCK"],
  "mode": "SIMULATED"
}
```

Los registros de simulación incluyen `method: "MOCK"`, `isSimulated: true` y tipos `TAX`, `INSURANCE`, `INSPECTION`, `TRAFFIC`, `REGISTRY` y `LEGAL`; no deben presentarse como información oficial.

Ejemplo de documento manual (la API recibe sólo metadatos, no el binario):

```json
POST /api/v1/external-queries/clx.../documents
{
  "institution": "DEKRA",
  "type": "CERTIFICATE",
  "fileName": "dekra-inspeccion.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 183002,
  "sha256": "f5a5fd42d16a20302798ef6ed309979b43003d2320d5c688cc1a352f5b3b3c71",
  "observedAt": "2026-11-20T18:00:00.000Z"
}
```

Estados de proveedor: `AVAILABLE`, `REQUIRES_CREDENTIALS`, `REQUIRES_AGREEMENT`, `MANUAL_ONLY`, `UNAVAILABLE` y `NOT_IMPLEMENTED`. Estados de consulta: `PENDING`, `COMPLETED`, `PARTIAL`, `FAILED` y `MANUAL_REQUIRED`. Los errores adicionales son `VEHICLE_PLATE_REQUIRED`, `PROVIDER_NOT_FOUND`, `EXTERNAL_QUERY_NOT_FOUND`, `QUERY_NOT_RETRYABLE`, `CREDENTIAL_VAULT_NOT_CONFIGURED` y `RATE_LIMITED`.

Los registros de impuestos, seguros, inspecciones, tránsito, registro y legal mantienen una relación con la consulta y el proveedor, y pueden llevar una relación opcional con el vehículo. No se extraen ni exponen nombres, documentos ni datos de contacto de titulares. Consultar un portal manual, adjuntar una evidencia o tener un hash íntegro no certifica un hecho del mundo real.

## Recursos de datos y recorrido pendiente

El esquema y la migración cubren `Users`, `Organizations`, `OrganizationMembers`, `Vehicles`, `VehicleOwnerships`, `VehicleAccessGrants`, `Workshops`, `Devices`, `DiagnosticScans`, `DiagnosticTroubleCodes`, `WorkOrders`, `MaintenanceRecords`, `ServiceProcedures`, `ServiceParts`, `ServiceEvidence`, `MaintenanceSchedules`, `VehicleMileageLogs`, `VehicleTransfers`, `VehiclePassports`, `AuditLogs` y `Notifications`.

Las rutas CRUD de órdenes, evidencias, transferencias, dispositivos y notificaciones permanecen en contrato de siguiente iteración y responden `501` hasta habilitar sus flujos. Engrain Connect y Engrain AI ya están habilitados para el recorrido de hackathon: **login → vehículo autorizado → diagnóstico OBD2 simulado o histórico → gráficos/alertas → asistente con referencias → pasaporte compartible**.
