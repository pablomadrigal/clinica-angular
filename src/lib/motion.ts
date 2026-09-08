// Parallax sutil del diseño de agosto. La animación es decorativa: si el usuario pidió
// movimiento reducido (WCAG 2.2, criterio 2.3.3), no se inicializa nada y la página se ve
// completa y estática. `initParallax` recibe GSAP por parámetro para poder probarla sin
// cargar la librería.

export interface GsapLike {
  registerPlugin: (...plugins: unknown[]) => void;
  fromTo: (target: unknown, from: object, to: object) => unknown;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initParallax(gsapLike: GsapLike, scrollTrigger?: unknown): void {
  if (prefersReducedMotion()) return;

  const targets = Array.from(document.querySelectorAll('[data-parallax]'));
  if (targets.length === 0) return;

  gsapLike.registerPlugin(scrollTrigger);

  for (const el of targets) {
    gsapLike.fromTo(
      el,
      { scale: 1.08, yPercent: -4 },
      {
        scale: 1,
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    );
  }
}
