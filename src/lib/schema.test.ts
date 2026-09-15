import { describe, expect, it } from 'vitest';
import { blogPosting, breadcrumb, clinicGraph, faqPage, graph, medicalWebPage } from './schema';

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

  it('el artículo del blog lleva fecha ISO y atribuye a la clínica', () => {
    const p = blogPosting({ title: 'Hongos', description: 'x', url: '/blog/hongos/', date: new Date('2026-03-12') });
    expect(p.datePublished).toBe('2026-03-12');
    expect(p.url).toBe('https://angular.cr/blog/hongos/');
    expect(p.author['@id']).toBe(clinicGraph()[0]['@id']);
  });

  it('el artículo sin portada no declara una imagen vacía', () => {
    const sin = blogPosting({ title: 'a', description: 'b', url: '/blog/a/', date: new Date('2026-01-01') });
    expect('image' in sin).toBe(false);
    const con = blogPosting({ title: 'a', description: 'b', url: '/blog/a/', date: new Date('2026-01-01'), image: '/_astro/portada.jpg' });
    expect(con.image).toBe('https://angular.cr/_astro/portada.jpg');
  });

  it('el grafo descarta los nodos ausentes', () => {
    const json = JSON.parse(graph([{ '@type': 'A' }, null, faqPage([])]));
    expect(json['@graph']).toHaveLength(1);
    expect(json['@context']).toBe('https://schema.org');
  });
});
