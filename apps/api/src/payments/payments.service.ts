import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('Payments');
  private stripe: InstanceType<typeof Stripe> | null = null;
  readonly usdRate: number;

  // PayPal (REST API — opera en Costa Rica)
  private readonly paypalClientId: string;
  private readonly paypalSecret: string;
  private readonly paypalBase: string;

  constructor(private config: ConfigService) {
    const secret = config.get<string>('STRIPE_SECRET_KEY');
    this.usdRate = Number(config.get<string>('USD_RATE') ?? 510);
    if (secret) {
      // Sin apiVersion explícita: usa la versión por defecto de la cuenta
      this.stripe = new Stripe(secret);
      this.logger.log('Stripe configurado');
    } else {
      this.logger.warn('Stripe NO configurado — el checkout usará SINPE / PayPal');
    }

    this.paypalClientId = config.get<string>('PAYPAL_CLIENT_ID') ?? '';
    this.paypalSecret = config.get<string>('PAYPAL_SECRET') ?? '';
    const env = config.get<string>('PAYPAL_ENV') ?? 'sandbox';
    this.paypalBase =
      env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    if (this.paypalEnabled) this.logger.log(`PayPal configurado (${env})`);
    else this.logger.warn('PayPal NO configurado');
  }

  get enabled() {
    return this.stripe !== null;
  }

  get paypalEnabled() {
    return Boolean(this.paypalClientId && this.paypalSecret);
  }

  // Convierte el total del pedido (céntimos de CRC) a céntimos de USD
  toUsdCents(crcCents: number) {
    return Math.max(50, Math.round(crcCents / this.usdRate));
  }

  toUsdValue(crcCents: number) {
    return (this.toUsdCents(crcCents) / 100).toFixed(2);
  }

  // ---------- STRIPE ----------
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

  // Verifica un PaymentIntent directo contra Stripe (para confirmar sin webhook)
  async verifyPaymentIntent(paymentIntentId: string, orderId: string) {
    if (!this.stripe) return false;
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return intent.status === 'succeeded' && intent.metadata?.orderId === orderId;
    } catch (err) {
      this.logger.warn(`No se pudo verificar el intent: ${(err as Error).message}`);
      return false;
    }
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

  // ---------- PAYPAL ----------
  private async paypalToken(): Promise<string> {
    const auth = Buffer.from(`${this.paypalClientId}:${this.paypalSecret}`).toString('base64');
    const res = await fetch(`${this.paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new Error(`PayPal token error ${res.status}`);
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  // Crea una orden de PayPal por el total del pedido (en USD); guarda nuestro orderId en custom_id
  async createPayPalOrder(orderId: string, crcCents: number) {
    const token = await this.paypalToken();
    const res = await fetch(`${this.paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: orderId,
            description: `NMRC Order #${orderId.slice(-8).toUpperCase()}`,
            amount: { currency_code: 'USD', value: this.toUsdValue(crcCents) },
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`PayPal create error ${res.status}`);
    const data = (await res.json()) as { id: string };
    return { paypalOrderId: data.id };
  }

  // Captura el pago y devuelve nuestro orderId si quedó COMPLETED
  async capturePayPalOrder(paypalOrderId: string): Promise<{ orderId: string } | null> {
    const token = await this.paypalToken();
    const res = await fetch(`${this.paypalBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      this.logger.warn(`PayPal capture error ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      status: string;
      purchase_units?: { custom_id?: string; payments?: { captures?: { custom_id?: string }[] } }[];
    };
    if (data.status !== 'COMPLETED') return null;
    const unit = data.purchase_units?.[0];
    const orderId = unit?.payments?.captures?.[0]?.custom_id ?? unit?.custom_id;
    return orderId ? { orderId } : null;
  }
}
