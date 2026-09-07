export const WHATSAPP_NUMBER = '50683056444';
export const CHAT_URL = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text&type=phone_number&app_absent=0`;

export interface AppointmentFields {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function buildAppointmentMessage(f: AppointmentFields): string {
  const lines = ['Hola, quiero agendar una cita.'];
  const push = (label: string, value: string) => {
    const v = value.trim();
    if (v) lines.push(`${label}: ${v}`);
  };
  push('Nombre', f.name);
  push('Correo', f.email);
  push('Teléfono', f.phone);
  push('Mensaje', f.message);
  return lines.join('\n');
}

export function buildAppointmentUrl(f: AppointmentFields): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildAppointmentMessage(f))}`;
}
