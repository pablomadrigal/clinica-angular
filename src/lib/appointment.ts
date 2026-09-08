// Asistente de agenda de 5 pasos. No hay backend: al terminar se abre WhatsApp con el
// resumen para que el equipo coordine la cita. La validación vive acá, separada del
// componente, para poder probarla sin navegador.
import { WHATSAPP_NUMBER } from './whatsapp';

export interface WizardData {
  servicio: string;
  profesional: string;
  sede: string;
  fecha: string;
  hora: string;
  nombre: string;
  email: string;
  celular: string;
  mensaje: string;
  consentimiento: boolean;
  origen: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;

export interface FieldError {
  field: keyof WizardData;
  message: string;
}

export const STEP_FIELDS: Record<Step, Array<keyof WizardData>> = {
  1: ['servicio'],
  2: ['profesional'],
  3: ['sede'],
  4: ['fecha', 'hora'],
  5: ['nombre', 'email', 'celular', 'mensaje', 'consentimiento'],
};

const isBlank = (v: unknown): boolean => typeof v !== 'string' || v.trim() === '';

// Compara solo la parte de fecha, para que "hoy" siga siendo válido a cualquier hora.
function isPastDate(value: string, today: Date): boolean {
  const limit = today.toISOString().slice(0, 10);
  return value < limit;
}

export function validateStep(step: Step, data: Partial<WizardData>, today: Date = new Date()): FieldError[] {
  const errors: FieldError[] = [];
  const add = (field: keyof WizardData, message: string) => errors.push({ field, message });

  if (step === 1 && isBlank(data.servicio)) {
    add('servicio', 'Elegí un servicio para continuar.');
  }

  // Paso 2: el profesional es opcional a propósito — el equipo asigna según disponibilidad.

  if (step === 3 && isBlank(data.sede)) {
    add('sede', 'Elegí la sede donde querés que te atiendan.');
  }

  if (step === 4) {
    if (isBlank(data.fecha)) add('fecha', 'Elegí una fecha preferida.');
    else if (isPastDate(data.fecha!, today)) add('fecha', 'Elegí una fecha de hoy en adelante.');
    if (isBlank(data.hora)) add('hora', 'Elegí un horario preferido.');
  }

  if (step === 5) {
    if (isBlank(data.nombre) || data.nombre!.trim().length < 2) {
      add('nombre', 'Ingresá tu nombre (mínimo 2 caracteres).');
    }
    if (isBlank(data.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email!.trim())) {
      add('email', 'Ingresá un correo válido.');
    }
    if (isBlank(data.celular) || !/^\d{8}$/.test(data.celular!.trim())) {
      add('celular', 'Ingresá un celular de 8 dígitos, sin espacios ni guiones.');
    }
    if (data.consentimiento !== true) {
      add('consentimiento', 'Necesitamos tu autorización para tratar tus datos y gestionar la cita.');
    }
  }

  return errors;
}

export function buildWizardMessage(data: WizardData): string {
  const lines = ['Hola, quiero agendar una cita.'];
  const push = (label: string, value: string) => {
    const v = (value ?? '').trim();
    if (v) lines.push(`${label}: ${v}`);
  };
  push('Servicio', data.servicio);
  push('Profesional', data.profesional);
  push('Sede', data.sede);
  push('Fecha', data.fecha);
  push('Hora', data.hora);
  push('Nombre', data.nombre);
  push('Correo', data.email);
  push('Celular', data.celular);
  push('Mensaje', data.mensaje);
  // `origen` queda fuera a propósito: sirve para saber de qué página vino la consulta,
  // no es información que el paciente tenga que ver en su propio mensaje.
  return lines.join('\n');
}

export function buildWizardUrl(data: WizardData): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWizardMessage(data))}`;
}
