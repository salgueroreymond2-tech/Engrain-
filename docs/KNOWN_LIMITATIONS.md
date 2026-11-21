# Limitaciones conocidas

- La conexión OBD2 física no está declarada funcional: sólo existe el contrato de adaptador de lectura y el simulador de hackathon. No se programa ECU, borran DTCs ni controlan componentes.
- Las evidencias se conservan como metadatos y hashes. No hay almacenamiento privado firmado, antivirus ni descarga de binarios implementados; el pasaporte público nunca expone `storageKey` ni archivos.
- El rate limit de autenticación y de enlaces públicos es en memoria. Para más de una instancia se requiere un almacén compartido, como Redis.
- El proveedor de IA remoto es opcional y tiene fallback al catálogo local. Sus respuestas son explicativas, no certifican reparaciones ni el estado mecánico.
- La transferencia digital actualiza propiedad y accesos dentro de ENGRAIN, pero no sustituye un traspaso legal, registral, notarial ni contractual.
- Los enlaces heredados con token CUID fueron revocados por la migración de cierre; el dueño debe emitir un nuevo enlace aleatorio de 256 bits.
- El repositorio de frontend no está presente en este espacio de trabajo. Se verificó el contrato REST, CORS, Swagger y la URL configurable de QR, pero no una prueba visual de React/Tailwind.
- `npm audit --omit=dev` mantiene cuatro hallazgos altos transitivos del CLI Prisma 6; la solución disponible es Prisma 7, una actualización mayor que debe probarse fuera del cierre de hackathon. No hay vulnerabilidades críticas de producción reportadas en la auditoría final.
- Docker Desktop no estaba activo durante el cierre, por lo que el Dockerfile no se construyó localmente. Debe ejecutarse una construcción en CI o el hosting antes de presentar el despliegue como verificado.
