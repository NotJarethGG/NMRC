import { ConfigService } from '@nestjs/config';

export interface ShippingConfig {
  flatCents: number; // costo de envío plano
  freeMinCents: number; // subtotal a partir del cual el envío es gratis
}

// Valores por defecto: ₡3.000 de envío, gratis a partir de ₡60.000 (priceCents = colones × 100)
export function shippingConfig(config: ConfigService): ShippingConfig {
  return {
    flatCents: Number(config.get('SHIPPING_FLAT_CENTS') ?? 300000),
    freeMinCents: Number(config.get('FREE_SHIPPING_MIN_CENTS') ?? 6000000),
  };
}

export function shippingFor(subtotalCents: number, cfg: ShippingConfig): number {
  return subtotalCents >= cfg.freeMinCents ? 0 : cfg.flatCents;
}
