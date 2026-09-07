// Descarga todas las imágenes del sitio original a src/assets/.
// Fuente: reference/images.txt (contenido de páginas) + EXTRA (header, footer, hero, carrusel, fondos).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { basename, join } from 'node:path';

const OUT = 'src/assets';
const EXTRA = [
  // header / footer
  'https://angular.cr/wp-content/uploads/2023/09/Logo-Angular-2-e1770681953456.png',
  'https://angular.cr/wp-content/uploads/2023/09/Logo-Angular-1-1024x659.png',
  'https://angular.cr/wp-content/uploads/2023/09/Contactenos-footer.png',
  'https://angular.cr/wp-content/uploads/2023/09/Group-245464935-1-1024x252.png',
  'https://angular.cr/wp-content/uploads/2023/09/ANGULAR-logotipo-principal-100x100.png',
  // hero (slides) escritorio y móvil
  'https://angular.cr/wp-content/uploads/2024/03/Banner-2-e1770682456920.png',
  'https://angular.cr/wp-content/uploads/2026/03/Diseno-sin-titulo.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/podologia-banner.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/medicina-general-1.jpg',
  'https://angular.cr/wp-content/uploads/2023/09/Banner-6-e1764877042937.png',
  'https://angular.cr/wp-content/uploads/2024/03/Psicologia.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/Fisioterapia.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/Estetica.jpg',
  // carrusel "Conozca nuestras especialidades"
  'https://angular.cr/wp-content/uploads/2023/09/enfermera-paciente-sesion-osteopatia-1-e1764877090615.png',
  'https://angular.cr/wp-content/uploads/2024/02/Que-diferencias-existen-entre-la-medicina-general-y-la-medicina-interna.webp',
  'https://angular.cr/wp-content/uploads/2024/02/centro-estetica-avanzado.jpg',
  'https://angular.cr/wp-content/uploads/2024/02/fisioterapia-deportiva-1920w.webp',
  'https://angular.cr/wp-content/uploads/2024/02/por_que_fazer_terapia.width-1920.jpg',
  // fondo "Conozca nuestros Beneficios"
  'https://angular.cr/wp-content/uploads/2023/09/patoient-osteopatia-recibiendo-masaje-tratamiento-scaled.jpg',
];

const listed = (await readFile('reference/images.txt', 'utf8')).split('\n').map((l) => l.trim()).filter(Boolean);
const urls = [...new Set([...listed, ...EXTRA])].filter((u) => u.startsWith('https://angular.cr/wp-content/uploads/'));

const SIZE_SUFFIX = /-\d{2,4}x\d{2,4}(?=\.[a-z]+$)/i;

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function fetchOk(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

await mkdir(OUT, { recursive: true });
let ok = 0, skipped = 0, failed = [];
for (const url of urls) {
  const original = url.replace(SIZE_SUFFIX, '');
  const name = basename(original);
  const dest = join(OUT, name);
  if (await exists(dest)) { skipped++; continue; }
  // Preferir el archivo original (sin sufijo de tamaño); si no existe, usar la URL tal cual.
  const data = (await fetchOk(original)) ?? (original !== url ? await fetchOk(url) : null);
  if (!data) { failed.push(url); continue; }
  await writeFile(dest, data);
  ok++;
  console.log('ok', name);
}
console.log({ ok, skipped, failed: failed.length });
if (failed.length) { console.error('FALLARON:\n' + failed.join('\n')); process.exitCode = 1; }
