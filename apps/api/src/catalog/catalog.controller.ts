import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CatalogService } from './catalog.service';

class CategoryDto {
  @IsString()
  @MinLength(2)
  name: string;
}

class CollectionDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  heroImage?: string;
}

@Controller()
export class CatalogController {
  constructor(private catalog: CatalogService) {}

  // --- Público ---
  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get('collections')
  listCollections() {
    return this.catalog.listCollections();
  }

  // --- Admin: categorías ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('categories')
  createCategory(@Body() dto: CategoryDto) {
    return this.catalog.createCategory(dto.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: CategoryDto) {
    return this.catalog.updateCategory(id, dto.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.catalog.removeCategory(id);
  }

  // --- Admin: colecciones ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('collections')
  createCollection(@Body() dto: CollectionDto) {
    return this.catalog.createCollection(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Patch('collections/:id')
  updateCollection(@Param('id') id: string, @Body() dto: CollectionDto) {
    return this.catalog.updateCollection(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete('collections/:id')
  removeCollection(@Param('id') id: string) {
    return this.catalog.removeCollection(id);
  }
}
