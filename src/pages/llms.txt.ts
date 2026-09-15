import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../data/site';

// `llms.txt` del rediseño. Se genera desde las colecciones en vez de mantenerse a mano: así no
// queda listando rutas que ya no existen (que es justo lo que le pasó al archivo del entregable).
export const GET: APIRoute = async () => {
  const servicios = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
  const padecimientos = (await getCollection('conditions')).sort((a, b) => a.data.order - b.data.order);

  const lineas = [
    `# ${site.name}`,
    '> Clínica de podología clínica, tratamiento avanzado de heridas, fisioterapia, psicología',
    '> clínica y medicina general en Guadalupe, San José, Costa Rica.',
    '',
    '## Especialidades',
    ...servicios.map((s) => `- ${s.data.card.label}: /${s.data.slug}/`),
    '',
  ];

  if (padecimientos.length > 0) {
    lineas.push('## Padecimientos de podología', ...padecimientos.map((c) => `- ${c.data.title}: /${c.data.slug}/`), '');
  }

  lineas.push(
    '## Páginas clave',
    '- Nuestra Clínica: /nuestra-clinica/',
    '- Nuestros Especialistas: /nuestros-especialistas/',
    '- Tecnologías: /tecnologias/',
    '- Instalaciones: /instalaciones/',
    '- Agendar cita: /contactenos/',
    '',
    '## Contacto',
    `Teléfono: ${site.phoneIntl}`,
    `WhatsApp: ${site.whatsappIntl}`,
    `Correo: ${site.email}`,
    site.addresses.home,
    ...site.hoursLong,
    '',
    '## Nota',
    'El contenido clínico lo revisa el equipo profesional de la clínica. El sitio no sustituye',
    'una valoración presencial.',
  );

  return new Response(lineas.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
