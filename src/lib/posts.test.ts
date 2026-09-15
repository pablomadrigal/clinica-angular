import { describe, expect, it } from 'vitest';
import { EVIDENCE, formatDate, publishedPosts } from './posts';

const post = (id: string, date: string, draft = false) => ({ id, data: { date: new Date(date), draft } });

describe('publishedPosts', () => {
  it('no publica los borradores', () => {
    const entries = [post('a', '2026-01-01'), post('b', '2026-02-01', true)];
    expect(publishedPosts(entries).map((e) => e.id)).toEqual(['a']);
  });

  it('ordena del más reciente al más viejo', () => {
    const entries = [post('viejo', '2025-03-10'), post('nuevo', '2026-08-01'), post('medio', '2026-01-15')];
    expect(publishedPosts(entries).map((e) => e.id)).toEqual(['nuevo', 'medio', 'viejo']);
  });

  it('no muta el arreglo original', () => {
    const entries = [post('a', '2025-01-01'), post('b', '2026-01-01')];
    publishedPosts(entries);
    expect(entries.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('con la colección vacía devuelve vacío en vez de reventar', () => {
    expect(publishedPosts([])).toEqual([]);
  });
});

describe('formatDate', () => {
  it('escribe la fecha en español sin correrla de día por la zona horaria', () => {
    expect(formatDate(new Date('2026-03-12'))).toBe('12 de marzo de 2026');
  });
});

describe('EVIDENCE', () => {
  it('cubre los tres niveles del esquema con su etiqueta', () => {
    expect(Object.keys(EVIDENCE)).toEqual(['strong', 'mixed', 'clinical']);
    expect(EVIDENCE.clinical.label).toBe('Manejo clínico');
  });
});
