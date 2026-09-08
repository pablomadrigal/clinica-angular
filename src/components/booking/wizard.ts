// Navegación entre pasos del asistente. La validación y el armado del mensaje viven en
// src/lib/appointment.ts, que sí tiene pruebas; acá solo queda el manejo del DOM.
import { STEP_FIELDS, buildWizardUrl, validateStep, type Step, type WizardData } from '../../lib/appointment';

export function initWizard(): void {
  const form = document.getElementById('booking-form') as HTMLFormElement | null;
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-wizard-status]')!;
  const panels = form.querySelectorAll<HTMLElement>('[data-panel]');
  const pills = form.querySelectorAll<HTMLElement>('.step-pill');

  function readData(): WizardData {
    const value = (name: string) => form!.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? '';
    return {
      servicio: value('servicio'),
      profesional: value('profesional'),
      sede: value('sede'),
      fecha: value('fecha'),
      hora: value('hora'),
      nombre: value('nombre'),
      email: value('email'),
      celular: value('celular'),
      mensaje: value('mensaje'),
      consentimiento: form!.querySelector<HTMLInputElement>('[name="consentimiento"]')?.checked ?? false,
    };
  }

  function clearErrors(step: Step): void {
    for (const field of STEP_FIELDS[step]) {
      const el = form!.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      if (el) {
        el.hidden = true;
        el.textContent = '';
      }
      form!.querySelector<HTMLElement>(`[name="${field}"]`)?.removeAttribute('aria-invalid');
    }
  }

  // `focus` queda en false para el estado inicial: al cargar la página hay que marcar el paso 1
  // como actual, pero mover el foco ahí saltaría por encima del contenido que está más arriba.
  function showPanel(panel: string, focus = true): void {
    panels.forEach((p) => { p.hidden = p.dataset.panel !== panel; });
    pills.forEach((pill) => {
      const active = pill.dataset.step === panel;
      pill.classList.toggle('bg-primary', active);
      // Las dos clases de color se alternan juntas. `text-text/70` viene en el atributo `class`
      // de la píldora y Tailwind la emite después de `text-secondary`, así que agregar solo la
      // segunda no cambiaba nada: la píldora activa quedaba en 1.62 sobre el púrpura.
      pill.classList.toggle('text-text/70', !active);
      pill.classList.toggle('text-secondary', active);
      pill.setAttribute('aria-current', active ? 'step' : 'false');
    });
    if (!focus) return;
    const target = form!.querySelector<HTMLElement>(`[data-panel="${panel}"]`);
    // Mover el foco al panel nuevo: sin esto, quien navega con teclado o lector de pantalla
    // queda en el botón anterior y no se entera de que la pantalla cambió.
    const focusable = target?.querySelector<HTMLElement>('select, input, textarea, a[href]');
    (focusable ?? target)?.focus();
  }

  function advance(from: Step, to: string): void {
    clearErrors(from);
    const errors = validateStep(from, readData());
    if (errors.length > 0) {
      for (const { field, message } of errors) {
        const el = form!.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
        if (el) {
          el.textContent = message;
          el.hidden = false;
        }
        form!.querySelector<HTMLElement>(`[name="${field}"]`)?.setAttribute('aria-invalid', 'true');
      }
      status.textContent = `Revisá ${errors.length === 1 ? 'un campo' : `${errors.length} campos`} para continuar.`;
      form!.querySelector<HTMLElement>(`[name="${errors[0].field}"]`)?.focus();
      return;
    }
    status.textContent = '';
    showPanel(to);
  }

  form.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const from = Number(btn.closest<HTMLElement>('[data-panel]')!.dataset.panel) as Step;
      advance(from, btn.dataset.next!);
    });
  });

  form.querySelectorAll<HTMLButtonElement>('[data-prev]').forEach((btn) => {
    btn.addEventListener('click', () => showPanel(btn.dataset.prev!));
  });

  // Los enlaces "Agendar cita" de cada especialidad traen ?servicio=… para dejar el primer
  // paso ya resuelto. Solo se acepta un valor que exista entre las opciones del select.
  const servicio = form.querySelector<HTMLSelectElement>('[name="servicio"]');
  const pedido = new URLSearchParams(window.location.search).get('servicio');
  if (servicio && pedido && Array.from(servicio.options).some((o) => o.value === pedido)) {
    servicio.value = pedido;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(5);
    const data = readData();
    const errors = validateStep(5, data);
    if (errors.length > 0) {
      advance(5, '5');
      return;
    }
    const resumen = form.querySelector<HTMLElement>('[data-resumen]');
    if (resumen) {
      resumen.textContent = [data.nombre, data.servicio, `${data.fecha} ${data.hora}`.trim()]
        .filter(Boolean)
        .join(' · ');
    }
    const send = form.querySelector<HTMLAnchorElement>('[data-wizard-send]');
    if (send) send.href = buildWizardUrl(data);
    showPanel('confirmacion');
  });

  // `showPanel` solo corría en las transiciones, así que al cargar la página el paso 1 no
  // aparecía marcado como actual ni visualmente ni con `aria-current`.
  showPanel('1', false);
}
