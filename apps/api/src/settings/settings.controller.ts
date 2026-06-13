import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shippingConfig } from '../common/shipping';

@Controller('config')
export class SettingsController {
  constructor(private config: ConfigService) {}

  // Público: el frontend lo usa para mostrar envío y datos de pago de forma consistente.
  @Get()
  get() {
    const s = shippingConfig(this.config);
    // Stripe activo solo si hay clave secreta + publicable configuradas
    const stripePublishableKey = this.config.get<string>('STRIPE_PUBLISHABLE_KEY') ?? '';
    const stripeEnabled = Boolean(this.config.get<string>('STRIPE_SECRET_KEY') && stripePublishableKey);
    return {
      shippingFlatCents: s.flatCents,
      freeShippingMinCents: s.freeMinCents,
      sinpeNumber: this.config.get<string>('SINPE_NUMBER') ?? '',
      whatsappNumber: this.config.get<string>('WHATSAPP_NUMBER') ?? '',
      stripeEnabled,
      stripePublishableKey: stripeEnabled ? stripePublishableKey : '',
      usdRate: Number(this.config.get<string>('USD_RATE') ?? 510),
    };
  }
}
