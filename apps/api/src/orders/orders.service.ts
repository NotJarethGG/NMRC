import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { shippingConfig, shippingFor } from '../common/shipping';
import { findValidDiscount } from '../discounts/discounts.util';
import { CreateOrderDto } from './dto';

const orderInclude = {
  items: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Resolver variants y validar stock
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    let subtotalCents = 0;
    const itemsData = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant || variant.productId !== item.productId) {
        throw new BadRequestException('Variante de producto inválida');
      }
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${variant.product.name} (talla ${variant.size})`,
        );
      }
      const unitPriceCents = variant.product.priceCents;
      subtotalCents += unitPriceCents * item.quantity;
      return {
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        size: variant.size,
        quantity: item.quantity,
        unitPriceCents,
      };
    });

    // Descuento validado y calculado en el servidor (autoritativo)
    let discountCents = 0;
    let discountCode: string | null = null;
    if (dto.couponCode) {
      const discount = await findValidDiscount(this.prisma, dto.couponCode);
      if (!discount) throw new BadRequestException('El código de descuento no es válido');
      discountCents = Math.round((subtotalCents * discount.percentOff) / 100);
      discountCode = discount.code;
    }

    // Envío sobre el subtotal ya descontado
    const discounted = subtotalCents - discountCents;
    const shippingCents = shippingFor(discounted, shippingConfig(this.config));
    const totalCents = discounted + shippingCents;

    const order = await this.prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        subtotalCents,
        discountCents,
        discountCode,
        shippingCents,
        totalCents,
        shippingName: dto.shippingName,
        shippingPhone: dto.shippingPhone,
        shippingAddress: dto.shippingAddress,
        notes: dto.notes,
        items: { create: itemsData },
      },
      include: orderInclude,
    });

    // Consumir un uso del código (después de crear el pedido)
    if (discountCode) {
      await this.prisma.discountCode.update({
        where: { code: discountCode },
        data: { uses: { increment: 1 } },
      });
    }

    // Correo de confirmación (no-op si Resend no está configurado; no bloquea)
    if (order.user?.email) {
      void this.mail.sendOrderConfirmation(order.user.email, {
        id: order.id,
        totalCents: order.totalCents,
        shippingName: order.shippingName,
        items: order.items.map((i) => ({
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
        })),
      });
    }

    return { ...order, payment: this.paymentInfo(order.id, totalCents) };
  }

  paymentInfo(orderId: string, totalCents: number) {
    const sinpeNumber = this.config.get<string>('SINPE_NUMBER') ?? '';
    const whatsapp = this.config.get<string>('WHATSAPP_NUMBER') ?? '';
    const totalText = `₡${(totalCents / 100).toLocaleString('es-CR')}`;
    const message = `Hola NMRC, acabo de realizar el pago por SINPE de mi pedido ${orderId} por un total de ${totalText}. Adjunto el comprobante.`;
    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    return { sinpeNumber, whatsappNumber: whatsapp, whatsappUrl, totalText };
  }

  async findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // El cliente puede cancelar su pedido solo mientras está pendiente de pago
  async cancelMine(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Solo puedes cancelar pedidos pendientes de pago');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return { ...order, payment: this.paymentInfo(order.id, order.totalCents) };
  }

  // --- Admin ---
  async findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, sinpeRef?: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Descontar stock al confirmar el pago (PENDING -> PAID)
    if (status === OrderStatus.PAID && order.status === OrderStatus.PENDING) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: { status, sinpeRef: sinpeRef ?? order.sinpeRef },
        });
      });
    } else if (status === OrderStatus.CANCELLED && order.status === OrderStatus.PAID) {
      // Reponer stock si se cancela un pedido ya pagado
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({ where: { id }, data: { status } });
      });
    } else {
      await this.prisma.order.update({
        where: { id },
        data: { status, sinpeRef: sinpeRef ?? order.sinpeRef },
      });
    }

    return this.findOne(id);
  }

  // Marca un pedido como pagado por una pasarela (idempotente; descuenta stock una sola vez)
  async markPaid(orderId: string, via: 'stripe' | 'paypal', paymentRef: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;
    if (order.status !== OrderStatus.PENDING) {
      // ya procesado: solo asegurar trazabilidad del pago
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paidVia: order.paidVia ?? via, stripePaymentId: paymentRef },
      });
      return;
    }
    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID, paidVia: via, stripePaymentId: paymentRef },
      });
    });
  }

  markPaidViaStripe(orderId: string, paymentIntentId: string) {
    return this.markPaid(orderId, 'stripe', paymentIntentId);
  }

  // Busca un pedido pendiente del usuario y devuelve su total (para crear el PaymentIntent)
  async getPayableOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async stats() {
    const [orders, paidAgg, byStatus] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalCents: true },
        where: { status: { in: [OrderStatus.PAID, OrderStatus.FULFILLED] } },
      }),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const products = await this.prisma.product.count();

    const paidCount = byStatus
      .filter((s) => s.status === OrderStatus.PAID || s.status === OrderStatus.FULFILLED)
      .reduce((n, s) => n + s._count._all, 0);
    const revenue = paidAgg._sum.totalCents ?? 0;

    // Ventas confirmadas de los últimos 14 días, agrupadas por día
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);
    const recentPaid = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.FULFILLED] },
        createdAt: { gte: since },
      },
      select: { createdAt: true, totalCents: true },
    });
    const revenueByDay: { date: string; revenueCents: number; orders: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = recentPaid.filter((o) => o.createdAt.toISOString().slice(0, 10) === key);
      revenueByDay.push({
        date: key,
        revenueCents: dayOrders.reduce((n, o) => n + o.totalCents, 0),
        orders: dayOrders.length,
      });
    }

    return {
      totalOrders: orders,
      totalProducts: products,
      revenueCents: revenue,
      avgOrderCents: paidCount ? Math.round(revenue / paidCount) : 0,
      ordersByStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      revenueByDay,
    };
  }

  // Productos más vendidos (por unidades en pedidos pagados/enviados)
  async bestSellers(limit = 6) {
    const items = await this.prisma.orderItem.findMany({
      where: { order: { status: { in: [OrderStatus.PAID, OrderStatus.FULFILLED] } } },
      select: { productId: true, productName: true, quantity: true, unitPriceCents: true },
    });

    const map = new Map<
      string,
      { productId: string; name: string; units: number; revenueCents: number }
    >();
    for (const it of items) {
      const cur =
        map.get(it.productId) ?? {
          productId: it.productId,
          name: it.productName,
          units: 0,
          revenueCents: 0,
        };
      cur.units += it.quantity;
      cur.revenueCents += it.quantity * it.unitPriceCents;
      map.set(it.productId, cur);
    }

    const ranked = [...map.values()].sort((a, b) => b.units - a.units).slice(0, limit);

    // Adjuntar imagen actual del producto si existe
    const ids = ranked.map((r) => r.productId);
    const products = ids.length
      ? await this.prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, slug: true, images: { orderBy: { position: 'asc' }, take: 1 } },
        })
      : [];

    return ranked.map((r) => {
      const p = products.find((x) => x.id === r.productId);
      return { ...r, slug: p?.slug ?? null, image: p?.images[0]?.url ?? null };
    });
  }
}
