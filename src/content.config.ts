import { defineCollection } from 'astro:content';
import type { ImageFunction } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada string de `paragraphs` es un <p>. Las que empiezan con "✓" se pintan como ítem de lista.
const paragraphs = z.array(z.string());

// La imagen `escleroterapia-scaled-1.jpg` da 404 en el sitio original y no se descargó;
// por eso `card.image` y la imagen de `condition` son opcionales (se omiten solo en escleroterapia.yaml).
const sectionSchema = (image: ImageFunction) =>
  z.discriminatedUnion('type', [
    // Padecimiento: título grande + imagen + subtítulo "- X -" + párrafos + CHAT DIRECTO
    z.object({
      type: z.literal('condition'),
      heading: z.string(),
      image: image().optional(),
      subheading: z.string().optional(),
      body: paragraphs.default([]),
      imageSide: z.enum(['left', 'right']).default('left'),
      showChat: z.boolean().default(true),
    }),
    // Tarjetas de tratamiento: título h3 + párrafos, seguidas de "Agendar cita"
    z.object({
      type: z.literal('treatments'),
      heading: z.string().optional(),
      items: z.array(z.object({ title: z.string(), body: paragraphs.default([]) })),
      showAppointment: z.boolean().default(true),
    }),
    // Tema: título h2 + imagen opcional + ítems (título opcional + párrafos) + "Agendar cita" opcional
    z.object({
      type: z.literal('topics'),
      heading: z.string().optional(),
      image: image().optional(),
      imageSide: z.enum(['left', 'right']).default('left'),
      items: z.array(z.object({ title: z.string().optional(), body: paragraphs.default([]) })),
      showAppointment: z.boolean().default(false),
      showChat: z.boolean().default(false),
    }),
  ]);

export type ServiceSection = z.infer<ReturnType<typeof sectionSchema>>;

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '*.yaml' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(), // encabezado de la página, tal cual (mayúsculas incluidas)
      slug: z.string(), // ruta sin barras: "especialidades/podologia" o "fisioterapia"
      menuLabel: z.string(),
      inMenu: z.boolean().default(true),
      order: z.number(),
      seoTitle: z.string(),
      card: z.object({ label: z.string(), image: image().optional() }),
      // Encabezado "Padecimientos y Tratamientos" + botón CHAT DIRECTO bajo el título
      showTreatmentsHeader: z.boolean().default(false),
      // Imagen grande bajo el título (Fisioterapia, Estética)
      heroImage: image().optional(),
      showChatAfterHero: z.boolean().default(false),
      sections: z.array(sectionSchema(image)),
      related: z.array(z.string()).default([]), // ids de otros servicios para "Ver más especialidades"
      showBackHome: z.boolean().default(true),
    }),
});

const specialists = defineCollection({
  loader: glob({ base: './src/content/specialists', pattern: '*.yaml' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      shortName: z.string().optional(), // nombre corto para el home
      role: z.string(),
      code: z.string().optional(), // línea "Código: …" tal cual
      photo: image(),
      profileTitle: z.string().default('Perfil Profesional'),
      profile: z.array(z.string()),
      group: z.enum(['clinico', 'administrativo']),
      order: z.number(),
      featured: z.boolean().default(false), // aparece en "Nuestro Equipo" del home
      featuredRole: z.string().optional(), // etiqueta corta en el home (Podología, Psicología, Fisioterapia)
    }),
});

export const collections = { services, specialists };
