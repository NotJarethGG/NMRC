import { useLocale } from '../store/locale';
import { translations, type TKey } from './translations';

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

export type { TKey };
