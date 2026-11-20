# ENGRAIN — Guía de colaboración

## Alcance y responsables

- El backend vive exclusivamente en `backend/` y es responsabilidad del desarrollador backend.
- El frontend es responsabilidad de la desarrolladora frontend. No modificar `frontend/` sin su autorización explícita.
- La integración se realiza mediante el contrato versionado en `docs/API_CONTRACT.md`.

## Reglas de implementación

- Usar TypeScript estricto, REST bajo `/api/v1`, Prisma y MySQL.
- Mantener los módulos aislados por dominio; no introducir microservicios para el MVP.
- Validar entradas con Zod y devolver el sobre de respuesta descrito en el contrato.
- No confirmar secretos, archivos `.env`, claves JWT, credenciales ni evidencias reales.
- Toda nueva ruta debe tener control de autorización, validación, documentación de contrato y manejo de errores.

## Comandos principales

```bash
npm install
npm run dev
npm run test
npm run build
```

Los comandos de Prisma se ejecutan desde la raíz mediante `npm run db:generate` y `npm run db:migrate`.
