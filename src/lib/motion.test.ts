import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initParallax, prefersReducedMotion } from './motion';

function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({ matches: reduce && query.includes('reduce') }),
  });
}

function fakeGsap() {
  return {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
  };
}

describe('motion', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('detecta la preferencia de movimiento reducido', () => {
    stubMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
    stubMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('no anima nada si el usuario pidió movimiento reducido', () => {
    stubMatchMedia(true);
    vi.stubGlobal('document', { querySelectorAll: () => [] });
    const g = fakeGsap();
    initParallax(g);
    expect(g.registerPlugin).not.toHaveBeenCalled();
    expect(g.fromTo).not.toHaveBeenCalled();
  });

  it('anima un elemento por cada [data-parallax] cuando el movimiento está permitido', () => {
    stubMatchMedia(false);
    const nodes = [{ id: 'a' }, { id: 'b' }];
    vi.stubGlobal('document', { querySelectorAll: vi.fn(() => nodes) });
    const g = fakeGsap();
    initParallax(g);
    expect(g.registerPlugin).toHaveBeenCalledTimes(1);
    expect(g.fromTo).toHaveBeenCalledTimes(2);
  });

  it('no falla si no hay elementos con [data-parallax]', () => {
    stubMatchMedia(false);
    vi.stubGlobal('document', { querySelectorAll: () => [] });
    const g = fakeGsap();
    expect(() => initParallax(g)).not.toThrow();
    expect(g.fromTo).not.toHaveBeenCalled();
  });
});
