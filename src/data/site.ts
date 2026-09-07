export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const site = {
  name: 'Clínica Angular',
  url: 'https://angular.cr',
  phone: '2253-8303',
  phoneIntl: '+(506) 2253-8303',
  phoneHref: 'tel:+50622538303',
  whatsapp: '8305-6444',
  whatsappIntl: '+(506) 8305-6444',
  email: 'info@angular.cr',
  hours: ['Lunes a Viernes : 9 am a 5 pm', 'Sábado: 9 am a 1 pm', 'Domingo: Cerrado'],
  hoursLong: ['Lunes a Viernes : 9:00 am – 5:00 pm', 'Sábado: 9:00 am a 1:00 pm', 'Domingo: Cerrado'],
  social: {
    facebook: 'https://www.facebook.com/AngularClinica',
    instagram: 'https://www.instagram.com/clinica_angular',
    tiktok: 'https://www.tiktok.com/@clinicadelpieangular',
  },
  addresses: {
    home: '75m Oeste del Estadio Colleya Fonseca, Guadalupe, San José, Costa Rica.',
    empresa: '75 mts oeste del Estadio Colleya Fonseca, Guadalupe, Goicoechea, San José, Costa Rica.',
    especialidades: 'Edificio sur de la Clínica Católica, Oficentro Centauro Guadalupe, San José, Costa Rica.',
    contacto: 'Guadalupe, Del Estadio Coyella Fonseca 75m Oeste',
    contactoLargo: 'Edificio sur del Hospital Internacional La Católica, Guadalupe, San José, Costa Rica.',
    kLaser: '75 mts oeste del Estadio Colleya Fonseca, Guadalupe, Goicoechea, San José, Costa Rica.',
    laserPion: 'Edificio sur del Hospital Internacional La Católica, Guadalupe, San José, Costa Rica.',
    especialistas: '75 mts oeste del Estadio Colleya Fonseca, Guadalupe, Goicoechea, San José, Costa Rica.',
    footer: ['Clínica Angular,', 'Guadalupe, San José.'],
  },
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Angular%20Cl%C3%ADnica%20del%20Pie%2C%20guadalupe%2C%20san%20jos%C3%A9%2C%20costa%20rica&t=m&z=15&output=embed&iwloc=near',
  copyright: '© Copyright Pablo Madrigal 2024. All rights reserved.',
} as const;

// El submenú de "Especialidades" se rellena en Header.astro desde la colección `services`.
export const nav: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Nuestra Empresa', href: '/nuestra-empresa/' },
  { label: 'Especialidades', href: '/especialidades/', children: [] },
  { label: 'Nuestros Especialistas', href: '/nuestros-especialistas/' },
  { label: 'Nuestros Beneficios', href: '/nuestros-beneficios/' },
  {
    label: 'Tecnología',
    href: '#',
    children: [
      { label: 'K-laser', href: '/k-laser/' },
      { label: 'Láser Pion', href: '/laser-pion/' },
    ],
  },
  { label: 'Contáctenos', href: '/contactenos/' },
];
