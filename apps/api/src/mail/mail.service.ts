import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface OrderEmailItem {
  productName: string;
  size: string;
  quantity: number;
}
interface OrderEmail {
  id: string;
  totalCents: number;
  items: OrderEmailItem[];
  shippingName: string;
}

const colones = (cents: number) => `₡${(cents / 100).toLocaleString('es-CR')}`;

@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private resend: Resend | null = null;
  private readonly from: string;

  constructor(private config: ConfigService) {
    const key = config.get<string>('RESEND_API_KEY');
    this.from = config.get<string>('MAIL_FROM') ?? 'NMRC <onboarding@resend.dev>';
    if (key) {
      this.resend = new Resend(key);
      this.logger.log('Resend configurado');
    } else {
      this.logger.warn('Resend NO configurado — los correos se omiten (no-op)');
    }
  }

  get enabled() {
    return this.resend !== null;
  }

  // Envío base: nunca lanza; si Resend no está configurado, hace no-op
  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.debug(`(omitido) "${subject}" → ${to}`);
      return;
    }
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
      this.logger.log(`Email "${subject}" → ${to}`);
    } catch (err) {
      this.logger.warn(`Falló el email a ${to}: ${(err as Error).message}`);
    }
  }

  private shell(title: string, body: string) {
    return `<div style="background:#0B0B0A;color:#EDE8DD;font-family:Inter,Arial,sans-serif;padding:40px 24px">
      <div style="max-width:520px;margin:0 auto">
        <div style="font-family:Georgia,serif;font-size:34px;letter-spacing:6px;font-weight:bold">NMRC</div>
        <div style="font-size:11px;letter-spacing:3px;color:#8A8174;margin-top:4px">NO MERCY · EST. 2026</div>
        <h1 style="font-size:22px;margin:32px 0 16px;text-transform:uppercase;letter-spacing:1px">${title}</h1>
        ${body}
        <div style="margin-top:40px;border-top:1px solid #2A2824;padding-top:20px;font-size:11px;color:#8A8174;letter-spacing:1px;text-transform:uppercase">
          Limited Drops. No Restocks. NMRC · Worldwide
        </div>
      </div>
    </div>`;
  }

  async sendOrderConfirmation(to: string, order: OrderEmail) {
    const rows = order.items
      .map(
        (i) =>
          `<tr><td style="padding:8px 0;color:#C9C2B5">${i.productName} · ${i.size} × ${i.quantity}</td></tr>`,
      )
      .join('');
    const body = `
      <p style="color:#C9C2B5;line-height:1.6">Hey ${order.shippingName.split(' ')[0]}, we received your order. Here's the summary:</p>
      <p style="font-size:13px;color:#8A8174;text-transform:uppercase;letter-spacing:1px;margin-top:24px">Order #${order.id
        .slice(-8)
        .toUpperCase()}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:8px">${rows}</table>
      <p style="margin-top:16px;font-size:18px">Total: <strong>${colones(order.totalCents)}</strong></p>
      <p style="color:#C9C2B5;line-height:1.6;margin-top:24px">We'll confirm your payment and prepare your pieces. You'll hear from us soon.</p>`;
    await this.send(to, `NMRC — Order #${order.id.slice(-8).toUpperCase()} received`, this.shell('Order received', body));
  }

  async sendWaitlistWelcome(to: string) {
    const body = `
      <p style="color:#C9C2B5;line-height:1.6">You're on the list. You'll be among the first to access Drop 001 — limited quantities, no restocks, no second chances.</p>
      <p style="color:#C9C2B5;line-height:1.6;margin-top:16px">Stay ready.</p>
      <p style="font-family:Georgia,serif;font-size:16px;letter-spacing:2px;margin-top:24px">No Excuses. No Limits. No Mercy.</p>`;
    await this.send(to, 'You’re on the NMRC list', this.shell('Welcome to NMRC', body));
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    const body = `
      <p style="color:#C9C2B5;line-height:1.6">Hi ${name.split(' ')[0]}, we received a request to reset your NMRC password.</p>
      <p style="margin:28px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#EDE8DD;color:#0B0B0A;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase">Reset password</a>
      </p>
      <p style="color:#8A8174;line-height:1.6;font-size:13px">This link expires in 1 hour. If you didn't request it, you can ignore this email — your password won't change.</p>`;
    await this.send(to, 'Reset your NMRC password', this.shell('Password reset', body));
  }
}
