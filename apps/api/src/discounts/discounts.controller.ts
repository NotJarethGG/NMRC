import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { findValidDiscount } from './discounts.util';

class ValidateDto {
  @IsString()
  @MinLength(2)
  code: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  subtotalCents: number;
}

class CreateDiscountDto {
  @IsString()
  @MinLength(2)
  @MaxLength(24)
  code: string;

  @IsInt()
  @Min(1)
  @Max(100)
  percentOff: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;
}

class UpdateDiscountDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  percentOff?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number | null;
}

@Controller('discounts')
export class DiscountsController {
  constructor(private prisma: PrismaService) {}

  // Público: valida un código contra un subtotal y devuelve el descuento
  @Post('validate')
  async validate(@Body() dto: ValidateDto) {
    const found = await findValidDiscount(this.prisma, dto.code);
    if (!found) return { valid: false };
    const discountCents = Math.round((dto.subtotalCents * found.percentOff) / 100);
    return { valid: true, code: found.code, percentOff: found.percentOff, discountCents };
  }

  // --- Staff ---
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list() {
    return this.prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async create(@Body() dto: CreateDiscountDto) {
    const code = dto.code.toUpperCase().trim();
    const exists = await this.prisma.discountCode.findUnique({ where: { code } });
    if (exists) throw new BadRequestException('Ese código ya existe');
    return this.prisma.discountCode.create({
      data: {
        code,
        percentOff: dto.percentOff,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        maxUses: dto.maxUses ?? null,
      },
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    const found = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Código no encontrado');
    return this.prisma.discountCode.update({
      where: { id },
      data: {
        active: dto.active,
        percentOff: dto.percentOff,
        expiresAt: dto.expiresAt === undefined ? undefined : dto.expiresAt ? new Date(dto.expiresAt) : null,
        maxUses: dto.maxUses === undefined ? undefined : dto.maxUses,
      },
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async remove(@Param('id') id: string) {
    await this.prisma.discountCode.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Código no encontrado');
    });
    return { ok: true };
  }
}
