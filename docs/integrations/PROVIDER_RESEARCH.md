# Investigación de proveedores externos (Costa Rica)

Fecha de revisión: 20 de noviembre de 2026. Este documento es una revisión de interfaces públicas y documentación oficial; no constituye autorización para automatizar ningún portal.

| Institución | Fuente oficial revisada | Hallazgo relevante | Decisión ENGRAIN |
| --- | --- | --- | --- |
| Ministerio de Hacienda | [Autogestión Tributaria](https://serviciosnet.hacienda.go.cr/autogestion/) | La consulta web solicita componentes de placa y ofrece información de valor fiscal, características e impuesto. No se identificó una API pública documentada para ENGRAIN. | `MANUAL_ONLY`; se guía al usuario al portal y se permite adjuntar el comprobante. |
| INS | [Consulta Marchamo](https://marchamo.ins-cr.com/) | El flujo público usa placa/tipo y puede requerir datos del propietario. No se identificó API pública documentada. | `MANUAL_ONLY`; no se envía ni persiste información personal extra. |
| DEKRA | [Sitio DEKRA Costa Rica](https://www.dekra.cr/) | La cita/consulta pública se ofrece por los canales de DEKRA; no se halló API pública para resultados de inspección por placa. | `MANUAL_ONLY`; el resultado debe venir como documento autorizado por el usuario. |
| COSEVI | [Portal de desarrolladores de datos abiertos](https://datosabiertos.csv.go.cr/developers/) | Existe una API de datos abiertos con `auth_key`, pero la información verificada es estadística/dataset; no se verificó una API autorizada de infracciones individuales por placa. | `REQUIRES_CREDENTIALS`, `supportsPlateLookup=false`; no se habilita una consulta individual automatizada. |
| Registro Nacional | [RNP Digital](https://www.rnpdigital.com/) | Los servicios digitales/certificaciones son administrados por el Registro; no se identificó una API pública que autorice la consulta automatizada de gravámenes o titularidad. | `REQUIRES_AGREEMENT`; se requiere convenio, credenciales y revisión legal antes de cualquier adaptador real. |

## Reglas no negociables

- No se hace scraping, automatización de navegador, evasión de CAPTCHA, uso de credenciales de usuarios ni consumo de endpoints no documentados.
- Que un dato pueda verse en un portal no significa que pueda recolectarse, reutilizarse o publicarse mediante API.
- Titularidad, identificaciones personales y datos financieros se tratan como sensibles. ENGRAIN no almacena credenciales de portales de usuarios.
- Antes de habilitar un adaptador real se debe registrar el contrato, alcance de datos, base legal, límites, sandbox, responsable y método de revocación.

Los enlaces se conservan como referencia operacional. El estado en tiempo de ejecución se expone por `GET /api/v1/external-providers`.
