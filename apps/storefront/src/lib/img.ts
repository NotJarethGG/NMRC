/**
 * Optimiza una URL de Cloudinary inyectando transformaciones:
 *  - f_auto: mejor formato según el navegador (WebP/AVIF)
 *  - q_auto: compresión automática sin pérdida visible
 *  - w_<width> + c_limit: nunca sirve más ancho del necesario
 *  - dpr_auto: nitidez en pantallas retina
 * URLs que no son de Cloudinary (Unsplash, etc.) se devuelven sin tocar.
 */
export function cldUrl(url?: string | null, width = 800): string {
  if (!url) return '';
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const before = url.slice(0, i + marker.length);
  const after = url.slice(i + marker.length);
  // No duplicar si ya trae transformaciones
  if (/^[a-z]{1,3}_/.test(after)) return url;
  return `${before}f_auto,q_auto,c_limit,w_${width},dpr_auto/${after}`;
}
