import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '../i18n/translations';
import type { CurrencyCode } from '../lib/currency';

interface LocaleState {
  locale: Locale;
  currency: CurrencyCode;
  setLocale: (l: Locale) => void;
  setCurrency: (c: CurrencyCode) => void;
}

// EN/USD por defecto: NMRC es una marca internacional
export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      currency: 'USD',
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'nmrc_locale' },
  ),
);
