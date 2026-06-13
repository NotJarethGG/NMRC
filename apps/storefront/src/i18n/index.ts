import { useLocale } from '../store/locale';
import { translations, type TKey } from './translations';
import type { Product } from '../lib/types';

/**
 * Hook de traducción. Uso:
 *   const t = useT();
 *   t('nav.shop')                          → "Shop" | "Tienda"
 *   t('checkout.freeOver', { free: '$118 USD' }) → interpola {free}
 */
export function useT() {
  const locale = useLocale((s) => s.locale);
  return (key: TKey, vars?: Record<string, string | number>) => {
    let text: string = translations[locale][key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.split(`{${k}}`).join(String(v));
      }
    }
    return text;
  };
}

/**
 * Localiza el contenido de un producto según el idioma activo.
 * Usa los campos EN si existen y el locale es inglés; si no, el original (ES).
 *   const L = useLocalize();
 *   L.name(product) / L.description(product)
 */
export function useLocalize() {
  const locale = useLocale((s) => s.locale);
  const en = locale === 'en';
  return {
    name: (p: Product) => (en && p.nameEn ? p.nameEn : p.name),
    description: (p: Product) => (en && p.descriptionEn ? p.descriptionEn : p.description ?? ''),
  };
}

export type { TKey };
