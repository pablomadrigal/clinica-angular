import { describe, expect, it, vi } from 'vitest';
import { initMotion } from './motion';

function fakeRoot(selectores: Record<string, unknown[]> = {}): ParentNode {
  return {
    querySelector: (s: string) => (selectores[s]?.[0] ?? null),
    querySelectorAll: (s: string) => (selectores[s] ?? []),
  } as unknown as ParentNode;
}

const gsap = () => ({ registerPlugin: vi.fn(), fromTo: vi.fn() });

describe('initMotion', () => {
  it('no carga GSAP si el usuario pidió menos movimiento', async () => {
    const load = vi.fn();
    expect(await initMotion({ reducedMotion: true, load, root: fakeRoot() })).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });

  it('si GSAP no carga, no revienta la página', async () => {
    const load = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await initMotion({ reducedMotion: false, load, root: fakeRoot() })).toBe(false);
  });

  it('anima el hero, las imágenes de sección y los bloques marcados', async () => {
    const g = gsap();
    const root = fakeRoot({
      '[data-parallax] img': ['hero'],
      '[data-reveal-media] img': ['img1', 'img2'],
      '[data-animate]': ['bloque'],
    });
    const ok = await initMotion({
      reducedMotion: false,
      load: async () => ({ gsap: g, ScrollTrigger: {} }),
      root,
    });
    expect(ok).toBe(true);
    expect(g.registerPlugin).toHaveBeenCalledOnce();
    expect(g.fromTo).toHaveBeenCalledTimes(4);
  });

  it('un bloque que aparece arranca en opacidad 0 y termina en 1', async () => {
    const g = gsap();
    await initMotion({
      reducedMotion: false,
      load: async () => ({ gsap: g, ScrollTrigger: {} }),
      root: fakeRoot({ '[data-animate]': ['bloque'] }),
    });
    const [, desde, hasta] = g.fromTo.mock.calls[0];
    expect(desde).toMatchObject({ opacity: 0 });
    expect(hasta).toMatchObject({ opacity: 1 });
  });
});
