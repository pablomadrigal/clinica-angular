// Lógica del blog ("Centro de Conocimiento") separada de las plantillas .astro para poder
// probarla sin renderizar: lo que de verdad se puede romper es publicar un borrador o
// mostrar los artículos en el orden equivocado.

/** Forma mínima de una entrada de `posts`; `CollectionEntry<'posts'>` la cumple. */
export interface PostLike {
  data: { date: Date; draft: boolean };
}

/** Descarta los borradores y ordena del más reciente al más viejo. No muta el arreglo. */
export function publishedPosts<T extends PostLike>(entries: T[]): T[] {
  return entries
    .filter((e) => !e.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Fecha legible en español: "12 de marzo de 2026". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/** Etiquetas de nivel de evidencia y sus tokens de color (fondo claro + texto del mismo tono). */
export const EVIDENCE = {
  strong: { label: 'Evidencia sólida', class: 'bg-evidence-strong-bg text-evidence-strong' },
  mixed: { label: 'Evidencia mixta', class: 'bg-evidence-mixed-bg text-evidence-mixed' },
  clinical: { label: 'Manejo clínico', class: 'bg-evidence-clinical-bg text-evidence-clinical' },
} as const;

export type EvidenceLevel = keyof typeof EVIDENCE;
