import { useEffect } from 'react';

const BASE = 'NMRC | Premium Streetwear';

/**
 * Ajusta el <title> y la meta description por página (SEO básico SPA).
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
    return () => {
      document.title = BASE;
    };
  }, [title, description]);
}
