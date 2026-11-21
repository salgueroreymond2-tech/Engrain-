# Guion de demostración — ENGRAIN: Driving Trust

Duración objetivo: 4–6 minutos. Usar solamente los datos ficticios creados por `npm run prisma:seed`.

1. **Confianza e identidad (30 s).** Iniciar sesión con una cuenta demo de propietario. Mostrar `GET /auth/me` y `GET /vehicles`; remarcar que la visibilidad depende de propiedad o grants.
2. **Diagnóstico conectado (60 s).** Como superadministrador, crear `POST /vehicles/:id/diagnostics/simulations` con `{"scenario":"misfire"}`. Mostrar `P0300`, RPM, temperatura, voltaje y el indicador `isSimulated: true`; aclarar que no se conectó hardware físico ni se cambió la ECU.
3. **Historial y asistente (45 s).** Consultar timeline, después `GET /assistant/vehicles/:id/dtc-interpretation?scanId=...`. Señalar `supportingRecords`, las limitaciones y que la IA no modifica ni certifica registros.
4. **Pasaporte comprador (90 s).** Como dueño, crear `POST /passports` y abrir `GET /passports/:id/qr`. Escanear o abrir `publicUrl` sin iniciar sesión. Mostrar VIN enmascarado, historial técnico, talleres, DTCs, alertas, cobertura y gaps. Confirmar que no aparecen propietarios, correos, grants, snapshots ni archivos privados.
5. **Control del dueño (30 s).** Ejecutar `POST /passports/:id/revoke`; refrescar la URL pública y mostrar `404`. Explicar expiración y auditoría.
6. **Transferencia opcional (45 s).** En un vehículo demo separado, iniciar `POST /vehicles/:id/transfers` y aceptar desde la cuenta invitada. Mostrar que se revocan enlaces/grants anteriores y leer el aviso de que no reemplaza un traspaso legal.

## Preparación

```bash
npm --prefix backend run prisma:deploy
npm --prefix backend run prisma:seed
npm --prefix backend run dev
```

Abrir Swagger en `http://localhost:3000/docs` para una demo de API, o integrar el frontend con `/api/v1` y configurar `PUBLIC_PASSPORT_URL` con su ruta de lector público. No compartir secretos, credenciales reales ni URLs de base de datos durante la presentación.
