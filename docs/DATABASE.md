# Base de datos

## Motor y acceso

MySQL 8+ es el motor requerido. Prisma usa `DATABASE_URL` con formato:

```text
mysql://USUARIO:CONTRASENA@HOST:3306/engrain
```

## Convenciones

- Las tablas se modelan en singular mediante Prisma y las claves primarias son `String @id @default(cuid())`.
- Todas las entidades auditables tienen `createdAt` y `updatedAt`.
- Las fechas de negocio usan `DateTime`; la API las representa como ISO 8601 UTC.
- VIN se almacena normalizado en mayúsculas y es único.
- Los datos flexibles de OBD2 y pasaporte se almacenan en columnas JSON para el MVP; campos consultados frecuentemente deberán normalizarse antes de escalar.

## Entidades del MVP

| Entidad | Responsabilidad |
| --- | --- |
| User | Cuenta, rol global y credencial protegida. |
| Vehicle | Vehículo y propietario actual. |
| Workshop / WorkshopMember | Taller y membresías con roles del taller. |
| WorkOrder | Orden de trabajo asociada a vehículo y taller. |
| Maintenance | Mantenimiento programado o realizado. |
| Evidence | Archivo o enlace verificable de un evento. |
| Diagnostic | Resultado OBD2 o diagnóstico manual. |
| ConversationMessage | Interacción trazable con el asistente IA. |
| Notification | Evento visible para un usuario. |
| Passport | Configuración y estado de un pasaporte compartible. |

## Operación local

```bash
npm run db:generate
npm run db:migrate -- --name init
```

No se sube `backend/.env`. Para cada cambio de modelo se debe crear una migración revisable y actualizar este documento y el contrato si afecta una representación pública.
