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
    return {
      shippingFlatCents: s.flatCents,
      freeShippingMinCents: s.freeMinCents,
      sinpeNumber: this.config.get<string>('SINPE_NUMBER') ?? '',
      whatsappNumber: this.config.get<string>('WHATSAPP_NUMBER') ?? '',
    };
  }
}
