import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('Payments');
  private stripe: InstanceType<typeof Stripe> | null = null;
  readonly usdRate: number;

  constructor(private config: ConfigService) {
    const secret = config.get<string>('STRIPE_SECRET_KEY');
    this.usdRate = Number(config.get<string>('USD_RATE') ?? 510);
    if (secret) {
      // Sin apiVersion explícita: usa la versión por defecto de la cuenta
      this.stripe = new Stripe(secret);
      this.logger.log('Stripe configurado');
    } else {
      this.logger.warn('Stripe NO configurado — el checkout usará solo SINPE');
    }
  }

  get enabled() {
    return this.stripe !== null;
  }

  // Convierte el total del pedido (céntimos de CRC) a céntimos de USD para Stripe
  toUsdCents(crcCents: number) {
    return Math.max(50, Math.round(crcCents / this.usdRate));
  }

  async createPaymentIntent(orderId: string, crcCents: number) {
    if (!this.stripe) throw new Error('Stripe no está configurado');
    const intent = await this.stripe.paymentIntents.create({
      amount: this.toUsdCents(crcCents),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId },
      description: `NMRC Order #${orderId.slice(-8).toUpperCase()}`,
    });
    return { clientSecret: intent.client_secret, amountUsdCents: intent.amount };
  }

  // Verifica la firma del webhook y devuelve el evento (o null si no se puede validar)
  constructEvent(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !webhookSecret) return null;
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.warn(`Webhook firma inválida: ${(err as Error).message}`);
      return null;
    }
  }
}
