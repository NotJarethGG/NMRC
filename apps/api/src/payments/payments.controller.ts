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

@Controller('payments')
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private orders: OrdersService,
  ) {}

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
}
