// Parallax y apariciones suaves con GSAP. Reglas:
// - Sin GSAP (falla la carga) o con "reducir movimiento", la página se ve COMPLETA y estática.
//   Nada empieza en opacidad 0 desde el CSS: la animación parte de un estado ya visible.
// - GSAP se carga de forma diferida, así el HTML del sitio no arrastra la librería si no hace falta.

export interface MotionEnv {
  reducedMotion: boolean;
  load: () => Promise<{ gsap: GsapLike; ScrollTrigger: unknown }>;
  root: ParentNode;
}

interface GsapLike {
  registerPlugin: (plugin: unknown) => void;
  fromTo: (target: unknown, from: object, to: object) => void;
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Devuelve `true` si llegó a animar; `false` si decidió (o tuvo que) dejar la página quieta. */
export async function initMotion(env: MotionEnv): Promise<boolean> {
  if (env.reducedMotion) return false;

  let gsap: GsapLike;
  let ScrollTrigger: unknown;
  try {
    ({ gsap, ScrollTrigger } = await env.load());
  } catch {
    return false;
  }
  gsap.registerPlugin(ScrollTrigger);

  const hero = env.root.querySelector('[data-parallax] img');
  if (hero) {
    gsap.fromTo(
      hero,
      { scale: 1.08, yPercent: -4 },
      { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } },
    );
  }

  for (const media of env.root.querySelectorAll('[data-reveal-media] img')) {
    gsap.fromTo(
      media,
      { scale: 1.12 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: media, start: 'top 85%', end: 'bottom 30%', scrub: 0.8 } },
    );
  }

  for (const el of env.root.querySelectorAll('[data-animate]')) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } },
    );
  }

  return true;
}
