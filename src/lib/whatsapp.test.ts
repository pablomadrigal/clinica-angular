import { describe, expect, it } from 'vitest';
import { CHAT_URL, WHATSAPP_NUMBER, buildAppointmentMessage, buildAppointmentUrl } from './whatsapp';

const fields = { name: 'Ana Mora', email: 'ana@example.com', phone: '8888-1234', message: 'Quiero cita de podología' };

describe('whatsapp', () => {
  it('usa el número de la clínica', () => {
    expect(WHATSAPP_NUMBER).toBe('50683056444');
    expect(CHAT_URL).toBe('https://api.whatsapp.com/send/?phone=50683056444&text&type=phone_number&app_absent=0');
  });

  it('arma el mensaje con todos los campos en líneas separadas', () => {
    expect(buildAppointmentMessage(fields)).toBe(
      'Hola, quiero agendar una cita.\nNombre: Ana Mora\nCorreo: ana@example.com\nTeléfono: 8888-1234\nMensaje: Quiero cita de podología',
    );
  });

  it('omite líneas de campos vacíos', () => {
    expect(buildAppointmentMessage({ ...fields, email: '', message: '  ' })).toBe(
      'Hola, quiero agendar una cita.\nNombre: Ana Mora\nTeléfono: 8888-1234',
    );
  });

  it('genera la URL wa.me codificada', () => {
    const url = buildAppointmentUrl(fields);
    expect(url.startsWith('https://wa.me/50683056444?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(buildAppointmentMessage(fields));
    expect(url).not.toContain('\n');
  });
});
