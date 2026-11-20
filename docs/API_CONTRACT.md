# Contrato de API — ENGRAIN v1

Base URL local: `http://localhost:3000/api/v1`. Todos los recursos usan JSON UTF-8 y el prefijo `/api/v1`. Swagger se publica en `http://localhost:3000/docs`.

## Convenciones transversales

| Elemento | Regla |
| --- | --- |
| ID | `cuid` como cadena opaca. Nunca inferir significado. |
| Fechas | ISO 8601 UTC, por ejemplo `2026-11-20T18:25:43.000Z`. |
| Paginación futura | `page` (>=1) y `limit` (1–100); las colecciones actuales no la requieren en el MVP. |
| Autenticación | `Authorization: Bearer <accessToken>` salvo que se indique público. |
| Contenido | `Content-Type: application/json`; carga de archivos se añadirá como flujo firmado independiente. |
| Éxito | `{ "success": true, "data": { ... } }`. |
| Error | `{ "success": false, "error": { "code", "message", "details?" }, "meta": { "requestId" } }`. |

Los valores enumerados se mandan exactamente en mayúsculas. Un recurso al que el usuario no tiene acceso se presenta como `404` cuando revelar su existencia pueda exponer datos privados.

## Roles y permisos

| Rol | Alcance |
| --- | --- |
| `OWNER` | Sus vehículos, mantenimientos, diagnósticos, evidencias autorizadas y pasaportes. |
| `TECHNICIAN` | Operaciones del taller del cual es miembro. |
| `WORKSHOP_ADMIN` | Gestiona taller, miembros, órdenes y evidencias de su taller. |
| `DEALER_ADMIN` | Reservado para Business; sin permisos adicionales MVP. |
| `PLATFORM_ADMIN` | Operación de plataforma; no sustituye auditoría ni consentimiento. |

## Estados y procedencia

| Recurso | Valores |
| --- | --- |
| Vehículo `status` | `ACTIVE`, `ARCHIVED`, `TRANSFER_PENDING` |
| Vehículo `dataSource` | `MANUAL`, `OBD2`, `WORKSHOP`, `AGENCY`, `IMPORTED` |
| Orden `status` | `DRAFT`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| Mantenimiento `status` | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| Diagnóstico `source` | `OBD2`, `MANUAL`, `WORKSHOP` |
| Diagnóstico `status` | `PENDING`, `SUCCESS`, `FAILED`, `PARTIAL` |
| Evidencia `type` | `IMAGE`, `VIDEO`, `PDF`, `INVOICE`, `OBD_REPORT` |
| Pasaporte `visibility` | `PRIVATE`, `SHAREABLE`, `PUBLIC` |
| Pasaporte `status` | `ACTIVE`, `REVOKED` |

## Disponibilidad de implementación

`Disponible` significa que la ruta ya está operativa en el backend. `Reservado` significa que la ruta y la representación están acordadas; el backend responde `501 FEATURE_NOT_IMPLEMENTED` hasta completar el flujo. El frontend debe implementar un estado de “próximamente” o usar mocks sólo durante ese periodo.

## System

| Método y ruta | Acceso | Estado | Respuesta |
| --- | --- | --- | --- |
| `GET /health` | Público | Disponible | `200` disponibilidad del proceso |

```json
{
  "success": true,
  "data": {
    "service": "engrain-api",
    "status": "ok",
    "timestamp": "2026-11-20T18:25:43.000Z"
  }
}
```

## Autenticación

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /auth/register` | Público | Disponible | `name`, `email`, `password` (8–128 caracteres) | `201`, `409`, `422` |
| `POST /auth/login` | Público | Disponible | `email`, `password` | `200`, `401`, `422` |
| `GET /auth/me` | Bearer | Disponible | — | `200`, `401` |

Ejemplo de registro:

```json
{
  "name": "Ana Torres",
  "email": "ana@example.com",
  "password": "un-secreto-largo"
}
```

Ejemplo de éxito de registro o login:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4a1bcde0000xyz123abc456",
      "name": "Ana Torres",
      "email": "ana@example.com",
      "role": "OWNER",
      "createdAt": "2026-11-20T18:25:43.000Z",
      "updatedAt": "2026-11-20T18:25:43.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

El cliente conserva el token en memoria o mecanismo seguro de la plataforma; no se debe registrar, poner en URL ni persistir sin evaluación de amenaza. La renovación de token se incorpora después del MVP.

## Vehículos

| Método y ruta | Acceso | Estado | Parámetros / body | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /vehicles` | `OWNER` | Disponible | — | `200`, `401` |
| `POST /vehicles` | `OWNER` | Disponible | objeto vehículo | `201`, `409`, `422` |
| `GET /vehicles/:id` | propietario | Disponible | `id` CUID | `200`, `401`, `404` |
| `PATCH /vehicles/:id` | propietario | Disponible | campos modificables | `200`, `401`, `404`, `422` |
| `DELETE /vehicles/:id` | propietario | Disponible | `id` CUID | `204`, `401`, `404` |

Body de creación:

```json
{
  "vin": "1HGCM82633A004352",
  "plate": "ABC123",
  "make": "Honda",
  "model": "Accord",
  "year": 2020,
  "mileageKm": 72000,
  "dataSource": "MANUAL"
}
```

`vin` requiere 17 caracteres válidos, se normaliza a mayúsculas y es globalmente único. `DELETE` archiva el vehículo (`ARCHIVED`), no borra el historial. `PATCH` no permite cambiar VIN; `plate`, `make`, `model`, `year`, `mileageKm` y `dataSource` son opcionales y debe recibirse al menos uno.

Ejemplo de elemento:

```json
{
  "id": "cm4a1bcde0000xyz123abc456",
  "ownerId": "cm4owner0000xyz123abc45",
  "vin": "1HGCM82633A004352",
  "plate": "ABC123",
  "make": "Honda",
  "model": "Accord",
  "year": 2020,
  "mileageKm": 72000,
  "status": "ACTIVE",
  "dataSource": "MANUAL",
  "createdAt": "2026-11-20T18:25:43.000Z",
  "updatedAt": "2026-11-20T18:25:43.000Z"
}
```

## Talleres y miembros

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /workshops` | autenticado | Reservado | `page`, `limit` opcionales | `200`, `401`, `501` |
| `POST /workshops` | autenticado | Reservado | `name`, `taxId?`, `phone?`, `address?` | `201`, `422`, `501` |
| `GET /workshops/:id` | miembro | Reservado | `id` | `200`, `404`, `501` |
| `PATCH /workshops/:id` | `WORKSHOP_ADMIN` | Reservado | campos editables | `200`, `403`, `501` |
| `POST /workshops/:id/members` | `WORKSHOP_ADMIN` | Reservado | `userId`, `role` (`ADMIN`, `TECHNICIAN`, `ADVISOR`) | `201`, `409`, `501` |
| `DELETE /workshops/:id/members/:userId` | `WORKSHOP_ADMIN` | Reservado | IDs CUID | `204`, `404`, `501` |

Representación: `{ id, ownerId, name, taxId, phone, address, createdAt, updatedAt }`. Un taller sólo puede revelar sus órdenes a sus miembros y al propietario del vehículo involucrado.

## Órdenes de trabajo

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /work-orders` | propietario o miembro de taller | Reservado | filtros `vehicleId?`, `workshopId?`, `status?` | `200`, `401`, `501` |
| `POST /work-orders` | técnico / admin de taller | Reservado | `vehicleId`, `workshopId`, `title`, `description?`, `status?` | `201`, `403`, `422`, `501` |
| `GET /work-orders/:id` | participante | Reservado | `id` | `200`, `404`, `501` |
| `PATCH /work-orders/:id` | técnico / admin de taller | Reservado | `status?`, `title?`, `description?`, `closedAt?` | `200`, `422`, `501` |

Representación: `{ id, vehicleId, workshopId, createdById, status, title, description, openedAt, closedAt, createdAt, updatedAt }`.

## Mantenimientos

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /maintenances` | propietario / participante | Reservado | `vehicleId` requerido; `status?` | `200`, `401`, `501` |
| `POST /maintenances` | propietario / técnico autorizado | Reservado | `vehicleId`, `title`, `description?`, `dueDate?`, `mileageKm?`, `status?` | `201`, `422`, `501` |
| `PATCH /maintenances/:id` | creador autorizado | Reservado | campos anteriores más `completedAt?` | `200`, `404`, `501` |
| `DELETE /maintenances/:id` | creador autorizado | Reservado | `id` | `204`, `404`, `501` |

Representación: `{ id, vehicleId, createdById, status, title, description, dueDate, completedAt, mileageKm, createdAt, updatedAt }`.

## Evidencias

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /evidences/upload-intents` | participante | Reservado | `workOrderId?`, `maintenanceId?`, `fileName`, `mimeType`, `sizeBytes`, `type` | `201`, `422`, `501` |
| `POST /evidences` | participante | Reservado | `storageKey`, relaciones, `type`, `fileName`, `mimeType`, `sizeBytes`, `sha256?` | `201`, `422`, `501` |
| `GET /evidences/:id` | participante / propietario | Reservado | `id` | `200`, `404`, `501` |
| `DELETE /evidences/:id` | creador/administrador autorizado | Reservado | `id` | `204`, `501` |

La API no acepta binarios en JSON. `upload-intents` retornará una URL firmada y `storageKey`; el cliente carga el archivo directamente al proveedor. Representación: `{ id, workOrderId, maintenanceId, type, storageKey, fileName, mimeType, sizeBytes, sha256, createdAt }`.

## Diagnósticos OBD2

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /diagnostics` | propietario / participante | Reservado | `vehicleId` requerido, `from?`, `to?` ISO 8601 | `200`, `401`, `501` |
| `POST /diagnostics` | propietario / técnico autorizado | Reservado | `vehicleId`, `source`, `status`, `mileageKm?`, `dtcs?`, `payload?`, `performedAt?` | `201`, `422`, `501` |
| `GET /diagnostics/:id` | participante | Reservado | `id` | `200`, `404`, `501` |

`dtcs` es un arreglo de objetos como `{ "code": "P0300", "status": "PENDING", "description": "Random/multiple cylinder misfire" }`. `payload` conserva datos de adaptador no normalizados y nunca debe contener credenciales. Representación: `{ id, vehicleId, createdById, source, status, mileageKm, dtcs, payload, performedAt, createdAt, updatedAt }`.

## Asistente IA

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /assistant/messages` | autenticado | Reservado | `content`, `vehicleId?`, `conversationId?` | `200`, `422`, `501` |
| `GET /assistant/conversations` | autenticado | Reservado | `vehicleId?` | `200`, `501` |

La respuesta propuesta es `{ conversationId, message: { id, role: "ASSISTANT", content, metadata, createdAt }, disclaimers: string[] }`. La IA debe explicar riesgos y nunca dictaminar seguridad mecánica ni sustituir un diagnóstico de taller.

## Notificaciones y Socket.IO

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /notifications` | autenticado | Reservado | `unreadOnly?` | `200`, `501` |
| `PATCH /notifications/:id/read` | propietario | Reservado | `id` | `200`, `404`, `501` |

La conexión Socket.IO se realiza al mismo host y envía `{ "token": "<accessToken>" }` en `auth`. Tras autenticar, el servidor emite `system:ready`; las notificaciones usan `notification:created` con `{ id, type, title, body, data, readAt, createdAt }`. No se envían datos de otro usuario por broadcast global.

## Pasaportes digitales

| Método y ruta | Acceso | Estado | Body / parámetros | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /passports` | propietario | Reservado | `vehicleId`, `visibility`, `expiresAt?` | `201`, `422`, `501` |
| `GET /passports/:id` | propietario | Reservado | `id` | `200`, `404`, `501` |
| `PATCH /passports/:id` | propietario | Reservado | `visibility?`, `status?`, `expiresAt?` | `200`, `501` |
| `GET /passports/public/:publicToken` | Público, token válido | Reservado | `publicToken` | `200`, `404`, `410`, `501` |

Una vista pública sólo expone el `snapshot` autorizado al crear/actualizar el pasaporte, nunca correo, identificadores de propietario ni evidencia privada. Representación privada: `{ id, vehicleId, publicToken, visibility, status, expiresAt, snapshot, createdAt, updatedAt }`.

## Errores

| HTTP | Código | Cuándo debe tratarlo el frontend |
| --- | --- | --- |
| `401` | `AUTHENTICATION_REQUIRED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` | Limpiar sesión si no puede renovar e ir a login. |
| `403` | `FORBIDDEN` | Mostrar que el rol no permite esa acción. |
| `404` | `ROUTE_NOT_FOUND`, `RESOURCE_NOT_FOUND`, `VEHICLE_NOT_FOUND` | Mostrar estado vacío/no encontrado. |
| `409` | `EMAIL_ALREADY_REGISTERED`, `RESOURCE_CONFLICT` | Pedir corregir campo duplicado. |
| `422` | `VALIDATION_ERROR` | Pintar `error.details[]` junto a los campos. |
| `501` | `FEATURE_NOT_IMPLEMENTED` | Ocultar flujo o mostrar “próximamente”; no reintentar. |
| `500` | `INTERNAL_ERROR` | Mostrar error genérico y conservar `requestId` para soporte. |

Ejemplo de validación:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [
      { "path": "vin", "message": "VIN must contain 17 valid characters." }
    ]
  },
  "meta": { "requestId": "f5ffecdc-6275-4b9e-99b1-c77ec37bf44d" }
}
```
