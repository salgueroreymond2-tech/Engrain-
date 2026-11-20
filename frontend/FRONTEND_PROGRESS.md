# ENGRAIN — Progreso del Frontend (Etapa B1)

**Estado general de la Etapa B1**: ✅ **COMPLETADA SATISFACTORIAMENTE**  
**Fecha de corte**: 20 de noviembre de 2026  
**Entrega de hackathon**: Domingo 22 de noviembre de 2026  
**Rama activa**: `ana`

---

## 1. Resumen Ejecutivo de la Etapa B1

Se diseñó e implementó desde cero la **Arquitectura Frontend y la Identidad Visual de ENGRAIN — Driving Trust**, respetando estrictamente el aislamiento con el backend y el contrato versionado en `docs/API_CONTRACT.md`.

El proyecto compila al 100% con TypeScript estricto, cuenta con una paleta automotriz premium (Carbono, Grafito, Platino, Naranja Aceleración y Verde Confianza), un sistema de diseño con más de 17 componentes base reutilizables, navegación completa por roles (Público, Taller y Propietario), y un cliente HTTP centralizado preparado para la API REST v1.

---

## 2. Archivos Creados en la Etapa B1

### Configuración y Entorno
- `frontend/package.json`: Definición de scripts y dependencias (React 18, Vite 6, Tailwind CSS, TanStack Query, React Hook Form, Zod, Lucide React, Recharts).
- `frontend/tsconfig.json` & `frontend/tsconfig.node.json`: Configuración estricta de TypeScript con alias `@/*` y tipos de Vite.
- `frontend/vite.config.ts`: Configuración del bundler con alias y puertos.
- `frontend/tailwind.config.js`: Tokens de diseño, paleta automotriz, sombras, animaciones y tipografías (Manrope e Inter).
- `frontend/postcss.config.js`: Plugins de Tailwind y Autoprefixer.
- `frontend/index.html`: Plantilla base con fuentes tipográficas Google Fonts y favicon vectorial.
- `frontend/public/favicon.svg`: Isotipo corporativo de ENGRAIN con escudo de confianza.
- `frontend/.env.example` & `frontend/.env`: Variables de entorno configuradas (`VITE_API_BASE_URL=http://localhost:3000/api/v1`).

### Tipos TypeScript (`src/types/`)
- `api.ts`: Contrato de sobres `{ success, data }` y `{ success: false, error: { code, message, details }, meta: { requestId } }`.
- `auth.ts`: Modelos de usuario (`OWNER`, `TECHNICIAN`, `WORKSHOP_ADMIN`), tokens y credenciales.
- `vehicle.ts`: Modelo de vehículo, estados (`ACTIVE`, `ARCHIVED`), fuentes (`OBD2`, `WORKSHOP`, `MANUAL`) e inputs de creación/edición.
- `workshop.ts`: Talleres, miembros técnicos y órdenes de trabajo (`WorkOrder`).
- `maintenance.ts`: Registro de mantenimientos e intervenciones programadas.
- `diagnostic.ts`: Diagnósticos telemáticos, códigos DTC (`P0300`, `P0420`), severidad y telemetría de bus CAN.
- `passport.ts`: Pasaporte vehicular, instantáneas inmutables (`snapshot`), tokens públicos y visibilidad.
- `ai.ts`: Mensajes y descargos de responsabilidad del asistente ENGRAIN AI.
- `index.ts`: Exportación unificada.

### Cliente HTTP y Estado Global (`src/lib/`, `src/context/`, `src/hooks/`)
- `lib/api-client.ts`: Cliente HTTP centralizado con inyección de Bearer Token, formateador de query params y clase `ApiError` que preserva el `requestId`.
- `lib/query-client.ts`: Configuración optimizada de TanStack Query evitando reintentos en errores 401, 403, 404 y 501.
- `lib/cn.ts`: Utilidad para composición dinámica de clases Tailwind (`clsx` + `tailwind-merge`).
- `context/AuthContext.tsx` & `hooks/useAuth.ts`: Manejo de sesión persistente, login, registro, logout y alternador rápido de roles para pruebas de hackathon.
- `context/ToastContext.tsx` & `hooks/useToast.ts`: Sistema global de notificaciones toast automotrices (éxito, error, advertencia e información).

### Sistema de Diseño UI (`src/components/ui/`)
- `Button.tsx`: Botones con 6 variantes, 3 tamaños, spinner accesible de carga y soporte de iconos.
- `Input.tsx`: Entradas de texto con etiquetas flotantes, estados de error y slots para iconos.
- `Select.tsx`: Selectores estilizados y accesibles.
- `Textarea.tsx`: Entradas multilínea.
- `Card.tsx`: Tarjetas de superficie oscura con variantes `default`, `flat`, `interactive` y `accent`.
- `Badge.tsx`: Etiquetas de estado técnico con indicador luminoso opcional (`dot`).
- `Modal.tsx`: Diálogos flotantes con backdrop blur y captura de teclado (`Escape`).
- `Table.tsx`: Tablas responsivas compuestas por `Header`, `Body`, `Row`, `Head` y `Cell`.
- `Tabs.tsx`: Pestañas desacopladas mediante React Context.
- `Breadcrumb.tsx`: Miga de pan para jerarquías profundas de navegación.
- `Dropdown.tsx`: Menú emergente de perfil y opciones con cierre automático al hacer clic fuera.
- `Loading.tsx`: Componentes de carga (`LoadingSpinner`, `Skeleton`, `PageLoading`).
- `EmptyState.tsx`: Estado visual para listados sin elementos.
- `ErrorState.tsx`: Tarjeta visual para fallas de red o recursos inexistentes con ID de soporte.
- `PageHeader.tsx`: Cabecera unificada con título h1, descripción, miga de pan y botones de acción.
- `StatCard.tsx`: Indicadores clave (KPIs) con comparadores de tendencia e iconos.
- `index.ts`: Barril de exportación.

### Componentes de Estructura y Layouts (`src/components/layout/`, `src/layouts/`)
- `BrandLogo.tsx`: Isotipo y logotipo vectorial responsive con resplandor naranja.
- `Sidebar.tsx`: Barra lateral para escritorio con soporte para modo colapsado, enlaces activos, badge de módulo y cierre de sesión.
- `Navbar.tsx`: Barra superior con selector rápido de roles para evaluación, enlace al pasaporte demo y menú de perfil.
- `MobileNav.tsx`: Menú desplegable lateral adaptado para dispositivos móviles y tabletas.
- `PublicLayout.tsx`: Estructura para el sitio público con barra de navegación y pie de página.
- `AuthLayout.tsx`: Layout dividido con escaparate telemático visual a la izquierda y formularios a la derecha.
- `WorkshopLayout.tsx`: Entorno de trabajo para talleres mecánicos.
- `OwnerLayout.tsx`: Entorno de trabajo para propietarios de vehículos.

### Vistas y Páginas (`src/pages/`)
- `LandingPage.tsx`: Portal de bienvenida, explicación de los 5 módulos, beneficios para compradores y enlace al pasaporte demo.
- `LoginPage.tsx`: Formulario de acceso con Zod, React Hook Form y botones de un solo clic para credenciales demo.
- `RegisterPage.tsx`: Registro con selección de cuenta (`Propietario` o `Taller Mecánico`).
- `PassportPublicPage.tsx`: Vista pública del Pasaporte Digital con score de integridad (94/100), verificación de odómetro y línea de tiempo cronológica de servicios.
- `NotFoundPage.tsx`: Página de error 404 estilizada.
- `workshop/WorkshopOverviewPage.tsx`: Dashboard de taller con KPIs de bahía, órdenes activas y recomendaciones telemáticas.
- `workshop/WorkshopVehiclesPage.tsx`: Catálogo de vehículos atendidos con modal de alta y búsqueda rápida.
- `workshop/WorkshopWorkOrdersPage.tsx`: Tablero de órdenes de trabajo con filtros por estado (`En curso`, `Programadas`, `Completadas`).
- `workshop/WorkshopMaintenancePage.tsx`: Calendario de servicios programados y correctivos.
- `workshop/WorkshopDiagnosticsPage.tsx`: Lecturas de telemetría OBD2, códigos DTC detectados y simulador de escaneo en bahía.
- `workshop/WorkshopSettingsPage.tsx`: Datos fiscales, dirección del taller y miembros técnicos.
- `owner/OwnerOverviewPage.tsx`: Dashboard de propietario con estado de salud del vehículo principal.
- `owner/OwnerGaragePage.tsx`: Cochera virtual con tarjetas de automóviles y acceso a expedientes.
- `owner/OwnerVehicleDetailPage.tsx`: Expediente con pestañas de línea de tiempo, telemetría y ficha técnica.
- `owner/OwnerMaintenancePage.tsx`: Bitácora de mantenimientos y recomendaciones predictivas con IA.
- `owner/OwnerDiagnosticsPage.tsx`: Monitor de Check Engine, estado de batería y sincronizador de adaptador OBD2.
- `owner/OwnerPassportPage.tsx`: Gestor de token público, selector de visibilidad (`Público`, `Restringido`, `Privado`) y revocación de credenciales.

### Servicios de Integración y Adaptadores Mock (`src/services/`)
- `mockAdapters.ts`: Datos estructurados de ejemplo (talleres, órdenes, mantenimientos, diagnósticos y pasaporte) identificados como mock para no falsear datos reales.
- `authService.ts`: Llamadas a `/auth/login`, `/auth/register` y `/auth/me`.
- `vehicleService.ts`: Consumo de `/vehicles` (GET, POST, GET :id, PATCH :id, DELETE :id) con fallback elegante.
- `workshopService.ts`: Consumo de `/workshops`.
- `workOrderService.ts`: Consumo de `/work-orders`.
- `maintenanceService.ts`: Consumo de `/maintenances`.
- `diagnosticService.ts`: Consumo de `/diagnostics`.
- `passportService.ts`: Consumo de `/passports` y `/passports/public/:publicToken`.
- `assistantService.ts`: Consumo de `/assistant/messages`.

---

## 3. Pruebas Ejecutadas y Resultados

| Prueba | Comando | Resultado |
| --- | --- | --- |
| **Instalación de dependencias** | `npm --prefix frontend install` | **Exitoso**: 184 paquetes instalados sin conflictos de dependencias. |
| **Análisis de tipos TypeScript** | `npm --prefix frontend run lint` (`tsc --noEmit`) | **Exitoso**: 0 errores de tipado en modo estricto. |
| **Compilación de producción** | `npm --prefix frontend run build` (`tsc && vite build`) | **Exitoso**: Generado bundle optimizado en `dist/` en 6.71 segundos. |
| **Estructura CSS** | PostCSS / Tailwind CSS compilation | **Exitoso**: CSS generado de 36.15 kB con selectores y utilidades automotrices limpias. |
| **Aislamiento de Backend** | Inspección de `git status` en `backend/` | **Exitoso**: El directorio `backend/` no fue modificado en ningún momento. |

---

## 4. Limitaciones Actuales y Pendientes para Etapa B2

1. **Rutas en estado Reservado en Backend**:
   - Según `docs/API_CONTRACT.md`, endpoints como `/workshops`, `/work-orders`, `/maintenances`, `/diagnostics`, `/passports` y `/assistant` se encuentran actualmente en estado `Reservado` (responden `501 FEATURE_NOT_IMPLEMENTED` en el backend).
   - En esta etapa B1, los servicios del frontend invocan dichos endpoints y, ante respuestas `501` o ausencia de conexión, activan automáticamente los adaptadores mock documentados (`VITE_ENABLE_MOCK_FALLBACK=true`).
2. **Carga de Evidencias Reales**:
   - El flujo de URLs firmadas para carga de archivos de evidencias (`POST /evidences/upload-intents`) está proyectado para la siguiente etapa de integración.
3. **WebSockets / Notificaciones en tiempo real**:
   - La conexión a Socket.IO (`notification:created`) se encuentra documentada en el contrato de API y se integrará formalmente en B2/B3.

---

## 5. Recomendaciones para la Etapa B2

1. **Conexión End-to-End de Autenticación**:
   - Levantar el servidor backend local (`npm run dev`) y verificar el flujo de registro e inicio de sesión real contra la base de datos MySQL/Prisma.
2. **CRUD Completo de Vehículos**:
   - Conectar los formularios de alta y actualización de automóviles contra los endpoints disponibles `POST /vehicles` y `PATCH /vehicles/:id`.
3. **Coordinación con el desarrollador Backend**:
   - Revisar la transición de las rutas `Reservado` a `Disponible` (en particular `/passports` y `/diagnostics`) para sustituir progresivamente los adaptadores mock por datos reales.
4. **Chat interactivo con Engrain AI**:
   - Implementar el widget de conversación flotante para interacción directa con el modelo de lenguaje del backend.
