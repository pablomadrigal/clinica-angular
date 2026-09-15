// Apariciones al hacer scroll, con IntersectionObserver y transiciones CSS.
//
// Por qué NO con GSAP/ScrollTrigger, que es lo que pedía el entregable: el efecto arranca
// poniendo el bloque en opacidad 0, así que si el disparador no corre el contenido queda
// invisible para siempre. Eso pasó de verdad en las páginas de padecimiento (ScrollTrigger
// aplicaba el estado inicial y nunca avanzaba), y es un modo de fallo inaceptable para un
// sitio de salud. IntersectionObserver garantiza una primera llamada para cada elemento
// observado en el siguiente cuadro, esté o no a la vista, así que lo que está en pantalla se
// revela sí o sí.
//
// Además, el estado oculto lo aplica una clase que pone este script (`motion-ready`): sin
// JavaScript, o con "reducir movimiento", el CSS nunca esconde nada.

export interface MotionEnv {
  reducedMotion: boolean;
  root: ParentNode;
  /** El documento al que se le marca `motion-ready`; separado para poder probarlo. */
  flag: { classList: { add: (c: string) => void } };
  observe: (onEnter: (el: Element) => void) => { observe: (el: Element) => void };
}

export const SELECTORES = '[data-animate], [data-reveal-media]';

/** Devuelve cuántos elementos quedaron a cargo del observador (0 = página estática). */
export function initMotion(env: MotionEnv): number {
  const elementos = [...env.root.querySelectorAll(SELECTORES)];
  if (env.reducedMotion || elementos.length === 0) return 0;

  env.flag.classList.add('motion-ready');
  const observador = env.observe((el) => el.classList.add('is-visible'));
  for (const el of elementos) observador.observe(el);
  return elementos.length;
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Observador real del navegador: revela al entrar y deja de mirar el elemento. */
export function browserObserver(onEnter: (el: Element) => void): IntersectionObserver {
  return new IntersectionObserver(
    (entradas, obs) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        onEnter(e.target);
        obs.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
}
