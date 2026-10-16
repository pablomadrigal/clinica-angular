# Contrato de API — Sistema de citas a la medida (Clínica Angular)

Este documento describe el backend que falta construir para que el formulario de citas (ya implementado en `/contactenos/`, archivo `assets/js/booking.js`) quede completamente funcional: hoy el formulario valida los datos y muestra una confirmación en pantalla, pero **no envía todavía la información a ningún servidor**. Este contrato es la base para que el desarrollador backend (Pablo o quien continúe el proyecto) construya esa pieza sin tener que adivinar el formato de datos ni la lógica de negocio.

Base de datos de referencia: `schema.sql` en esta misma carpeta (PostgreSQL / Supabase).

## 1. Resumen del flujo

1. El paciente completa el formulario de 5 pasos en `/contactenos/`.
2. Al enviar, el frontend hace `POST /api/citas` con los datos del formulario.
3. El backend valida disponibilidad real (tabla `disponibilidad` + `bloqueos` + `citas` existentes), crea el registro en `pacientes` (o reutiliza uno existente por email/celular) y crea la fila en `citas` con estado `pendiente`.
4. El backend dispara una notificación de confirmación por WhatsApp y/o correo (ver sección 5).
5. El personal de la clínica confirma manualmente (o vía panel administrativo futuro) y el estado pasa a `confirmada`.
6. 24h y 2h antes de la cita, un job programado envía recordatorios automáticos.

## 2. Endpoints

### `GET /api/disponibilidad`

Devuelve los bloques de horario disponibles para un servicio (y opcionalmente un profesional) en una fecha dada, cruzando `disponibilidad`, `bloqueos` y `citas` ya ocupadas.

**Query params:** `servicio` (clave, ej. `pie-diabetico`), `fecha` (YYYY-MM-DD), `profesional_id` (opcional).

**Respuesta:**
```json
{
  "fecha": "2026-10-15",
  "bloques_disponibles": ["09:00", "10:00", "11:00", "14:00"]
}
```

### `POST /api/citas`

Crea una solicitud de cita. Este es el endpoint que debe conectarse al `submit` de `booking-form` en `assets/js/booking.js`.

**Body esperado** (mapea 1:1 con los campos del formulario actual):
```json
{
  "servicio": "pie-diabetico",
  "profesional": "dr-madrigal",
  "sede": "guadalupe",
  "fecha": "2026-10-15",
  "hora": "10:00 am",
  "nombre": "Juan Pérez",
  "email": "juan@correo.com",
  "celular": "88887777",
  "mensaje": "Tengo una herida que no cierra hace 3 semanas.",
  "consentimiento": true,
  "origen": "web-contactenos"
}
```

**Respuesta (201):**
```json
{
  "cita_id": "uuid",
  "estado": "pendiente",
  "resumen": "Pie diabético · 15 oct 2026 · 10:00 am · Guadalupe"
}
```

**Errores a manejar:** horario ya no disponible (409), datos incompletos (400), servicio inexistente (404).

### `POST /api/citas/:id/reprogramar`

Cambia la fecha/hora de una cita existente, revalidando disponibilidad. Dispara notificación de tipo `reprogramacion`.

```json
{ "fecha": "2026-10-20", "hora": "2:00 pm" }
```

### `POST /api/citas/:id/cancelar`

Cambia el estado a `cancelada`. Libera el horario (el `EXCLUDE CONSTRAINT` de la tabla `citas` ignora las citas canceladas).

## 3. Integración con WhatsApp

El sitio ya usa enlaces `wa.me` con mensaje pre-cargado como solución inmediata sin backend (ver `assets/js/config.js`, función `whatsappUrl`). Para notificaciones automáticas de confirmación y recordatorio (no solo el clic manual del paciente), se necesita una de estas dos rutas:

1. **WhatsApp Business API** (Meta Cloud API, o un proveedor como Twilio/360dialog) — permite enviar mensajes salientes automáticos (confirmaciones, recordatorios 24h/2h). Es la opción recomendada a mediano plazo.
2. **Interim manual**: el personal de la clínica confirma por WhatsApp manualmente al ver la nueva fila en `citas`, usando un panel administrativo simple (no incluido todavía en este entregable).

Cualquiera que sea la ruta elegida, cada envío debe registrarse en `notificaciones_cita` (canal, tipo, éxito/fallo) para poder auditar que los recordatorios efectivamente salieron.

## 4. Integración con correo electrónico

Mínimo viable: un proveedor transaccional (Resend, SendGrid, Amazon SES) para confirmaciones y recordatorios por correo, en paralelo a WhatsApp.

## 5. Recordatorios automáticos (jobs programados)

Se requiere un *cron job* (o función programada en Supabase/Vercel Cron) que corra cada hora y:
1. Busque citas con estado `confirmada` cuya hora de inicio esté entre 23h55 y 24h05 desde ahora → enviar recordatorio `recordatorio_24h`.
2. Busque citas con estado `confirmada` cuya hora de inicio esté entre 1h55 y 2h05 desde ahora → enviar recordatorio `recordatorio_2h`.
3. Registrar cada envío en `notificaciones_cita`.

## 6. Integración con Google Calendar (pendiente de decisión)

Dos opciones, a decidir con la clínica antes de implementar:
- **Calendario único de la clínica**: cada cita creada en `citas` genera un evento en un calendario compartido de Google (vía Google Calendar API con cuenta de servicio). Simple, pero no distingue agenda por profesional dentro de Google Calendar.
- **Un calendario por profesional**: requiere que cada profesional autorice acceso OAuth a su propio calendario. Más trabajo de implementación, pero refleja mejor la agenda real de cada quien.

**Recomendación:** empezar con calendario único de la clínica (opción 1) y evaluar la opción 2 solo si el equipo de profesionales crece o pide vistas individuales.

## 7. CRM / Expediente clínico electrónico (pendiente de decisión)

El documento maestro menciona un expediente clínico electrónico ya en uso. Antes de construir un CRM nuevo, se debe confirmar:
- ¿Qué sistema usan hoy (Siku, Huli, u otro)? Si ya existe uno, la integración correcta es que `POST /api/citas` cree también el registro correspondiente en ese sistema vía su API (si la tiene), en vez de duplicar datos de pacientes en dos sistemas separados sin sincronía.
- Si no hay decisión tomada todavía, las tablas `pacientes`/`citas` de este esquema pueden operar de forma independiente mientras se define el sistema definitivo — pero se recomienda definirlo pronto para evitar una migración de datos más adelante.

## 8. Checklist para el desarrollador backend

- [ ] Levantar la base de datos con `schema.sql` (Supabase recomendado: incluye auth, Postgres gestionado y funciones programadas).
- [ ] Implementar `POST /api/citas`, conectarlo al `submit` de `assets/js/booking.js` (hoy ese handler solo hace `console.log` y muestra la confirmación en pantalla — hay que agregar el `fetch` real).
- [ ] Implementar `GET /api/disponibilidad` y usarlo para poblar dinámicamente el `<select id="hora">` del paso 4 (hoy son opciones fijas de ejemplo).
- [ ] Decidir y conectar el canal de notificaciones (sección 3).
- [ ] Configurar el job de recordatorios (sección 5).
- [ ] Definir con la clínica la integración de Google Calendar (sección 6) y de CRM/expediente clínico (sección 7) antes de construirlas, para no duplicar trabajo.
