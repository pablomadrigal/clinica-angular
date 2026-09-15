# Sistema de citas — diseño del backend

**Hoy el sitio no tiene backend de citas.** El formulario de agenda de 5 pasos
(`src/components/booking/`) corre solo en el navegador: valida los datos, arma
un resumen y lo envía por WhatsApp con `src/lib/whatsapp.ts`. No hay llamada a
ninguna API y nunca se le muestra al paciente la confirmación de una cita que
nadie recibió.

Los dos archivos de esta carpeta son el **diseño del backend**, copiados tal
cual del entregable de agosto (`angularwebfase1/booking-system/`). No están
implementados ni conectados a nada del sitio:

| Archivo | Qué es |
|---|---|
| `schema.sql` | Esquema de base de datos propuesto para citas, profesionales, sedes y disponibilidad |
| `api-contract.md` | Contrato de los endpoints que consumiría el formulario |

Quedan versionados acá para la fase de backend, que es un proyecto aparte y
está explícitamente fuera del alcance de la migración de diseño (ver
`docs/superpowers/specs/2026-09-08-migracion-diseno-agosto-design.md`,
sección "Fuera de alcance").
