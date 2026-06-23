import { useEffect } from 'react';
import { SITE_URL } from '../lib/brand';

const BASE = 'NMRC | Premium Streetwear';
const DEFAULT_IMAGE = `${SITE_URL}/NMRC.png`;

function setNamedMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setPropMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Ajusta <title>, meta description, canonical y etiquetas OpenGraph/Twitter por página (SEO SPA).
 */
export function useDocumentTitle(
  title?: string,
  description?: string,
  opts?: { image?: string; type?: string },
) {
  const image = opts?.image;
  const type = opts?.type;
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BASE}` : BASE;
    document.title = fullTitle;

    // Canonical + og:url a la ruta actual (sin query, para evitar duplicados)
    const url = `${SITE_URL}${window.location.pathname}`;
    setCanonical(url);
    setPropMeta('og:url', url);
    setPropMeta('og:title', fullTitle);
    setNamedMeta('twitter:title', fullTitle);
    setPropMeta('og:type', type || 'website');

    if (description) {
      setNamedMeta('description', description);
      setPropMeta('og:description', description);
      setNamedMeta('twitter:description', description);
    }

    // Imagen específica de la página (p. ej. producto) o el fallback de marca
    setPropMeta('og:image', image || DEFAULT_IMAGE);
    setNamedMeta('twitter:image', image || DEFAULT_IMAGE);

    return () => {
      document.title = BASE;
    };
  }, [title, description, image, type]);
}
