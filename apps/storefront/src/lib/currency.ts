import { useLocale } from '../store/locale';

/**
 * Sistema de moneda configurable.
 * Los precios se almacenan en la DB en céntimos de colón (CRC × 100).
 * Cada moneda define su tasa de conversión desde CRC y su formato.
 * Agregar una moneda = agregar una entrada aquí.
 */
export type CurrencyCode = 'USD' | 'CRC';

interface CurrencyDef {
  /** colones por unidad de esta moneda */
  ratePerCRC: number;
  format: (amount: number) => string;
}

const USD_RATE = Number(import.meta.env.VITE_USD_RATE ?? 510); // ₡ por $1

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  USD: {
    ratePerCRC: USD_RATE,
    format: (usd) => `$${Math.round(usd).toLocaleString('en-US')} USD`,
  },
  CRC: {
    ratePerCRC: 1,
    format: (crc) => `₡${crc.toLocaleString('es-CR')}`,
  },
};

export function formatPrice(crcCents: number, code: CurrencyCode): string {
  const def = CURRENCIES[code];
  const amount = crcCents / 100 / def.ratePerCRC;
  return def.format(amount);
}

/** Hook: formateador ligado a la moneda activa. */
export function usePrice() {
  const currency = useLocale((s) => s.currency);
  return (crcCents: number) => formatPrice(crcCents, currency);
}
