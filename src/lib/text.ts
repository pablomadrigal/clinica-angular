// Convierte los saltos de línea "\n" del contenido (YAML) en `<br />` para usarse con `set:html`.
// Se repetía como `str.replace(/\n/g, '<br />')` en varios componentes de sección; centralizado
// aquí para que todos compartan la misma lógica.
export function nl2br(s: string): string {
  return s.replace(/\n/g, '<br />');
}
