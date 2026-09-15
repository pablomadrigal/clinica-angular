// Datos estructurados (schema.org). Se inyectan como un solo <script> por página.
import { site } from '../data/site';

const CLINIC_ID = `${site.url}/#clinica`;

export function clinicGraph() {
  return [
    {
      '@type': 'MedicalClinic',
      '@id': CLINIC_ID,
      name: site.name,
      url: site.url,
      telephone: site.phoneIntl.replace(/[()\s]/g, ''),
      email: site.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Del Estadio Colleya Fonseca, 75 m oeste',
        addressLocality: 'Guadalupe',
        addressRegion: 'San José',
        addressCountry: 'CR',
      },
      medicalSpecialty: ['Podiatric', 'Physiotherapy', 'Psychiatric'],
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:00' },
      ],
      sameAs: Object.values(site.social),
    },
    { '@type': 'WebSite', '@id': `${site.url}/#website`, url: site.url, name: site.name, inLanguage: 'es-CR' },
  ];
}

/** Migas de pan. `items` va de la raíz a la página actual, incluida. */
export function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: new URL(it.url, site.url).href,
    })),
  };
}

/** Solo tiene sentido con preguntas reales: sin ellas devuelve `null` y no se pinta nada. */
export function faqPage(faq: { question: string; answer: string }[]) {
  if (faq.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function medicalWebPage(opts: { name: string; description: string; url: string }) {
  return {
    '@type': 'MedicalWebPage',
    name: opts.name,
    description: opts.description,
    url: new URL(opts.url, site.url).href,
    inLanguage: 'es-CR',
    about: { '@id': CLINIC_ID },
  };
}

export function graph(nodes: unknown[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
}
