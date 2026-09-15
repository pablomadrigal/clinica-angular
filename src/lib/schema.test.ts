import { describe, expect, it } from 'vitest';
import { breadcrumb, clinicGraph, faqPage, graph, medicalWebPage } from './schema';

describe('schema.org', () => {
  it('numera las migas desde 1 y las vuelve absolutas', () => {
    const b = breadcrumb([
      { name: 'Inicio', url: '/' },
      { name: 'Podología', url: '/especialidades/podologia/' },
    ]);
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item).toBe('https://angular.cr/especialidades/podologia/');
  });

  it('no inventa un FAQPage cuando no hay preguntas', () => {
    expect(faqPage([])).toBeNull();
    expect(faqPage([{ question: '¿Duele?', answer: 'No.' }])).not.toBeNull();
  });

  it('la página médica apunta a la ficha de la clínica', () => {
    const p = medicalWebPage({ name: 'Uña incarnada', description: 'x', url: '/una-incarnada/' });
    expect(p.about['@id']).toBe(clinicGraph()[0]['@id']);
  });

  it('el grafo descarta los nodos ausentes', () => {
    const json = JSON.parse(graph([{ '@type': 'A' }, null, faqPage([])]));
    expect(json['@graph']).toHaveLength(1);
    expect(json['@context']).toBe('https://schema.org');
  });
});
