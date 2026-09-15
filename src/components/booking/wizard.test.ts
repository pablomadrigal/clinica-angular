import { describe, expect, it } from 'vitest';
import { anterior, buildBookingMessage, buildBookingUrl, origen, resumen, siguiente, validateStep } from './wizard';

const HOY = new Date(2026, 8, 15); // 15 de setiembre de 2026

describe('validación por paso', () => {
  it('no deja pasar del primer paso sin servicio', () => {
    expect(validateStep('servicio', {}, HOY)).toHaveProperty('servicio');
    expect(validateStep('servicio', { servicio: 'pie-diabetico' }, HOY)).toEqual({});
  });

  it('el profesional es opcional', () => {
    expect(validateStep('profesional', {}, HOY)).toEqual({});
  });

  it('rechaza una fecha que ya pasó', () => {
    expect(validateStep('fecha', { fecha: '2026-09-14', hora: '9:00 am' }, HOY)).toHaveProperty('fecha');
    expect(validateStep('fecha', { fecha: '2026-09-15', hora: '9:00 am' }, HOY)).toEqual({});
    expect(validateStep('fecha', { fecha: '2026-12-01', hora: '9:00 am' }, HOY)).toEqual({});
  });

  it('pide hora además de fecha', () => {
    expect(validateStep('fecha', { fecha: '2026-12-01' }, HOY)).toHaveProperty('hora');
  });

  it('exige nombre, correo, celular de 8 dígitos y consentimiento', () => {
    const errores = validateStep('datos', { nombre: 'A', email: 'no-es-correo', celular: '8305 6444' }, HOY);
    expect(Object.keys(errores).sort()).toEqual(['celular', 'consentimiento', 'email', 'nombre']);
    expect(
      validateStep('datos', { nombre: 'Ana Mora', email: 'ana@ejemplo.cr', celular: '83056444', consentimiento: true }, HOY),
    ).toEqual({});
  });
});

describe('navegación', () => {
  it('avanza hasta la confirmación y no más allá', () => {
    expect(siguiente('servicio')).toBe('profesional');
    expect(siguiente('datos')).toBe('confirmacion');
  });

  it('retrocede sin salirse del primer paso', () => {
    expect(anterior('profesional')).toBe('servicio');
    expect(anterior('servicio')).toBe('servicio');
  });
});

describe('resumen y envío', () => {
  const cita = {
    servicio: 'pie-diabetico',
    servicioLabel: 'Pie diabético',
    sede: 'Guadalupe, San José',
    fecha: '2026-09-20',
    hora: '10:00 am',
    nombre: 'Ana Mora',
    email: 'ana@ejemplo.cr',
    celular: '83056444',
    mensaje: '',
    consentimiento: true,
  };

  it('omite los campos vacíos en vez de mandar líneas huérfanas', () => {
    const lineas = resumen(cita);
    expect(lineas.some((l) => l.startsWith('Consulta'))).toBe(false);
    expect(lineas.some((l) => l.startsWith('Profesional'))).toBe(false);
  });

  it('prefiere la etiqueta legible del servicio al slug', () => {
    expect(resumen(cita)[0]).toBe('Servicio: Pie diabético');
  });

  it('arma un enlace de WhatsApp con el resumen codificado', () => {
    const url = buildBookingUrl(cita);
    expect(url.startsWith('https://wa.me/50683056444?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(buildBookingMessage(cita));
    expect(buildBookingMessage(cita)).toContain('Fecha: 2026-09-20 10:00 am');
  });
});

describe('origen del paciente', () => {
  it('usa el servicio del enlace de la página de padecimiento', () => {
    expect(origen('?servicio=onicomicosis', 'https://google.com')).toBe('onicomicosis');
  });

  it('cae al referente y, sin él, a "directo"', () => {
    expect(origen('', 'https://google.com')).toBe('https://google.com');
    expect(origen('', '')).toBe('directo');
  });
});
