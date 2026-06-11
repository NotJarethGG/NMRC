import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreateAlertDto {
  @IsEmail()
  email: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  size?: string;
}

@Controller('stock-alerts')
export class StockAlertsController {
  constructor(private prisma: PrismaService) {}

  // Público: "avísame cuando vuelva" (idempotente por email+producto)
  @Post()
  async create(@Body() dto: CreateAlertDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    const email = dto.email.toLowerCase().trim();
    await this.prisma.stockAlert.upsert({
      where: { email_productId: { email, productId: dto.productId } },
      create: { email, productId: dto.productId, size: dto.size },
      update: { size: dto.size },
    });
    return { ok: true };
  }

  // Staff: demanda capturada
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list() {
    return this.prisma.stockAlert.findMany({
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async remove(@Param('id') id: string) {
    await this.prisma.stockAlert.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Alerta no encontrada');
    });
    return { ok: true };
  }
}
