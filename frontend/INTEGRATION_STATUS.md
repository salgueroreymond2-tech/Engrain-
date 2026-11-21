# Estado de Integración Frontend — Backend (Etapa B6.1)

**ENGRAIN — Driving Trust**  
**Fecha de actualización**: 21 de noviembre de 2026  
**Rama de trabajo**: `ana`  
**Responsable del Frontend**: Ana Ocampo  

---

## 1. Resumen de Integración y Validación

En la Etapa B6.1 se realizó la auditoría técnica exhaustiva y validación estática de las integraciones desarrolladas en B6, comprobando la compatibilidad de esquemas entre el frontend y el backend, las variables de entorno, la ausencia total de fallbacks silenciosos ante errores del servidor y la estabilidad del modo demostración.

### Verificación de Variables de Entorno
* `VITE_API_BASE_URL=http://localhost:3000/api/v1`: Endpoint base del backend REST v1.
* `VITE_PUBLIC_URL=http://localhost:5173`: URL pública absoluta para enlaces compartibles y códigos QR (en producción apunta al dominio público de despliegue).
* `VITE_ENABLE_MOCK_FALLBACK=true`: Bandera para permitir el modo demostración explícito cuando se requiera. No realiza sustituciones silenciosas ante errores HTTP 401, 403, 404, 410 o 500 en flujos de datos reales.

---

## 2. Estado de Disponibilidad del Proceso Backend

> [!IMPORTANT]
> **Estado en la sesión de auditoría:**
> Se verificó el estado de red local en el puerto `3000`. El proceso del backend no se encontraba en ejecución activa en segundo plano en esta sesión (`Get-NetTCPConnection -LocalPort 3000` retornó nulo).
> Siguiendo la política de integridad de ENGRAIN: **No se inventan pruebas de red ni se simulan resultados falsos**.
> Se deja documentado el procedimiento y checklist para ejecutar la prueba en vivo tan pronto como el compañero de backend levante el servidor (`npm --prefix backend run dev`).

---

## 3. Matriz de Endpoints y Compatibilidad de Esquemas

| Módulo | Método y Ruta | Contrato Backend | Compatibilidad Frontend |
| :--- | :--- | :--- | :--- |
| **System** | `GET /health` | `{ service, status: "ok", timestamp }` | ✅ Compatible. Valida disponibilidad sin credenciales. |
| **Auth** | `POST /auth/register` | Body: `{ name, email, password }` | ✅ Compatible. Validación Zod con roles asignados. |
| **Auth** | `POST /auth/login` | Body: `{ email, password }` | ✅ Compatible. Persistencia de JWT en memoria y storage. |
| **Auth** | `GET /auth/me` | Bearer token | ✅ Compatible. Restablece la sesión activa al recargar. |
| **Vehículos** | `GET /vehicles` | Filtro implícito por `ownerId` | ✅ Compatible. Listado de vehículos del usuario. |
| **Vehículos** | `POST /vehicles` | Body: `{ vin, plate, make, model, year, mileageKm, dataSource? }` | ✅ Compatible. VIN validado a 17 caracteres y mayúsculas. |
| **Vehículos** | `GET /vehicles/:id` | `params: { id }` (CUID) | ✅ Compatible. Expediente detallado del automóvil. |
| **Vehículos** | `PATCH /vehicles/:id` | Body parcial de campos modificables | ✅ Compatible. Actualizaciones de kilometraje y placas. |
| **Vehículos** | `DELETE /vehicles/:id` | Archivado lógico (`ARCHIVED`) | ✅ Compatible. Retiro de la cochera sin borrado destructivo. |
| **Work Orders** | `GET /work-orders` | `query: { vehicleId?, workshopId?, status? }` | ✅ Compatible. Listado filtrado por vehículo o taller. |
| **Work Orders** | `POST /work-orders` | Body: `{ vehicleId, workshopId, title, description?, status? }` | ✅ Compatible. Sanitización de payload para evitar campos no permitidos. |
| **Work Orders** | `GET /work-orders/:id` | `params: { id }` | ✅ Compatible. Consulta de orden técnica por participantes. |
| **Work Orders** | `PATCH /work-orders/:id` | Body `.strict()`: `{ status?, title?, description?, closedAt? }` | ✅ Compatible. `workOrderService.ts` filtra campos adicionales de UI (`budget`, `items`) para evitar error 422. |
| **Maintenances** | `GET /maintenances` | `query: { vehicleId?, status? }` | ✅ Compatible. Filtro por vehículo para el historial del propietario. |
| **Maintenances** | `POST /maintenances` | Body: `{ vehicleId, title, description?, dueDate?, mileageKm?, status? }` | ✅ Compatible. Creación y vinculación automática al finalizar órdenes. |
| **Maintenances** | `GET /maintenances/:id` | `params: { id }` | ✅ Compatible. Detalle del mantenimiento. |
| **Maintenances** | `PATCH /maintenances/:id` | Body parcial | ✅ Compatible. Actualización de bitácora técnica. |
| **Maintenances** | `DELETE /maintenances/:id` | Creador autorizado | ✅ Compatible. Borrado con respuesta 204. |
| **Passports** | `POST /passports` | Body: `{ vehicleId, visibility? }` | ✅ Compatible. Generación de `publicToken` criptográfico. |
| **Passports** | `GET /passports/:id` | `params: { id }` | ✅ Compatible. Consulta privada por el propietario. |
| **Passports** | `PATCH /passports/:id` | Body `.strict()`: `{ visibility?, status? }` | ✅ Compatible. Revocación (`status: "REVOKED"`). |
| **Passports** | `GET /passports/public/:publicToken` | Público (sin JWT) | ⚠️ **Observación Backend:** El backend tiene `router.use(authenticate)` previo a esta ruta, retornando 401 a usuarios anónimos. Solución documentada en backend. |

---

## 4. Política Anti-Fallback Silencioso Verificada

Se auditó el código de `passportService.ts`, `maintenanceService.ts`, `workOrderService.ts` y `vehicleService.ts`:
* Ninguna función intercepta errores `401`, `403`, `404`, `410` o errores de red para sustituirlos por mocks si la sesión está en modo real.
* Los errores del servidor se elevan directamente al componente visual (`Toast`, `ErrorState` o mensajes de validación).
* Los datos simulados se reservan **única y exclusivamente** para sesiones iniciadas expresamente como usuario de demostración (`isExplicitDemoMode() === true`) o al consultar identificadores de prueba con prefijo `demo-`.

---

## 5. Checklist de Pruebas de Integración (Al Iniciar Backend)

Tan pronto como el servidor backend esté corriendo en `http://localhost:3000`:

1. **Autenticación:**
   - Registrar usuario nuevo en `http://localhost:5173/register`.
   - Iniciar sesión y comprobar recepción de JWT en `localStorage`.
2. **Vehículos:**
   - Crear un vehículo nuevo en `/owner/garage` (VIN de 17 caracteres).
   - Comprobar que aparece en la lista con datos persistidos en MySQL.
3. **Órdenes de Trabajo y Mantenimiento:**
   - Como taller, crear una orden vinculada al vehículo.
   - Avanzar los 7 pasos y finalizar la orden para certificar el mantenimiento.
   - Verificar que el propietario observa el mantenimiento en `/owner/vehicles/:id`.
4. **Pasaporte Digital:**
   - Generar el pasaporte desde `/owner/passport`.
   - Copiar la URL pública absoluta generada con el `publicToken`.
   - Abrir en ventana privada sin iniciar sesión: verificar que muestra los datos del vehículo y el mantenimiento certificado.
5. **Revocación:**
   - Desde la cuenta de propietario, hacer clic en **"Revocar Enlace"**.
   - Recargar la ventana privada: verificar que responde con estado revocado y **NO muestra información del vehículo**.
