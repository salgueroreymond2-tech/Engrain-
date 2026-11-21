# Contexto del proyecto

## Problema

En el mercado de vehículos usados, la información de mantenimientos, reparaciones, diagnósticos y procedencia suele estar fragmentada o no puede verificarse. Esto incrementa el riesgo para compradores y propietarios.

## Propuesta

ENGRAIN — Driving Trust crea una línea de tiempo vehicular respaldada por evidencias, eventos de taller y diagnósticos OBD2. El propietario conserva el control, el taller aporta trazabilidad y el comprador consulta un pasaporte digital compartible.

## Módulos

| Módulo | Propósito MVP |
| --- | --- |
| Connect | Registrar diagnósticos provenientes de un adaptador OBD2. |
| Workshop | Gestionar talleres, órdenes e intervenciones. |
| Owner | Administrar vehículos, mantenimientos y permisos del propietario. |
| Passport | Exponer un historial verificable bajo consentimiento. |
| AI | Asistir con explicaciones de códigos, mantenimientos y riesgos. |
| Business | Extensión futura para agencias; no se implementa en el MVP. |

## Restricciones

- Entrega objetivo: domingo 22 de noviembre de 2026.
- Backend: Node.js, Express, TypeScript, PostgreSQL en Supabase, Prisma, JWT, Zod, Swagger y Socket.IO. PostgreSQL sustituye MySQL para esta hackathon por decisión explícita del equipo.
- Frontend independiente: React, Vite y Tailwind CSS. No se modifica en este alcance.
- Se prioriza un monolito modular mantenible sobre microservicios.
