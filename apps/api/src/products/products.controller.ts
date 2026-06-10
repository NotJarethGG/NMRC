import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';

class ReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  // --- Público (storefront) ---
  @Get()
  findAll(@Query() query: ProductQuery) {
    return this.products.findAll(query);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  lowStock() {
    return this.products.lowStock();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  // Valoración del cliente (1 por usuario, se actualiza si ya existe)
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  review(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ReviewDto) {
    return this.products.upsertReview(id, user.id, dto.rating, dto.comment);
  }

  // --- Admin ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
