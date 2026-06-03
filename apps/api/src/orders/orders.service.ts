import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Resolver variants y validar stock
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    let totalCents = 0;
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
      totalCents += unitPriceCents * item.quantity;
      return {
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        size: variant.size,
        quantity: item.quantity,
        unitPriceCents,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalCents,
        shippingName: dto.shippingName,
        shippingPhone: dto.shippingPhone,
        shippingAddress: dto.shippingAddress,
        notes: dto.notes,
        items: { create: itemsData },
      },
      include: orderInclude,
    });

    return { ...order, payment: this.paymentInfo(order.id, totalCents) };
  }

  paymentInfo(orderId: string, totalCents: number) {
    const sinpeNumber = this.config.get<string>('SINPE_NUMBER') ?? '';
    const whatsapp = this.config.get<string>('WHATSAPP_NUMBER') ?? '';
    const totalText = `₡${(totalCents / 100).toLocaleString('es-CR')}`;
    const message = `Hola GosthShop, acabo de realizar el pago por SINPE de mi pedido ${orderId} por un total de ${totalText}. Adjunto el comprobante.`;
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

    return {
      totalOrders: orders,
      totalProducts: products,
      revenueCents: paidAgg._sum.totalCents ?? 0,
      ordersByStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    };
  }
}
