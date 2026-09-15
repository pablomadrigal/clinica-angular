// Lógica del asistente de agenda. Vive aparte del componente para poder probarla:
// el navegador solo aporta los valores de los campos, las reglas están todas acá.
import { WHATSAPP_NUMBER } from '../../lib/whatsapp';

export const STEPS = ['servicio', 'profesional', 'sede', 'fecha', 'datos'] as const;
export type Step = (typeof STEPS)[number];

export interface BookingData {
  servicio: string;
  servicioLabel: string;
  profesional: string;
  sede: string;
  fecha: string; // ISO corto: 2026-09-20
  hora: string;
  nombre: string;
  email: string;
  celular: string;
  mensaje: string;
  consentimiento: boolean;
  origen: string;
}

export type Errores = Partial<Record<keyof BookingData, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CELULAR_CR = /^\d{8}$/;

/** Errores del paso indicado. Objeto vacío = se puede avanzar. */
export function validateStep(step: Step, data: Partial<BookingData>, hoy = new Date()): Errores {
  const e: Errores = {};
  if (step === 'servicio' && !data.servicio) {
    e.servicio = 'Elegí un servicio para continuar.';
  }
  if (step === 'sede' && !data.sede) {
    e.sede = 'Elegí una sede para continuar.';
  }
  if (step === 'fecha') {
    if (!data.fecha) e.fecha = 'Elegí la fecha que preferís.';
    else if (esPasada(data.fecha, hoy)) e.fecha = 'Esa fecha ya pasó. Elegí una de hoy en adelante.';
    if (!data.hora) e.hora = 'Elegí el horario que preferís.';
  }
  if (step === 'datos') {
    if (!data.nombre || data.nombre.trim().length < 2) e.nombre = 'Ingresá tu nombre (mínimo 2 letras).';
    if (!data.email || !EMAIL.test(data.email.trim())) e.email = 'Ingresá un correo válido.';
    if (!data.celular || !CELULAR_CR.test(data.celular.trim())) e.celular = 'Ingresá un celular de 8 dígitos, sin espacios ni guiones.';
    if (!data.consentimiento) e.consentimiento = 'Necesitamos tu autorización para gestionar la cita.';
  }
  return e;
}

function esPasada(fecha: string, hoy: Date): boolean {
  const hoyCorto = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const [a, m, d] = fecha.split('-').map(Number);
  if (!a || !m || !d) return false; // formato raro: lo resuelve el navegador, no lo adivinamos acá
  return new Date(a, m - 1, d) < hoyCorto;
}

export function siguiente(step: Step): Step | 'confirmacion' {
  const i = STEPS.indexOf(step);
  return i < STEPS.length - 1 ? STEPS[i + 1] : 'confirmacion';
}

export function anterior(step: Step): Step {
  const i = STEPS.indexOf(step);
  return STEPS[Math.max(0, i - 1)];
}

/** Resumen legible de la cita; es lo que ve el paciente y lo que viaja por WhatsApp. */
export function resumen(data: Partial<BookingData>): string[] {
  const linea = (etiqueta: string, valor?: string) => (valor?.trim() ? `${etiqueta}: ${valor.trim()}` : null);
  return [
    linea('Servicio', data.servicioLabel || data.servicio),
    linea('Profesional', data.profesional),
    linea('Sede', data.sede),
    linea('Fecha', [data.fecha, data.hora].filter(Boolean).join(' ')),
    linea('Nombre', data.nombre),
    linea('Correo', data.email),
    linea('Celular', data.celular),
    linea('Consulta', data.mensaje),
    linea('Llegó desde', data.origen),
  ].filter((l): l is string => l !== null);
}

export function buildBookingMessage(data: Partial<BookingData>): string {
  return ['Hola, quiero agendar una cita en Clínica Angular.', '', ...resumen(data)].join('\n');
}

export function buildBookingUrl(data: Partial<BookingData>): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildBookingMessage(data))}`;
}

/** De dónde llegó el paciente: primero el `?servicio=` de la página de padecimiento, luego el referente. */
export function origen(search: string, referrer: string): string {
  const servicio = new URLSearchParams(search).get('servicio');
  if (servicio) return servicio;
  return referrer || 'directo';
}
