# Sistema de Diseño ENGRAIN — Automotive Premium UI

Guía de componentes, tokens visuales e identidad de marca para **ENGRAIN — Driving Trust**.

---

## 1. Identidad Visual y Paleta de Colores

Diseñado con una estética automotriz de alto rendimiento, inspirada en consolas telemáticas, fibra de carbono e instrumentos de precisión.

### Paleta Primaria

| Nombre | Token Hex | Clase Tailwind | Uso Principal |
| --- | --- | --- | --- |
| **Carbono** | `#111318` | `bg-carbon`, `bg-carbon-900` | Fondo general de aplicación, superficies base. |
| **Grafito** | `#242830` | `bg-graphite`, `bg-graphite-800` | Tarjetas, barras laterales, inputs y bordes. |
| **Naranja Aceleración** | `#F97316` | `text-brand`, `bg-brand` | Acentos de marca, botones primarios, glows telemáticos. |
| **Platino** | `#F4F5F7` | `text-platinum` | Tipografía principal, contrastes nítidos de alta legibilidad. |
| **Verde Confianza** | `#16A34A` | `text-trust`, `bg-trust` | Estados verificados, pasaporte aprobado, métricas seguras. |

---

## 2. Tipografía

- **Manrope (`font-display`)**: Encabezados (h1-h6), títulos de tarjetas, números de score y marcas principales. Transmite ingeniería y robustez.
- **Inter (`font-sans`)**: Componentes de formulario, tablas, párrafos, badges y microcopia. Máxima legibilidad en pantallas táctiles y móviles.
- **JetBrains Mono / Monospace (`font-mono`)**: Códigos VIN, matrículas, códigos DTC (ej. `P0420`), tokens de pasaporte y estampas temporales ISO.

---

## 3. Catálogo de Componentes UI Reutilizables

Todos los componentes se ubican en `src/components/ui/` y exponen props tipadas en TypeScript.

### 1. `Button`
- **Variantes**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`.
- **Tamaños**: `sm` (text-xs, py-1.5), `md` (text-sm, py-2), `lg` (text-base, py-3).
- **Estados**: `isLoading` (spinner integrado accesible), `disabled`, soporte para `leftIcon` y `rightIcon`.
- **Efecto Focus**: Anillo exterior `focus:ring-brand` con `ring-offset-carbon`.

### 2. `Input`
- **Propiedades**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`.
- **Estilos**: Fondo grafito con borde sutil `border-graphite-600/60`, cambio de color a naranja en foco y rojo en error.

### 3. `Select`
- Menú desplegable nativo estilizado con chevron integrado y compatibilidad accesible con formularios reactivos.

### 4. `Textarea`
- Campo multilínea con redimensionamiento vertical sutil y estilos sincronizados con `Input`.

### 5. `Card`
- Contenedores de superficie automotriz con `border-graphite-600/50` y sombra sutil `shadow-automotive`.
- Subcomponentes: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- Variantes: `default`, `flat`, `interactive` (hover glow), `accent` (gradiente con resplandor naranja).

### 6. `Badge`
- Etiquetas para estados técnicos.
- Variantes: `default`, `success`, `warning`, `danger`, `info`, `outline`.
- Soporte para indicador luminoso `dot`.

### 7. `Modal`
- Diálogo modal con overlay oscuro (`backdrop-blur-md`), bloqueo de scroll en body y captura de tecla `Escape`.
- Tamaños: `sm`, `md`, `lg`, `xl`.

### 8. `Table`
- Tabla con contenedor horizontal responsivo (`overflow-x-auto`).
- Subcomponentes: `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.

### 9. `Tabs`
- Sistema de pestañas desacoplado con contexto React (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).

### 10. `Breadcrumb`
- Jerarquía de navegación con enlaces integrados de React Router y chevron separador.

### 11. `Dropdown`
- Menú contextual flotante con click-outside listener y opciones estándar o peligrosas (ej. logout).

### 12. `Toast`
- Alertas emergentes en la esquina inferior derecha (`useToast` hook) con soporte para `success`, `error`, `warning` e `info`.

### 13. `Loading`
- `LoadingSpinner`, `Skeleton` y `PageLoading` para retroalimentación visual de operaciones asíncronas.

### 14. `EmptyState`
- Estados vacíos con icono central, título, descripción y botón de acción opcional.

### 15. `ErrorState`
- Presentación de fallas con código de error, `requestId` del backend y botón de reintento.

### 16. `PageHeader`
- Cabecera estandarizada para todas las vistas con títulos h1, badges de módulo y slot de acciones primarias.

### 17. `StatCard`
- Tarjetas métricas de dashboard con indicador de tendencia (porcentaje o etiqueta) e iconos dedicados.
