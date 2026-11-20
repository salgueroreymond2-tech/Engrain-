# ENGRAIN — Frontend

**Driving Trust** — Ecosistema digital de confianza vehicular para la hackathon de noviembre 2026.

Este repositorio contiene la arquitectura completa de cliente web desarrollada con **React 18**, **Vite**, **TypeScript**, y **Tailwind CSS**.

---

## 1. Stack Tecnológico

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Lenguaje**: TypeScript (Strict Mode)
- **Estilos e Identidad**: Tailwind CSS con paleta temática automotriz personalizada
- **Enrutamiento**: React Router DOM v6 con layouts modulares desacoplados
- **Gestión de Estado Asíncrono / Caching**: TanStack Query v5
- **Formularios y Validación**: React Hook Form + Zod (validación contra el contrato de API)
- **Iconografía**: Lucide React
- **Tipografía**: Manrope (Headings / Identidad) e Inter (UI y cuerpo de texto)
- **Cliente HTTP**: Centralizado con tipado estricto contra el sobre de respuesta `{ success, data, error, meta }` de `docs/API_CONTRACT.md`.

---

## 2. Estructura de Directorios

```
frontend/
├── .env.example              # Variables de entorno documentadas
├── .env                      # Configuración local de desarrollo
├── index.html                # Plantilla HTML con tipografía Google Fonts
├── package.json              # Dependencias y scripts
├── postcss.config.js         # Configuración de PostCSS
├── tailwind.config.js        # Tokens de diseño y colores corporativos
├── tsconfig.json             # Configuración TypeScript
├── vite.config.ts            # Configuración de Vite con alias @ -> /src
└── src/
    ├── app/                  # Providers globales
    ├── assets/               # Recursos estáticos e isotipo SVG
    ├── components/
    │   ├── ui/               # Sistema de diseño reusable (Button, Input, Card, Modal, etc.)
    │   └── layout/           # Sidebar, Navbar, MobileNav, BrandLogo
    ├── context/              # AuthContext (Sesión y roles) y ToastContext (Alertas)
    ├── hooks/                # useAuth, useToast
    ├── layouts/              # PublicLayout, AuthLayout, WorkshopLayout, OwnerLayout
    ├── lib/                  # api-client, query-client, cn (clsx + twMerge)
    ├── pages/                # Vistas públicas, de autenticación, taller y propietario
    │   ├── workshop/         # Módulo Taller: Overview, Vehicles, Work Orders, Diagnostics...
    │   └── owner/            # Módulo Propietario: Overview, Garage, Detail, Diagnostics...
    ├── routes/               # Declaración centralizada del router
    ├── services/             # Servicios desacoplados de API y adaptadores mock
    ├── styles/               # globals.css y directivas Tailwind
    └── types/                # Modelos y contratos TypeScript sincronizados con API_CONTRACT.md
```

---

## 3. Comandos de Ejecución

Desde el directorio `frontend/`:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (por defecto en http://localhost:5173)
npm run dev

# Compilar proyecto y verificar tipos
npm run build

# Previsualizar compilación de producción
npm run preview

# Verificación de tipos sin emitir bundle
npm run lint
```

O desde la raíz del proyecto (si se configuran los prefijos en scripts):
```bash
npm --prefix frontend run dev
npm --prefix frontend run build
```

---

## 4. Rutas Disponibles

### Rutas Públicas
- `/`: Landing page de ENGRAIN, módulos, métricas y propuesta de valor.
- `/login`: Inicio de sesión con validación de credenciales y botones de acceso demo.
- `/register`: Registro con selección de rol (`OWNER` o `WORKSHOP_ADMIN`).
- `/passport/:token`: Pasaporte digital vehicular público con verificación criptográfica y score de integridad.

### Rutas de Taller Mecánico (`/workshop`)
- `/workshop`: Visión general, órdenes en bahía, KPIs operativos y telemetría IA.
- `/workshop/vehicles`: Inventario de vehículos atendidos y búsqueda por VIN/placa.
- `/workshop/work-orders`: Gestión de órdenes de trabajo (en curso, programadas, completadas).
- `/workshop/maintenance`: Calendario de servicios e intervenciones preventivas.
- `/workshop/diagnostics`: Lectura telemática OBD2 e inspección de códigos DTC.
- `/workshop/settings`: Parámetros operativos, dirección y equipo técnico.

### Rutas de Propietario (`/owner`)
- `/owner`: Dashboard principal con estado del vehículo activo y recomendaciones IA.
- `/owner/garage`: Cochera personal con lista de automóviles y kilometraje.
- `/owner/vehicles/:id`: Expediente individual con ficha técnica, bitácora y diagnósticos.
- `/owner/maintenance`: Alertas preventivas y próximos servicios calculados.
- `/owner/diagnostics`: Salud electrónica, sensores en reposo y estado de Check Engine.
- `/owner/passport`: Generador de token público, selector de visibilidad y enlace para compradores.

---

## 5. Variables de Entorno

Definidas en `.env.example`:

| Variable | Descripción | Valor por Defecto |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Endpoint base para el consumo de la API REST v1 | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Nombre de la plataforma | `ENGRAIN — Driving Trust` |
| `VITE_APP_VERSION` | Versión actual del frontend | `0.1.0` |
| `VITE_ENABLE_MOCK_FALLBACK` | Permite usar adaptadores mock cuando el backend responde 501 / Reservado | `true` |
