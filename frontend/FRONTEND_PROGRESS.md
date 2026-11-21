# ENGRAIN — Progreso del Frontend (Etapa B6)

**Estado general de la Etapa B6**: ✅ **COMPLETADA SATISFACTORIAMENTE**  
**Fecha de corte**: 21 de noviembre de 2026  
**Entrega de hackathon**: Domingo 22 de noviembre de 2026  
**Rama activa**: `ana`  
**Responsable del Frontend**: Ana Ocampo  

---

## 1. Resumen Ejecutivo de la Etapa B6

La **Etapa B6 — Integración Real del Frontend y Preparación de la Demo Final** conectó las vistas y servicios de usuario con los endpoints reales implementados para el MVP de ENGRAIN:
- **Órdenes de Trabajo (`/work-orders`)**: Conexión completa de consulta, creación, actualización y sellado.
- **Mantenimientos (`/maintenances`)**: Integración de historial por vehículo con fecha, kilometraje, descripción y procedencia.
- **Pasaportes Digitales (`/passports` y `/passports/public/:publicToken`)**: Generación con token público real devuelto por el backend, visualización pública sin token JWT (`skipAuth: true`), soporte para QR con URL absoluta (`VITE_PUBLIC_URL`) y manejo seguro de estados (`ACTIVE`, `REVOKED`, `INVALID`).
- **Modo Demostración Explícito**: Separación clara entre ejecución real y simulada. El almacenamiento `demoLinkStore` persiste revocaciones demo exclusivamente en `localStorage` del navegador actual, evitando fallbacks silenciosos ante errores en modo real.

---

## 2. Archivos Modificados y Creados en la Etapa B6

### Servicios y Cliente HTTP
- `frontend/src/lib/api-client.ts`: Añadido soporte para `skipAuth: true` para garantizar que las consultas públicas de pasaportes nunca envíen tokens Bearer privados.
- `frontend/src/lib/demo-mode.ts` *(Nuevo)*: Utilidad centralizada para determinar si la aplicación se ejecuta bajo modo demostración explícito (`isExplicitDemoMode`, `setExplicitDemoMode`).
- `frontend/src/services/demoLinkStore.ts` *(Nuevo)*: Tienda local de persistencia para revocación y regeneración de enlaces demo en `localStorage`.
- `frontend/src/services/passportService.ts`: Integración de endpoints reales `/passports`, actualización y revocación, junto con normalización de la respuesta de `/passports/public/:publicToken`.
- `frontend/src/services/maintenanceService.ts`: Métodos completos (`getMaintenances`, `getMaintenanceById`, `createMaintenance`, `updateMaintenance`, `deleteMaintenance`) sin fallbacks silenciosos.
- `frontend/src/services/workOrderService.ts`: Conexión de endpoints reales con filtros y eliminación de mocks automáticos.
- `frontend/src/services/vehicleService.ts`: Manejo de llamadas reales sin fallback silencioso ante fallas de red.

### Vistas y Componentes
- `frontend/src/pages/owner/OwnerPassportPage.tsx`:
  - Corrección de importación de `QRCodeSVG` desde `qrcode.react`.
  - Corrección de `Badge` desde componentes UI y botón `variant="danger"`.
  - Integración de selección de vehículo, revocación real en backend o demo, regeneración de tokens y QR con URL absoluta.
  - Indicador visible de modo real vs modo demo.
- `frontend/src/pages/PassportPublicPage.tsx`:
  - Consulta pública desacoplada sin JWT.
  - Pantalla segura de **"Enlace revocado"** ante HTTP 410 o estado `REVOKED` que oculta especificaciones técnicas y kilometraje.
  - Manejo de HTTP 404 (`INVALID`) y 401 (`UNAUTHORIZED`).
  - Badge visible de modo demostración cuando se evalúa un token demo.
- `frontend/src/pages/owner/OwnerVehicleDetailPage.tsx`:
  - Conexión del historial cronológico de intervenciones con los mantenimientos reales del vehículo.
- `frontend/src/pages/workshop/WorkshopWorkOrdersPage.tsx`:
  - Eliminación de imports y variables no utilizadas para cumplimiento de TypeScript estricto.
  - Integración de selectores para tipo de procedimiento y cantidad en el presupuesto de bahía.
- `frontend/src/pages/workshop/WorkshopVehiclesPage.tsx`:
  - Limpieza de importaciones no utilizadas.

### Documentación
- `frontend/INTEGRATION_STATUS.md` *(Nuevo)*: Matriz detallada de disponibilidad de endpoints, convenciones de contrato y notas técnicas para backend.
- `frontend/DEMO_GUIDE.md` *(Nuevo)*: Guía paso a paso para la presentación en vivo ante el jurado del hackathon.

---

## 3. Pruebas de Calidad y Compilación

| Verificación | Comando | Resultado |
| :--- | :--- | :--- |
| **Lint / TypeScript** | `npm --prefix frontend run lint` (`tsc --noEmit`) | ✅ **0 errores** (Modo TypeScript estricto) |
| **Build de Producción** | `npm --prefix frontend run build` (`tsc && vite build`) | ✅ **Exitoso** (Bundle optimizado generado en `dist/`) |
| **Aislamiento de Backend** | Verificación de Git | ✅ **Sin modificaciones en `backend/`** |

---

## 4. Estado de Bloqueos y Dependencias de Backend

1. **Autenticación en ruta pública de Pasaportes**:
   - En `backend/src/modules/passports/passport.router.ts`, el middleware `router.use(authenticate)` se encuentra a nivel global antes de `router.get("/public/:publicToken", ...)`.
   - Se documentó en `frontend/INTEGRATION_STATUS.md` para que el desarrollador backend mueva la ruta pública antes del middleware.
2. **Endpoints diferidos en estado 501**:
   - Evidencias con URLs firmadas (`/evidences/upload-intents`), diagnósticos OBD2 en vivo (`/diagnostics`), talleres (`/workshops`) y asistente IA (`/assistant`) permanecen correctamente etiquetados como modo demostración para el MVP.
