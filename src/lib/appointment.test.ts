import { describe, expect, it } from 'vitest';
import { buildWizardMessage, buildWizardUrl, validateStep, type WizardData } from './appointment';

const full: WizardData = {
  servicio: 'Podología',
  profesional: 'Dr. Marvin Madrigal Chaves',
  sede: 'Guadalupe, San José (sede principal)',
  fecha: '2026-09-15',
  hora: '10:00 am',
  nombre: 'Ana Mora',
  email: 'ana@example.com',
  celular: '88881234',
  mensaje: 'Uña dolorosa hace dos semanas',
  consentimiento: true,
  origen: '/hongos-unas-onicomicosis/',
};

// Se construye con componentes locales, no con una cadena UTC: así la prueba da igual
// en cualquier zona horaria donde corra la suite.
const hoy = new Date(2026, 8, 8, 12, 0, 0);

describe('validateStep', () => {
  it('paso 1 exige servicio', () => {
    expect(validateStep(1, { servicio: '' })).toEqual([
      { field: 'servicio', message: 'Elegí un servicio para continuar.' },
    ]);
    expect(validateStep(1, { servicio: 'Podología' })).toEqual([]);
  });

  it('paso 2 no exige nada: el profesional es opcional', () => {
    expect(validateStep(2, {})).toEqual([]);
  });

  it('paso 3 exige sede', () => {
    expect(validateStep(3, { sede: '' })).toHaveLength(1);
    expect(validateStep(3, { sede: 'Guadalupe, San José (sede principal)' })).toEqual([]);
  });

  it('paso 4 exige fecha y hora', () => {
    expect(validateStep(4, { fecha: '', hora: '' }, hoy)).toHaveLength(2);
    expect(validateStep(4, { fecha: '2026-09-15', hora: '10:00 am' }, hoy)).toEqual([]);
  });

  it('paso 4 rechaza una fecha pasada', () => {
    expect(validateStep(4, { fecha: '2026-09-07', hora: '10:00 am' }, hoy)).toEqual([
      { field: 'fecha', message: 'Elegí una fecha de hoy en adelante.' },
    ]);
  });

  it('paso 4 acepta la fecha de hoy', () => {
    expect(validateStep(4, { fecha: '2026-09-08', hora: '10:00 am' }, hoy)).toEqual([]);
  });

  it('paso 4 acepta hoy también de noche, cuando en UTC ya es mañana', () => {
    // Costa Rica es UTC-6: a las 7 de la noche del 8, en UTC ya son las 1 del 9.
    // Calcular el límite con `toISOString()` rechazaría "hoy" durante esas horas.
    const nocheEnCostaRica = new Date(2026, 8, 8, 19, 0, 0);
    expect(validateStep(4, { fecha: '2026-09-08', hora: '4:00 pm' }, nocheEnCostaRica)).toEqual([]);
  });

  it('paso 5 valida nombre, correo, celular y consentimiento', () => {
    const errors = validateStep(5, { nombre: 'A', email: 'no-es-correo', celular: '123', consentimiento: false });
    expect(errors.map((e) => e.field)).toEqual(['nombre', 'email', 'celular', 'consentimiento']);
  });

  it('paso 5 exige exactamente 8 dígitos de celular', () => {
    const base = { nombre: 'Ana Mora', email: 'ana@example.com', consentimiento: true };
    expect(validateStep(5, { ...base, celular: '88881234' })).toEqual([]);
    expect(validateStep(5, { ...base, celular: '888812345' })).toHaveLength(1);
    expect(validateStep(5, { ...base, celular: '8888-1234' })).toHaveLength(1);
  });

  it('paso 5 pasa con datos completos', () => {
    expect(validateStep(5, full)).toEqual([]);
  });
});

describe('buildWizardMessage', () => {
  it('arma el mensaje con una línea por campo', () => {
    expect(buildWizardMessage(full)).toBe(
      [
        'Hola, quiero agendar una cita.',
        'Servicio: Podología',
        'Profesional: Dr. Marvin Madrigal Chaves',
        'Sede: Guadalupe, San José (sede principal)',
        'Fecha: 2026-09-15',
        'Hora: 10:00 am',
        'Nombre: Ana Mora',
        'Correo: ana@example.com',
        'Celular: 88881234',
        'Mensaje: Uña dolorosa hace dos semanas',
      ].join('\n'),
    );
  });

  it('omite los campos opcionales vacíos', () => {
    const msg = buildWizardMessage({ ...full, profesional: '', mensaje: '   ' });
    expect(msg).not.toContain('Profesional:');
    expect(msg).not.toContain('Mensaje:');
    expect(msg).toContain('Servicio: Podología');
  });

  it('no incluye el origen: es para analítica, no para el paciente', () => {
    expect(buildWizardMessage(full)).not.toContain('/hongos-unas-onicomicosis/');
  });
});

describe('buildWizardUrl', () => {
  it('genera una URL wa.me codificada al número de la clínica', () => {
    const url = buildWizardUrl(full);
    expect(url.startsWith('https://wa.me/50683056444?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(buildWizardMessage(full));
    expect(url).not.toContain('\n');
  });
});
