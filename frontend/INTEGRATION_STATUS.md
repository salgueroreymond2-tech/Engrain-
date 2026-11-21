# Estado de Integración Frontend — Backend (Etapa B6)

**ENGRAIN — Driving Trust**  
**Fecha de actualización**: 21 de noviembre de 2026  
**Rama de trabajo**: `ana`  
**Responsable del Frontend**: Ana Ocampo  

---

## 1. Resumen de Integración

En la Etapa B6 se completó la integración técnica de los servicios frontend con los endpoints del backend implementados para el MVP: **Auth**, **Vehículos**, **Órdenes de Trabajo (Work Orders)**, **Mantenimientos (Maintenances)** y **Pasaportes Digitales (Passports)**.

Se implementó una separación estricta entre el **Modo Real** y el **Modo Demostración**:
1. **Sin fallbacks silenciosos**: Cuando la aplicación opera en modo real contra el backend, los errores de red, autenticación (401), autorización (403), validación (422) o recurso no encontrado (404) se transmiten directamente a la interfaz sin sustituirlos por datos ficticios.
2. **Modo Demostración Explícito**: Únicamente se activa cuando el usuario inicia sesión como usuario demo (`engrain_demo_user` / `switchDemoRole`) o navega con un token demo explícito (`demo-token-123`, `engrain-demo-...`).
3. **Persistencia de Enlaces Demo**: Mediante `demoLinkStore`, la revocación de tokens demo se preserva en `localStorage` del navegador para evaluar la experiencia de usuario y recargas locales sin comprometer la seguridad de pasaportes reales.

---

## 2. Matriz de Endpoints y Estado de Disponibilidad

| Módulo | Método y Ruta | Estado Backend | Integración Frontend | Comportamiento en Modo Real / Demo |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET /health` | **Disponible** | Integrado | Verifica disponibilidad del proceso backend. |
| **Auth** | `POST /auth/register` | **Disponible** | Integrado | Registro real con rol `OWNER`. |
| **Auth** | `POST /auth/login` | **Disponible** | Integrado | Login con JWT persistido en memoria / storage. |
| **Auth** | `GET /auth/me` | **Disponible** | Integrado | Validación de sesión activa del usuario. |
| **Vehículos** | `GET /vehicles` | **Disponible** | Integrado | Listado de vehículos del propietario autenticado. |
| **Vehículos** | `POST /vehicles` | **Disponible** | Integrado | Alta de vehículo con VIN (17 caracteres) y placa. |
| **Vehículos** | `GET /vehicles/:id` | **Disponible** | Integrado | Consulta de expediente de vehículo propio. |
| **Vehículos** | `PATCH /vehicles/:id` | **Disponible** | Integrado | Actualización de odómetro y datos vehiculares. |
| **Vehículos** | `DELETE /vehicles/:id` | **Disponible** | Integrado | Archivado lógico (`ARCHIVED`) de vehículo. |
| **Work Orders** | `GET /work-orders` | **Disponible** | Integrado | Consulta órdenes filtradas por vehículo/taller. |
| **Work Orders** | `POST /work-orders` | **Disponible** | Integrado | Creación de orden técnica (`TECHNICIAN`, `WORKSHOP_ADMIN`). |
| **Work Orders** | `GET /work-orders/:id` | **Disponible** | Integrado | Consulta detallada con participantes autorizados. |
| **Work Orders** | `PATCH /work-orders/:id` | **Disponible** | Integrado | Actualización de estado y cierre de orden. |
| **Maintenances** | `GET /maintenances` | **Disponible** | Integrado | Historial de mantenimientos por vehículo. |
| **Maintenances** | `POST /maintenances` | **Disponible** | Integrado | Registro de servicio preventivo/correctivo certificado. |
| **Maintenances** | `GET /maintenances/:id` | **Disponible** | Integrado | Consulta individual de mantenimiento. |
| **Maintenances** | `PATCH /maintenances/:id` | **Disponible** | Integrado | Edición de fecha, descripción y kilometraje. |
| **Maintenances** | `DELETE /maintenances/:id` | **Disponible** | Integrado | Eliminación autorizada de registro. |
| **Passports** | `POST /passports` | **Disponible** | Integrado | Generación de pasaporte y `publicToken` criptográfico. |
| **Passports** | `GET /passports/:id` | **Disponible** | Integrado | Consulta de pasaporte interno por propietario. |
| **Passports** | `PATCH /passports/:id` | **Disponible** | Integrado | Modificación de visibilidad y revocación (`REVOKED`). |
| **Passports** | `GET /passports/public/:publicToken` | **Disponible** *(Nota)* | Integrado | Consulta pública sin JWT (`skipAuth: true`). |
| **Evidencias** | `POST /evidences/upload-intents` | *501 Reservado* | Modo Demo | Simulación de subida de archivos antes/después. |
| **Diagnósticos** | `GET /diagnostics` | *501 Reservado* | Modo Demo | Telemetría OBD2 y simulación de lectura CAN. |
| **Workshops** | `GET /workshops` | *501 Reservado* | Modo Demo | Perfil de taller en demostración. |
| **Asistente IA** | `POST /assistant/messages` | *501 Reservado* | Modo Demo | Descargos de responsabilidad y chat asistencial. |
| **Notificaciones**| `GET /notifications` | *501 Reservado* | Modo Demo | Bandeja de avisos del sistema. |

---

## 3. Observación Técnica para el Desarrollador Backend

> [!WARNING]
> **Ruta pública de pasaportes con autenticación requerida en Backend:**
> En `backend/src/modules/passports/passport.router.ts`:
> ```typescript
> const router = Router();
> router.use(authenticate); // <-- Aplicado a nivel global en todo el router
> ...
> // Public endpoint (no auth)
> router.get("/public/:publicToken", validate(publicTokenSchema, "params"), getPassportByPublicToken);
> ```
> Al estar `router.use(authenticate)` declarado antes de `router.get("/public/:publicToken")`, las solicitudes de usuarios no registrados (compradores que escanean el QR) son rechazadas con HTTP `401 AUTHENTICATION_REQUIRED`.
> **Acción requerida en backend:** Mover `router.get("/public/:publicToken", ...)` antes de `router.use(authenticate)` o eximir la ruta pública del middleware. El frontend ya envía la petición con `skipAuth: true`.

---

## 4. Normalización de Respuestas de Pasaporte Público

En el backend, `getPassportByPublicToken` responde con:
```json
{
  "success": true,
  "data": {
    "passport": { "id": "...", "publicToken": "...", "status": "ACTIVE", "visibility": "PUBLIC" },
    "vehicle": { "vin": "...", "plate": "...", "make": "...", "model": "...", "year": 2021, "mileageKm": 72000 },
    "maintenances": [ { "id": "...", "title": "...", "mileageKm": 72000, "status": "COMPLETED" } ]
  }
}
```
En `passportService.ts`, el frontend normaliza automáticamente este sobre a la interfaz `PassportSnapshot` de modo que la vista pública muestra de forma inmediata el vehículo real y sus mantenimientos certificados.
