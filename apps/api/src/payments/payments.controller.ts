import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { IsString } from 'class-validator';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

class CreateIntentDto {
  @IsString()
  orderId: string;
}

class ConfirmDto {
  @IsString()
  orderId: string;

  @IsString()
  paymentIntentId: string;
}

class PayPalCreateDto {
  @IsString()
  orderId: string;
}

class PayPalCaptureDto {
  @IsString()
  paypalOrderId: string;

  @IsString()
  orderId: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private orders: OrdersService,
  ) {}

  // ---------- STRIPE ----------
  // El cliente pide un PaymentIntent para su pedido pendiente
  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createIntent(@CurrentUser() user: AuthUser, @Body() dto: CreateIntentDto) {
    if (!this.payments.enabled) {
      throw new ServiceUnavailableException('El pago con tarjeta no está disponible');
    }
    const order = await this.orders.getPayableOrder(dto.orderId, user.id);
    return this.payments.createPaymentIntent(order.id, order.totalCents);
  }

  // Confirma el pago verificando el intent contra Stripe (no requiere webhook — ideal para demo)
  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(@CurrentUser() user: AuthUser, @Body() dto: ConfirmDto) {
    const order = await this.orders.getPayableOrder(dto.orderId, user.id);
    const ok = await this.payments.verifyPaymentIntent(dto.paymentIntentId, order.id);
    if (!ok) throw new BadRequestException('El pago no se pudo verificar');
    await this.orders.markPaid(order.id, 'stripe', dto.paymentIntentId);
    return { ok: true };
  }

  // Webhook de Stripe: confirma el pago y marca el pedido como pagado
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody || !signature) throw new BadRequestException('Webhook inválido');
    const event = this.payments.constructEvent(req.rawBody, signature);
    if (!event) throw new BadRequestException('Firma no verificada');

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string; metadata?: { orderId?: string } };
      const orderId = intent.metadata?.orderId;
      if (orderId) await this.orders.markPaidViaStripe(orderId, intent.id);
    }
    return { received: true };
  }

  // ---------- PAYPAL ----------
  @Post('paypal/create-order')
  @UseGuards(JwtAuthGuard)
  async paypalCreate(@CurrentUser() user: AuthUser, @Body() dto: PayPalCreateDto) {
    if (!this.payments.paypalEnabled) {
      throw new ServiceUnavailableException('PayPal no está disponible');
    }
    const order = await this.orders.getPayableOrder(dto.orderId, user.id);
    return this.payments.createPayPalOrder(order.id, order.totalCents);
  }

  @Post('paypal/capture')
  @UseGuards(JwtAuthGuard)
  async paypalCapture(@CurrentUser() user: AuthUser, @Body() dto: PayPalCaptureDto) {
    if (!this.payments.paypalEnabled) {
      throw new ServiceUnavailableException('PayPal no está disponible');
    }
    // El pedido debe ser del usuario (evita capturar a nombre de otro)
    const order = await this.orders.getPayableOrder(dto.orderId, user.id);
    const result = await this.payments.capturePayPalOrder(dto.paypalOrderId);
    if (!result || result.orderId !== order.id) {
      throw new BadRequestException('No se pudo capturar el pago de PayPal');
    }
    await this.orders.markPaid(order.id, 'paypal', dto.paypalOrderId);
    return { ok: true };
  }
}
