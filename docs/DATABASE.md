# Datos externos de vehiculos

La migracion `20261121220000_external_vehicle_data` agrega `ExternalDataProvider`, `ExternalProviderCredential`, `VehicleExternalQuery`, `VehicleExternalRecord`, `VehicleTaxRecord`, `VehicleInsuranceRecord`, `VehicleInspectionRecord`, `VehicleTrafficRecord`, `VehicleRegistryRecord`, `VehicleLegalRecord` y `ExternalVerificationLog`.

- Cada consulta pertenece al solicitante, puede referir a un vehiculo y mantiene placa normalizada, proveedores, metodo, estado y tiempo.
- Cada resultado pertenece a consulta y proveedor, preserva tipo, referencia, payload, vigencia y `isSimulated`.
- Las filas especializadas normalizan impuesto, seguro, inspeccion, transito y registro/legal sin almacenar datos personales de titularidad.
- `ExternalProviderCredential.secretCiphertext` acepta solo secretos cifrados; el texto plano no forma parte del esquema ni de las respuestas HTTP.
- La procedencia puede ser `AUTHORIZED_API`, `MANUAL_PORTAL`, `MANUAL_DOCUMENT` o `MOCK`. Un documento, URL o hash no certifica un hecho externo.

# Base de datos PostgreSQL (Supabase) y Prisma

ENGRAIN usa **PostgreSQL administrado por Supabase** a través de Prisma ORM. El modelo está en `backend/prisma/schema.prisma`; las migraciones se generan y revisan en `backend/prisma/migrations/`.

```text
DATABASE_URL="postgresql://...?[sslmode=require]"
```

## Aplicación local

```bash
cp backend/.env.example backend/.env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Para un entorno desplegado se usa `npm --prefix backend run prisma:deploy`; nunca `migrate dev` en producción. En una red IPv4, usar la URL **Session pooler** de Supabase con `sslmode=require`; reservar la URL directa para migraciones cuando sea accesible. El seeder sólo contiene datos ficticios y es idempotente sobre sus correos, VIN, tax IDs, número de serie y referencia de orden.

## Diseño y aislamiento

```text
User ──< OrganizationMember >── Organization ──1 Workshop
  │                 │                           │
  │                 └──── acceso por organización│
  ├──< VehicleOwnership >── Vehicle ──< VehicleAccessGrant >── User / Organization / Workshop
  │                              │
  │                              ├──< DiagnosticScan ──< DiagnosticTroubleCode
  │                              ├──< WorkOrder ──< MaintenanceRecord ──< Procedures / Parts / Evidence
  │                              ├──< MaintenanceSchedule / VehicleMileageLog / VehicleTransfer
  │                              └──< VehiclePassport
  └──< AuthSession / AuditLog / Notification
```

- Un historial técnico pertenece a `Vehicle`, nunca a un propietario. Un cambio de `VehicleOwnership` no borra ni traslada diagnósticos, mantenimientos, evidencias u órdenes.
- Sólo los `VehicleOwnership` con `isCurrent=true` representan el dueño vigente. La aplicación cambia la titularidad dentro de una transacción antes de insertar la nueva fila.
- `VehicleAccessGrant` usa `targetKey` único por vehículo para hacer idempotente la concesión a un usuario, organización o taller. La aplicación exige exactamente un destinatario.
- Un empleado de taller debe ser `OrganizationMember` activo de la organización del taller **y** existir un grant activo/no expirado. El mero rol `MECHANIC` no concede visibilidad.
- `VehiclePassport` compartible requiere token único, estado activo y no expirado; sólo contiene un snapshot explícitamente autorizado.

## Entidades

| Tabla PostgreSQL | Modelo Prisma | Finalidad |
| --- | --- | --- |
| `users` | `User` | Identidad, rol global, hash bcrypt y estado. |
| `auth_sessions` | `AuthSession` | Hash de refresh token, revocación y metadatos de sesión. |
| `organizations` | `Organization` | Tenant de taller, agencia o plataforma. |
| `organization_members` | `OrganizationMember` | Rol y estado por tenant. |
| `vehicles` | `Vehicle` | VIN único, ficha estable e identidad del historial. |
| `vehicle_ownerships` | `VehicleOwnership` | Titularidad temporal e histórica. |
| `vehicle_access_grants` | `VehicleAccessGrant` | Permiso granular `VIEW`, `SERVICE` o `MANAGE`. |
| `workshops` | `Workshop` | Perfil operativo 1:1 de una organización taller. |
| `devices` | `Device` | Adaptador OBD2 vinculado a vehículo/organización. |
| `diagnostic_scans` | `DiagnosticScan` | Lectura OBD2/manual y payload normalizado. |
| `diagnostic_trouble_codes` | `DiagnosticTroubleCode` | DTCs únicos por scan. |
| `work_orders` | `WorkOrder` | Orden trazable de taller con referencia única. |
| `maintenance_records` | `MaintenanceRecord` | Intervención técnica del vehículo. |
| `service_procedures` | `ServiceProcedure` | Mano de obra/procedimientos del mantenimiento. |
| `service_parts` | `ServicePart` | Repuestos utilizados. |
| `service_evidence` | `ServiceEvidence` | Metadatos y hash de evidencia; no binarios. |
| `maintenance_schedules` | `MaintenanceSchedule` | Próximos servicios por tiempo/kilometraje. |
| `vehicle_mileage_logs` | `VehicleMileageLog` | Lecturas históricas de kilometraje. |
| `vehicle_transfers` | `VehicleTransfer` | Transferencia de titularidad pendiente/aceptada. |
| `vehicle_passports` | `VehiclePassport` | Snapshot y token de compartición externa. |
| `audit_logs` | `AuditLog` | Registro de acciones sensibles y contexto. |
| `notifications` | `Notification` | Eventos visibles por usuario. |

## Integridad y operación

- CUIDs para claves primarias; VIN, email, número de serie, token público, storage key y referencia de orden tienen índices únicos.
- Las tablas relacionales y rutas de timeline tienen índices por vehículo, organización, estado y fecha.
- Prisma/PostgreSQL no puede expresar por sí solo todas las reglas de dominio, como un solo `VehicleOwnership.isCurrent` o la regla XOR del grant. Ambas se validan en servicios transaccionales y deben mantenerse cubiertas por pruebas.
- `ServiceEvidence.storageKey` referencia almacenamiento privado futuro; no almacenar archivos ni secretos dentro de PostgreSQL.
- Antes de cambiar el esquema: editar `schema.prisma`, generar/revisar una nueva migración, ejecutar `prisma validate`, regenerar el cliente, actualizar este documento y el contrato.
