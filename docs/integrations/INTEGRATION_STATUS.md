# Estado de integraciones externas

| Código | Estado | Consulta automática de placa | Implementación actual | Condición para habilitar producción |
| --- | --- | ---: | --- | --- |
| `HACIENDA` | `MANUAL_ONLY` | No | Instrucciones y evidencia documental | API oficial o autorización escrita con contrato. |
| `INS` | `MANUAL_ONLY` | No | Instrucciones y evidencia documental | API oficial o autorización escrita con contrato. |
| `DEKRA` | `MANUAL_ONLY` | No | Instrucciones y evidencia documental | API oficial o autorización escrita con contrato. |
| `COSEVI` | `REQUIRES_CREDENTIALS` | No | Catálogo/configuración solamente; su API de datos abiertos no se trata como consulta individual. | Credenciales válidas y autorización explícita para el alcance requerido. |
| `REGISTRO_NACIONAL` | `REQUIRES_AGREEMENT` | No | Catálogo/configuración solamente. | Convenio, evaluación legal y credenciales autorizadas. |
| `MANUAL_DOCUMENT` | `AVAILABLE` | No aplica | Metadatos, hash SHA-256 y trazabilidad de un documento aportado por usuario autorizado. | Configurar almacenamiento privado si se incorpora carga de binarios. |
| `MOCK` | `AVAILABLE` | Sí, sólo demo | Perfil, impuestos, seguro, inspección, tránsito, registro/legal ficticios. | Nunca: está reservado para demo y requiere `SUPER_ADMIN`. |

Ningún proveedor gubernamental o privado anterior está marcado como integrado automáticamente. El estado `AVAILABLE` del módulo sólo describe `MANUAL_DOCUMENT` y `MOCK`, no una conexión oficial.
