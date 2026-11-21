# Reporte de pruebas — ENGRAIN

Fecha: 20 de noviembre de 2026.

## Alcance de la auditoría final

La ejecución final cubre autenticación y sesiones JWT, autorización y aislamiento de vehículos/talleres, Prisma/Supabase, hashes de integridad, Connect OBD2 simulado, catálogo y asistente IA, pasaporte público, QR, revocación, expiración y transferencia digital de demostración.

## Resultado

| Verificación | Resultado observado |
| --- | --- |
| Compilación TypeScript | Aprobada con `npm --prefix backend run build`. |
| Pruebas unitarias | 15 aprobadas; 7 archivos aprobados. Cubren health/CORS/errores, JWT/sesión, política de acceso, hashes, kilometraje, proveedor OBD2, hardware no verificado y catálogo IA. |
| Integración Supabase | 4 escenarios aprobados, ejecutados individualmente por límite de tiempo del runner: aislamiento de taller; OBD2 simulado y referencias IA; pasaporte/QR/privacidad/revocación/expiración; transferencia digital temporal. |
| Prisma/Supabase | `prisma migrate status` confirmó 4 migraciones aplicadas y esquema actualizado. |
| Auditoría de producción | `npm audit --omit=dev --json`: 0 críticos, 4 altos transitivos ligados a Prisma 6; ver `KNOWN_LIMITATIONS.md`. |
| Docker | No probado: Docker Desktop no estaba activo en el equipo. El Dockerfile fue revisado y queda listo para construir en CI/hosting. |
| Frontend visual | No probado: el directorio/repositorio frontend no estaba disponible; se validaron contrato, CORS, Swagger y la URL QR configurable. |

No se declara una prueba visual del frontend ni una conexión OBD2 física como completadas.

## Comandos de cierre

```bash
npm --prefix backend run build
$env:RUN_INTEGRATION_TESTS='true'; npm --prefix backend test -- --run
npm --prefix backend exec -- prisma migrate status
```

## Controles manuales requeridos

- Abrir una URL pública de pasaporte en una sesión sin login y confirmar que no devuelve identidad de propietarios ni rutas de archivo.
- Revocar el enlace y confirmar `404`.
- Confirmar que QR apunta a `PUBLIC_PASSPORT_URL` HTTPS en el entorno desplegado.
- Revisar CORS desde el dominio real del frontend.
- Mantener la advertencia de transferencia digital visible en la interfaz.
