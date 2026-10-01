# API de citas — Clínica Angular

Contrato de la API que el formulario de `/contactenos/` debe consumir.
El frontend (`site/assets/js/booking.js`) ya arma el `payload` correcto;
falta implementar estos endpoints como funciones serverless (Vercel
Functions / Supabase Edge Functions) conectadas al esquema en `schema.sql`.

## 1. `GET /api/disponibilidad`

Parámetros: `servicioId`, `profesionalId` (opcional), `sedeId`, `fecha` (YYYY-MM-DD).

Devuelve los bloques de horario libres ese día, cruzando `disponibilidad`,
`bloqueos` y `citas` existentes:

```json
{ "slots": ["09:00", "10:00", "11:00", "14:00"] }
```

## 2. `POST /api/citas`

Body (igual a lo que ya arma `booking.js`):

```json
{
  "servicio": "onicomicosis",
  "profesional": "dr-madrigal",
  "sede": "guadalupe",
  "fecha": "2026-09-02",
  "hora": "10:00 am",
  "nombre": "María Pérez",
  "email": "maria@correo.com",
  "celular": "88881234",
  "mensaje": "Uña del dedo gordo, dolorosa desde hace 2 semanas",
  "consentimiento": true,
  "origen": "onicomicosis",
  "paginaOrigen": "https://angular.cr/hongos-unas-onicomicosis/"
}
```

Acciones del backend:
1. Crear o encontrar `paciente` por email/celular.
2. Verificar que el horario sigue libre (evita condiciones de carrera —
   por eso el `exclude` constraint en `schema.sql`).
3. Insertar la `cita` con `estado = 'pendiente_confirmacion'`.
4. Disparar notificaciones (ver sección 3).
5. Responder:

```json
{ "ok": true, "citaId": "uuid", "estado": "pendiente_confirmacion" }
```

Si el horario ya no está disponible, responder `409` con `{ "ok": false, "error": "horario_no_disponible" }`
para que el frontend lo muestre con claridad (requisito de accesibilidad:
errores de formulario comprensibles).

## 3. Notificaciones (confirmación, recordatorios, reprogramación)

Requiere credenciales de terceros que la clínica debe contratar —
esto NO se resuelve con código, es una decisión de proveedor:

- **WhatsApp:** cuenta de WhatsApp Business API vía Meta, Twilio o
  360dialog (aprobación de Meta + costo mensual + costo por conversación).
- **Correo:** proveedor transaccional (Resend, Postmark, SendGrid).
- **Recordatorios:** un cron (Vercel Cron o Supabase Scheduled Functions)
  que corra cada hora, revise `citas` con `inicio` a 24h/2h y dispare
  la notificación pendiente, registrando el envío en `notificaciones_cita`.

## 4. `POST /api/citas/:id/reprogramar`

Body: `{ "nuevaFecha": "...", "nuevaHora": "..." }` — repite la
verificación de disponibilidad del punto 2 y actualiza `estado = 'reprogramada'`.

## 5. Integración con Google Calendar (opcional, fase posterior)

Al confirmar una cita, crear un evento en el calendario del profesional
vía Google Calendar API (OAuth2 de la cuenta de la clínica). Requiere
que la clínica autorice el acceso una sola vez desde el panel admin.

## 6. Integración con CRM/EMR (Siku o Huli)

Documento maestro marca esto como "decisión pendiente". El contrato
recomendado: al confirmar una cita, hacer un `POST` a un webhook que la
integración de Siku/Huli exponga (o, si no exponen webhook, sincronizar
por lote cada noche). No implementar hasta que se elija el proveedor —
construir contra un CRM no confirmado es trabajo que se descarta.

---

**Dónde vive esto en producción:** estas funciones no pueden vivir en
un sitio 100% estático. La ruta recomendada es Next.js desplegado en
Vercel (API routes en `/pages/api/` o `/app/api/`) con Supabase como
base de datos — ambos tienen plan gratuito suficiente para el volumen
de 50–70 consultas/semana que maneja hoy la clínica.
