# Contrato de adaptadores de información vehicular

Cada adaptador implementa `VehicleInformationProvider`:

```ts
interface VehicleInformationProvider {
  definition: ProviderDefinition;
  lookup(plate: { category?: string; code?: string; number: string; normalized: string }): Promise<ProviderLookupResult>;
}
```

El adaptador devuelve `COMPLETED`, `MANUAL_REQUIRED` o `FAILED`; cada registro identifica `type`, `sourceUrl`, `sourceReference`, `validUntil` e `isSimulated`. Los únicos tipos son `VEHICLE_PROFILE`, `TAX`, `INSURANCE`, `INSPECTION`, `TRAFFIC`, `REGISTRY`, `LEGAL` y `DOCUMENT`.

## Condiciones para un adaptador real

1. Confirmar que el proveedor autoriza la automatización para el dato y propósito específicos.
2. Implementar autenticación exclusivamente del lado servidor, con timeout, límites, reintentos prudentes y auditoría sin secretos.
3. Cifrar toda credencial antes de persistirla mediante `EXTERNAL_CREDENTIAL_ENCRYPTION_KEY` (AES-256-GCM). No hay endpoint HTTP para leer o registrar secretos.
4. Exponer solamente datos necesarios y autorizados; no devolver nombres, cédulas, correos ni identificadores de dueños cuando no corresponda.
5. Registrar proveedor, método (`AUTHORIZED_API`, `MANUAL_PORTAL`, `MANUAL_DOCUMENT` o `MOCK`), fecha, estado y referencia de fuente.

Un adaptador no puede cambiar el estado de un vehículo, su titularidad, mantenimientos ni diagnósticos.
