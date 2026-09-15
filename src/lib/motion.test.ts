import { describe, expect, it, vi } from 'vitest';
import { initMotion, SELECTORES } from './motion';

function entorno(elementos: Element[], reducedMotion = false) {
  const flag = { classList: { add: vi.fn() } };
  const observados: Element[] = [];
  let disparar: (el: Element) => void = () => {};
  const env = {
    reducedMotion,
    flag,
    root: { querySelectorAll: (s: string) => (s === SELECTORES ? elementos : []) } as unknown as ParentNode,
    observe: (onEnter: (el: Element) => void) => {
      disparar = onEnter;
      return { observe: (el: Element) => observados.push(el) };
    },
  };
  return { env, flag, observados, entrar: (el: Element) => disparar(el) };
}

const bloque = () => ({ classList: { add: vi.fn() } }) as unknown as Element;

describe('initMotion', () => {
  it('con "reducir movimiento" no esconde nada ni observa nada', () => {
    const { env, flag, observados } = entorno([bloque(), bloque()], true);
    expect(initMotion(env)).toBe(0);
    expect(flag.classList.add).not.toHaveBeenCalled();
    expect(observados).toHaveLength(0);
  });

  it('solo marca la página como animable si hay algo que animar', () => {
    const { env, flag } = entorno([]);
    expect(initMotion(env)).toBe(0);
    expect(flag.classList.add).not.toHaveBeenCalled();
  });

  it('esconde solo después de tomar el control, y observa cada bloque', () => {
    const elementos = [bloque(), bloque(), bloque()];
    const { env, flag, observados } = entorno(elementos);
    expect(initMotion(env)).toBe(3);
    expect(flag.classList.add).toHaveBeenCalledWith('motion-ready');
    expect(observados).toEqual(elementos);
  });

  it('revela el bloque cuando entra a la vista', () => {
    const el = bloque();
    const { env, entrar } = entorno([el]);
    initMotion(env);
    entrar(el);
    expect(el.classList.add).toHaveBeenCalledWith('is-visible');
  });
});
