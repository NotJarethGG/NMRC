import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { OrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  // --- Cliente ---
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.orders.findMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine/:id')
  mineOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.findOneForUser(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mine/:id/cancel')
  cancelMine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.cancelMine(user.id, id);
  }

  // El cliente sube el comprobante del pago SINPE (imagen) a su pedido pendiente
  @UseGuards(JwtAuthGuard)
  @Post('mine/:id/proof')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
      fileFilter: (_req, file, cb) => {
        const ok = /image\/(jpe?g|png|webp|avif|gif)/.test(file.mimetype);
        cb(ok ? null : new BadRequestException('Solo se permiten imágenes'), ok);
      },
    }),
  )
  uploadProof(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.orders.attachProof(user.id, id, file);
  }

  // --- Admin / Staff ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('stats')
  stats() {
    return this.orders.stats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('best-sellers')
  bestSellers() {
    return this.orders.bestSellers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.orders.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status, {
      sinpeRef: dto.sinpeRef,
      trackingCode: dto.trackingCode,
      trackingCarrier: dto.trackingCarrier,
    });
  }
}
