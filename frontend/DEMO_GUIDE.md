# ENGRAIN — Guía de Demostración para Hackathon (Demo Guide)

Esta guía explica paso a paso cómo presentar el flujo integral de **ENGRAIN — Driving Trust** ante el jurado y evaluadores técnicos.

---

## 1. Modos de Ejecución

ENGRAIN soporta dos modos claramente diferenciados:

1. **Modo Integración Real (con Backend activo en `http://localhost:3000`):**
   - Consume base de datos MySQL mediante Prisma.
   - Creación real de vehículos con validación de VIN y placas.
   - Órdenes de trabajo, mantenimientos y pasaportes con tokens criptográficos reales.
   - No utiliza mocks ni realiza fallbacks silenciosos.

2. **Modo Demostración Rápida (Standalone / Pruebas Offline):**
   - Utiliza usuarios simulados precargados en la pantalla de inicio de sesión (`/login`).
   - Muestra el badge distintivo `[Modo demostración]`.
   - Permite probar la creación, regeneración y revocación de pasaportes con persistencia en `localStorage` del navegador.

---

## 2. Recorrido de Demostración de Extremo a Extremo

### Paso 1: Inicio de Sesión
1. Dirígete a `http://localhost:5173/login`.
2. Para una demostración rápida sin backend:
   - Haz clic en **"Propietario Demo"** (`propietario@engrain.io`) para ingresar a la cochera.
   - O bien, haz clic en **"Taller Demo"** (`taller@precisionmotors.mx`) para ingresar al panel de bahía técnica.
3. Para una prueba real con backend:
   - Registra una cuenta en `/register` o ingresa con credenciales reales creadas en el servidor.

---

### Paso 2: Cochera y Gestión del Vehículo (Propietario)
1. Navega a **"Mis Vehículos"** (`/owner/garage`).
2. Haz clic en **"Ver Expediente"** para abrir el detalle del automóvil (`/owner/vehicles/:id`).
3. Observa la pestaña **"Línea de Tiempo y Servicios"**:
   - En modo real: Muestra los mantenimientos certificados registrados por el taller.
   - En modo demo: Muestra la bitácora demostrativa de servicios preventivos.

---

### Paso 3: Generación del Pasaporte Digital y Código QR
1. Desde el menú lateral o el expediente, haz clic en **"Pasaporte Digital"** (`/owner/passport`).
2. Verifica los elementos de la interfaz:
   - **Enlace de Verificación Activo**: URL absoluta construida con `VITE_PUBLIC_URL` o `window.location.origin`.
   - **Código QR Certificado**: Generado mediante SVG con nivel de corrección medio.
   - **Nivel de Visibilidad**: Selector de tres estados (`Público`, `Restringido`, `Privado`).
   - **Garantías de Privacidad**: Explicación clara de que el nombre del propietario, correos e importes monetarios no se exponen al comprador.
3. Haz clic en el botón **"Copiar"** o en **"Ver Vista Pública"** para abrir el enlace en una pestaña nueva o ventana de incógnito.

---

### Paso 4: Consulta de la Vista Pública para Compradores
1. Abre la URL pública generada: `http://localhost:5173/passport/:token`.
2. Observa la vista del comprador:
   - **Score de Integridad (TrustScore)** calculado a partir de las intervenciones verificadas.
   - **Validación del Odómetro** y kilometraje garantizado sin manipulación.
   - **Ficha Técnica**: Marca, modelo, año, placa y número de serie (VIN).
   - **Línea de Tiempo**: Registro cronológico de intervenciones con sello de taller certificado.

---

### Paso 5: Prueba de Revocación de Seguridad
1. Regresa a la pestaña del propietario en `/owner/passport`.
2. Haz clic en el botón rojo **"Revocar Enlace"**.
3. El estado del enlace cambiará inmediatamente a **REVOCADO** con badge rojo.
4. Regresa a la pestaña pública de consulta (`/passport/:token`) y recarga la página:
   - La pantalla mostrará de forma segura: **"Enlace revocado"**.
   - **Protección de datos**: No se revela ninguna especificación técnica, placa, odómetro ni historial del automóvil.
5. Regresa a la pestaña del propietario y haz clic en **"Revocar y Regenerar"**:
   - Se creará un nuevo token público activo con un nuevo código QR.
   - El token anterior permanecerá revocado permanentemente.

---

### Paso 6: Flujo de Taller (Órdenes de Trabajo a Mantenimientos)
1. Cambia de rol a **Taller Mecánico** usando el selector rápido superior en la barra de navegación o cerrando sesión.
2. Ingresa a **"Órdenes de Trabajo"** (`/workshop/work-orders`).
3. Haz clic en una orden activa para abrir el asistente de 7 pasos:
   - **Paso 1: Recepción** (Inventario y kilometraje de entrada).
   - **Paso 2: Diagnóstico** (Revisión técnica de averías).
   - **Paso 3: Presupuesto** (Añadir procedimientos, refacciones y cálculo de IVA).
   - **Paso 4: Aprobación** (Simulación de consentimiento del cliente).
   - **Paso 5: Ejecución** (Checklist de tareas en bahía).
   - **Paso 6: Evidencias** (Fotografías antes / después del servicio).
   - **Paso 7: Finalización** (Al hacer clic en "Finalizar y Sellar Orden", el servicio se convierte automáticamente en un mantenimiento completado en la bitácora del vehículo).
